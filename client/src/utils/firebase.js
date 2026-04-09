import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "intervexa-ai-c67ed.firebaseapp.com",
  projectId: "intervexa-ai-c67ed",
  storageBucket: "intervexa-ai-c67ed.firebasestorage.app",
  messagingSenderId: "529584026077",
  appId: "1:529584026077:web:a3a478dae33b11de5e0634"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();


provider.setCustomParameters({
  prompt: "select_account",
});

export { auth, provider };