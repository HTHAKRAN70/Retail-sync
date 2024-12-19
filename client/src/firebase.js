// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: "mern-blog-3600b.firebaseapp.com",
//   projectId: "mern-blog-3600b",
//   storageBucket: "mern-blog-3600b.appspot.com",
//   messagingSenderId: "542616735625",
//   appId: "1:542616735625:web:5a5ffbe81ee084d0a81b58"
// };

// // Initialize Firebase
// export  const app = initializeApp(firebaseConfig);
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "vendor-da52b.firebaseapp.com",
  projectId: "vendor-da52b",
  storageBucket: "vendor-da52b.appspot.com",
  messagingSenderId: "915813556872",
  appId: "1:915813556872:web:7804bfcea5bbe031d0f53d",
  measurementId: "G-XWZKZKNZLC"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);