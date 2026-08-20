"use client";

import Link from "next/link";
import Image from "next/image";
import { Box, Typography, IconButton, Chip, Stack } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { Producto } from "@/types/Product";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { useAuthModal } from "@/context/AuthModalContext";

const colorInsignia: Record<string, "success" | "secondary" | "info"> = {
  Nuevo: "success",
  Oferta: "secondary",
  Popular: "info",
};

export default function ProductCard({ producto }: { producto: Producto }) {
  const { usuario } = useAuth();
  const { esFavorito, alternarFavorito } = useFavorites();
  const { agregarAlCarrito } = useCart();
  const { abrirModal } = useAuthModal();

  const favorito = esFavorito(producto.id);
  const agotado = producto.cantidadDisponible === 0;

  function manejarFavorito(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!usuario) {
      abrirModal();
      return;
    }
    alternarFavorito(producto.id);
  }

  function manejarAgregarCarrito(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (producto.cantidadDisponible === 0) return;
    agregarAlCarrito(producto);
  }

  return (
    <Box
      component={Link}
      href={`/producto/${producto.id}`}
      sx={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Imagen con overlays */}
      <Box sx={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
        <Image
          src={producto.imagenPrincipal}
          alt={producto.nombre}
          fill
          style={{ objectFit: "cover" }}
        />

        {/* Etiquetas superior izquierda: categoría + insignia */}
        <Stack sx={{ position: "absolute", top: 8, left: 8, gap: 0.5 }}>
          <Chip label={producto.categoria} size="small" sx={{ bgcolor: "background.paper" }} />
          {producto.insignia && (
            <Chip
              label={producto.insignia}
              size="small"
              color={colorInsignia[producto.insignia] ?? "default"}
            />
          )}
        </Stack>

        {/* Favorito superior derecha */}
        <IconButton
          onClick={manejarFavorito}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "background.paper",
            "&:hover": { bgcolor: "background.paper" },
          }}
          size="small"
          aria-label="Agregar a favoritos"
        >
          {favorito ? (
            <FavoriteIcon fontSize="small" color="secondary" />
          ) : (
            <FavoriteBorderIcon fontSize="small" />
          )}
        </IconButton>
        {agotado && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Chip label="AGOTADO" sx={{ bgcolor: "background.paper", fontWeight: 700 }} />
          </Box>
        )}
      </Box>

      {/* Info del producto */}
      <Box sx={{ p: 1.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {producto.nombre}
        </Typography>
        <Typography variant="caption" color={agotado ? "error" : "text.secondary"} sx={{ fontWeight: agotado ? 700 : 400 }}>
          {agotado ? "Agotado" : `${producto.cantidadDisponible} disponibles`}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }} component="span">
              ${producto.precio.toFixed(2)}
            </Typography>
            {producto.precioOriginal && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textDecoration: "line-through", ml: 0.75 }}
              >
                ${producto.precioOriginal.toFixed(2)}
              </Typography>
            )}
          </Box>

          <IconButton
            onClick={manejarAgregarCarrito}
            size="small"
            color="primary"
            aria-label="Agregar al carrito"
            disabled={agotado}
          >
            <ShoppingCartOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}