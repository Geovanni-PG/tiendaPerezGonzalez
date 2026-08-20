import { createTheme, ThemeOptions } from "@mui/material/styles";

export const getTheme = (mode: "light" | "dark") => {
  const isLight = mode === "light";

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: isLight ? "#FF6F59" : "#FF8A73", // Coral vibrante (botones y acentos)
      },
      secondary: {
        main: isLight ? "#B31F1F" : "#E05C5C", // Rojo (estructura/acentos secundarios)
      },
      background: {
        default: isLight ? "#FFFFFF" : "#121212", // Blanco puro
        paper: isLight ? "#FFFFFF" : "#1E1E1E",
      },
      text: {
        primary: isLight ? "#0B1F3A" : "#F5F0EA", // Azul marino profundo
      },
    },
    typography: {
      fontFamily: "var(--font-geist-sans), Arial, sans-serif",
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};