import { Timestamp } from "firebase/firestore"

export interface Product {
  id: string
  title: string
  price: string
  image: string
  category: string
  description?: string
  location?: string
  sellerId?: string
  sellerName?: string
  status?: string
  phoneNumber?: string
  createdAt?: Timestamp 
}



export interface Seller {
  storeName: string
  location: string
  phoneNumber: string
  sellerId: string
  createdAt?: Timestamp
}

export interface UserData {
  uid: string
  displayName: string
  email: string
  phoneNumber?: string
  wishlist?: string[]
  createdAt?: Timestamp

    isAdmin?: boolean // Add this flag
}



export interface Chat {
  id: string
  participants: string[]
  participantNames: { [uid: string]: string }
  lastMessage: string
  lastMessageTime: Timestamp
}

export interface Message {
  id: string
  senderId: string
  text: string
  createdAt: Timestamp
}

// NEW: Order Interface
export interface Order {
  id: string
  items: Product[]
  totalAmount: number
  status: 'pending' | 'completed' | 'cancelled'
  date: Timestamp
}


export interface Report {
    id: string
    reporterId: string
    reportedSellerId: string
    productId?: string
    reason: string
    description: string
    status: 'pending' | 'resolved'
    createdAt: Timestamp
}

export interface Review {
    id: string
    reviewerId: string
    reviewerName: string
    sellerId: string
    rating: number // 1 to 5
    comment: string
    createdAt: Timestamp
}

export interface Service {
  id: string
  title: string
  providerName: string
  providerId: string
  description: string
  category: 'Beauty' | 'Tech' | 'Academic' | 'Domestic' | 'Design' | 'Food' | 'Other'
  price: string
  contactPhone: string
  image: string
  rating: number
  reviewsCount: number
  createdAt: Timestamp | any // allow flexibility for dummy data
}