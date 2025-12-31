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







