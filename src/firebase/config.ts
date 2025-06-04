import { initializeApp } from 'firebase/app';
// ⚠️ Do NOT import getAnalytics — it’s web-only!

const firebaseConfig = {
  apiKey: "AIzaSyBd3E5a4EFTtBdr5Ha3Lg8cA28DOepTP4s",
  authDomain: "mvmntdanceapp.firebaseapp.com",
  projectId: "mvmntdanceapp",
  storageBucket: "mvmntdanceapp.appspot.com",
  messagingSenderId: "725624410329",
  appId: "1:725624410329:web:2e7d1a2bb41ffa1d29eec8",
  // measurementId: "G-T733DY4HKE" // Optional, but also web-only
};

const app = initializeApp(firebaseConfig);

export { app };
