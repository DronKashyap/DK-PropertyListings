import React from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import firebase from '../firebase';
import axios from 'axios';

const OAuth: React.FC = () => {
  const auth = getAuth(firebase);
  const provider = new GoogleAuthProvider();

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userData = {
        username: user.displayName || 'Unknown User',
        email: user.email,
        password:user.uid,
        avatar: user.photoURL || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
      };

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/signup`, userData);
      console.log('User signed up:', response.data);
    } catch (error) {
      console.error('Error during Google login: ', error);
    }
  };

  return ( 
    <div>
      <button onClick={signInWithGoogle} className="bg-white hover:bg-gray-300 text-black font-bold py-2  mt-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
        Login with Google
      </button>
    </div>
  );
};

export default OAuth;
