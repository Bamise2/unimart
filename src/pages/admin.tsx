import { useState, useEffect } from "react"
import Header from "../components/header"
import { Button } from "../components/ui/button"
import { ShieldAlert, Users, Package, Trash2, CheckCircle, Lock, Eye, X, User, ShoppingBag, Tag, AlertTriangle, BarChart3 } from "lucide-react"
import { db } from "../libs/firebase"
import { collection, getDocs, doc, updateDoc, query, orderBy, writeBatch, deleteDoc } from "firebase/firestore"
import type { Product, UserData, Report } from "../libs/types"
import ResponseModal from "../components/response-modal"
import { DUMMY_PRODUCTS } from "../libs/dummyData"

// --- EXTENDED TYPES FOR ADMIN VIEW ---
interface AdminUser extends UserData {
  purchaseHistory?: Product[] // Simulated history
}

interface AdminProduct extends Product {
  // Extended properties if needed
}

// --- REALISTIC NIGERIAN USERS (Integrated seamlessly) ---
const DUMMY_USERS: AdminUser[] = [
  { uid: 'u_101', displayName: 'Chinedu Okafor', email: 'chinedu.o@stu.ui.edu.ng', role: 'student', verified: true, createdAt: null },
  { uid: 'u_102', displayName: 'Fatima Yusuf', email: 'fatima.y@stu.ui.edu.ng', role: 'student', verified: true, createdAt: null },
  { uid: 'u_103', displayName: 'Tolu Adebayo', email: 'tolu.ade@stu.ui.edu.ng', role: 'student', verified: true, createdAt: null },
  { uid: 'u_104', displayName: 'Emeka Nnamdi', email: 'emeka.n@stu.ui.edu.ng', role: 'student', verified: false, createdAt: null },
  { uid: 'u_105', displayName: 'Zainab Ibrahim', email: 'zainab.i@stu.ui.edu.ng', role: 'student', verified: true, createdAt: null },
]

// --- SIMULATE PURCHASE HISTORY ---
const assignRandomPurchases = (products: Product[]) => {
    return DUMMY_USERS.map(user => {
        const shuffled = [...products].sort(() => 0.5 - Math.random())
        const purchases = shuffled.slice(0, Math.floor(Math.random() * 3) + 1)
        return { ...user, purchaseHistory: purchases }
    })
}

export default function AdminPage() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [emailInput, setEmailInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")
  const [activeTab, setActiveTab] = useState("reports") // Default to reports
  const [loading, setLoading] = useState(false)
  
  // Data States
  const [users, setUsers] = useState<AdminUser[]>([])
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [reports, setReports] = useState<Report[]>([])
  
  // Selection States
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null)
  
  const [resModal, setResModal] = useState({ isOpen: false, type: 'success' as 'success'|'error', title: '', message: '' })

  const handleAdminLogin = (e: React.FormEvent) => {
      e.preventDefault()
      if (emailInput === "bamiseshogbesan2004@gmail.com" && passwordInput === "bamise") {
          setIsAdminAuthenticated(true)
          fetchAllData()
      } else {
          setResModal({ isOpen: true, type: 'error', title: 'Access Denied', message: 'Invalid Admin Credentials.' })
      }
  }

  const fetchAllData = async () => {
    setLoading(true)
    try {
        // 1. Fetch Real Data
        const usersSnap = await getDocs(collection(db, "users"))
        const realUsers = usersSnap.docs.map(d => ({ uid: d.id, ...d.data() } as AdminUser))

        const productsSnap = await getDocs(collection(db, "listings"))
        const realProducts = productsSnap.docs.map(d => ({ id: d.id, ...d.data() } as AdminProduct))

        const reportsSnap = await getDocs(query(collection(db, "reports"), orderBy("createdAt", "desc")))
        setReports(reportsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Report)))

        // 2. Merge with Dummy Data (Seamlessly)
        const enrichedDummyProducts = DUMMY_PRODUCTS.map((p, index) => ({
            ...p,
            sellerId: DUMMY_USERS[index % DUMMY_USERS.length].uid,
            sellerName: DUMMY_USERS[index % DUMMY_USERS.length].displayName
        }))

        const enrichedDummyUsers = assignRandomPurchases(DUMMY_PRODUCTS)

        setUsers([...realUsers, ...enrichedDummyUsers])
        setProducts([...realProducts, ...enrichedDummyProducts])

    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  // --- ACTIONS ---

  const handleBanUser = async (uid: string) => {
      if (prompt("Type BAN to confirm banning this user. This will delete their account and all listings.") !== "BAN") return

      // Check if it's a dummy user (local delete)
      const isDummy = DUMMY_USERS.find(u => u.uid === uid)
      
      try {
          if (!isDummy) {
              const batch = writeBatch(db)
              batch.delete(doc(db, "users", uid))
              const userProducts = products.filter(p => p.sellerId === uid)
              userProducts.forEach(p => batch.delete(doc(db, "listings", p.id)))
              await batch.commit()
          }
          
          // Update State
          setUsers(prev => prev.filter(u => u.uid !== uid))
          setProducts(prev => prev.filter(p => p.sellerId !== uid))
          setResModal({ isOpen: true, type: 'success', title: 'User Banned', message: 'User and all their listings have been removed.' })
          if(selectedReport) setSelectedReport(null) // Close modal if open
          if(selectedUser) setSelectedUser(null) 
      } catch (e) { 
          setResModal({ isOpen: true, type: 'error', title: 'Operation Failed', message: 'Could not ban user.' })
      }
  }

  const handleDeleteListing = async (productId: string) => {
      if (!confirm("Are you sure you want to remove this listing?")) return

      const isDummy = DUMMY_PRODUCTS.find(p => p.id === productId)

      try {
          if (!isDummy) {
              await deleteDoc(doc(db, "listings", productId))
          }
          setProducts(prev => prev.filter(p => p.id !== productId))
          setResModal({ isOpen: true, type: 'success', title: 'Listing Removed', message: 'The item has been removed from the marketplace.' })
          if(selectedReport) setSelectedReport(null)
      } catch (e) {
          setResModal({ isOpen: true, type: 'error', title: 'Error', message: 'Failed to delete listing.' })
      }
  }

  const handleResolveReport = async (id: string) => {
      try {
          // Check if real report
          if (!id.startsWith('dummy')) {
             await updateDoc(doc(db, "reports", id), { status: 'resolved' })
          }
          setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r))
          setResModal({ isOpen: true, type: 'success', title: 'Report Resolved', message: 'Case marked as closed.' })
      } catch(e) { console.error(e) }
  }

  // Helper to find names for report modal
  const getUserName = (uid: string) => users.find(u => u.uid === uid)?.displayName || "Unknown User"
  const getItemTitle = (pid: string) => products.find(p => p.id === pid)?.title || "Unknown Item"

  // --- Login Screen ---
  if (!isAdminAuthenticated) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <ResponseModal {...resModal} onClose={() => setResModal({ ...resModal, isOpen: false })} />
              <form onSubmit={handleAdminLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6 border border-gray-100">
                  <div className="text-center">
                    <div className="h-12 w-12 bg-[#103470]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#103470]">
                        <Lock size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-[#103470]">Admin Portal</h1>
                    <p className="text-gray-500 text-sm">Restricted Access Only</p>
                  </div>
                  <div className="space-y-4">
                    <input type="email" value={emailInput} onChange={e=>setEmailInput(e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:border-[#103470]" placeholder="Admin Email"/>
                    <input type="password" value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:border-[#103470]" placeholder="Password"/>
                  </div>
                  <Button type="submit" className="w-full bg-[#103470] text-white py-6 rounded-xl font-bold">Secure Login</Button>
              </form>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] font-sans">
      <Header />
      <ResponseModal {...resModal} onClose={() => setResModal({ ...resModal, isOpen: false })} />
      
      <div className="mx-auto max-w-7xl px-4 py-8">
        
        {/* HEADER & STATS */}
        <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#10102a] flex items-center gap-2">
                        <ShieldAlert className="text-[#103470]"/> Admin Dashboard
                    </h1>
                </div>
                <Button onClick={() => setIsAdminAuthenticated(false)} variant="outline" className="text-red-500 border-red-200">Logout</Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Users/></div>
                    <div><p className="text-gray-500 text-sm">Total Users</p><p className="text-2xl font-bold">{users.length}</p></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><Package/></div>
                    <div><p className="text-gray-500 text-sm">Active Listings</p><p className="text-2xl font-bold">{products.length}</p></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center"><AlertTriangle/></div>
                    <div><p className="text-gray-500 text-sm">Pending Reports</p><p className="text-2xl font-bold">{reports.filter(r => r.status === 'pending').length}</p></div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* SIDEBAR TABS */}
            <div className="space-y-2">
                {[
                    { id: 'reports', label: 'Safety Reports', icon: ShieldAlert },
                    { id: 'products', label: 'All Listings', icon: Package },
                    { id: 'users', label: 'User Database', icon: Users },
                ].map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id)} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === tab.id ? "bg-[#103470] text-white shadow-lg" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="md:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
                {loading && <div className="text-center py-20 text-gray-400">Loading Database...</div>}
                
                {/* --- REPORTS TAB --- */}
                {!loading && activeTab === 'reports' && (
                     <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-4">Safety Reports</h2>
                        {reports.length === 0 ? <p className="text-gray-400">No pending reports.</p> : reports.map(r => (
                            <div key={r.id} className="p-4 border rounded-xl flex justify-between bg-red-50/30 border-red-100 items-center">
                                <div>
                                    <p className="font-bold text-red-700 flex items-center gap-2"><ShieldAlert size={16}/> {r.reason}</p>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{r.description}</p>
                                    <p className="text-xs text-gray-400 mt-1">ID: {r.id}</p>
                                </div>
                                <div className="flex gap-2">
                                    {r.status === 'pending' && <Button onClick={()=>handleResolveReport(r.id)} size="sm" className="bg-green-600 text-white hover:bg-green-700">Resolve</Button>}
                                    <Button onClick={()=>setSelectedReport(r)} size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">View Details</Button>
                                </div>
                            </div>
                        ))}
                     </div>
                )}

                {/* --- PRODUCTS TAB --- */}
                {!loading && activeTab === 'products' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-4">Active Listings ({products.length})</h2>
                        {products.map(p => (
                            <div key={p.id} onClick={() => setSelectedProduct(p)} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition group">
                                <img src={p.image} className="h-12 w-12 rounded-lg object-cover bg-gray-100" alt="" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-[#10102a] group-hover:text-[#103470]">{p.title}</h4>
                                    <p className="text-xs text-gray-500">Seller: {p.sellerName || "Unknown"} • ₦{p.price}</p>
                                </div>
                                <Eye size={18} className="text-gray-400" />
                            </div>
                        ))}
                    </div>
                )}

                {/* --- USERS TAB --- */}
                {!loading && activeTab === 'users' && (
                    <div className="space-y-4">
                         <h2 className="text-xl font-bold mb-4">Registered Users ({users.length})</h2>
                         {users.map(u => (
                            <div key={u.uid} onClick={() => setSelectedUser(u)} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                        {u.displayName?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#10102a]">{u.displayName}</p>
                                        <p className="text-xs text-gray-500">{u.email}</p>
                                    </div>
                                </div>
                                <Button 
                                    onClick={(e) => { e.stopPropagation(); handleBanUser(u.uid) }} 
                                    size="sm" 
                                    className="bg-red-50 text-red-600 hover:bg-red-100 border-none"
                                >
                                    Ban
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* --- REPORT DETAILS MODAL (UPDATED) --- */}
      {selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in zoom-in-95">
              <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-2xl relative">
                  <button onClick={() => setSelectedReport(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={24}/></button>
                  
                  <div className="flex items-center gap-2 mb-6 text-red-600">
                      <ShieldAlert size={28}/>
                      <h2 className="text-2xl font-bold">Report Investigation</h2>
                  </div>

                  <div className="space-y-4 mb-8">
                      {/* ITEM DETAILS */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Item Reported</p>
                          <div className="flex items-center gap-3">
                              <div className="h-12 w-12 bg-gray-200 rounded-lg overflow-hidden">
                                 {products.find(p => p.id === selectedReport.productId)?.image && 
                                    <img src={products.find(p => p.id === selectedReport.productId)?.image} className="h-full w-full object-cover"/>
                                 }
                              </div>
                              <div>
                                  <p className="font-bold text-[#10102a]">{getItemTitle(selectedReport.productId)}</p>
                                  <p className="text-xs font-mono text-gray-500">ID: {selectedReport.productId}</p>
                              </div>
                          </div>
                      </div>

                      {/* INVOLVED PARTIES */}
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                              <p className="text-xs font-bold text-blue-400 uppercase mb-1">Reporter</p>
                              <p className="font-bold text-sm">{getUserName(selectedReport.reporterId!)}</p>
                              <p className="text-xs font-mono text-gray-400 truncate">{selectedReport.reporterId}</p>
                          </div>
                          <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                              <p className="text-xs font-bold text-red-400 uppercase mb-1">Accused Seller</p>
                              <p className="font-bold text-sm">{getUserName(selectedReport.reportedSellerId)}</p>
                              <p className="text-xs font-mono text-gray-400 truncate">{selectedReport.reportedSellerId}</p>
                          </div>
                      </div>

                      {/* REASON */}
                      <div className="p-4 border rounded-xl">
                          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Reason</p>
                          <p className="font-bold text-red-600">{selectedReport.reason}</p>
                          <p className="text-sm text-gray-600 mt-2">"{selectedReport.description}"</p>
                      </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="grid grid-cols-2 gap-3">
                      <Button onClick={()=>handleDeleteListing(selectedReport.productId)} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                          Remove Listing
                      </Button>
                      <Button onClick={()=>handleBanUser(selectedReport.reportedSellerId)} className="bg-red-600 text-white hover:bg-red-700">
                          Ban Seller
                      </Button>
                  </div>
              </div>
          </div>
      )}

      {/* --- PRODUCT DETAILS MODAL --- */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                <button onClick={() => setSelectedProduct(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={24}/></button>
                <div className="text-center mb-6">
                    <img src={selectedProduct.image} className="h-32 w-32 object-cover rounded-xl mx-auto mb-4 bg-gray-100" alt="" />
                    <h2 className="text-xl font-bold">{selectedProduct.title}</h2>
                    <p className="text-[#103470] font-bold text-lg">₦{selectedProduct.price}</p>
                </div>
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl text-sm">
                    <div className="flex justify-between"><span>Seller Name:</span> <span className="font-bold">{selectedProduct.sellerName || "N/A"}</span></div>
                    <div className="flex justify-between"><span>Seller ID:</span> <span className="font-mono text-xs">{selectedProduct.sellerId}</span></div>
                    <div className="flex justify-between"><span>Category:</span> <span>{selectedProduct.category}</span></div>
                    <div className="flex justify-between"><span>Status:</span> <span className="uppercase font-bold text-green-600">{selectedProduct.status || "Active"}</span></div>
                </div>
                <Button onClick={() => handleDeleteListing(selectedProduct.id)} className="w-full mt-4 bg-red-50 text-red-600 hover:bg-red-100 border-none font-bold">Remove Listing</Button>
            </div>
        </div>
      )}

      {/* --- USER DETAILS MODAL --- */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={() => setSelectedUser(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={24}/></button>
                
                <div className="flex items-center gap-4 mb-8 border-b pb-6">
                    <div className="h-16 w-16 rounded-full bg-[#103470] text-white flex items-center justify-center text-2xl font-bold">
                        {selectedUser.displayName?.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[#10102a]">{selectedUser.displayName}</h2>
                        <p className="text-gray-500">{selectedUser.email}</p>
                        <span className="text-xs font-mono text-gray-400">UID: {selectedUser.uid}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* SECTION: SELLING */}
                    <div>
                        <h3 className="font-bold text-[#10102a] mb-4 flex items-center gap-2"><Tag size={18}/> Selling ({products.filter(p => p.sellerId === selectedUser.uid).length})</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {products.filter(p => p.sellerId === selectedUser.uid).length === 0 ? <p className="text-sm text-gray-400">No active listings.</p> :
                            products.filter(p => p.sellerId === selectedUser.uid).map(p => (
                                <div key={p.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                    <img src={p.image} className="h-10 w-10 rounded object-cover" alt="" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{p.title}</p>
                                        <p className="text-xs text-gray-500">₦{p.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION: BOUGHT HISTORY */}
                    <div>
                        <h3 className="font-bold text-[#10102a] mb-4 flex items-center gap-2"><ShoppingBag size={18}/> Order History</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {(!selectedUser.purchaseHistory || selectedUser.purchaseHistory.length === 0) ? 
                                <p className="text-sm text-gray-400">No purchase history found.</p> :
                                selectedUser.purchaseHistory.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg border border-green-100">
                                        <div className="h-10 w-10 rounded bg-white flex items-center justify-center text-green-600"><CheckCircle size={16}/></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate">{p.title}</p>
                                            <p className="text-xs text-green-700">Completed</p>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t pt-4 flex justify-end">
                    <Button onClick={() => handleBanUser(selectedUser.uid)} className="bg-red-100 text-red-600 hover:bg-red-200 border-none font-bold">
                        Ban User & Wipe Data
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}