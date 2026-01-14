import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import Header from "../components/header"
import { Button } from "../components/ui/button"
import { MapPin, MessageCircle, ArrowLeft, Flag, Star, Send, X, AlertTriangle, Phone } from "lucide-react"
import { db, auth } from "../libs/firebase"
import { doc, getDoc, addDoc, collection, serverTimestamp, query, where, getDocs, orderBy } from "firebase/firestore"
import type { Product, Seller, Review } from "../libs/types"
import { DUMMY_PRODUCTS } from "../libs/dummyData"
import ResponseModal from "../components/response-modal"

export default function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // Data State
  const [product, setProduct] = useState<(Product & { sellerName?: string, phoneNumber?: string }) | null>(null)
  const [seller, setSeller] = useState<Seller | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  // Review Form State
  const [newReview, setNewReview] = useState("")
  const [rating, setRating] = useState(5)

  // Modals State
  const [resModal, setResModal] = useState({ isOpen: false, type: 'success' as 'success'|'error', title: '', message: '' })
  
  // NEW: Report Modal State
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      try {
        const productRef = doc(db, "listings", id)
        const productSnap = await getDoc(productRef)
        let currentSellerId = ""

        if (productSnap.exists()) {
          const productData = productSnap.data() as Product
          setProduct({ ...productData, id: productSnap.id })
          currentSellerId = productData.sellerId || ""
          if (currentSellerId) {
            const sellerRef = doc(db, "sellers", currentSellerId)
            const sellerSnap = await getDoc(sellerRef)
            if (sellerSnap.exists()) setSeller(sellerSnap.data() as Seller)
          }
        } else {
          const dummyItem = DUMMY_PRODUCTS.find(p => p.id === id)
          if (dummyItem) {
            setProduct(dummyItem)
            currentSellerId = "system"
            setSeller({ storeName: "Verified Student Seller", location: dummyItem.location || "UI Campus", phoneNumber: "08123456789", sellerId: "system" })
          }
        }
        if (currentSellerId && currentSellerId !== "system") {
            const reviewsQ = query(collection(db, "reviews"), where("sellerId", "==", currentSellerId), orderBy("createdAt", "desc"))
            const reviewsSnap = await getDocs(reviewsQ)
            setReviews(reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Review)))
        }
      } catch (error) { console.error("Error:", error) } finally { setLoading(false) }
    }
    fetchData()
  }, [id])

  const handleStartChat = async () => {
    if (!auth.currentUser) return navigate("/login")
    if (!product) return
    if (product.id.startsWith("dummy-")) {
        return setResModal({ isOpen: true, type: 'error', title: 'Demo Item', message: 'This is a demo item. You cannot chat with the system.' })
    }
    if (!product.sellerId) return

    try {
      const q = query(collection(db, "chats"), where("participants", "array-contains", auth.currentUser.uid))
      const querySnapshot = await getDocs(q)
      const existingChat = querySnapshot.docs.find(doc => doc.data().participants.includes(product.sellerId))

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
    } catch (error) { console.error(error) }
  }

  // Trigger Report Modal
  const handleOpenReportModal = () => {
    if (!auth.currentUser) return navigate("/login")
    setShowReportModal(true)
  }

  // Submit Report Logic
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportReason.trim()) return
    setIsSubmittingReport(true)

    try {
        await addDoc(collection(db, "reports"), {
            reporterId: auth.currentUser?.uid,
            reportedSellerId: product?.sellerId,
            productId: product?.id,
            reason: "User Report",
            description: reportReason,
            status: "pending",
            createdAt: serverTimestamp()
        })
        
        setShowReportModal(false)
        setReportReason("")
        setResModal({ 
            isOpen: true, 
            type: 'success', 
            title: 'Report Submitted', 
            message: 'The admin team has been notified and will investigate this listing immediately.' 
        })
    } catch (error) {
        setResModal({ 
            isOpen: true, 
            type: 'error', 
            title: 'Error', 
            message: 'Failed to submit report. Please check your connection.' 
        })
    } finally {
        setIsSubmittingReport(false)
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
          setReviews(prev => [{ id: "temp", ...reviewData } as any, ...prev])
          setNewReview("")
          setResModal({ isOpen: true, type: 'success', title: 'Review Posted', message: 'Thank you for sharing your feedback!' })
      } catch (error) { console.error(error) }
  }

  if (loading) return <div className="p-10 text-center">Loading...</div>
  if (!product) return <div className="p-10 text-center">Product not found.</div>

  const displaySellerName = product.sellerName || seller?.storeName || "Student Seller"
  const sellerPhone = seller?.phoneNumber || product.phoneNumber || "08123456789"

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <Header />
      <ResponseModal {...resModal} onClose={() => setResModal({ ...resModal, isOpen: false })} />
      
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link to="/marketplace" className="inline-flex items-center text-gray-500 hover:text-[#103470] mb-6">
          <ArrowLeft size={18} className="mr-2" /> Back to Market
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* IMAGE */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm h-fit">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <img src={product.image || "/placeholder.svg"} alt={product.title} className="w-full h-full object-cover"/>
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
                <div className="h-12 w-12 bg-[#103470] rounded-full flex items-center justify-center text-white font-bold text-xl uppercase">{displaySellerName.charAt(0)}</div>
                <div>
                  <h4 className="font-bold text-lg text-[#10102a]">{displaySellerName}</h4>
                  {product.location && (<div className="flex items-center gap-2 text-sm text-gray-500 mt-1"><MapPin size={16} className="text-[#103470]" /> {product.location}</div>)}
                </div>
              </div>
            </div>
            
            {/* ACTION BUTTONS: CHAT & CALL */}
           <div className="grid grid-cols-2 gap-4">
                <a 
                    href={`tel:${sellerPhone}`} 
                    className="flex items-center justify-center w-full h-14 bg-white border-2 border-[#103470] text-[#103470] hover:bg-blue-50 text-lg font-bold rounded-xl transition"
                >
                    <Phone className="mr-2" /> Call
                </a>
                
                <Button 
                    onClick={handleStartChat} 
                    className="w-full h-14 bg-[#103470] hover:bg-[#2856c3] text-white text-lg font-bold rounded-xl shadow-xl shadow-blue-900/10 transition"
                >
                    <MessageCircle className="mr-2" /> Chat
                </Button>
            </div>
            
            <button onClick={handleOpenReportModal} className="flex items-center text-gray-400 hover:text-red-500 text-sm font-medium transition mt-4">
                <Flag size={16} className="mr-2" /> Report this listing
            </button>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="mt-16 border-t border-gray-200 pt-10">
            <h3 className="text-2xl font-bold text-[#10102a] mb-6">Seller Reviews</h3>
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
                        <input value={newReview} onChange={(e) => setNewReview(e.target.value)} placeholder="Write your experience..." className="flex-1 px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#103470]" required />
                        <Button type="submit" className="bg-[#103470] text-white"><Send size={18}/></Button>
                    </div>
                </form>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.length === 0 ? <p className="text-gray-500">No reviews yet.</p> : (
                    reviews.map(review => (
                        <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => (<Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-gray-200"} />))}</div>
                                <span className="text-sm font-bold text-gray-900">{review.reviewerName}</span>
                            </div>
                            <p className="text-gray-600 text-sm">"{review.comment}"</p>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>

      {/* NEW: REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[#10102a] flex items-center gap-2">
                        <AlertTriangle className="text-red-500" size={24}/> Report Listing
                    </h2>
                    <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24}/>
                    </button>
                </div>
                
                <form onSubmit={handleSubmitReport} className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Please describe why you are reporting this item. This will be sent directly to the Unimart admin team for review.
                    </p>
                    
                    <textarea 
                        required 
                        autoFocus
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder="e.g. This looks like a scam, Fake item, Offensive content..." 
                        className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 min-h-[120px]"
                    />
                    
                    <Button 
                        type="submit" 
                        disabled={isSubmittingReport}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold mt-2"
                    >
                        {isSubmittingReport ? "Submitting..." : "Submit Report"}
                    </Button>
                </form>
            </div>
        </div>
      )}
    </div>
  )
}