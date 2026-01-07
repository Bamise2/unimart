import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { MessageCircle, Search, Send, ArrowLeft } from "lucide-react"
import { auth, db } from "../libs/firebase"
import { 
  collection, query, where, orderBy, onSnapshot, 
  addDoc, serverTimestamp, doc, updateDoc 
} from "firebase/firestore"
import type { Chat, Message } from "../libs/types"

export default function ChatPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState(auth.currentUser)
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((u) => {
      if (!u) navigate("/login")
      setUser(u)
    })
    return () => unsubscribeAuth()
  }, [navigate])

  useEffect(() => {
      const paramId = searchParams.get('id')
      if (paramId) setActiveChatId(paramId)
  }, [searchParams])

  useEffect(() => {
    if (!user) return
    const chatsRef = collection(db, "chats")
    const q = query(chatsRef, where("participants", "array-contains", user.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Chat[]
      chatList.sort((a, b) => {
        const timeA = a.lastMessageTime?.toMillis ? a.lastMessageTime.toMillis() : 0
        const timeB = b.lastMessageTime?.toMillis ? b.lastMessageTime.toMillis() : 0
        return timeB - timeA
      })
      setChats(chatList)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    if (!activeChatId) return
    const messagesRef = collection(db, "chats", activeChatId, "messages")
    const q = query(messagesRef, orderBy("createdAt", "asc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[]
      setMessages(msgList)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    })
    return () => unsubscribe()
  }, [activeChatId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChatId || !user) return
    try {
      const chatRef = doc(db, "chats", activeChatId)
      const messagesRef = collection(chatRef, "messages")
      await addDoc(messagesRef, { senderId: user.uid, text: newMessage, createdAt: serverTimestamp() })
      await updateDoc(chatRef, { lastMessage: newMessage, lastMessageTime: serverTimestamp() })
      setNewMessage("")
    } catch (error) { console.error(error) }
  }

  const getChatName = (chat: Chat) => {
    if (!user) return "Chat"
    const otherId = chat.participants.find(id => id !== user.uid)
    return (otherId && chat.participantNames?.[otherId]) ? chat.participantNames[otherId] : "User"
  }

  return (
    <div className="h-screen bg-[#f8f9fa] flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shrink-0">
         <Link to="/marketplace" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#103470] text-white font-bold text-sm">
               <img src="/ui logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-[#10102a] hidden md:block">Unimart Chat</span>
         </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <div className={`w-full md:w-80 bg-white border-r border-gray-200 flex flex-col ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#10102a] mb-4">Messages</h2>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input type="text" placeholder="Search chats..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#103470]/20"/>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
             {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> : chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 p-4 text-center">
                    <MessageCircle size={48} className="mb-4 opacity-20" />
                    <p>No messages yet.</p>
                </div>
             ) : (
                chats.map(chat => (
                   <button key={chat.id} onClick={() => { setActiveChatId(chat.id); navigate('/chat?id=' + chat.id, { replace: true }) }} className={`w-full text-left p-4 border-b border-gray-50 hover:bg-blue-50 transition flex items-start gap-3 ${activeChatId === chat.id ? "bg-blue-50 border-l-4 border-l-[#103470]" : ""}`}>
                      <div className="h-10 w-10 rounded-full bg-[#103470]/10 flex items-center justify-center font-bold text-[#103470] shrink-0">{getChatName(chat).charAt(0)}</div>
                      <div className="min-w-0 flex-1">
                         <div className="flex justify-between mb-1">
                            <span className="font-bold text-[#10102a] truncate">{getChatName(chat)}</span>
                         </div>
                         <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                      </div>
                   </button>
                ))
             )}
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className={`flex-1 flex flex-col bg-[#f0f2f5] ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
           {activeChatId ? (
             <>
               <div className="bg-white p-4 border-b border-gray-200 flex items-center gap-4 shadow-sm z-10">
                  <button onClick={() => setActiveChatId(null)} className="md:hidden text-gray-600"><ArrowLeft size={24} /></button>
                  <div className="h-10 w-10 rounded-full bg-[#103470] text-white flex items-center justify-center font-bold">
                     {chats.find(c => c.id === activeChatId) ? getChatName(chats.find(c => c.id === activeChatId)!).charAt(0) : "U"}
                  </div>
                  <h3 className="font-bold text-[#10102a]">{chats.find(c => c.id === activeChatId) ? getChatName(chats.find(c => c.id === activeChatId)!) : "User"}</h3>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => {
                     const isMe = msg.senderId === user?.uid
                     return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                           <div className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm text-sm ${isMe ? "bg-[#103470] text-white rounded-tr-none" : "bg-white text-gray-800 border rounded-tl-none"}`}>
                              {msg.text}
                           </div>
                        </div>
                     )
                  })}
                  <div ref={messagesEndRef} />
               </div>
               <div className="p-4 bg-white border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                     <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-3 border border-gray-200 rounded-full outline-none focus:ring-2 focus:ring-[#103470]"/>
                     <button disabled={!newMessage.trim()} className="bg-[#103470] hover:bg-[#2856c3] text-white h-12 w-12 rounded-full flex items-center justify-center"><Send size={20} /></button>
                  </form>
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <MessageCircle size={48} className="opacity-40 mb-4" />
                <h3 className="text-xl font-bold">Select a conversation</h3>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}