"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDrawer } from "@/context/DrawerContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import CheckoutDialog from "@/components/carrito/CheckoutDialog";

export default function CartDrawer() {
  const { abierto, cerrar } = useDrawer();
  const { usuario } = useAuth();
  const { abrirModal } = useAuthModal();
  const { items, actualizarCantidad, quitarDelCarrito, totalPrecio } = useCart();
  const [checkoutAbierto, setCheckoutAbierto] = useState(false);

  return (
    <>
      <Drawer anchor="right" open={abierto === "carrito"} onClose={cerrar}>
        <Box sx={{ width: { xs: 320, sm: 400 }, display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Mi carrito
            </Typography>
            <IconButton onClick={cerrar} aria-label="Cerrar">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />

          {items.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">Tu carrito está vacío.</Typography>
            </Box>
          ) : (
            <List sx={{ flex: 1, overflowY: "auto" }}>
              {items.map(({ producto, cantidad }) => (
                <ListItem key={producto.id} sx={{ alignItems: "flex-start" }}>
                  <ListItemAvatar>
                    <Box sx={{ position: "relative", width: 56, height: 56, borderRadius: 1, overflow: "hidden" }}>
                      <Image src={producto.imagenPrincipal} alt={producto.nombre} fill style={{ objectFit: "cover" }} />
                    </Box>
                  </ListItemAvatar>
                  <ListItemText
                    sx={{ ml: 1.5 }}
                    primary={producto.nombre}
                    secondary={
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5, alignItems: "center" }}>
                        <IconButton size="small" onClick={() => actualizarCantidad(producto.id, cantidad - 1)}>
                          <RemoveIcon fontSize="inherit" />
                        </IconButton>
                        <Typography variant="body2">{cantidad}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => actualizarCantidad(producto.id, cantidad + 1)}
                          disabled={cantidad >= producto.cantidadDisponible}
                        >
                          <AddIcon fontSize="inherit" />
                        </IconButton>
                        <Typography variant="body2" sx={{ ml: 1, fontWeight: 700 }}>
                          ${(producto.precio * cantidad).toFixed(2)}
                        </Typography>
                      </Stack>
                    }
                  />
                  <IconButton size="small" onClick={() => quitarDelCarrito(producto.id)} aria-label="Quitar">
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}

          {items.length > 0 && (
            <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                <Typography sx={{ fontWeight: 700 }}>${totalPrecio.toFixed(2)}</Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => {
                  if (!usuario) {
                    cerrar();
                    abrirModal();
                    return;
                  }
                  setCheckoutAbierto(true);
                }}
              >
                Proceder al pago
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      <CheckoutDialog
        open={checkoutAbierto}
        onClose={() => setCheckoutAbierto(false)}
        onExito={() => {
          setCheckoutAbierto(false);
          cerrar();
        }}
      />
    </>
  );
}