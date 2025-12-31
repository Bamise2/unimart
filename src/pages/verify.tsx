import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { auth, db } from "../libs/firebase" // CONNECTS TO FIREBASE
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

export default function VerifyPage() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    // Ensure user is authenticated before verifying
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login")
      } else {
        setUserEmail(user.email || "")
      }
    })
    return () => unsubscribe()
  }, [navigate])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!auth.currentUser) return

    try {
      // 1. GET USER DATA FROM FIRESTORE
      const userRef = doc(db, "users", auth.currentUser.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const data = userSnap.data()
        
        // 2. CHECK IF CODE MATCHES
        if (data.verificationCode === code) {
          // 3. UPDATE USER AS VERIFIED
          await updateDoc(userRef, {
            isVerified: true,
            verificationCode: null // Security: remove code after use
          })
          alert("Success! Your email is verified.")
          navigate("/marketplace")
        } else {
          setError("Invalid code. Please check your email/alert again.")
        }
      } else {
        setError("User record not found.")
      }
    } catch (err: any) {
      console.error("Verification error:", err)
      setError("Verification failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f7ff] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#103470]">
          {/* Lock Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        </div>
        
        <h2 className="text-2xl font-bold text-[#10102a] mb-2">Verify your Email</h2>
        <p className="text-gray-500 mb-8">
          Enter the 6-digit code sent to <br/>
          <span className="font-bold text-[#103470]">{userEmail}</span>
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="0 0 0 0 0 0"
            className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 border-2 border-gray-200 rounded-xl focus:border-[#103470] focus:ring-0 outline-none transition text-[#103470]"
          />
          
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <Button disabled={loading} className="w-full bg-[#103470] hover:bg-[#2856c3] text-white py-6 rounded-xl text-lg font-bold">
            {loading ? "Verifying..." : "Verify Code"}
          </Button>
        </form>
      </div>
    </div>
  )
}