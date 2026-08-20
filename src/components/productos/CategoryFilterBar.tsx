"use client";

import { Box, Button } from "@mui/material";

interface CategoryFilterBarProps {
  categorias: string[];
  categoriaActiva: string;
  onCambiarCategoria: (categoria: string) => void;
}

export default function CategoryFilterBar({
  categorias,
  categoriaActiva,
  onCambiarCategoria,
}: CategoryFilterBarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        overflowX: "auto",
        pb: 1,
        "&::-webkit-scrollbar": { height: 6 },
      }}
    >
      {["Todos", ...categorias].map((categoria) => {
        const activa = categoriaActiva === categoria;
        return (
          <Button
            key={categoria}
            onClick={() => onCambiarCategoria(categoria)}
            variant="text"
            sx={{
              flexShrink: 0,
              borderRadius: 5,
              px: 2.5,
              textTransform: "none",
              bgcolor: activa ? "primary.main" : "transparent",
              color: activa ? "primary.contrastText" : "text.primary",
              "&:hover": {
                bgcolor: activa ? "primary.main" : "transparent",
                boxShadow: 2,
              },
            }}
          >
            {categoria}
          </Button>
        );
      })}
    </Box>
  );
}