// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDlVU4gg2hDjmxHaLmrU7BwBH0P2oXAMSg",
  authDomain: "https://broadcast-green.vercel.app/",
  projectId: "broadcast-ddeb4",
  storageBucket: "broadcast-ddeb4.firebasestorage.app",
  messagingSenderId: "803737868675",
  appId: "1:803737868675:web:28f8fab8f02aff2021feb6",
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore();
const storage = getStorage();



export { app, db, storage };