import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";


const app = initializeApp({
  apiKey: "AIzaSyAOfv20Zw_QL7VSFw97Q6F_6BrEzPUi8EU",
  authDomain: "roomlink-ebbe0.firebaseapp.com",
  projectId: "roomlink-ebbe0",
  storageBucket: "roomlink-ebbe0.firebasestorage.app",
  messagingSenderId: "500405131620",
  appId: "1:500405131620:web:bc0a415a70bf283f950271"
});``

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, "asia-northeast3");


if (import.meta.env.VITE_USE_EMULATOR === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

