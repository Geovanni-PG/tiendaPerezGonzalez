"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface FavoritesContextType {
  favoritos: string[]; // IDs de productos
  esFavorito: (idProducto: string) => boolean;
  alternarFavorito: (idProducto: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { usuarioFirebase, usuario } = useAuth();
  const [favoritos, setFavoritos] = useState<string[]>([]);

  // Escucha en tiempo real los favoritos del usuario mientras tenga sesión
  useEffect(() => {
    if (!usuarioFirebase) {
      setFavoritos([]);
      return;
    }

    const refUsuario = doc(db, "usuarios", usuarioFirebase.uid);
    const unsubscribe = onSnapshot(refUsuario, (snapshot) => {
      const datos = snapshot.data();
      setFavoritos(datos?.favoritos ?? []);
    });

    return () => unsubscribe();
  }, [usuarioFirebase]);

  function esFavorito(idProducto: string) {
    return favoritos.includes(idProducto);
  }

  async function alternarFavorito(idProducto: string) {
    if (!usuarioFirebase) {
      throw new Error("Debes iniciar sesión para guardar favoritos");
    }

    const refUsuario = doc(db, "usuarios", usuarioFirebase.uid);

    if (esFavorito(idProducto)) {
      await updateDoc(refUsuario, {
        favoritos: arrayRemove(idProducto),
      });
    } else {
      await updateDoc(refUsuario, {
        favoritos: arrayUnion(idProducto),
      });
    }
    // No hace falta actualizar el estado manualmente:
    // onSnapshot ya lo detecta y actualiza solo
  }

  return (
    <FavoritesContext.Provider value={{ favoritos, esFavorito, alternarFavorito }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const contexto = useContext(FavoritesContext);
  if (!contexto) {
    throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  }
  return contexto;
}