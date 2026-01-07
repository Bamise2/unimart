import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/home"
import MarketplacePage from "./pages/marketplace"
import ProductDetailsPage from "./pages/product-details"
import WishlistPage from "./pages/wishlist"
import LoginPage from "./pages/login"
import SignupPage from "./pages/signup"
import ProfilePage from "./pages/profile"
import ChatPage from "./pages/chat"
import SellPage from "./pages/sell"
import AdminPage from "./pages/admin"
import ServicesPage from "./pages/services"
import VerifyPage from "./pages/verify"
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/product/:id" element={<ProductDetailsPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/sell" element={<SellPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/verify-email" element={<VerifyPage />} />
    </Routes>
  )
}

export default App