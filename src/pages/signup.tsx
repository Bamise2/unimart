import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react"
import { auth, db } from "../libs/firebase" // CONNECTS TO FIREBASE
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. CREATE USER IN FIREBASE AUTH
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // 2. GENERATE RANDOM 6-DIGIT CODE
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

      // 3. UPDATE FIREBASE PROFILE
      await updateProfile(user, { displayName: fullName })

      // 4. SAVE USER DATA & CODE TO FIRESTORE DB
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: fullName,
        email: email,
        university: "University of Ibadan",
        role: "student",
        isVerified: false, 
        verificationCode: verificationCode, // Storing code for verification
        createdAt: serverTimestamp()
      })

      // 5. SIMULATE EMAIL SENDING (Alert code for testing)
      alert(`DEMO MODE: Your Verification Code is ${verificationCode}`)
      
      // 6. REDIRECT TO VERIFY PAGE
      navigate("/verify-email")

    } catch (error: any) {
      console.error("Firebase Error:", error)
      alert("Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT SIDE - FORM */}
      <div className="flex flex-col justify-center bg-white p-8 lg:p-24 order-last lg:order-first">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-10">
            <Link to="/" className="flex items-center gap-2 mb-8 w-fit">
                <div className="flex h-10 w-10 items-center justify-center text-white font-bold text-lg">
                  <img src="/ui logo.png" alt="Unimart Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-xl font-bold text-[#103470]">Unimart</span>
            </Link>
            <h2 className="text-3xl font-bold text-[#10102a] mb-2">Create Account</h2>
            <p className="text-gray-500">Join the verified UI student marketplace.</p>
          </div>
          
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#10102a] mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input 
                  type="text" 
                  required
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#103470] outline-none transition bg-gray-50"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#10102a] mb-2">University Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input 
                  type="email" 
                  required
                  placeholder="yourname@stu.ui.edu.ng"
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
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#103470] outline-none transition bg-gray-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-[#103470]">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20}/>}
                </button>
              </div>
            </div>

            <Button disabled={loading} className="w-full bg-[#103470] hover:bg-[#2856c3] text-white py-6 rounded-xl text-lg font-bold shadow-xl shadow-blue-900/10 mt-4">
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>

            <div className="text-center mt-6">
              <span className="text-gray-500">Already have an account? </span>
              <Link to="/login" className="text-[#103470] font-bold hover:underline">Sign In</Link>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE - IMAGE */}
      <div className="hidden lg:block relative h-full w-full">
        <img src="/ui-gateImage.jpg" alt="University of Ibadan Gate" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#103470]/80 mix-blend-multiply"></div>
        <div className="absolute bottom-20 left-12 right-12 text-white z-10">
           <h1 className="text-4xl font-extrabold mb-4 leading-tight">First and Best. <br/> Buying and Selling.</h1>
           <p className="text-blue-100 text-lg">Experience the safest way to trade within the University of Ibadan campus community.</p>
        </div>
      </div>
    </div>
  )
}