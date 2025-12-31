import { useState } from "react"
import Header from "../components/header"
import { Button } from "../components/ui/button"
import { ShieldAlert, Users, Package, Trash2, CheckCircle, Lock, Eye, X } from "lucide-react"
import { db } from "../libs/firebase"
import { 
    collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy, where, writeBatch 
} from "firebase/firestore"
import type { Product, UserData, Report } from "../libs/types"

export default function AdminPage() {
  // --- ADMIN AUTH STATE ---
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [emailInput, setEmailInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")

  // --- DASHBOARD DATA STATE ---
  const [activeTab, setActiveTab] = useState("reports")
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<UserData[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [reports, setReports] = useState<Report[]>([])

  // --- MODAL STATE ---
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  // Hardcoded Admin Credentials
  const ADMIN_EMAIL = "bamiseshogbesan2004@gmail.com"
  const ADMIN_PASS = "bamise"

  const handleAdminLogin = (e: React.FormEvent) => {
      e.preventDefault()
      if (emailInput === ADMIN_EMAIL && passwordInput === ADMIN_PASS) {
          setIsAdminAuthenticated(true)
          fetchAllData()
      } else {
          alert("Invalid Admin Credentials")
      }
  }

  const fetchAllData = async () => {
    setLoading(true)
    try {
        // 1. Fetch Users
        const usersSnap = await getDocs(collection(db, "users"))
        setUsers(usersSnap.docs.map(d => ({ uid: d.id, ...d.data() } as UserData)))

        // 2. Fetch Products
        const productsSnap = await getDocs(collection(db, "listings"))
        setProducts(productsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)))

        // 3. Fetch Reports
        const reportsSnap = await getDocs(query(collection(db, "reports"), orderBy("createdAt", "desc")))
        setReports(reportsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Report)))

    } catch (error) {
        console.error("Admin Load Error:", error)
    } finally {
        setLoading(false)
    }
  }

  // --- ACTIONS ---

  const handleDeleteProduct = async (id: string) => {
      if(!confirm("Permanently delete this item?")) return
      try {
        await deleteDoc(doc(db, "listings", id))
        setProducts(prev => prev.filter(p => p.id !== id))
      } catch (e) { alert("Failed to delete item") }
  }

  const handleResolveReport = async (id: string) => {
      try {
        await updateDoc(doc(db, "reports", id), { status: 'resolved' })
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r))
        if (selectedReport?.id === id) setSelectedReport(prev => prev ? {...prev, status: 'resolved'} : null)
      } catch (e) { alert("Failed to update report") }
  }

  // NEW: Delete User & All their Data
  const handleDeleteUser = async (uid: string) => {
      const confirmDelete = prompt("Type 'DELETE' to confirm banning this user and wiping their data. This cannot be undone.")
      if (confirmDelete !== "DELETE") return

      try {
          const batch = writeBatch(db)

          // 1. Delete User Profile
          const userRef = doc(db, "users", uid)
          batch.delete(userRef)

          // 2. Delete All User's Listings
          const userProducts = products.filter(p => p.sellerId === uid)
          userProducts.forEach(p => {
              const prodRef = doc(db, "listings", p.id)
              batch.delete(prodRef)
          })

          await batch.commit()

          // Update State
          setUsers(prev => prev.filter(u => u.uid !== uid))
          setProducts(prev => prev.filter(p => p.sellerId !== uid))
          alert(`User banned and ${userProducts.length} items removed.`)

      } catch (error) {
          console.error(error)
          alert("Failed to delete user data.")
      }
  }

  // --- HELPERS FOR REPORT DETAILS ---
  const getUserName = (uid: string) => {
      const u = users.find(user => user.uid === uid)
      return u ? `${u.displayName} (${u.email})` : "Unknown ID: " + uid
  }

  const getProductName = (id?: string) => {
      if (!id) return "N/A"
      const p = products.find(prod => prod.id === id)
      return p ? p.title : "Deleted Item or ID: " + id
  }

  // --- 1. LOGIN SCREEN ---
  if (!isAdminAuthenticated) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
                  <div className="text-center mb-8">
                      <div className="h-16 w-16 bg-[#103470]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#103470]">
                          <ShieldAlert size={32} />
                      </div>
                      <h1 className="text-2xl font-bold text-[#10102a]">Admin Portal</h1>
                      <p className="text-gray-500">Restricted Access Only</p>
                  </div>
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Admin Email</label>
                          <input 
                              type="email" 
                              value={emailInput}
                              onChange={(e) => setEmailInput(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#103470]"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                          <input 
                              type="password" 
                              value={passwordInput}
                              onChange={(e) => setPasswordInput(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#103470]"
                          />
                      </div>
                      <Button type="submit" className="w-full bg-[#103470] hover:bg-[#2856c3] text-white py-6 rounded-xl text-lg font-bold">
                          Access Dashboard
                      </Button>
                  </form>
              </div>
          </div>
      )
  }

  // --- 2. DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#fafaf9] font-sans relative">
      <Header />
      
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#10102a] flex items-center gap-2">
                <ShieldAlert className="text-red-600"/> Admin Dashboard
            </h1>
            <Button onClick={() => setIsAdminAuthenticated(false)} variant="outline" className="border-red-200 text-red-500">
                <Lock size={16} className="mr-2"/> Logout Admin
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="space-y-2">
                <button onClick={() => setActiveTab("reports")} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 ${activeTab === "reports" ? "bg-red-50 text-red-600" : "bg-white text-gray-500"}`}>
                    <ShieldAlert size={20}/> Reports <span className="ml-auto bg-red-100 px-2 rounded-full text-xs">{reports.filter(r => r.status === 'pending').length}</span>
                </button>
                <button onClick={() => setActiveTab("products")} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 ${activeTab === "products" ? "bg-[#103470] text-white" : "bg-white text-gray-500"}`}>
                    <Package size={20}/> Listings
                </button>
                <button onClick={() => setActiveTab("users")} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 ${activeTab === "users" ? "bg-[#103470] text-white" : "bg-white text-gray-500"}`}>
                    <Users size={20}/> Users
                </button>
            </div>

            {/* Content Area */}
            <div className="md:col-span-3 bg-white rounded-2xl border border-gray-100 p-6 min-h-[500px]">
                {loading && <p className="text-center py-10">Loading data...</p>}

                {/* REPORTS TAB */}
                {!loading && activeTab === "reports" && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-4">User Reports</h2>
                        {reports.length === 0 ? <p className="text-gray-400">No reports found.</p> : (
                            reports.map(report => (
                                <div key={report.id} className={`p-4 border rounded-xl flex justify-between items-center ${report.status === 'resolved' ? 'bg-gray-50 opacity-60' : 'bg-red-50 border-red-100'}`}>
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">{report.reason}</span>
                                        <p className="font-bold text-[#10102a] mt-1 truncate max-w-md">{report.description}</p>
                                    </div>
                                    <Button onClick={() => setSelectedReport(report)} size="sm" variant="outline" className="bg-white border-gray-200">
                                        <Eye size={16} className="mr-2"/> View Details
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* USERS TAB */}
                {!loading && activeTab === "users" && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-4">Registered Users ({users.length})</h2>
                        {users.map(u => (
                            <div key={u.uid} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50">
                                <div>
                                    <h4 className="font-bold text-[#10102a]">{u.displayName || "No Name"}</h4>
                                    <p className="text-sm text-gray-500">{u.email}</p>
                                    <p className="text-xs text-gray-400">UID: {u.uid}</p>
                                </div>
                                <Button onClick={() => handleDeleteUser(u.uid)} size="sm" className="bg-red-100 text-red-600 hover:bg-red-200 border-none">
                                    <Trash2 size={16} className="mr-2"/> Ban User
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* PRODUCTS TAB */}
                {!loading && activeTab === "products" && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-4">All Listings ({products.length})</h2>
                        {products.map(product => (
                            <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                                <img src={product.image} className="w-12 h-12 rounded bg-gray-100 object-cover" alt="" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-[#10102a]">{product.title}</h4>
                                    <p className="text-sm text-gray-500">Seller: {product.sellerName || "Unknown"}</p>
                                </div>
                                <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded bg-white border border-gray-200 shadow-sm">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* --- REPORT DETAILS MODAL --- */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-[#10102a] flex items-center gap-2">
                        <ShieldAlert className="text-red-500"/> Report Details
                    </h2>
                    <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                </div>
                
                <div className="space-y-4 mb-8">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-500 uppercase">Reason</span>
                        <p className="font-bold text-[#10102a]">{selectedReport.reason}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-500 uppercase">Description</span>
                        <p className="text-gray-700 leading-relaxed mt-1">{selectedReport.description}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                         <div>
                            <span className="text-xs font-bold text-gray-500 uppercase">Accused Seller</span>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                <p className="font-medium text-[#10102a]">{getUserName(selectedReport.reportedSellerId)}</p>
                            </div>
                         </div>
                         
                         <div>
                            <span className="text-xs font-bold text-gray-500 uppercase">Product Involved</span>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                <p className="font-medium text-[#10102a]">{getProductName(selectedReport.productId)}</p>
                            </div>
                         </div>

                         <div>
                            <span className="text-xs font-bold text-gray-500 uppercase">Reported By</span>
                            <p className="text-sm text-gray-600 mt-1">{getUserName(selectedReport.reporterId)}</p>
                         </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    {selectedReport.status === 'pending' ? (
                        <Button onClick={() => handleResolveReport(selectedReport.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold">
                            <CheckCircle size={18} className="mr-2"/> Mark Resolved
                        </Button>
                    ) : (
                        <Button disabled className="flex-1 bg-gray-100 text-gray-400 py-3 rounded-xl font-bold border border-gray-200">
                             Resolved
                        </Button>
                    )}
                    <Button onClick={() => handleDeleteUser(selectedReport.reportedSellerId)} variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl font-bold">
                        <Trash2 size={18} className="mr-2"/> Ban Seller
                    </Button>
                </div>
            </div>
        </div>
      )}

    </div>
  )
}