import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import Header from "../components/header"
import { Button } from "../components/ui/button"
import { User, Heart, Settings, LogOut, Store, Trash2 } from "lucide-react"
import { auth, db } from "../libs/firebase"
import { onAuthStateChanged, updateProfile, signOut } from "firebase/auth"
import { 
    doc, updateDoc, getDoc, collection, query, where, getDocs, deleteDoc, arrayRemove 
} from "firebase/firestore"
import type { Product } from "../libs/types"

export default function ProfilePage() {
  const [user, setUser] = useState(auth.currentUser)
  const [activeTab, setActiveTab] = useState("store")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  // Profile Data
  const [displayName, setDisplayName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  
  // Tab Data
  const [myProducts, setMyProducts] = useState<Product[]>([])
  const [wishlistItems, setWishlistItems] = useState<Product[]>([])
  
  const [dataLoading, setDataLoading] = useState(false)
  const navigate = useNavigate()

  // 1. Listen for Auth & Load User Profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        navigate("/login")
      } else {
        setUser(u)
        setDisplayName(u.displayName || "")
        try {
            const docRef = doc(db, "users", u.uid)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
                setPhoneNumber(docSnap.data().phoneNumber || "")
            }
        } catch (error) {
            console.error(error)
        }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [navigate])

  // 2. Fetch Data based on Active Tab
  useEffect(() => {
    const fetchData = async () => {
        if (!user) return
        setDataLoading(true)

        try {
            // A. FETCH MY STORE PRODUCTS
            if (activeTab === "store") {
                const q = query(collection(db, "listings"), where("sellerId", "==", user.uid))
                const querySnapshot = await getDocs(q)
                const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product))
                setMyProducts(items)
            } 
            
            // B. FETCH WISHLIST
            else if (activeTab === "wishlist") {
                const userRef = doc(db, "users", user.uid)
                const userSnap = await getDoc(userRef)
                
                if (userSnap.exists() && userSnap.data().wishlist) {
                    const ids = userSnap.data().wishlist as string[]
                    if (ids.length > 0) {
                        const loadedProducts: Product[] = []
                        for (const id of ids) {
                             if (id.startsWith('dummy-')) continue; // Skip dummy items in DB fetch
                             const docRef = doc(db, "listings", id)
                             const docSnap = await getDoc(docRef)
                             if (docSnap.exists()) {
                                 loadedProducts.push({ id: docSnap.id, ...docSnap.data() } as Product)
                             }
                        }
                        setWishlistItems(loadedProducts)
                    } else {
                        setWishlistItems([])
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching tab data:", error)
        } finally {
            setDataLoading(false)
        }
    }
    fetchData()
  }, [user, activeTab])

  // --- ACTIONS ---

  const handleUpdateProfile = async () => {
    if (!user) return
    setUpdating(true)
    try {
        await updateProfile(user, { displayName })
        await updateDoc(doc(db, "users", user.uid), { displayName, phoneNumber })
        alert("Profile updated successfully!")
    } catch (error) {
        alert("Failed to update profile.")
    } finally {
        setUpdating(false)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    navigate("/")
  }

  const handleStatusChange = async (productId: string, newStatus: string) => {
    try {
        await updateDoc(doc(db, "listings", productId), { status: newStatus })
        setMyProducts(prev => prev.map(p => p.id === productId ? { ...p, status: newStatus } : p))
    } catch (error) {
        alert("Failed to update status")
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Delete this item?")) return
    try {
        await deleteDoc(doc(db, "listings", productId))
        setMyProducts(prev => prev.filter(p => p.id !== productId))
    } catch (error) {
        alert("Failed to delete item")
    }
  }

  const removeFromWishlist = async (productId: string) => {
    if (!user) return
    try {
        await updateDoc(doc(db, "users", user.uid), {
            wishlist: arrayRemove(productId)
        })
        setWishlistItems(prev => prev.filter(item => item.id !== productId))
    } catch (e) {
        console.error(e)
    }
  }

  if (loading) return <div className="p-10 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-[#103470]/10 flex items-center justify-center text-[#103470] text-4xl font-bold">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={40} />}
            </div>
            <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-[#10102a]">{user?.displayName || "Student"}</h1>
                <p className="text-gray-500">{user?.email}</p>
                <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        UI Student
                    </span>
                </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                <LogOut size={16} className="mr-2"/> Sign Out
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="md:col-span-1 space-y-1">
                {[
                    { id: "store", icon: Store, label: "My Store" },
                    { id: "wishlist", icon: Heart, label: "Wishlist" },
                    { id: "settings", icon: Settings, label: "Settings" }
                ].map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id)} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === tab.id ? "bg-[#103470] text-white shadow-lg shadow-blue-900/10" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="md:col-span-3 bg-white rounded-2xl border border-gray-100 p-8 min-h-[500px]">
                
                {/* --- MY STORE --- */}
                {activeTab === "store" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-[#10102a]">Manage Products</h2>
                            <Link to="/sell"><Button className="bg-[#103470] text-white text-sm">Add New Item</Button></Link>
                        </div>
                        {dataLoading ? <p className="text-center py-10">Loading store...</p> : myProducts.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                                <Store size={40} className="mx-auto text-gray-300 mb-4"/>
                                <p className="text-gray-500 mb-4">No items listed yet.</p>
                                <Link to="/sell"><Button variant="outline">Start Selling</Button></Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myProducts.map(item => (
                                    <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-gray-100 rounded-xl bg-white">
                                        <div className="h-16 w-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 text-center sm:text-left w-full">
                                            <h3 className="font-bold text-[#10102a] line-clamp-1">{item.title}</h3>
                                            <p className="text-[#103470] font-bold">₦{parseInt(item.price).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <select 
                                                value={item.status || "active"}
                                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                className="text-xs font-bold px-3 py-2 rounded-lg bg-gray-50 border-none outline-none"
                                            >
                                                <option value="active">Active</option>
                                                <option value="sold">Sold</option>
                                                <option value="out-stock">No Stock</option>
                                            </select>
                                            <button onClick={() => handleDeleteProduct(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {/* --- WISHLIST --- */}
                {activeTab === "wishlist" && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-[#10102a] mb-6">My Wishlist</h2>
                        {dataLoading ? <p className="text-center py-10">Loading wishlist...</p> : wishlistItems.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                                <Heart size={40} className="mx-auto text-gray-300 mb-4"/>
                                <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
                                <Link to="/marketplace"><Button>Browse Market</Button></Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {wishlistItems.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-sm transition bg-white">
                                        <div className="h-16 w-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-[#10102a] line-clamp-1">{item.title}</h3>
                                            <p className="text-[#103470] font-bold">₦{parseInt(item.price).toLocaleString()}</p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Link to={`/product/${item.id}`}>
                                                <Button size="sm" className="bg-[#103470] text-white h-8 text-xs">View</Button>
                                            </Link>
                                            <button onClick={() => removeFromWishlist(item.id)} className="text-red-400 text-xs hover:underline">Remove</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {/* --- SETTINGS --- */}
                {activeTab === "settings" && (
                    <div className="max-w-md space-y-6">
                        <h2 className="text-xl font-bold text-[#10102a]">Account Settings</h2>
                        <div><label className="block text-sm font-bold mb-2">Display Name</label><input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full border p-3 rounded-xl"/></div>
                        <div><label className="block text-sm font-bold mb-2">Phone Number</label><input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full border p-3 rounded-xl"/></div>
                        <Button onClick={handleUpdateProfile} disabled={updating} className="bg-[#103470] text-white w-full py-3 rounded-xl">{updating ? "Saving..." : "Save Changes"}</Button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}