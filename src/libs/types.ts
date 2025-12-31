import { Timestamp } from "firebase/firestore"

// ... (keep existing interfaces like Product, Seller, etc.)

export interface Product {
    // ... keep existing
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

// NEW: Report Interface
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

// NEW: Review Interface
export interface Review {
    id: string
    reviewerId: string
    reviewerName: string
    sellerId: string
    rating: number // 1 to 5
    comment: string
    createdAt: Timestamp
}

// NEW: Admin User Interface (to check permissions)
export interface UserData {
    // ... keep existing
    uid: string
    displayName: string
    email: string
    phoneNumber?: string
    wishlist?: string[]
    isAdmin?: boolean // Add this flag
    createdAt?: Timestamp
}