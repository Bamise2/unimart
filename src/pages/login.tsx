import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { auth } from "../libs/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/marketplace")
    } catch (err: any) {
      setError("Invalid credentials. Please try again.")
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      
      {/* 1. LEFT SIDE - FORM */}
      <div className="flex flex-col justify-center bg-white p-8 lg:p-24 order-last lg:order-first">
        <div className="mx-auto w-full max-w-md">
          
          <div className="mb-10">
            <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl  text-white font-bold text-lg shadow-blue-900/20 shadow-lg">
              <img src="/ui logo.png" alt="" />
            </div>
            <span className="text-xl font-bold text-[#10102a]">Unimart</span>
          </Link>
            <h2 className="text-3xl font-bold text-[#10102a] mb-2">Welcome Back!</h2>
            <p className="text-gray-500">Log in to continue to your dashboard.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">{error}</div>}
            
            <div>
              <label className="block text-sm font-bold text-[#10102a] mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input 
                  type="email" 
                  required
                  placeholder="yourname@student.ui.edu.ng"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#103470] outline-none transition bg-gray-50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#10102a] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#103470] outline-none transition bg-gray-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-[#103470]">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20}/>}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link to="#" className="text-sm font-medium text-[#103470] hover:underline">Forgot Password?</Link>
              </div>
            </div>

            <Button className="w-full bg-[#103470] hover:bg-[#2856c3] text-white py-6 rounded-xl text-lg font-bold shadow-xl shadow-blue-900/10 mt-4">
              Sign In
            </Button>

            <div className="text-center mt-6">
              <span className="text-gray-500">Don't have an account? </span>
              <Link to="/signup" className="text-[#103470] font-bold hover:underline">
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* 2. RIGHT SIDE - IMAGE */}
      <div className="hidden lg:block relative h-full w-full">
        <img 
            src="/ui-gateImage.jpg" 
            alt="University of Ibadan Gate" 
            className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Blue overlay matching brand color */}
        <div className="absolute inset-0 bg-[#103470]/80 mix-blend-multiply"></div>
        
        <div className="absolute bottom-20 left-12 right-12 text-white z-10">
           <h1 className="text-4xl font-extrabold mb-4 leading-tight">Secure. Reliable. <br/> Campus Trade.</h1>
           <p className="text-blue-100 text-lg">Join thousands of UI students buying and selling every day.</p>
        </div>
      </div>

    </div>
  )
}