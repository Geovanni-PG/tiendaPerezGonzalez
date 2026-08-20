"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AuthModalContextType {
  abierto: boolean;
  abrirModal: () => void;
  cerrarModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <AuthModalContext.Provider
      value={{
        abierto,
        abrirModal: () => setAbierto(true),
        cerrarModal: () => setAbierto(false),
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const contexto = useContext(AuthModalContext);
  if (!contexto) {
    throw new Error("useAuthModal debe usarse dentro de AuthModalProvider");
  }
  return contexto;
}