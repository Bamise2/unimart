import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Header from "../components/header"
import { Button } from "../components/ui/button"
import { Heart, MapPin, Search, Filter, Grid, List, ChevronDown, User } from "lucide-react"
import { db, auth } from "../libs/firebase"
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc, orderBy, query } from "firebase/firestore"
import type { Product } from "../libs/types"
import { DUMMY_PRODUCTS } from "../libs/dummyData"

export default function MarketplacePage() {
  const navigate = useNavigate()
  
  // Data State
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState<string[]>([])

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedPriceRange, setSelectedPriceRange] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Categories based on your reference
  const CATEGORIES = ["All", "Tech", "Beauty & Personal Care", "Clothing", "Books", "Services", "Other"]

  // Price Ranges
  const PRICE_RANGES = [
      { id: 'all', label: 'All Prices' },
      { id: 'under-10k', label: '₦0 - ₦10,000' },
      { id: '10k-50k', label: '₦10,000 - ₦50,000' },
      { id: '50k-100k', label: '₦50,000 - ₦100,000' },
      { id: 'above-100k', label: 'Above ₦100,000' },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch REAL items
        const q = query(collection(db, "listings"), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)
        const realItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product))

        // 2. Combine with Dummy
        setProducts([...realItems, ...DUMMY_PRODUCTS])

        // 3. Fetch Wishlist
        if (auth.currentUser) {
           const userRef = doc(db, "users", auth.currentUser.uid)
           const userSnap = await getDoc(userRef)
           if (userSnap.exists() && userSnap.data().wishlist) {
             setWishlist(userSnap.data().wishlist)
           }
        }
      } catch (error) { console.error("Error:", error) } finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const toggleWishlist = async (productId: string) => {
    if (!auth.currentUser) return navigate("/login")
    if (productId.startsWith("dummy-")) {
        setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId])
        return
    }
    const userRef = doc(db, "users", auth.currentUser.uid)
    try {
      if (wishlist.includes(productId)) {
        await updateDoc(userRef, { wishlist: arrayRemove(productId) })
        setWishlist(prev => prev.filter(id => id !== productId))
      } else {
        await setDoc(userRef, { wishlist: arrayUnion(productId) }, { merge: true })
        setWishlist(prev => [...prev, productId])
      }
    } catch (error) { console.error(error) }
  }

  // --- FILTERING LOGIC ---
  const filteredProducts = products.filter(product => {
      // 1. Search Filter
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      // 2. Category Filter
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory

      // 3. Price Filter
      const price = parseInt(product.price.replace(/[^0-9]/g, '')) || 0
      let matchesPrice = true
      if (selectedPriceRange === 'under-10k') matchesPrice = price < 10000
      if (selectedPriceRange === '10k-50k') matchesPrice = price >= 10000 && price <= 50000
      if (selectedPriceRange === '50k-100k') matchesPrice = price > 50000 && price <= 100000
      if (selectedPriceRange === 'above-100k') matchesPrice = price > 100000

      return matchesSearch && matchesCategory && matchesPrice
  })

  return (
    <div className="min-h-screen bg-[#fafaf9] font-sans">
      <Header />
      
      {/* BLUE HEADER SECTION */}
      <div className="bg-[#103470] pt-8 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-white mb-6">Find Anything on Campus</h1>
            <div className="max-w-3xl mx-auto relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What are you looking for?" 
                    className="w-full pl-14 pr-32 py-4 rounded-full shadow-lg outline-none text-white font-medium"
                />
                <button className="absolute right-2 top-2 bottom-2 bg-[#2856c3] hover:bg-[#1e4094] text-white px-8 rounded-full font-bold transition">
                    Search
                </button>
            </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 -mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* --- LEFT SIDEBAR (FILTERS) --- */}
            <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6 text-[#103470]">
                        <Filter size={20}/>
                        <h2 className="font-bold text-lg">Filter</h2>
                    </div>

                    {/* Categories */}
                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">Categories</h3>
                        <div className="space-y-1">
                            {CATEGORIES.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition flex justify-between items-center ${
                                        selectedCategory === cat 
                                        ? "bg-blue-50 text-[#103470] border-l-4 border-[#103470]" 
                                        : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">Price</h3>
                        <div className="space-y-3">
                            {PRICE_RANGES.map(range => (
                                <label key={range.id} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input 
                                            type="radio" 
                                            name="price" 
                                            checked={selectedPriceRange === range.id}
                                            onChange={() => setSelectedPriceRange(range.id)}
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-gray-300 checked:border-[#103470] transition-all"
                                        />
                                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-[#103470] opacity-0 peer-checked:opacity-100 transition-opacity"></span>
                                    </div>
                                    <span className={`text-sm ${selectedPriceRange === range.id ? "text-[#103470] font-bold" : "text-gray-600 group-hover:text-gray-900"}`}>
                                        {range.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1">
                {/* Sort Bar */}
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-500 text-sm">Showing <span className="font-bold text-[#10102a]">{filteredProducts.length}</span> results</p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 cursor-pointer">
                            <span className="text-sm text-gray-500">Sort by:</span>
                            <span className="text-sm font-bold text-[#10102a]">Recommended</span>
                            <ChevronDown size={16} className="text-gray-400"/>
                        </div>
                        <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                            <button className="p-2 bg-gray-100 rounded text-[#103470]"><Grid size={18}/></button>
                            <button className="p-2 text-gray-400 hover:text-gray-600"><List size={18}/></button>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="text-center py-20 bg-white rounded-2xl"><p>Loading marketplace...</p></div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Search size={48} className="mx-auto text-gray-300 mb-4"/>
                        <p className="text-gray-500 font-bold">No items found matching your filters.</p>
                        <button onClick={() => {setSelectedCategory("All"); setSelectedPriceRange("all"); setSearchQuery("")}} className="text-[#103470] mt-2 underline">Clear Filters</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition duration-300 group flex flex-col">
                                {/* Image Area */}
                                <div className="relative aspect-square overflow-hidden bg-gray-100">
                                    <Link to={`/product/${product.id}`}>
                                        <img 
                                            src={product.image || "/placeholder.svg"} 
                                            alt={product.title} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                        />
                                    </Link>
                                    {/* Location Badge */}
                                    {product.location && (
                                        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md flex items-center">
                                            <MapPin size={10} className="mr-1" /> {product.location}
                                        </div>
                                    )}
                                </div>

                                {/* Content Area */}
                                <div className="p-4 flex-1 flex flex-col">
                                    <Link to={`/product/${product.id}`}>
                                        <h3 className="font-bold text-[#10102a] text-lg mb-1 line-clamp-1 hover:text-[#103470] transition">
                                            {product.title}
                                        </h3>
                                    </Link>
                                    
                                    <p className="text-[#103470] font-extrabold text-xl mb-3">
                                        ₦{parseInt(product.price.replace(/[^0-9]/g, '')).toLocaleString()}
                                    </p>

                                    {/* Seller Mini Profile */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200">
                                            <User size={12}/>
                                        </div>
                                        <span className="text-xs text-gray-500 truncate">
                                            {product.sellerName || "Verified Student"}
                                        </span>
                                    </div>

                                    {/* Action Footer (Matches Reference) */}
                                    <div className="mt-auto flex gap-3">
                                        <Link to={`/product/${product.id}`} className="flex-1">
                                            <Button className="w-full bg-[#103470] hover:bg-[#2856c3] text-white rounded-xl font-bold py-5 shadow-lg shadow-blue-900/10">
                                                View Details
                                            </Button>
                                        </Link>
                                        <button 
                                            onClick={() => toggleWishlist(product.id)}
                                            className={`px-3 rounded-xl border transition ${
                                                wishlist.includes(product.id) 
                                                ? "border-red-200 bg-red-50 text-red-500" 
                                                : "border-gray-200 hover:border-[#103470] text-gray-400 hover:text-[#103470]"
                                            }`}
                                        >
                                            <Heart size={20} className={wishlist.includes(product.id) ? "fill-current" : ""} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination (Visual) */}
                {filteredProducts.length > 0 && (
                    <div className="mt-12 flex justify-center gap-2">
                        <button className="h-10 w-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-500">
                            &lt;
                        </button>
                        {[1, 2, 3].map(page => (
                            <button key={page} className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold ${page === 1 ? "bg-[#103470] text-white" : "border border-gray-200 hover:bg-gray-50 text-gray-600"}`}>
                                {page}
                            </button>
                        ))}
                        <button className="h-10 w-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-500">
                            &gt;
                        </button>
                    </div>
                )}
            </main>
        </div>
      </div>
    </div>
  )
}