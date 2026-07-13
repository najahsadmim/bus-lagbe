import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyB6cq46hL9Qj_UUo1mkd5Mhv4hMm-UyaL4",
    authDomain: "bus-lagbe-5a203.firebaseapp.com",
    projectId: "bus-lagbe-5a203",
    storageBucket: "bus-lagbe-5a203.firebasestorage.app",
    messagingSenderId: "669023691866",
    appId: "1:669023691866:web:4a6230815721cce0c5a463"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});

export {
    auth,
    googleProvider,
    signInWithPopup
};
