import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { ChevronLeft, MapPin, Phone, DollarSign, Tag, Image as ImageIcon } from "lucide-react"
import { auth, db } from "../libs/firebase"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"

const UI_LOCATIONS = [
  "Mellanby Hall", "Tedder Hall", "Kuti Hall", "Sultan Bello Hall",
  "Independence Hall", "Nnamdi Azikiwe Hall (Zik)", "Queen Idia Hall",
  "Obafemi Awolowo Hall (Awo)", "Abdulsalami Abubakar Hall",
  "SUB (Student Union Building)", "Tech Road / Faculty of Tech",
  "Faculty of Arts", "Faculty of Science", "Faculty of Social Sciences",
  "Faculty of Education", "Faculty of Law", "Other"
]

const CATEGORIES = ["Gadgets", "Fashion", "Books", "Furniture", "Appliances", "Kitchen", "School Supplies", "Other"]

export default function SellPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "Gadgets",
    description: "",
    location: "",
    phoneNumber: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Convert File to Base64 String to store in DB
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Simple size check (limit to ~800KB for Firestore safety)
      if (file.size > 800000) {
        alert("File is too big! Please upload an image smaller than 1MB.")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!auth.currentUser) {
        alert("You must be signed in to sell.")
        return navigate("/login")
    }

    if (!imagePreview) {
        alert("Please upload an image of your item.")
        return
    }

    setLoading(true)

    try {
      await addDoc(collection(db, "listings"), {
        ...formData,
        price: formData.price.replace(/[^0-9]/g, ''), 
        image: imagePreview, // FIX: Uses YOUR uploaded image
        sellerId: auth.currentUser.uid,
        sellerName: auth.currentUser.displayName || "Student Seller", // FIX: Uses YOUR real name
        status: "active",
        createdAt: serverTimestamp()
      })

      alert("Item Listed Successfully!")
      navigate("/marketplace")

    } catch (error: any) {
      console.error("Error listing item:", error)
      alert("Failed to list item: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="mx-auto max-w-3xl px-4 h-16 flex items-center justify-between">
          <Link to="/marketplace" className="flex items-center text-gray-500 hover:text-[#103470]">
             <ChevronLeft size={20} className="mr-1"/> Cancel
          </Link>
          <h1 className="font-bold text-lg text-[#10102a]">Sell Item</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="font-bold text-lg flex items-center gap-2 text-[#10102a]">
                <Tag size={20} className="text-[#103470]" /> Item Details
            </h2>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Item Title</label>
                <input 
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. HP Pavilion Laptop" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#103470] outline-none"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Price (₦)</label>
                    <div className="relative">
                        <DollarSign size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input 
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="5000" 
                            className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#103470] outline-none"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <div className="relative">
                        <select 
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#103470] outline-none appearance-none bg-white"
                        >
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the condition..." 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl h-32 resize-none focus:ring-2 focus:ring-[#103470] outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Upload Photo</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition relative overflow-hidden group">
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="h-48 mx-auto object-contain" />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3 text-[#103470]">
                                <ImageIcon size={24} />
                            </div>
                            <p className="text-sm font-medium text-gray-600">Click to upload image</p>
                            <p className="text-xs">JPG, PNG (Max 1MB)</p>
                        </div>
                    )}
                </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="font-bold text-lg flex items-center gap-2 text-[#10102a]">
                <MapPin size={20} className="text-[#103470]" /> Location & Contact
            </h2>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Meetup Location</label>
                <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    <select 
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#103470] outline-none appearance-none bg-white"
                        required
                    >
                        <option value="">Select a location...</option>
                        {UI_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp Number</label>
                <div className="relative">
                    <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    <input 
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="081 2345 6789" 
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#103470] outline-none"
                        required
                    />
                </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#103470] hover:bg-[#2856c3] text-white py-6 rounded-xl text-lg font-bold shadow-xl shadow-blue-900/10"
          >
            {loading ? "Uploading..." : "Post Item"}
          </Button>
        </form>
      </div>
    </div>
  )
}