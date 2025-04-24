import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBoOPilmvQj3Pzao7v32cnEw1ZO0JpddFM",
  authDomain: "final-year-project-67604.firebaseapp.com",
  projectId: "final-year-project-67604",
  storageBucket: "final-year-project-67604.firebasestorage.app",
  messagingSenderId: "534460544978",
  appId: "1:534460544978:web:b515e79ab0ad24bff4ba0b",
  measurementId: "G-K7NYYVQMBF"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
