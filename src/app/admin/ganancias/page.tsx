"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
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
} from "@mui/material";
import { Pedido } from "@/types/Order";

interface ResumenProducto {
  productoId: string;
  nombre: string;
  cantidadVendida: number;
  importe: number;
  ganancia: number;
}

export default function GananciasAdmin() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "pedidos"), (snapshot) => {
      setPedidos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Pedido));
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  if (cargando) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const resumenPorProducto = new Map<string, ResumenProducto>();

  pedidos.forEach((pedido) => {
    (pedido.items ?? []).forEach((item) => {
    const existente = resumenPorProducto.get(item.productoId);
    const importeItem = item.precio * item.cantidad;
    const gananciaItem = (item.precio - (item.costPrice ?? 0)) * item.cantidad;

    if (existente) {
      existente.cantidadVendida += item.cantidad;
      existente.importe += importeItem;
      existente.ganancia += gananciaItem;
    } else {
      resumenPorProducto.set(item.productoId, {
        productoId: item.productoId,
        nombre: item.nombre,
        cantidadVendida: item.cantidad,
        importe: importeItem,
        ganancia: gananciaItem,
      });
    }
  });
});

  const filas = Array.from(resumenPorProducto.values()).sort((a, b) => b.importe - a.importe);
  const gananciaTotal = filas.reduce((suma, fila) => suma + fila.ganancia, 0);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Ganancias
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Resumen de productos vendidos y su importe total
      </Typography>

      {filas.length === 0 ? (
        <Typography color="text.secondary">Todavía no hay ventas registradas.</Typography>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="right">Cantidad vendida</TableCell>
                <TableCell align="right">Importe (venta)</TableCell>
                <TableCell align="right">Ganancia</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filas.map((fila) => (
                <TableRow key={fila.productoId}>
                  <TableCell>{fila.nombre}</TableCell>
                  <TableCell align="right">{fila.cantidadVendida}</TableCell>
                  <TableCell align="right">${fila.importe.toFixed(2)}</TableCell>
                  <TableCell align="right">${fila.ganancia.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 4,
              mt: 2,
              pt: 2,
              borderTop: 2,
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Ganancia total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              ${gananciaTotal.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      )}
    </Container>
  );
}