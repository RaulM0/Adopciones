import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // <--- IMPORTANTE: Importar Storage

// Reemplaza con tus credenciales de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDo5pzaSeFS7F9UwygOqznmCdBFDbJ0iY8",
  authDomain: "adoptame-21d93.firebaseapp.com",
  projectId: "adoptame-21d93",
  storageBucket: "adoptame-21d93.firebasestorage.app", // <--- IMPORTANTE: Verificar bucket
  messagingSenderId: "369313927446",
  appId: "1:369313927446:web:e2a411a4ac05b1c83a4037"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // <--- IMPORTANTE: Exportar la variable storage