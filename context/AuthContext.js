// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
// 1. Nuevas importaciones necesarias para leer la base de datos
import { doc, getDoc } from 'firebase/firestore'; 
import { auth, db } from '../firebaseConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // 2. Nuevo estado para guardar datos extra (rol, nombre, favoritos, etc.)
  const [userData, setUserData] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          // 3. Si el usuario se loguea, buscamos su documento en la colección 'users'
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUserData(userSnap.data()); // Guardamos los datos (aquí vendrá el role: 'admin')
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error("Error cargando datos del usuario:", error);
          setUserData(null);
        }
      } else {
        // Si hace logout, limpiamos los datos
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 4. Exponemos 'userData' para poder usarlo en App.js y controlar la navegación
  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};