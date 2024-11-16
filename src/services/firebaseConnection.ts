import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDR8kcU3C7x63yGI-2VW-aM-6UWPJLbjF4",
  authDomain: "tarefas-6433a.firebaseapp.com",
  projectId: "tarefas-6433a",
  storageBucket: "tarefas-6433a.firebasestorage.app",
  messagingSenderId: "379169285316",
  appId: "1:379169285316:web:795438dc0c074800d31591"
};

const FirebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(FirebaseApp);

export { db };