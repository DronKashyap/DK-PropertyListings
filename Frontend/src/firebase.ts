// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage"; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'dkpropertylistings.firebaseapp.com',
  projectId: 'dkpropertylistings',
  storageBucket: 'dkpropertylistings.appspot.com',
  messagingSenderId: '870563527341',
  appId: '1:870563527341:web:7051fa08f598bdd2976424',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
