// src/firebase/config.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC5VC63wsmpp_vCg8ul29wopgUuvy1Innc",
  authDomain: "mvmntdanceapp-eeac3.firebaseapp.com",
  projectId: "mvmntdanceapp-eeac3",
  storageBucket: "mvmntdanceapp-eeac3.appspot.com",
  messagingSenderId: "1074387332824",
  appId: "1:1074387332824:web:07287f62909816b227b1ad",
  measurementId: "G-C78QHTKF20"
};

// Initialize app ONCE and export get functions
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Lazy-load functions
export const getFirebaseAuth = () => getAuth(app);
export const getFirebaseStorage = () => getStorage(app);
