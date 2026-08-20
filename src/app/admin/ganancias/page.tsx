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
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeek";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Pedido } from "@/types/Order";

interface ResumenProducto {
  productoId: string;
  nombre: string;
  cantidadVendida: number;
  costoTotal: number;
  importe: number;
  ganancia: number;
}

interface ResumenPeriodo {
  key: string;
  label: string;
  sortDate: number;
  importe: number;
  ganancia: number;
}

function inicioDeSemana(fecha: Date) {
  const d = new Date(fecha);
  const dia = d.getDay(); // 0 = domingo
  const diferenciaALunes = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diferenciaALunes);
  d.setHours(0, 0, 0, 0);
  return d;
}

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function GananciasAdmin() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [agrupacion, setAgrupacion] = useState<"semana" | "mes">("mes");

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

  // ---- Resumen por producto ----
  const resumenPorProducto = new Map<string, ResumenProducto>();

  pedidos.forEach((pedido) => {
    (pedido.items ?? []).forEach((item) => {
      const existente = resumenPorProducto.get(item.productoId);
      const importeItem = item.precio * item.cantidad;
      const costoItem = (item.costPrice ?? 0) * item.cantidad;
      const gananciaItem = importeItem - costoItem;

      if (existente) {
        existente.cantidadVendida += item.cantidad;
        existente.costoTotal += costoItem;
        existente.importe += importeItem;
        existente.ganancia += gananciaItem;
      } else {
        resumenPorProducto.set(item.productoId, {
          productoId: item.productoId,
          nombre: item.nombre,
          cantidadVendida: item.cantidad,
          costoTotal: costoItem,
          importe: importeItem,
          ganancia: gananciaItem,
        });
      }
    });
  });

  const filasProducto = Array.from(resumenPorProducto.values()).sort((a, b) => b.ganancia - a.ganancia);
  const gananciaTotal = filasProducto.reduce((suma, fila) => suma + fila.ganancia, 0);
  const costoTotalGeneral = filasProducto.reduce((suma, fila) => suma + fila.costoTotal, 0);
  const importeTotalGeneral = filasProducto.reduce((suma, fila) => suma + fila.importe, 0);

  // ---- Resumen por periodo (semana o mes) ----
  const resumenPorPeriodo = new Map<string, ResumenPeriodo>();

  pedidos.forEach((pedido) => {
    const fechaPedido = new Date(pedido.fecha);
    const gananciaPedido = (pedido.items ?? []).reduce(
      (suma, item) => suma + (item.precio - (item.costPrice ?? 0)) * item.cantidad,
      0
    );

    let key: string;
    let label: string;
    let sortDate: number;

    if (agrupacion === "semana") {
      const inicio = inicioDeSemana(fechaPedido);
      const fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 6);

      key = inicio.toISOString().slice(0, 10);
      sortDate = inicio.getTime();
      label = `${inicio.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit" })} — ${fin.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
    } else {
      key = `${fechaPedido.getFullYear()}-${fechaPedido.getMonth()}`;
      sortDate = new Date(fechaPedido.getFullYear(), fechaPedido.getMonth(), 1).getTime();
      label = capitalizar(fechaPedido.toLocaleDateString("es-MX", { month: "long", year: "numeric" }));
    }

    const existente = resumenPorPeriodo.get(key);
    if (existente) {
      existente.importe += pedido.total;
      existente.ganancia += gananciaPedido;
    } else {
      resumenPorPeriodo.set(key, { key, label, sortDate, importe: pedido.total, ganancia: gananciaPedido });
    }
  });

  const filasPeriodo = Array.from(resumenPorPeriodo.values()).sort((a, b) => b.sortDate - a.sortDate);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Ganancias
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Resumen de productos vendidos y su ganancia
      </Typography>

      {filasProducto.length === 0 ? (
        <Typography color="text.secondary">Todavía no hay ventas registradas.</Typography>
      ) : (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Por producto
          </Typography>
          <Box sx={{ overflowX: "auto", mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Cantidad vendida</TableCell>
                  <TableCell align="right">Precio de compra</TableCell>
                  <TableCell align="right">Importe (venta)</TableCell>
                  <TableCell align="right">Ganancia</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filasProducto.map((fila) => (
                  <TableRow key={fila.productoId}>
                    <TableCell>{fila.nombre}</TableCell>
                    <TableCell align="right">{fila.cantidadVendida}</TableCell>
                    <TableCell align="right">${fila.costoTotal.toFixed(2)}</TableCell>
                    <TableCell align="right">${fila.importe.toFixed(2)}</TableCell>
                    <TableCell align="right">${fila.ganancia.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 4,
              mb: 4,
              pt: 2,
              borderTop: 2,
              borderColor: "divider",
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="caption" color="text.secondary">Costo total</Typography>
              <Typography sx={{ fontWeight: 700 }}>${costoTotalGeneral.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="caption" color="text.secondary">Importe total</Typography>
              <Typography sx={{ fontWeight: 700 }}>${importeTotalGeneral.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="caption" color="text.secondary">Ganancia total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>${gananciaTotal.toFixed(2)}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1, flexWrap: "wrap", gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Por periodo
            </Typography>
            <ToggleButtonGroup
              value={agrupacion}
              exclusive
              size="small"
              onChange={(_, nuevoValor) => nuevoValor && setAgrupacion(nuevoValor)}
            >
              <ToggleButton value="semana">
                <CalendarViewWeekIcon fontSize="small" sx={{ mr: 0.5 }} />
                Semana
              </ToggleButton>
              <ToggleButton value="mes">
                <CalendarMonthIcon fontSize="small" sx={{ mr: 0.5 }} />
                Mes
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{agrupacion === "semana" ? "Semana" : "Mes"}</TableCell>
                  <TableCell align="right">Importe (venta)</TableCell>
                  <TableCell align="right">Ganancia</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filasPeriodo.map((fila) => (
                  <TableRow key={fila.key}>
                    <TableCell>{fila.label}</TableCell>
                    <TableCell align="right">${fila.importe.toFixed(2)}</TableCell>
                    <TableCell align="right">${fila.ganancia.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </>
      )}
    </Container>
  );
}