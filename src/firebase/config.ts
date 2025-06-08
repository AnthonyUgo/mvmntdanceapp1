import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBd3E5a4EFTtBdr5Ha3Lg8cA28DOepTP4s",
  authDomain: "mvmntdanceapp.firebaseapp.com",
  projectId: "mvmntdanceapp",
  storageBucket: "mvmntdanceapp.appspot.com",
  messagingSenderId: "725624410329",
  appId: "1:725624410329:web:2e7d1a2bb41ffa1d29eec8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, auth, storage };
