import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Header from "../components/header"
import { Button } from "../components/ui/button"
import { Heart, MapPin, Search, Filter, Grid, List, ChevronDown, Sparkles, TrendingUp, Zap, ShoppingBag, BookOpen, Laptop, Scissors, Package, Star, Eye, ArrowRight, X } from "lucide-react"
import { db, auth } from "../libs/firebase"
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc, orderBy, query } from "firebase/firestore"
import type { Product } from "../libs/types"
import { DUMMY_PRODUCTS } from "../libs/dummyData"

// Category icons mapping
const CATEGORY_ICONS: { [key: string]: React.ReactNode } = {
  "All": <Sparkles size={16} />,
  "Tech": <Laptop size={16} />,
  "Beauty & Personal Care": <Scissors size={16} />,
  "Clothing": <ShoppingBag size={16} />,
  "Books": <BookOpen size={16} />,
  "Services": <Zap size={16} />,
  "Other": <Package size={16} />
}

// Skeleton Card Component
const SkeletonCard = () => (
  <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-200 rounded-full w-3/4" />
      <div className="h-6 bg-gray-200 rounded-full w-1/2" />
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200" />
        <div className="h-3 bg-gray-200 rounded-full w-24" />
      </div>
      <div className="h-12 bg-gray-200 rounded-xl w-full mt-4" />
    </div>
  </div>
)

export default function MarketplacePage() {
  const navigate = useNavigate()
  
  // Data State
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState<string[]>([])

  const [searchFocused, setSearchFocused] = useState(false)

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedPriceRange, setSelectedPriceRange] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")


  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

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
                            (product.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      
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

  // Active filters count
  const activeFiltersCount = (selectedCategory !== "All" ? 1 : 0) + (selectedPriceRange !== "all" ? 1 : 0) + (searchQuery ? 1 : 0)

  const clearAllFilters = () => {
    setSelectedCategory("All")
    setSelectedPriceRange("all")
    setSearchQuery("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafaf9] to-[#f0f4f8] font-sans">
      <Header />
      
      {/* ANIMATED HERO HEADER SECTION */}
      <div className="relative bg-gradient-to-br from-[#103470] via-[#1a4a8f] to-[#0d2850] pt-12 pb-24 px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#2856c3]/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#103470]/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2856c3]/10 rounded-full blur-3xl" />
          {/* Floating dots */}
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-bounce"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Trending badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/20">
            <TrendingUp size={14} className="text-green-400" />
            <span className="text-white/90 text-sm font-medium">1,234 items listed this week</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Discover Amazing Deals
            <span className="block text-2xl md:text-3xl font-normal text-white/70 mt-2">on Campus</span>
          </h1>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">Buy, sell, and connect with fellow students. Your one-stop marketplace for everything on campus.</p>
          
          {/* Enhanced Search Bar */}
          <div className={`max-w-3xl mx-auto relative transition-all duration-500 ${searchFocused ? 'scale-105' : ''}`}>
            <div className={`absolute inset-0 bg-white/20 rounded-full blur-xl transition-opacity duration-300 ${searchFocused ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`relative bg-white/95 backdrop-blur-xl rounded-full shadow-2xl border-2 transition-all duration-300 ${searchFocused ? 'border-white shadow-white/20' : 'border-transparent'}`}>
              <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors duration-300 ${searchFocused ? 'text-[#103470]' : 'text-gray-400'}`} size={22} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search for anything..." 
                className="w-full pl-14 pr-36 py-5 rounded-full outline-none text-gray-800 font-medium text-lg bg-transparent placeholder:text-gray-400"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-[#103470] to-[#2856c3] hover:from-[#0d2850] hover:to-[#1a4a8f] text-white px-8 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2">
                <Search size={18} />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>

          {/* Quick category chips */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {CATEGORIES.slice(1, 5).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === cat 
                  ? 'bg-white text-[#103470] shadow-lg scale-105' 
                  : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/20'
                }`}
              >
                {CATEGORY_ICONS[cat]}
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Active Filters Bar */}
        {activeFiltersCount > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-fadeIn">
            <span className="text-sm text-gray-500 font-medium">Active filters:</span>
            {selectedCategory !== "All" && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#103470]/10 text-[#103470] rounded-full text-sm font-medium">
                {CATEGORY_ICONS[selectedCategory]}
                {selectedCategory}
                <button onClick={() => setSelectedCategory("All")} className="ml-1 hover:bg-[#103470]/20 rounded-full p-0.5">
                  <X size={12} />
                </button>
              </span>
            )}
            {selectedPriceRange !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#103470]/10 text-[#103470] rounded-full text-sm font-medium">
                {PRICE_RANGES.find(r => r.id === selectedPriceRange)?.label}
                <button onClick={() => setSelectedPriceRange("all")} className="ml-1 hover:bg-[#103470]/20 rounded-full p-0.5">
                  <X size={12} />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#103470]/10 text-[#103470] rounded-full text-sm font-medium">
                🔍 "{searchQuery}"
                <button onClick={() => setSearchQuery("")} className="ml-1 hover:bg-[#103470]/20 rounded-full p-0.5">
                  <X size={12} />
                </button>
              </span>
            )}
            <button onClick={clearAllFilters} className="ml-auto text-sm text-red-500 hover:text-red-600 font-medium hover:underline">
              Clear all
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* --- LEFT SIDEBAR (FILTERS) --- */}
            <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-[#103470]">
                            <div className="p-2 bg-[#103470]/10 rounded-xl">
                                <Filter size={18}/>
                            </div>
                            <h2 className="font-bold text-lg">Filters</h2>
                        </div>
                        {activeFiltersCount > 0 && (
                          <span className="px-2.5 py-1 bg-[#103470] text-white text-xs font-bold rounded-full">
                            {activeFiltersCount}
                          </span>
                        )}
                    </div>

                    {/* Categories */}
                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider flex items-center gap-2">
                          <span>Categories</span>
                          <div className="flex-1 h-px bg-gray-200" />
                        </h3>
                        <div className="space-y-2">
                            {CATEGORIES.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-3 group ${
                                        selectedCategory === cat 
                                        ? "bg-gradient-to-r from-[#103470] to-[#2856c3] text-white shadow-lg shadow-blue-500/20 scale-[1.02]" 
                                        : "text-gray-600 hover:bg-gray-50 hover:scale-[1.01]"
                                    }`}
                                >
                                    <span className={`p-1.5 rounded-lg transition-colors ${selectedCategory === cat ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                                      {CATEGORY_ICONS[cat]}
                                    </span>
                                    {cat}
                                    {selectedCategory === cat && (
                                      <ArrowRight size={14} className="ml-auto" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider flex items-center gap-2">
                          <span>Price Range</span>
                          <div className="flex-1 h-px bg-gray-200" />
                        </h3>
                        <div className="space-y-2">
                            {PRICE_RANGES.map(range => (
                                <label 
                                  key={range.id} 
                                  className={`flex items-center gap-3 cursor-pointer group p-3 rounded-xl transition-all duration-300 ${
                                    selectedPriceRange === range.id 
                                    ? 'bg-[#103470]/5 border-2 border-[#103470]/20' 
                                    : 'hover:bg-gray-50 border-2 border-transparent'
                                  }`}
                                >
                                    <div className="relative flex items-center">
                                        <input 
                                            type="radio" 
                                            name="price" 
                                            checked={selectedPriceRange === range.id}
                                            onChange={() => setSelectedPriceRange(range.id)}
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-gray-300 checked:border-[#103470] transition-all"
                                        />
                                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-[#103470] scale-0 peer-checked:scale-100 transition-transform"></span>
                                    </div>
                                    <span className={`text-sm transition-colors ${selectedPriceRange === range.id ? "text-[#103470] font-bold" : "text-gray-600 group-hover:text-gray-900"}`}>
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
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#103470]/10 rounded-xl">
                        <ShoppingBag size={18} className="text-[#103470]" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-bold text-lg">{filteredProducts.length} Items</p>
                        <p className="text-gray-500 text-xs">Found for you</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                            <span className="text-sm text-gray-500">Sort:</span>
                            <span className="text-sm font-bold text-[#10102a]">Recommended</span>
                            <ChevronDown size={16} className="text-gray-400"/>
                        </div>
                        <div className="flex bg-gray-50 rounded-xl p-1">
                            <button 
                              onClick={() => setViewMode("grid")}
                              className={`p-2.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-[#103470] text-white shadow-md" : "text-gray-400 hover:text-gray-600"}`}
                            >
                              <Grid size={18}/>
                            </button>
                            <button 
                              onClick={() => setViewMode("list")}
                              className={`p-2.5 rounded-lg transition-all ${viewMode === "list" ? "bg-[#103470] text-white shadow-md" : "text-gray-400 hover:text-gray-600"}`}
                            >
                              <List size={18}/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                      {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <Search size={32} className="text-gray-300"/>
                        </div>
                        <h3 className="text-gray-900 font-bold text-xl mb-2">No items found</h3>
                        <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                        <button 
                          onClick={clearAllFilters} 
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#103470] text-white rounded-xl font-bold hover:bg-[#2856c3] transition-colors shadow-lg shadow-blue-500/20"
                        >
                          <X size={16} />
                          Clear All Filters
                        </button>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                        {filteredProducts.map((product, index) => (
                            <div 
                              key={product.id} 
                              className={`bg-white rounded-3xl border border-gray-100 overflow-hidden group flex transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 ${viewMode === "list" ? "flex-row" : "flex-col"}`}
                              style={{ 
                                animationDelay: `${index * 50}ms`,
                                animation: 'fadeInUp 0.5s ease-out forwards',
                                opacity: 0
                              }}

                            >
                                {/* Image Area */}
                                <div className={`relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 ${viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-square"}`}>
                                    <Link to={`/product/${product.id}`}>
                                        <img 
                                            src={product.image || "/placeholder.svg"} 
                                            alt={product.title} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </Link>
                                    
                                    {/* Overlay gradient on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    
                                    {/* Quick view button */}
                                    <Link 
                                      to={`/product/${product.id}`}
                                      className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm text-[#103470] py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
                                    >
                                      <Eye size={16} />
                                      Quick View
                                    </Link>
                                    
                                    {/* Location Badge */}
                                    {product.location && (
                                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                                            <MapPin size={10} /> {product.location}
                                        </div>
                                    )}
                                    
                                    {/* Wishlist button */}
                                    <button 
                                        onClick={(e) => { e.preventDefault(); toggleWishlist(product.id) }}
                                        className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 shadow-lg ${
                                            wishlist.includes(product.id) 
                                            ? "bg-red-500 text-white scale-110" 
                                            : "bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500 hover:scale-110"
                                        }`}
                                    >
                                        <Heart size={16} className={wishlist.includes(product.id) ? "fill-current" : ""} />
                                    </button>

                                    {/* Category badge */}
                                    <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-0 transition-opacity">
                                      <span className="px-3 py-1 bg-[#103470] text-white text-xs font-medium rounded-full">
                                        {product.category}
                                      </span>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className={`p-5 flex-1 flex flex-col ${viewMode === "list" ? "justify-center" : ""}`}>
                                    {/* Category & Rating */}
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-medium text-[#103470] bg-[#103470]/10 px-2.5 py-1 rounded-full">
                                        {product.category}
                                      </span>
                                      <div className="flex items-center gap-1 text-yellow-500">
                                        <Star size={12} className="fill-current" />
                                        <span className="text-xs font-medium text-gray-600">4.8</span>
                                      </div>
                                    </div>

                                    <Link to={`/product/${product.id}`}>
                                        <h3 className="font-bold text-[#10102a] text-lg mb-2 line-clamp-1 hover:text-[#103470] transition-colors">
                                            {product.title}
                                        </h3>
                                    </Link>
                                    
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                                      {product.description}
                                    </p>
                                    
                                    <div className="flex items-baseline gap-2 mb-4">
                                      <p className="text-[#103470] font-extrabold text-2xl">
                                          ₦{parseInt(product.price.replace(/[^0-9]/g, '')).toLocaleString()}
                                      </p>
                                    </div>

                                    {/* Seller Mini Profile */}
                                    <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#103470] to-[#2856c3] flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                                            {(product.sellerName || "V")[0].toUpperCase()}
                                        </div>
                                        <div>
                                          <span className="text-sm font-medium text-gray-900 block">
                                              {product.sellerName || "Verified Student"}
                                          </span>
                                          <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                            Active seller
                                          </span>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="mt-auto">
                                        <Link to={`/product/${product.id}`} className="block">
                                            <Button className="w-full bg-gradient-to-r from-[#103470] to-[#2856c3] hover:from-[#0d2850] hover:to-[#1a4a8f] text-white rounded-xl font-bold py-6 shadow-xl shadow-blue-500/20 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] flex items-center justify-center gap-2">
                                                <ShoppingBag size={18} />
                                                View Details
                                                <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination (Enhanced) */}
                {filteredProducts.length > 0 && (
                    <div className="mt-12 flex justify-center items-center gap-3">
                        <button className="h-12 w-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-[#103470] text-gray-500 hover:text-[#103470] transition-all shadow-sm">
                            &lt;
                        </button>
                        {[1, 2, 3, '...', 10].map((page, i) => (
                            <button 
                              key={i} 
                              className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold transition-all ${
                                page === 1 
                                ? "bg-gradient-to-r from-[#103470] to-[#2856c3] text-white shadow-lg shadow-blue-500/20" 
                                : typeof page === 'number' 
                                  ? "bg-white border border-gray-200 hover:border-[#103470] hover:text-[#103470] text-gray-600 shadow-sm" 
                                  : "text-gray-400 cursor-default"
                              }`}
                              disabled={typeof page !== 'number'}
                            >
                                {page}
                            </button>
                        ))}
                        <button className="h-12 w-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-[#103470] text-gray-500 hover:text-[#103470] transition-all shadow-sm">
                            &gt;
                        </button>
                    </div>
                )}
            </main>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}