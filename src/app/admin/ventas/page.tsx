"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmailIcon from "@mui/icons-material/Email";
import CallIcon from "@mui/icons-material/Call";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Pedido } from "@/types/Order";
import { doc, writeBatch } from "firebase/firestore";

export default function VentasAdmin() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const DIAS_RETENCION = 60; // pedidos más antiguos que esto se borran solos

  useEffect(() => {
    const q = query(collection(db, "pedidos"), orderBy("fecha", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPedidos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Pedido));
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function limpiarPedidosAntiguos() {
      const limite = new Date();
      limite.setDate(limite.getDate() - DIAS_RETENCION);

      const antiguos = pedidos.filter((p) => new Date(p.fecha) < limite);
      if (antiguos.length === 0) return;

      const batch = writeBatch(db);
      antiguos.forEach((p) => batch.delete(doc(db, "pedidos", p.id)));
      await batch.commit();
    }

    if (pedidos.length > 0) {
      limpiarPedidosAntiguos();
    }
  }, [pedidos]);

  if (cargando) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Ventas
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {pedidos.length} pedido(s) registrados
      </Typography>

      {pedidos.length === 0 ? (
        <Typography color="text.secondary">Todavía no hay pedidos registrados.</Typography>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Contacto</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Pago</TableCell>
                <TableCell align="right">Detalles</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedidos.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell>{new Date(pedido.fecha).toLocaleString("es-MX")}</TableCell>
                  <TableCell>
                    {pedido.clienteNombre}
                    {!pedido.usuarioUid && <Chip label="Invitado" size="small" sx={{ ml: 1 }} />}
                  </TableCell>
                  <TableCell>{pedido.clienteTelefono}</TableCell>
                  <TableCell>${pedido.total.toFixed(2)}</TableCell>
                  <TableCell>{pedido.metodoPago}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => setPedidoSeleccionado(pedido)} aria-label="Ver detalles">
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      <Dialog open={!!pedidoSeleccionado} onClose={() => setPedidoSeleccionado(null)} maxWidth="xs" fullWidth>
        {pedidoSeleccionado && (
          <>
            <DialogTitle>Detalle del pedido</DialogTitle>
            <DialogContent dividers>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Cliente
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {pedidoSeleccionado.clienteNombre}
                {!pedidoSeleccionado.usuarioUid && " (compra sin cuenta)"}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <IconButton size="small" color="primary" component="a" href={`mailto:${pedidoSeleccionado.clienteCorreo}`}>
                  <EmailIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="primary" component="a" href={`tel:${pedidoSeleccionado.clienteTelefono}`}>
                  <CallIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="primary"
                  component="a"
                  href={`https://wa.me/${pedidoSeleccionado.clienteTelefono.replace(/\D/g, "")}`}
                  target="_blank"
                >
                  <WhatsAppIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Dirección de entrega
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {pedidoSeleccionado.direccion.calle}, {pedidoSeleccionado.direccion.colonia},{" "}
                {pedidoSeleccionado.direccion.ciudad}, {pedidoSeleccionado.direccion.estado}, CP{" "}
                {pedidoSeleccionado.direccion.codigoPostal}
                {pedidoSeleccionado.direccion.referencia && (
                  <>
                    <br />
                    Referencia: {pedidoSeleccionado.direccion.referencia}
                  </>
                )}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Productos
              </Typography>
              <Stack spacing={1} sx={{ mb: 2 }}>
                {pedidoSeleccionado.items.map((item, i) => (
                  <Box key={i} sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">
                      {item.nombre} x{item.cantidad}
                    </Typography>
                    <Typography variant="body2">${(item.precio * item.cantidad).toFixed(2)}</Typography>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                <Typography sx={{ fontWeight: 700 }}>${pedidoSeleccionado.total.toFixed(2)}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Método de pago: {pedidoSeleccionado.metodoPago}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPedidoSeleccionado(null)}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}