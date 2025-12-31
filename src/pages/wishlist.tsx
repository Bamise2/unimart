import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Header from "../components/header"
import { Button } from "../components/ui/button"
import { Heart, Trash2 } from "lucide-react"
import { db, auth } from "../libs/firebase"
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore"
import type { Product } from "../libs/types"

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!auth.currentUser) return navigate("/login")

      try {
        const userRef = doc(db, "users", auth.currentUser.uid)
        const userSnap = await getDoc(userRef)
        
        if (userSnap.exists() && userSnap.data().wishlist && userSnap.data().wishlist.length > 0) {
           const ids = userSnap.data().wishlist
           const items: Product[] = []
           
           for (const id of ids) {
             const prodSnap = await getDoc(doc(db, "listings", id))
             if (prodSnap.exists()) {
               items.push({ id: prodSnap.id, ...prodSnap.data() } as Product)
             }
           }
           setWishlistItems(items)
        }
      } catch (error) {
        console.error("Error loading wishlist:", error)
      } finally {
        setLoading(false)
      }
    }

    const unsubscribe = auth.onAuthStateChanged((u) => {
        if (u) fetchWishlist()
        else navigate("/login")
    })
    return () => unsubscribe()

  }, [navigate])

  const removeFromWishlist = async (productId: string) => {
    if (!auth.currentUser) return
    try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
            wishlist: arrayRemove(productId)
        })
        setWishlistItems(prev => prev.filter(item => item.id !== productId))
    } catch (e) {
        console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <Header />
      
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-[#10102a] mb-8 flex items-center gap-3">
            <Heart className="fill-[#103470] text-[#103470]" /> My Wishlist
        </h1>

        {loading ? (
            <p>Loading...</p>
        ) : wishlistItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
                <Link to="/marketplace">
                    <Button className="bg-[#103470] text-white">Browse Market</Button>
                </Link>
            </div>
        ) : (
            <div className="space-y-4">
                {wishlistItems.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm">
                        <div className="h-20 w-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                            <img src={item.image || "/placeholder.svg"} className="w-full h-full object-cover" alt={item.title}/>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-[#10102a]">{item.title}</h3>
                            <p className="text-[#103470] font-bold">₦{parseInt(item.price).toLocaleString()}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                             <Link to={`/product/${item.id}`}>
                                <Button size="sm" className="bg-[#103470] text-white w-full">View</Button>
                             </Link>
                             <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-500 border-red-100 hover:bg-red-50"
                                onClick={() => removeFromWishlist(item.id)}
                             >
                                <Trash2 size={16} />
                             </Button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  )
}