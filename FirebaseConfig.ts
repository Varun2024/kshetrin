// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCVZFUayqADIBSvFxvX3TsIzV1Mitsigr0",
  authDomain: "kshetrin-9dc1f.firebaseapp.com",
  projectId: "kshetrin-9dc1f",
  storageBucket: "kshetrin-9dc1f.firebasestorage.app",
  messagingSenderId: "781094361004",
  appId: "1:781094361004:web:a1344699cbe79a1e650c09",
  measurementId: "G-VWMKH4Q3NH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getFirestore(app)