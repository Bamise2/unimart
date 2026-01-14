import { Link, useLocation } from "react-router-dom"
import { Button } from "./ui/button"
import { User, LogOut, MessageCircle, Heart, Store, Menu, X, LayoutGrid } from "lucide-react"
import { auth } from "../libs/firebase"
import { signOut } from "firebase/auth"
import { useState, useEffect } from "react"

export default function Header() {
  const [user, setUser] = useState(auth.currentUser)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u))
    return () => unsubscribe()
  }, [])

  const handleLogout = () => {
    signOut(auth)
    window.location.href = "/"
  }

  if (location.pathname === "/login" || location.pathname === "/signup") return null

  const isLanding = location.pathname === "/" && !user

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* 1. LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center text-white font-bold text-lg">
              <img src="/ui logo.png" alt="Unimart Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-[#10102a]">Unimart</span>
          </Link>

          {/* 2. CENTER NAVIGATION (Guest Mode) */}
          {isLanding && (
            <nav className="hidden md:flex gap-8">
              {["Features", "How it works", "FAQs"].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '-')}`} className="text-sm font-medium text-gray-500 hover:text-[#103470] transition">
                  {item}
                </a>
              ))}
            </nav>
          )}

          {/* 3. RIGHT SIDE ACTIONS */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link to="/marketplace" className="flex items-center gap-1 text-gray-600 hover:text-[#103470] transition">
                    <LayoutGrid size={20} />
                    <span className="text-sm font-medium">Market</span>
                </Link>

                {/* <Link to="/lost-found" className="flex items-center gap-1 text-gray-600 hover:text-[#103470] transition">
                    <Search size={20} />
                    <span className="text-sm font-medium">Lost & Found</span>
                </Link> */}

                <Link to="/chat" className="flex items-center gap-1 text-gray-600 hover:text-[#103470] transition">
                    <MessageCircle size={20} />
                    <span className="text-sm font-medium">Chat</span>
                </Link>
                
                <Link to="/sell" className="flex items-center gap-1 text-gray-600 hover:text-[#103470] transition">
                    <Store size={20} />
                    <span className="text-sm font-medium">Sell</span>
                </Link>

                <div className="h-6 w-px bg-gray-200 mx-2"></div>

                <Link to="/profile" className="flex items-center gap-1 text-gray-600 hover:text-[#103470] transition">
                    <User size={20} />
                </Link>

                <Link to="/wishlist" className="text-gray-600 hover:text-red-500 transition">
                    <Heart size={22} />
                </Link>

                <button onClick={handleLogout} className="ml-2 text-gray-400 hover:text-red-500">
                    <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                    <Button variant="ghost" className="text-[#10102a] hover:bg-gray-50 font-bold">Sign In</Button>
                </Link>
                <Link to="/signup">
                    <Button className="bg-[#103470] hover:bg-[#2856c3] text-white rounded-full px-6 font-bold shadow-lg shadow-blue-900/20">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[#10102a]">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}