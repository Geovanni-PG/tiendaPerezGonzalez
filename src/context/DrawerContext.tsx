"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type TipoDrawer = "favoritos" | "carrito" | null;

interface DrawerContextType {
  abierto: TipoDrawer;
  abrirFavoritos: () => void;
  abrirCarrito: () => void;
  cerrar: () => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [abierto, setAbierto] = useState<TipoDrawer>(null);

  return (
    <DrawerContext.Provider
      value={{
        abierto,
        abrirFavoritos: () => setAbierto("favoritos"),
        abrirCarrito: () => setAbierto("carrito"),
        cerrar: () => setAbierto(null),
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const contexto = useContext(DrawerContext);
  if (!contexto) {
    throw new Error("useDrawer debe usarse dentro de DrawerProvider");
  }
  return contexto;
}