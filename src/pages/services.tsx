import { useState, useEffect } from "react"
import Header from "../components/header"
import { Button } from "../components/ui/button"
import { Briefcase, Star, MessageCircle, Phone, Plus, X, Image as ImageIcon } from "lucide-react"
import { db, auth } from "../libs/firebase"
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp, getDocs, where } from "firebase/firestore"
import type { Service } from "../libs/types"
import { useNavigate } from "react-router-dom"

// --- REALISTIC STUDENT GIGS (DUMMY DATA) ---
const DUMMY_SERVICES: Service[] = [
  
  { id: 's2', title: 'Laptop & Phone Repair', providerName: 'Tech Whiz', providerId: 'sys', category: 'Tech', price: '2,000', description: 'Screen replacement, battery change, software issues. Fast turnaround.', contactPhone: '09011223344', image: '/techDoctor.png', rating: 5.0, reviewsCount: 24, createdAt: Timestamp.now() },
  { id: 's3', title: 'Data Analysis Tutor (SPSS/Python)', providerName: 'David O.', providerId: 'sys', category: 'Academic', price: '5,000', description: 'Struggling with your project analysis? I teach Python, SPSS, and Excel.', contactPhone: '08099887766', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop', rating: 4.9, reviewsCount: 8, createdAt: Timestamp.now() },
  { id: 's4', title: 'Laundry Service (Wash & Fold)', providerName: 'Clean Kicks', providerId: 'sys', category: 'Domestic', price: '1,500', description: 'Pick up and delivery available for Awo, Idia, and Indy halls.', contactPhone: '07055443322', image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?q=80&w=400&auto=format&fit=crop', rating: 4.7, reviewsCount: 30, createdAt: Timestamp.now() },
//   { id: 's5', title: 'Graphic Design & Flyers', providerName: 'Creative Minds', providerId: 'sys', category: 'Design', price: '3,000', description: 'Event flyers, logos, and assignments. 24hr delivery.', contactPhone: '08166554433', image: 'https://images.unsplash.com/photo-1626785774573-4b799312c95d?q=80&w=400&auto=format&fit=crop', rating: 4.5, reviewsCount: 5, createdAt: Timestamp.now() },
  { id: 's6', title: 'Custom Birthday Cakes', providerName: 'Baker Girl', providerId: 'sys', category: 'Food', price: '8,000', description: 'Delicious cakes and pastries for birthdays and department dinners.', contactPhone: '09033221100', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=400&auto=format&fit=crop', rating: 5.0, reviewsCount: 15, createdAt: Timestamp.now() },
]

export default function ServicesPage() {
  const navigate = useNavigate()
  const [services, setServices] = useState<Service[]>([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // New Service Form State
  const [newService, setNewService] = useState({
      title: '', category: 'Beauty', price: '', description: '', contactPhone: '', image: ''
  })

  useEffect(() => {
    // Fetch live data and merge with dummy data
    const q = query(collection(db, "services"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const liveData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service))
        setServices([...liveData, ...DUMMY_SERVICES])
        setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setNewService(prev => ({ ...prev, image: reader.result as string }))
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!auth.currentUser) return navigate("/login")

      try {
          await addDoc(collection(db, "services"), {
              ...newService,
              providerId: auth.currentUser.uid,
              providerName: auth.currentUser.displayName || "Student Provider",
              rating: 0,
              reviewsCount: 0,
              createdAt: serverTimestamp(),
              image: newService.image || "https://placehold.co/400?text=Service"
          })
          setShowModal(false)
          setNewService({ title: '', category: 'Beauty', price: '', description: '', contactPhone: '', image: '' })
          alert("Service Listed Successfully!")
      } catch (error) {
          alert("Failed to list service.")
      }
  }

  const handleStartChat = async (service: Service) => {
      if (!auth.currentUser) return navigate("/login")
      if (service.providerId === 'sys') return alert("This is a demo service. You cannot chat with the system.")
      if (service.providerId === auth.currentUser.uid) return alert("You cannot chat with yourself.")

      try {
          // Check for existing chat
          const q = query(collection(db, "chats"), where("participants", "array-contains", auth.currentUser.uid))
          const snap = await getDocs(q)
          const existing = snap.docs.find(d => d.data().participants.includes(service.providerId))

          let chatId = existing?.id

          if (!chatId) {
              const newChat = await addDoc(collection(db, "chats"), {
                  participants: [auth.currentUser.uid, service.providerId],
                  participantNames: {
                      [auth.currentUser.uid]: auth.currentUser.displayName || "Me",
                      [service.providerId]: service.providerName
                  },
                  lastMessage: `Inquired about service: ${service.title}`,
                  lastMessageTime: serverTimestamp()
              })
              chatId = newChat.id
          }
          navigate(`/chat?id=${chatId}`)
      } catch (e) { console.error(e) }
  }

  const filteredServices = filter === 'All' ? services : services.filter(s => s.category === filter)

  return (
    <div className="min-h-screen bg-[#fafaf9] font-sans">
      <Header />
      
      <div className="mx-auto max-w-7xl px-4 py-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div>
                <h1 className="text-3xl font-bold text-[#10102a] flex items-center gap-2">
                   <Briefcase className="text-[#103470]" /> Campus Services
                </h1>
                <p className="text-gray-500 mt-2">Find talented students for hair, repairs, laundry, and tutoring.</p>
            </div>
            <Button 
                onClick={() => auth.currentUser ? setShowModal(true) : navigate("/login")} 
                className="bg-[#103470] hover:bg-[#2856c3] text-white rounded-xl px-8 py-6 font-bold text-lg shadow-xl shadow-blue-900/10"
            >
                <Plus size={20} className="mr-2"/> List Your Skill
            </Button>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {['All', 'Beauty', 'Tech', 'Academic', 'Domestic', 'Design', 'Food'].map((cat) => (
                <button 
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-6 py-2 rounded-full font-bold transition border ${
                        filter === cat 
                        ? "bg-[#103470] text-white border-[#103470]" 
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* SERVICE GRID */}
        {loading ? <p className="text-center py-10">Loading services...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map(service => (
                    <div key={service.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden group">
                        <div className="h-48 overflow-hidden relative">
                            <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-white/90 text-[#10102a] backdrop-blur-sm shadow-sm">
                                    {service.category}
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-[#10102a] line-clamp-1">{service.title}</h3>
                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs font-bold text-yellow-700">{service.rating}</span>
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">{service.description}</p>
                            
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-[#103470] font-bold text-xs">
                                    {service.providerName.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-[#10102a]">{service.providerName}</p>
                                    <p className="text-xs text-gray-400">Verified Student</p>
                                </div>
                                <p className="font-bold text-[#103470] text-lg">₦{service.price}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <a href={`tel:${service.contactPhone}`} className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-gray-50 hover:bg-gray-100 text-gray-700 transition">
                                    <Phone size={18} /> Call
                                </a>
                                <button onClick={() => handleStartChat(service)} className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-[#103470] hover:bg-[#2856c3] text-white transition">
                                    <MessageCircle size={18} /> Chat
                                </button>
                            </div>
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
                    <h2 className="text-xl font-bold text-[#10102a]">List Your Service</h2>
                    <button onClick={() => setShowModal(false)}><X size={24} className="text-gray-400"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Image Upload */}
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer relative h-32 flex items-center justify-center">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        {newService.image ? (
                            <img src={newService.image} alt="Preview" className="h-full object-contain" />
                        ) : (
                            <div className="text-gray-400">
                                <ImageIcon size={24} className="mx-auto mb-1 opacity-50"/>
                                <span className="text-xs font-bold">Upload Cover Image</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input required placeholder="Service Title (e.g. Hair Braiding)" value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:border-[#103470]"/>
                        
                        <select value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:border-[#103470] bg-white">
                            {['Beauty', 'Tech', 'Academic', 'Domestic', 'Design', 'Food', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    
                    <textarea required placeholder="Describe what you do..." value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:border-[#103470] h-24"/>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <input required placeholder="Starting Price (₦)" type="number" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:border-[#103470]"/>
                         <input required placeholder="Contact Phone" value={newService.contactPhone} onChange={e => setNewService({...newService, contactPhone: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:border-[#103470]"/>
                    </div>

                    <Button type="submit" className="w-full bg-[#103470] hover:bg-[#2856c3] text-white py-4 rounded-xl font-bold mt-2 shadow-lg">Publish Gig</Button>
                </form>
            </div>
        </div>
      )}
    </div>
  )
}