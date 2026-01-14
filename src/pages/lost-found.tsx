import { useState, useEffect } from "react"
import Header from "../components/header"
import { Button } from "../components/ui/button"
import { Search, MapPin, Phone, Plus, Tag, X, Image as ImageIcon, Calendar } from "lucide-react"
import { db, auth } from "../libs/firebase"
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp } from "firebase/firestore"
import type { LostItem } from "../libs/types"
import { useNavigate } from "react-router-dom"

// --- 20 REALISTIC DUMMY ITEMS WITH WORKING UNSPLASH IMAGES ---
const DUMMY_DATA: LostItem[] = [
  
  { id: 'd2', type: 'found', title: 'Casio Scientific Calculator', description: 'Found a black Casio fx-991EX calculator in NFLT.', location: 'NFLT Lecture Theater', contactPhone: '09011223344', date: Timestamp.now(), userId: 'sys', userName: 'Grace O.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL4E2WqNhQQ9yTySecC93HXYpGTUpp1K-05w&s' },
  { id: 'd3', type: 'lost', title: 'Brown Leather Wallet', description: 'Contains GTB ATM card and voter card. Reward available.', location: 'Tech Road', contactPhone: '08099887766', date: Timestamp.now(), userId: 'sys', userName: 'Tunde B.', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=400&auto=format&fit=crop' },
  { id: 'd4', type: 'found', title: 'Bunch of Keys', description: 'About 5 keys with a Manchester United keyholder.', location: 'Jaja Clinic', contactPhone: '07055443322', date: Timestamp.now(), userId: 'sys', userName: 'Security Unit', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRJ1s1DP6p6pYZmbXofXBwZRYskJCuHwdj2N1MaY-vMzg4vQtA' },
  { id: 'd5', type: 'lost', title: 'iPhone XR (Black)', description: 'Cracked screen protector. Lock screen is a picture of a dog.', location: 'Love Garden', contactPhone: '08166554433', date: Timestamp.now(), userId: 'sys', userName: 'Chidinma', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=400&auto=format&fit=crop' },
  
  { id: 'd7', type: 'lost', title: 'Prescription Glasses', description: 'Black rimmed glasses in a blue case.', location: 'Kenneth Dike Library', contactPhone: '08033221100', date: Timestamp.now(), userId: 'sys', userName: 'Sarah K.', image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=400&auto=format&fit=crop' },
  { id: 'd8', type: 'found', title: 'Water Bottle (Metal)', description: 'Silver water bottle, distinctly dented at the bottom.', location: 'Trenchard Hall', contactPhone: '07088990011', date: Timestamp.now(), userId: 'sys', userName: 'Usher', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuvXdPzbcQ68mebI8xvGpUk58r5HE979bgag&s' },
  { id: 'd9', type: 'lost', title: 'Gold Wristwatch', description: 'Lost during the SUG dinner. Sentimental value.', location: 'International Conference Centre', contactPhone: '08122334455', date: Timestamp.now(), userId: 'sys', userName: 'Big T', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=400&auto=format&fit=crop' },
  { id: 'd10', type: 'found', title: 'ATM Card (Access Bank)', description: 'Name on card: OLABISI FUNKE. Please call to claim.', location: 'Indy Hall Cafeteria', contactPhone: '09077665544', date: Timestamp.now(), userId: 'sys', userName: 'Cafe Manager', image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=400&auto=format&fit=crop' },
  { id: 'd11', type: 'lost', title: 'Spiral Notebook', description: 'Contains 300 level chem notes. Very important!', location: 'Chemistry Lab', contactPhone: '08011223344', date: Timestamp.now(), userId: 'sys', userName: 'Chem Student', image: 'https://images.unsplash.com/photo-1531346878377-a513bc95f30f?q=80&w=400&auto=format&fit=crop' },
  { id: 'd12', type: 'found', title: 'Power Bank (20000mAh)', description: 'White Oraimo power bank found charging but owner missing.', location: 'Reading Room (Tedder)', contactPhone: '07011223344', date: Timestamp.now(), userId: 'sys', userName: 'Porter', image: 'https://images.unsplash.com/photo-1609592425026-66ad0f3531b4?q=80&w=400&auto=format&fit=crop' },
  { id: 'd13', type: 'lost', title: 'AirPods Pro Case', description: 'Just the charging case. White, slightly scratched.', location: 'Botanical Garden', contactPhone: '08199887766', date: Timestamp.now(), userId: 'sys', userName: 'Music Lover', image: 'https://images.unsplash.com/photo-1588156979435-379b9d802b0a?q=80&w=400&auto=format&fit=crop' },
  { id: 'd14', type: 'found', title: 'Ladies Handbag', description: 'Small red tote bag. Found near the gate.', location: 'UI Main Gate', contactPhone: '09055443322', date: Timestamp.now(), userId: 'sys', userName: 'Security', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop' },
  { id: 'd15', type: 'lost', title: 'Hostel Key (Awo)', description: 'Room C24 key with a green tag.', location: 'Awolowo Hall', contactPhone: '08066554433', date: Timestamp.now(), userId: 'sys', userName: 'Room C24', image: 'https://images.unsplash.com/photo-1582140428522-8d76e333a465?q=80&w=400&auto=format&fit=crop' },
  { id: 'd16', type: 'found', title: 'Flash Drive (SanDisk)', description: '32GB Red and Black flash drive.', location: 'Computer Science Dept', contactPhone: '07022334455', date: Timestamp.now(), userId: 'sys', userName: 'Lab Tech', image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=400&auto=format&fit=crop' },
  { id: 'd17', type: 'lost', title: 'Silver Bracelet', description: 'Thin silver chain. Lost while walking.', location: 'Tech Road to SUB', contactPhone: '08133221100', date: Timestamp.now(), userId: 'sys', userName: 'Precious', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&auto=format&fit=crop' },
  { id: 'd18', type: 'found', title: 'Umbrella (Large)', description: 'Black heavy duty umbrella. Left in the rain.', location: 'Catholic Chapel', contactPhone: '09088990011', date: Timestamp.now(), userId: 'sys', userName: 'Chapel Warden', image: 'https://images.unsplash.com/photo-1575317789498-333e21c60815?q=80&w=400&auto=format&fit=crop' },
  { id: 'd19', type: 'lost', title: 'Library Card', description: 'Registration number 123456.', location: 'Bookshop', contactPhone: '08177665544', date: Timestamp.now(), userId: 'sys', userName: 'Scholar', image: 'https://images.unsplash.com/photo-1544131584-c89e3bc82136?q=80&w=400&auto=format&fit=crop' },
  { id: 'd20', type: 'found', title: 'Sport Sneaker (One side)', description: 'Left leg Nike running shoe. White.', location: 'Sports Center', contactPhone: '08011223399', date: Timestamp.now(), userId: 'sys', userName: 'Coach', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop' },
]

export default function LostFoundPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<LostItem[]>([])
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form State
  const [newItem, setNewItem] = useState({
      type: 'lost',
      title: '',
      description: '',
      location: '',
      contactPhone: '',
      image: '' // New Image Field
  })

  useEffect(() => {
    // Fetch live data
    const q = query(collection(db, "lost-found"), orderBy("date", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const liveData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LostItem))
        // Merge Live Data with Dummy Data (Live first)
        setItems([...liveData, ...DUMMY_DATA])
        setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewItem(prev => ({ ...prev, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!auth.currentUser) return navigate("/login")

      try {
          await addDoc(collection(db, "lost-found"), {
              ...newItem,
              userId: auth.currentUser.uid,
              userName: auth.currentUser.displayName || "Student",
              date: serverTimestamp(),
              // Use uploaded image or a default placeholder
              image: newItem.image || "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=400&auto=format&fit=crop"
          })
          setShowModal(false)
          setNewItem({ type: 'lost', title: '', description: '', location: '', contactPhone: '', image: '' })
          alert("Post created successfully!")
      } catch (error) {
          alert("Failed to post item.")
      }
  }

  const filteredItems = filter === 'all' ? items : items.filter(i => i.type === filter)

  return (
    <div className="min-h-screen bg-[#fafaf9] font-sans">
      <Header />
      
      <div className="mx-auto max-w-6xl px-4 py-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div>
                <h1 className="text-3xl font-bold text-[#10102a] flex items-center gap-2">
                   <Search className="text-[#103470]" /> Lost & Found
                </h1>
                <p className="text-gray-500 mt-2">Report missing items or help return found ones to their owners.</p>
            </div>
            <Button 
                onClick={() => auth.currentUser ? setShowModal(true) : navigate("/login")} 
                className="bg-[#103470] hover:bg-[#2856c3] text-white rounded-xl px-8 py-6 font-bold shadow-xl shadow-blue-900/10 text-lg"
            >
                <Plus size={20} className="mr-2"/> Post Item
            </Button>
        </div>

        {/* FILTER TABS */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {[
                { id: 'all', label: 'All Items' }, 
                { id: 'lost', label: 'Lost Items' }, 
                { id: 'found', label: 'Found Items' }
            ].map((f) => (
                <button 
                    key={f.id}
                    onClick={() => setFilter(f.id as any)}
                    className={`px-6 py-2 rounded-full font-bold capitalize transition border ${
                        filter === f.id 
                        ? "bg-[#103470] text-white border-[#103470]" 
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                >
                    {f.label}
                </button>
            ))}
        </div>

        {/* ITEMS GRID */}
        {loading ? <p className="text-center py-10">Loading...</p> : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <Search size={48} className="mx-auto text-gray-300 mb-4"/>
                <p className="text-gray-500">No items reported yet.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
                        {/* Image Preview */}
                        <div className="h-48 w-full bg-gray-100 relative">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            <div className="absolute top-4 left-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm ${item.type === 'lost' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                                    {item.type}
                                </span>
                            </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-[#10102a] line-clamp-1">{item.title}</h3>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{item.description}</p>
                            
                            <div className="space-y-2 text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-[#103470]"/> <span className="truncate">{item.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tag size={14} className="text-[#103470]"/> <span>By {item.userName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-[#103470]"/> 
                                    <span>{item.date?.toDate ? item.date.toDate().toLocaleDateString() : "Recent"}</span>
                                </div>
                            </div>

                            <a href={`tel:${item.contactPhone}`} className="block w-full text-center bg-[#103470]/5 hover:bg-[#103470]/10 text-[#103470] font-bold py-3 rounded-xl transition border border-[#103470]/10">
                                <Phone size={16} className="inline mr-2"/> Call: {item.contactPhone}
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* POST MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[#10102a]">Report Item</h2>
                    <button onClick={() => setShowModal(false)}><X size={24} className="text-gray-400"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Toggle Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => setNewItem({...newItem, type: 'lost'})} className={`py-3 rounded-xl font-bold border transition ${newItem.type === 'lost' ? 'bg-red-50 border-red-200 text-red-600 shadow-inner' : 'border-gray-200 text-gray-400'}`}>Lost Something</button>
                        <button type="button" onClick={() => setNewItem({...newItem, type: 'found'})} className={`py-3 rounded-xl font-bold border transition ${newItem.type === 'found' ? 'bg-green-50 border-green-200 text-green-600 shadow-inner' : 'border-gray-200 text-gray-400'}`}>Found Something</button>
                    </div>

                    {/* Image Upload */}
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        {newItem.image ? (
                            <img src={newItem.image} alt="Preview" className="h-32 mx-auto object-contain" />
                        ) : (
                            <div className="text-gray-400 py-4">
                                <ImageIcon size={32} className="mx-auto mb-2 opacity-50"/>
                                <span className="text-sm font-bold">Tap to upload image</span>
                            </div>
                        )}
                    </div>

                    <input required placeholder="Item Name (e.g. Blue ID Card)" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#103470] focus:ring-1 focus:ring-[#103470]"/>
                    
                    <textarea required placeholder="Description (Color, distinct marks, etc.)" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#103470] focus:ring-1 focus:ring-[#103470] h-24"/>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <input required placeholder="Location" value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#103470]"/>
                         <input required placeholder="Contact Phone" value={newItem.contactPhone} onChange={e => setNewItem({...newItem, contactPhone: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#103470]"/>
                    </div>

                    <Button type="submit" className="w-full bg-[#103470] hover:bg-[#2856c3] text-white py-4 rounded-xl font-bold mt-2 shadow-lg shadow-blue-900/10">Post Report</Button>
                </form>
            </div>
        </div>
      )}
    </div>
  )
}