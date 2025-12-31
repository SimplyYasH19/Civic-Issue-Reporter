import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSyBe_LaPADmUYh--1Th4ImsFl76slzYD5DU",
  authDomain: "civic-issue-app-83c27.firebaseapp.com",
  projectId: "civic-issue-app-83c27",
  storageBucket: "civic-issue-app-83c27.firebasestorage.app",
  messagingSenderId: "1099369255876",
  appId: "1:1099369255876:web:5ec8ca9c501a256ed8ca91",
  measurementId: "G-596ZXW8KC1"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
