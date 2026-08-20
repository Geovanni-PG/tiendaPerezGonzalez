"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Stack,
  Divider,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { collection, doc, writeBatch, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  onExito: () => void;
}

type Paso = "confirmar" | "exito";

export default function CheckoutDialog({ open, onClose, onExito }: CheckoutDialogProps) {
  const { usuario, usuarioFirebase } = useAuth();
  const { items, totalPrecio, vaciarCarrito } = useCart();

  const [paso, setPaso] = useState<Paso>("confirmar");
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [cvv, setCvv] = useState("");
  const [erroresTarjeta, setErroresTarjeta] = useState<{
    numero?: string;
    vencimiento?: string;
    cvv?: string;
  }>({});

  useEffect(() => {
    if (!open) return;
    setPaso("confirmar");
    setNumeroTarjeta("");
    setVencimiento("");
    setCvv("");
    setErroresTarjeta({});
    setError("");
  }, [open]);

  function manejarNumeroTarjeta(e: React.ChangeEvent<HTMLInputElement>) {
    const soloDigitos = e.target.value.replace(/\D/g, "").slice(0, 16);
    setNumeroTarjeta(soloDigitos.replace(/(.{4})/g, "$1 ").trim());
  }

  function manejarVencimiento(e: React.ChangeEvent<HTMLInputElement>) {
    const soloDigitos = e.target.value.replace(/\D/g, "").slice(0, 4);
    setVencimiento(
      soloDigitos.length > 2 ? `${soloDigitos.slice(0, 2)}/${soloDigitos.slice(2)}` : soloDigitos
    );
  }

  function manejarCvv(e: React.ChangeEvent<HTMLInputElement>) {
    setCvv(e.target.value.replace(/\D/g, "").slice(0, 3));
  }

  async function confirmarPago(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const nuevosErrores: typeof erroresTarjeta = {};
    const digitosNumero = numeroTarjeta.replace(/\s/g, "");
    if (digitosNumero.length < 16) nuevosErrores.numero = "Faltan dígitos de la tarjeta";
    if (vencimiento.length < 5) nuevosErrores.vencimiento = "Ingresa mes y año";
    if (cvv.length < 3) nuevosErrores.cvv = "Faltan dígitos del CVV";

    if (Object.keys(nuevosErrores).length > 0) {
      setErroresTarjeta(nuevosErrores);
      return;
    }
    setErroresTarjeta({});

    if (!usuario || !usuarioFirebase) return;

    setProcesando(true);
    try {
      const batch = writeBatch(db);
      const pedidoRef = doc(collection(db, "pedidos"));

      batch.set(pedidoRef, {
        clienteNombre: usuario.nombre,
        clienteCorreo: usuario.correo,
        clienteTelefono: usuario.direccion?.telefono ?? "",
        direccion: {
          calle: usuario.direccion?.calle ?? "",
          colonia: usuario.direccion?.colonia ?? "",
          ciudad: usuario.direccion?.ciudad ?? "",
          estado: usuario.direccion?.estado ?? "",
          codigoPostal: usuario.direccion?.codigoPostal ?? "",
          referencia: usuario.direccion?.referencia ?? "",
        },
        items: items.map(({ producto, cantidad }) => ({
          productoId: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          costPrice: producto.costPrice ?? 0,
          cantidad,
          imagen: producto.imagenPrincipal,
        })),
        total: totalPrecio,
        metodoPago: "Tarjeta (simulado)",
        estado: "pagado",
        usuarioUid: usuarioFirebase.uid,
        fecha: new Date().toISOString(),
      });

      items.forEach(({ producto, cantidad }) => {
        const productoRef = doc(db, "productos", producto.id);
        batch.update(productoRef, { cantidadDisponible: increment(-cantidad) });
      });

      await batch.commit();
      await vaciarCarrito();
      setPaso("exito");
    } catch {
      setError("Hubo un error al procesar tu pedido, intenta de nuevo");
    } finally {
      setProcesando(false);
    }
  }

  function cerrarTodo() {
    if (paso === "exito") {
      onExito();
    } else {
      onClose();
    }
  }

  if (!usuario) return null;

  return (
    <Dialog open={open} onClose={cerrarTodo} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {paso === "confirmar" ? "Confirmar pedido" : "¡Pedido realizado!"}
        <IconButton onClick={cerrarTodo} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {paso === "confirmar" && (
          <Box component="form" id="form-confirmar-checkout" onSubmit={confirmarPago} sx={{ pt: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Resumen del pedido
            </Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              {items.map(({ producto, cantidad }) => (
                <Box key={producto.id} sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">
                    {producto.nombre} x{cantidad}
                  </Typography>
                  <Typography variant="body2">${(producto.precio * cantidad).toFixed(2)}</Typography>
                </Box>
              ))}
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography sx={{ fontWeight: 700 }}>Total</Typography>
              <Typography sx={{ fontWeight: 700 }}>${totalPrecio.toFixed(2)}</Typography>
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Enviar a
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {usuario.nombre} · {usuario.direccion?.telefono || "Sin teléfono registrado"}
              <br />
              {usuario.direccion?.calle
                ? `${usuario.direccion.calle}, ${usuario.direccion.colonia}, ${usuario.direccion.ciudad}, ${usuario.direccion.estado}, CP ${usuario.direccion.codigoPostal}`
                : "Sin dirección registrada — puedes agregarla en tu perfil"}
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Pago con tarjeta (simulado)
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Número de tarjeta"
                value={numeroTarjeta}
                onChange={manejarNumeroTarjeta}
                fullWidth
                placeholder="0000 0000 0000 0000"
                error={!!erroresTarjeta.numero}
                helperText={erroresTarjeta.numero}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Vencimiento (MM/AA)"
                  value={vencimiento}
                  onChange={manejarVencimiento}
                  fullWidth
                  placeholder="12/28"
                  error={!!erroresTarjeta.vencimiento}
                  helperText={erroresTarjeta.vencimiento}
                />
                <TextField
                  label="CVV"
                  value={cvv}
                  onChange={manejarCvv}
                  fullWidth
                  placeholder="123"
                  error={!!erroresTarjeta.cvv}
                  helperText={erroresTarjeta.cvv}
                />
              </Stack>
              <Alert severity="info">Esto es una simulación — no se procesa ningún cobro real.</Alert>
            </Stack>
          </Box>
        )}

        {paso === "exito" && (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 56, color: "success.main", mb: 1 }} />
            <Typography sx={{ mb: 1 }}>
              Gracias, {usuario.nombre.split(" ")[0]}. Tu pedido fue registrado correctamente.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nos pondremos en contacto contigo para confirmar la entrega.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {paso === "confirmar" && (
          <Button type="submit" form="form-confirmar-checkout" variant="contained" disabled={procesando} fullWidth>
            {procesando ? "Procesando..." : "Confirmar pago"}
          </Button>
        )}
        {paso === "exito" && (
          <Button variant="contained" onClick={cerrarTodo} fullWidth>
            Cerrar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}