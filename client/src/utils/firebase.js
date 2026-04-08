
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "reetunhireiq.firebaseapp.com",
  projectId: "reetunhireiq",
  storageBucket: "reetunhireiq.firebasestorage.app",
  messagingSenderId: "1033902097563",
  appId: "1:1033902097563:web:60985960b5df7be442f23e"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export {auth , provider}