import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/home"
import MarketplacePage from "./pages/marketplace"
import ProductDetailsPage from "./pages/product-details" // NEW PAGE
import WishlistPage from "./pages/wishlist"
import CartPage from "./pages/cart"
import LoginPage from "./pages/login"
import SignupPage from "./pages/signup"
import ProfilePage from "./pages/profile"
import ChatPage from "./pages/chat"
import SellPage from "./pages/sell"
import VerifyPage from "./pages/verify"
import AdminPage from "./pages/admin"

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/product/:id" element={<ProductDetailsPage />} /> 
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify-email" element={<VerifyPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/sell" element={<SellPage />} />
      <Route path="/admin" element={<AdminPage />} /> 
    </Routes>
  )
}

export default App