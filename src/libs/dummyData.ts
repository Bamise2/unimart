import { Timestamp } from "firebase/firestore"
import type { Product } from "./types"

// Helper to create a fake timestamp for sorting
const now = Timestamp.now()

export const DUMMY_PRODUCTS: Product[] = [
  // --- GADGETS ---
  {
    id: "dummy-1",
    title: "MacBook Air M1 (256GB, Space Grey)",
    price: "750000",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
    category: "Gadgets",
    location: "Kuti Hall",
    description: "Mint condition. Battery cycle count is low. Comes with original charger and box.",
    sellerId: "system",
    createdAt: now
  },
  {
    id: "dummy-2",
    title: "iPhone 13 Pro (128GB, Sierra Blue)",
    price: "580000",
    image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80",
    category: "Gadgets",
    location: "Tedder Hall",
    description: "UK used, very clean. FaceID active. True tone active. 90% Battery Health.",
    sellerId: "system",
    createdAt: now
  },
  {
    id: "dummy-3",
    title: "Samsung Galaxy A14",
    price: "110000",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80",
    category: "Gadgets",
    location: "Queen Idia Hall",
    description: "Brand new in box. Receipt available. Great battery life for classes.",
    sellerId: "system",
    createdAt: now
  },
  {
    id: "dummy-4",
    title: "Oraimo FreePods 4",
    price: "25000",
    image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=800&q=80",
    category: "Gadgets",
    location: "Zik Hall",
    description: "Active Noise Cancellation. Barely used. Very loud bass.",
    sellerId: "system",
    createdAt: now
  },
  {
    id: "dummy-9",
    title: "Reading Table and Chair",
    price: "15000",
    image: "https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=800&q=80",
    category: "Furniture",
    location: "Agbowo",
    description: "Standard reading set. Sturdy table with plastic chair.",
    sellerId: "system",
    createdAt: now
  },


  // --- FASHION & WEAR ---
  {
    id: "dummy-11",
    title: "Vintage Nike Hoodie (Grey)",
    price: "12000",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    category: "Fashion",
    location: "Faculty of Arts",
    description: "Size XL. Heavy cotton material. Perfect for cold mornings.",
    sellerId: "system",
    createdAt: now
  },
  {
    id: "dummy-12",
    title: "Blue Mom Jeans (Size 32)",
    price: "7000",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    category: "Fashion",
    location: "Queen Idia",
    description: "High waist, thrift grade A. No fading.",
    sellerId: "system",
    createdAt: now
  },
  {
    id: "dummy-13",
    title: "Nike Air Force 1 '07",
    price: "25000",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    category: "Fashion",
    location: "Tech Road",
    description: "Clean white kicks. Size 44. Comes with box.",
    sellerId: "system",
    createdAt: now
  },
 
  {
    id: "dummy-20",
    title: "Wooden Wardrobe (2 Doors)",
    price: "35000",
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
    category: "Furniture",
    location: "Awo Hall",
    description: "Spacious wooden wardrobe. Lock and key included.",
    sellerId: "system",
    createdAt: now
  }
]