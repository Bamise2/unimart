import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import Header from "../components/header"
import { Button } from "../components/ui/button"
import { MapPin, MessageCircle, ArrowLeft, Flag, Star, Send } from "lucide-react"
import { db, auth } from "../libs/firebase"
import { 
    doc, getDoc, addDoc, collection, serverTimestamp, 
    query, where, getDocs, orderBy 
} from "firebase/firestore"
import type { Product, Seller, Review } from "../libs/types"
import { DUMMY_PRODUCTS } from "../libs/dummyData"

export default function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [product, setProduct] = useState<(Product & { sellerName?: string, phoneNumber?: string }) | null>(null)
  const [seller, setSeller] = useState<Seller | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  
  // Review Form State
  const [newReview, setNewReview] = useState("")
  const [rating, setRating] = useState(5)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      try {
        // 1. Fetch Product
        const productRef = doc(db, "listings", id)
        const productSnap = await getDoc(productRef)
        
        let currentSellerId = ""

        if (productSnap.exists()) {
          const productData = productSnap.data() as Product
          setProduct({ id: productSnap.id, ...productData })
          currentSellerId = productData.sellerId || ""

          // 2. Fetch Seller Details
          if (currentSellerId) {
            const sellerRef = doc(db, "sellers", currentSellerId)
            const sellerSnap = await getDoc(sellerRef)
            if (sellerSnap.exists()) {
              setSeller(sellerSnap.data() as Seller)
            }
          }
        } else {
          // Fallback to Dummy Data
          const dummyItem = DUMMY_PRODUCTS.find(p => p.id === id)
          if (dummyItem) {
            setProduct(dummyItem)
            currentSellerId = "system"
            setSeller({
                storeName: "Verified Student Seller",
                location: dummyItem.location || "UI Campus",
                phoneNumber: "08123456789",
                sellerId: "system"
            })
          }
        }

        // 3. Fetch Reviews for this Seller
        if (currentSellerId && currentSellerId !== "system") {
            const reviewsQ = query(
                collection(db, "reviews"), 
                where("sellerId", "==", currentSellerId),
                orderBy("createdAt", "desc")
            )
            const reviewsSnap = await getDocs(reviewsQ)
            setReviews(reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Review)))
        }

      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // --- ACTIONS ---

  const handleStartChat = async () => {
    if (!auth.currentUser) return navigate("/login")
    if (!product) return
    
    if (product.id.startsWith("dummy-")) {
        return alert("This is a demo item. You cannot chat with the system.")
    }

    if (!product.sellerId) return

    try {
      // Check for existing chat
      const q = query(
          collection(db, "chats"), 
          where("participants", "array-contains", auth.currentUser.uid)
      )
      const querySnapshot = await getDocs(q)
      const existingChat = querySnapshot.docs.find(doc => 
          doc.data().participants.includes(product.sellerId)
      )

      let chatId = ""
      if (existingChat) {
          chatId = existingChat.id
      } else {
          const newChatRef = await addDoc(collection(db, "chats"), {
            participants: [auth.currentUser.uid, product.sellerId],
            participantNames: {
                [auth.currentUser.uid]: auth.currentUser.displayName || "Me",
                [product.sellerId]: product.sellerName || seller?.storeName || "Seller"
            },
            lastMessage: `Inquired about: ${product.title}`,
            lastMessageTime: serverTimestamp()
          })
          chatId = newChatRef.id
      }
      navigate(`/chat?id=${chatId}`)
    } catch (error) {
      console.error("Error starting chat:", error)
    }
  }

  const handleReportSeller = async () => {
    if (!auth.currentUser) return navigate("/login")
    
    const reason = prompt("Please describe the issue (e.g. Fraud, Fake Item, Harassment):")
    if (!reason) return

    try {
        await addDoc(collection(db, "reports"), {
            reporterId: auth.currentUser.uid,
            reportedSellerId: product?.sellerId,
            productId: product?.id,
            reason: "User Report",
            description: reason,
            status: "pending",
            createdAt: serverTimestamp()
        })
        alert("Report submitted successfully. Our admin team will investigate.")
    } catch (error) {
        alert("Failed to submit report.")
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!auth.currentUser || !product?.sellerId) return

      try {
          const reviewData = {
              reviewerId: auth.currentUser.uid,
              reviewerName: auth.currentUser.displayName || "Anonymous",
              sellerId: product.sellerId,
              rating: rating,
              comment: newReview,
              createdAt: serverTimestamp()
          }
          await addDoc(collection(db, "reviews"), reviewData)
          
          // Optimistic Update
          setReviews(prev => [{ id: "temp", ...reviewData } as any, ...prev])
          setNewReview("")
          alert("Review posted!")
      } catch (error) {
          console.error(error)
      }
  }

  if (loading) return <div className="p-10 text-center">Loading...</div>
  if (!product) return <div className="p-10 text-center">Product not found.</div>

  const displaySellerName = product.sellerName || seller?.storeName || "Student Seller"
  const displayPhone = product.phoneNumber || seller?.phoneNumber

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link to="/marketplace" className="inline-flex items-center text-gray-500 hover:text-[#103470] mb-6">
          <ArrowLeft size={18} className="mr-2" /> Back to Market
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* IMAGE */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm h-fit">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <img 
                src={product.image || "/placeholder.svg"} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* DETAILS */}
          <div className="space-y-8">
            <div>
              <span className="text-[#103470] font-bold text-sm bg-blue-50 px-3 py-1 rounded-full">{product.category}</span>
              <h1 className="text-3xl font-bold text-[#10102a] mt-4 mb-2">{product.title}</h1>
              <p className="text-3xl font-bold text-[#103470]">₦{parseInt(product.price).toLocaleString()}</p>
              <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Sold By</h3>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-[#103470] rounded-full flex items-center justify-center text-white font-bold text-xl uppercase">
                  {displaySellerName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-[#10102a]">{displaySellerName}</h4>
                  {product.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <MapPin size={16} className="text-[#103470]" /> {product.location}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button 
                onClick={handleStartChat} 
                className="w-full bg-[#103470] hover:bg-[#2856c3] text-white py-6 text-lg font-bold rounded-xl shadow-xl shadow-blue-900/10"
            >
                <MessageCircle className="mr-2" /> Chat with Seller
            </Button>

            <button onClick={handleReportSeller} className="flex items-center text-gray-400 hover:text-red-500 text-sm font-medium transition mt-4">
                <Flag size={16} className="mr-2" /> Report this listing
            </button>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="mt-16 border-t border-gray-200 pt-10">
            <h3 className="text-2xl font-bold text-[#10102a] mb-6">Seller Reviews</h3>
            
            {/* Review Form */}
            {auth.currentUser && product.sellerId && !product.id.startsWith("dummy-") && (
                <form onSubmit={handleSubmitReview} className="mb-10 bg-white p-6 rounded-xl border border-gray-100">
                    <h4 className="font-bold mb-4">Leave a Review</h4>
                    <div className="flex gap-2 mb-4">
                        {[1,2,3,4,5].map(star => (
                            <button key={star} type="button" onClick={() => setRating(star)}>
                                <Star size={24} className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-4">
                        <input 
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                            placeholder="Write your experience..."
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#103470]"
                            required
                        />
                        <Button type="submit" className="bg-[#103470] text-white"><Send size={18}/></Button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.length === 0 ? (
                    <p className="text-gray-500">No reviews yet.</p>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-gray-200"} />
                                    ))}
                                </div>
                                <span className="text-sm font-bold text-gray-900">{review.reviewerName}</span>
                            </div>
                            <p className="text-gray-600 text-sm">"{review.comment}"</p>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  )
}