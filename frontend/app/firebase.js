// firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCWsz9BDBTucNsCUivVtr1__xA5U4jNDe4",
    authDomain: "forms-a7a8f.firebaseapp.com",
    projectId: "forms-a7a8f",
    storageBucket: "forms-a7a8f.appspot.com",
    messagingSenderId: "589554550070",
    appId: "1:589554550070:web:8b059c065c788f630f9f97",
    measurementId: "G-WK96RKFP77"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
export default app;
