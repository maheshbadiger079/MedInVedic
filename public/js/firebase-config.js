// Firebase Configuration — MedInVedic
// Project: medinvedic | https://console.firebase.google.com/project/medinvedic

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signInWithRedirect, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDLLUM3tq0DgQ9hqmeyrsHs8Qn4OqyT8I8",
  authDomain: "medinvedic.firebaseapp.com",
  projectId: "medinvedic",
  storageBucket: "medinvedic.firebasestorage.app",
  messagingSenderId: "541158956459",
  appId: "1:541158956459:web:22ad5e814e7c508a8dc6ee",
  measurementId: "G-RW9JCDWBQ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// ── Firestore Collections ──────────────────────
export const Collections = {
  USERS: 'Users',
  PRODUCTS: 'Products',
  ORDERS: 'Orders',
  PRESCRIPTIONS: 'Prescriptions',
  DOCTORS: 'Doctors',
  REVIEWS: 'Reviews',
  HEALTH_ARTICLES: 'HealthArticles',
  CART: 'Cart'
};

// ── Auth Helpers ────────────────────────────────
export async function registerUser(email, password, name) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, Collections.USERS, cred.user.uid), {
    name, email, createdAt: new Date().toISOString(),
    membership: 'Silver', orders: 0, prescriptions: 0
  });
  return cred.user;
}

export async function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
  return signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ── Prescription Upload ─────────────────────────
export async function uploadPrescription(file, userId) {
  const storageRef = ref(storage, `prescriptions/${userId}/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  const prescriptionDoc = await addDoc(collection(db, Collections.PRESCRIPTIONS), {
    userId, fileURL: downloadURL, fileName: file.name,
    status: 'pending', uploadedAt: new Date().toISOString()
  });
  return { id: prescriptionDoc.id, fileURL: downloadURL };
}

// ── Order Management ────────────────────────────
export async function createOrder(userId, cartItems, totalAmount, address) {
  const orderRef = await addDoc(collection(db, Collections.ORDERS), {
    userId, items: cartItems, totalAmount, address,
    status: 'Processing', createdAt: new Date().toISOString(),
    paymentStatus: 'Paid'
  });
  return orderRef.id;
}

export async function getUserOrders(userId) {
  const q = query(
    collection(db, Collections.ORDERS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Social Login ──────────────────────────────
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function signInWithFacebook() {
  const provider = new FacebookAuthProvider();
  return signInWithPopup(auth, provider);
}

export { RecaptchaVerifier, signInWithPhoneNumber };
