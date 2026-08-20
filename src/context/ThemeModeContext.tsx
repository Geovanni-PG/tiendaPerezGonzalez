"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "@/theme/theme";

type ModoTema = "light" | "dark";

interface ThemeModeContextType {
  mode: ModoTema;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ModoTema>("light");
  const [montado, setMontado] = useState(false);

  // Al cargar la app, revisamos si el usuario ya tenía una preferencia guardada
  useEffect(() => {
    const guardado = localStorage.getItem("modo-tema") as ModoTema | null;
    if (guardado) setMode(guardado);
    setMontado(true);
  }, []);

  const toggleMode = () => {
    const nuevoModo = mode === "light" ? "dark" : "light";
    setMode(nuevoModo);
    localStorage.setItem("modo-tema", nuevoModo);
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  // Evita un "parpadeo" de tema incorrecto mientras se lee localStorage
  if (!montado) return null;

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const contexto = useContext(ThemeModeContext);
  if (!contexto) {
    throw new Error("useThemeMode debe usarse dentro de ThemeModeProvider");
  }
  return contexto;
}