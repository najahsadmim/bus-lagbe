import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    browserLocalPersistence,
    setPersistence
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";

const firebaseConfig = {

    apiKey: "AIzaSyCNT1wlnX35rWndmdFQcSc-8gVtwxZKiVk",

    authDomain: "herwill-sprout.firebaseapp.com",

    projectId: "herwill-sprout",

    storageBucket: "herwill-sprout.firebasestorage.app",

    messagingSenderId: "799323507693",

    appId: "1:799323507693:web:7d4fccfde70ae3007875e4"

};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence)
    .catch(error => console.error(error));

const db = getFirestore(app);

const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});

export {

    auth,

    db,

    storage,

    googleProvider

};
