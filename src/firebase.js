// firebase.js — Firebase init & exports (npm package, no CDN)
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)

const auth = getAuth(app)
setPersistence(auth, browserLocalPersistence)

// Use IndexedDB-backed persistent cache so recipes survive browser restarts
// and cold page loads don't require a live network round-trip to Firestore.
// No explicit tabManager — defaults to single-tab mode which is the most
// reliable; multi-tab manager can fail to acquire IndexedDB ownership on a
// cold start and silently blocks all write operations including deleteDoc.
const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
})

export {
  auth, db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  collection, addDoc, getDocs, deleteDoc, doc, query, orderBy
}
