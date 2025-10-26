// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import 'firebase/auth';
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDmpD44C4ykQOldeW5te037CMfwKji8rF4",
  authDomain: "firstlight-ui.firebaseapp.com",
  projectId: "firstlight-ui",
  storageBucket: "firstlight-ui.firebasestorage.app",
  messagingSenderId: "487725473597",
  appId: "1:487725473597:web:9e4b0e56fd64b1916f6f54",
  measurementId: "G-RLX8RK359L",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const provider = new GoogleAuthProvider();
export default app;