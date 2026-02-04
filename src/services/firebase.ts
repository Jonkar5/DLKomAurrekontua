
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAL9qa10A-NYSeoKTqivVGaxB9UUOhrsaM",
  authDomain: "dlkomaurrekontua.firebaseapp.com",
  projectId: "dlkomaurrekontua",
  storageBucket: "dlkomaurrekontua.firebasestorage.app",
  messagingSenderId: "180428365229",
  appId: "1:180428365229:web:9f726da5fa67a030df1524",
  measurementId: "G-SDMKZP716L"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
