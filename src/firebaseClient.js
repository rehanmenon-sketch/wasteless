import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBkbZ9k1eE664qtLHLujDS-sXQQ8vV73q8",
  authDomain: "waste-less-45900.firebaseapp.com",
  projectId: "waste-less-45900",
  storageBucket: "waste-less-45900.firebasestorage.app",
  messagingSenderId: "928590563530",
  appId: "1:928590563530:web:0b01c4f93ab307a7da8c33"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
