// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCOsfXjrpMrl1ZuRypsfIIbgKj7CS3wEPo",
  authDomain: "ht-study-1a3eb.firebaseapp.com",
  projectId: "ht-study-1a3eb",
  storageBucket: "ht-study-1a3eb.firebasestorage.app",
  messagingSenderId: "71492518007",
  appId: "1:71492518007:web:47b3bc1c196c05952ec672"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Authentication
const auth = getAuth(app);

// Export
export { auth };
