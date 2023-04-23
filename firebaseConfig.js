// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCuZrKwqm5BU5HnTflLAj9id1O5txhFPjQ",
    authDomain: "quiz-game-bc4ba.firebaseapp.com",
    databaseURL: "https://quiz-game-bc4ba-default-rtdb.firebaseio.com",
    projectId: "quiz-game-bc4ba",
    storageBucket: "quiz-game-bc4ba.appspot.com",
    messagingSenderId: "1073273640899",
    appId: "1:1073273640899:web:2b48ac450c133bd6c20f76"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const dbRef = ref(getDatabase());

export { app, dbRef};