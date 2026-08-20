"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Usuario } from "@/types/User";

interface AuthContextType {
  usuarioFirebase: FirebaseUser | null;
  usuario: Usuario | null;
  cargando: boolean;
}

const AuthContext = createContext<AuthContextType>({
  usuarioFirebase: null,
  usuario: null,
  cargando: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuarioFirebase, setUsuarioFirebase] = useState<FirebaseUser | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let unsubscribeUsuario: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUsuarioFirebase(firebaseUser);

      // Cerramos el listener del documento anterior antes de abrir uno nuevo
      if (unsubscribeUsuario) {
        unsubscribeUsuario();
        unsubscribeUsuario = undefined;
      }

      if (firebaseUser) {
        const refDocumento = doc(db, "usuarios", firebaseUser.uid);
        unsubscribeUsuario = onSnapshot(refDocumento, (snapshot) => {
          setUsuario(snapshot.exists() ? (snapshot.data() as Usuario) : null);
          setCargando(false);
        });
      } else {
        setUsuario(null);
        setCargando(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUsuario) unsubscribeUsuario();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ usuarioFirebase, usuario, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}