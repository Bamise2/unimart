import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Header from "../components/header"
import { Button } from "../components/ui/button"
import { Heart, MapPin, Search } from "lucide-react"
import { db, auth } from "../libs/firebase"
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc, orderBy, query } from "firebase/firestore"
import type { Product } from "../libs/types"
import { DUMMY_PRODUCTS } from "../libs/dummyData" // Import dummy data

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState<string[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch REAL items from Firestore (Newest first)
        const q = query(collection(db, "listings"), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)
        
        const realItems = querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        } as Product))

        // 2. Combine: Real Items on TOP, Dummy items below
        setProducts([...realItems, ...DUMMY_PRODUCTS])

        // 3. Fetch Wishlist
        if (auth.currentUser) {
           const userRef = doc(db, "users", auth.currentUser.uid)
           const userSnap = await getDoc(userRef)
           if (userSnap.exists()) {
             const data = userSnap.data()
             if (data.wishlist) setWishlist(data.wishlist)
           }
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const toggleWishlist = async (productId: string) => {
    if (!auth.currentUser) return navigate("/login")

    // Note: We only allow wishlisting real items in database for this demo logic to persist correctly
    // If it's a dummy item, we just toggle UI state locally for visual effect
    if (productId.startsWith("dummy-")) {
        setWishlist(prev => 
            prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        )
        return
    }

    const userRef = doc(db, "users", auth.currentUser.uid)
    const isInWishlist = wishlist.includes(productId)

    try {
      if (isInWishlist) {
        await updateDoc(userRef, { wishlist: arrayRemove(productId) })
        setWishlist(prev => prev.filter(id => id !== productId))
      } else {
        await setDoc(userRef, { wishlist: arrayUnion(productId) }, { merge: true })
        setWishlist(prev => [...prev, productId])
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <Header />
      
      <div className="bg-[#103470] py-8 px-4">
        <div className="max-w-3xl mx-auto relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
           <input 
             type="text" 
             placeholder="Search textbooks, gadgets, hostel needs..." 
             className="w-full pl-12 pr-32 py-4 rounded-full shadow-lg outline-none text-gray-700"
           />
           <button className="absolute right-2 top-2 bottom-2 bg-[#2856c3] text-white px-6 rounded-full font-bold">Search</button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {loading ? (
            <p className="text-center py-10">Loading marketplace...</p>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition group">
                <Link to={`/product/${product.id}`}>
                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                        <img 
                            src={product.image || "/placeholder.svg"} 
                            alt={product.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        {product.location && (
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center">
                                <MapPin size={12} className="mr-1" /> {product.location}
                            </div>
                        )}
                    </div>
                </Link>

                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <Link to={`/product/${product.id}`} className="flex-1">
                            <h3 className="font-bold text-[#10102a] line-clamp-1 hover:text-[#103470]">{product.title}</h3>
                        </Link>
                        <button onClick={() => toggleWishlist(product.id)}>
                            <Heart size={20} className={wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"} />
                        </button>
                    </div>
                    
                    <p className="text-[#103470] font-extrabold text-lg mb-4">₦{parseInt(product.price).toLocaleString()}</p>
                    
                    <Link to={`/product/${product.id}`}>
                        <Button className="w-full bg-[#103470] hover:bg-[#2856c3] text-white rounded-lg">View Details</Button>
                    </Link>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  )
}