// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";




// TODO: Add SDKs for Firebase products that you want to use
//
const firebaseConfig = {
  apiKey: "AIzaSyAmI3uZKu0oqJ90xsX-3BLsYNLno3rz3rI",
  authDomain: "deep-state-dce44.firebaseapp.com",
  databaseURL: "https://deep-state-dce44-default-rtdb.firebaseio.com",
  projectId: "deep-state-dce44",
  storageBucket: "deep-state-dce44.appspot.com",
  messagingSenderId: "36467854328",
  appId: "1:36467854328:web:bb49838d3beb41be77240d"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore();
const storage = getStorage();
const auth = getAuth(app);


export { app, db, storage, auth };