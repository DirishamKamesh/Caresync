// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCySuook3NYKAf1wTvebviEh3_W0XVbJQA",
  authDomain: "caresync-6dbd1.firebaseapp.com",
  projectId: "caresync-6dbd1",
  storageBucket: "caresync-6dbd1.firebasestorage.app",
  messagingSenderId: "730041642149",
  appId: "1:730041642149:web:a6c92a76d8960042df714c",
  measurementId: "G-1MT11VHJS0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

window.FirebaseAuth = {
  auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  signOut,
  onAuthStateChanged
};

window.FirebaseDB = db;

export { app, auth, db, googleProvider };
