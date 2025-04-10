// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBEDaxI1FDo4cyq9zLNZ6RL1YcdYjNSLZA",
  authDomain: "instagram-2d742.firebaseapp.com",
  projectId: "instagram-2d742",
  storageBucket: "instagram-2d742.appspot.com",
  messagingSenderId: "969604915107",
  appId: "1:969604915107:web:14ef43be541df46d6e4416"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore();
const storage = getStorage();



export { app, db, storage };