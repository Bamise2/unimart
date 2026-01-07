# Unimart - Centralized Digital Marketplace for University Students

**Unimart** is a secure, localized, and student-centric e-commerce platform designed to streamline peer-to-peer commerce within the University of Ibadan. Unlike general marketplaces, Unimart ensures safety and trust by restricting access exclusively to verified students.

> **Project Status:** Completed (B.Sc. Final Year Project)
> **Author:** Shogbesan Oluwabamise Ifeoluwa

## 📖 Table of Contents
- [Introduction](#introduction)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Screenshots](#screenshots)
- [Contact](#contact)

## 💡 Introduction
Student commerce in Nigerian universities is currently fragmented across WhatsApp statuses and informal channels, leading to high search costs, low visibility, and fraud risks.

**Unimart** solves this by providing a dedicated web platform where students can:
* Buy and sell items (gadgets, books, fashion, etc.)
* Verify the identity of sellers (via institutional email).
* Chat in real-time to negotiate safely.
* Build reputation through a rating and review system.

## ✨ Key Features
* **🔐 Student Verification:** Strict sign-up process requiring a valid university email (e.g., `@stu.ui.edu.ng`) to ensure a closed, trusted community.
* **🛒 Product Management:** Sellers can easily upload products with images, prices, categories, and descriptions.
* **💬 Real-Time Messaging:** Integrated chat system for buyers and sellers to negotiate without exposing personal phone numbers.
* **🔎 Advanced Search & Filters:** Filter products by category, price range, and condition to find items quickly.
* **⭐ Trust System:** Peer review and rating system to flag reliable vendors and discourage fraud.
* **🛡️ Admin Dashboard:** Comprehensive panel for administrators to moderate content, manage users, and handle reported listings.

## 🛠️ Technology Stack
This project utilizes a modern **MERN-like** architecture (replacing MongoDB/Node with Firebase for serverless efficiency).

* **Frontend:** [React.js](https://reactjs.org/) (v18.2.0)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Backend / Database:** [Google Firebase](https://firebase.google.com/) (Firestore NoSQL Database)
* **Authentication:** Firebase Auth (Email/Password & Institutional Verification)
* **Storage:** Firebase Storage (Image hosting)
* **Icons:** Lucide React

## 🏗️ System Architecture
The system follows a **Three-Tier Architecture**:
1.  **Presentation Layer:** React.js frontend for user interaction.
2.  **Application Layer:** Firebase SDK handling business logic, auth, and security rules.
3.  **Data Layer:** Cloud Firestore for persistent, real-time data storage.

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v14 or higher)
* [npm](https://www.npmjs.com/) or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/unimart.git](https://github.com/your-username/unimart.git)
    cd unimart
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add your Firebase credentials (see Configuration section below).

4.  **Run the application**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## ⚙️ Configuration
To run this project, you need to create a project on [Firebase Console](https://console.firebase.google.com/).

1.  Create a new Firebase project.
2.  Enable **Authentication** (Email/Password).
3.  Enable **Firestore Database** and **Storage**.
4.  Copy your web app config keys and paste them into a `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";

// REPLACE THESE WITH YOUR ACTUAL FIREBASE CONSOLE KEYS
const firebaseConfig = {
  apiKey: "AIzaSyBdQBBDXd64dsetmNtn7GXZnukFSi0Ukd4",
  authDomain: "unimart-1e367.firebaseapp.com",
  projectId: "unimart-1e367",
  storageBucket: "unimart-1e367.firebasestorage.app",
  messagingSenderId: "107052519252",
  appId: "1:107052519252:web:c8b8b8bedb05d775ea02c1",
  measurementId: "G-L52J506CB7"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);



