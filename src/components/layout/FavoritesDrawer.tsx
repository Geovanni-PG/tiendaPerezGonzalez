"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useDrawer } from "@/context/DrawerContext";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useProducts } from "@/hooks/useProducts";
import { useAuthModal } from "@/context/AuthModalContext";

export default function FavoritesDrawer() {
  const { abierto, cerrar } = useDrawer();
  const { usuario } = useAuth();
  const { favoritos, alternarFavorito } = useFavorites();
  const { productos } = useProducts();
  const { abrirModal } = useAuthModal();

  const productosFavoritos = productos.filter((p) => favoritos.includes(p.id));

  return (
    <Drawer anchor="right" open={abierto === "favoritos"} onClose={cerrar}>
      <Box sx={{ width: { xs: 320, sm: 380 }, display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Mis favoritos
          </Typography>
          <IconButton onClick={cerrar} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />

        {!usuario ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Inicia sesión para guardar y ver tus productos favoritos.
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                cerrar();
                abrirModal();
              }}
            >
              Iniciar sesión
            </Button>
          </Box>
        ) : productosFavoritos.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">Todavía no tienes favoritos.</Typography>
          </Box>
        ) : (
          <List sx={{ flex: 1, overflowY: "auto" }}>
            {productosFavoritos.map((producto) => (
              <ListItem
                key={producto.id}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => alternarFavorito(producto.id)}
                    aria-label="Quitar de favoritos"
                  >
                    <FavoriteIcon color="secondary" fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemButton
                  component={Link}
                  href={`/producto/${producto.id}`}
                  onClick={cerrar}
                  sx={{ pr: 6 }}
                >
                  <ListItemAvatar>
                    <Box
                      sx={{
                        position: "relative",
                        width: 56,
                        height: 56,
                        borderRadius: 1,
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        src={producto.imagenPrincipal}
                        alt={producto.nombre}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </Box>
                  </ListItemAvatar>
                  <ListItemText
                    sx={{ ml: 1.5 }}
                    primary={producto.nombre}
                    secondary={`$${producto.precio.toFixed(2)}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
}