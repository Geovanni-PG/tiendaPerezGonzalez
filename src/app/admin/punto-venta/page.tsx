"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { collection, doc, writeBatch, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useProducts } from "@/hooks/useProducts";
import { Producto } from "@/types/Product";

interface SaleItem {
  product: Producto;
  quantity: number;
}

export default function PointOfSalePage() {
  const { productos } = useProducts();

  const [search, setSearch] = useState("");
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  const searchResults = search.trim()
    ? productos.filter(
        (p) =>
          p.cantidadDisponible > 0 &&
          p.nombre.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  function addToSale(product: Producto) {
    setSaleItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.cantidadDisponible) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setSearch("");
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      setSaleItems((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setSaleItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.cantidadDisponible) }
          : item
      )
    );
  }

  const total = saleItems.reduce((sum, item) => sum + item.product.precio * item.quantity, 0);

  function openConfirm() {
    setError("");
    if (saleItems.length === 0) {
      setError("Agrega al menos un producto a la venta");
      return;
    }
    if (!customerName.trim()) {
      setError("El nombre del cliente es obligatorio");
      return;
    }
    setConfirmOpen(true);
  }

  async function registerSale() {
    setProcessing(true);
    setError("");
    try {
      const batch = writeBatch(db);
      const saleRef = doc(collection(db, "pedidos"));

      batch.set(saleRef, {
        clienteNombre: customerName,
        clienteCorreo: customerEmail,
        clienteTelefono: customerPhone,
        direccion: { calle: "", colonia: "", ciudad: "", estado: "", codigoPostal: "", referencia: "Venta registrada en punto de venta" },
        items: saleItems.map(({ product, quantity }) => ({
          productoId: product.id,
          nombre: product.nombre,
          precio: product.precio,
          costPrice: product.costPrice ?? 0,
          cantidad: quantity,
          imagen: product.imagenPrincipal,
        })),
        total,
        metodoPago: "Digital (punto de venta)",
        estado: "pagado",
        usuarioUid: null,
        fecha: new Date().toISOString(),
      });

      saleItems.forEach(({ product, quantity }) => {
        batch.update(doc(db, "productos", product.id), { cantidadDisponible: increment(-quantity) });
      });

      await batch.commit();

      setConfirmOpen(false);
      setSuccessOpen(true);
      setSaleItems([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
    } catch {
      setError("Hubo un error al registrar la venta");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Punto de venta
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Registra una venta directa (presencial o por otro medio) con pago digital
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        placeholder="Buscar producto para agregar a la venta..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 1 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      {searchResults.length > 0 && (
        <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, mb: 3, overflow: "hidden" }}>
          {searchResults.slice(0, 6).map((product) => (
            <Box
              key={product.id}
              onClick={() => addToSale(product)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                cursor: "pointer",
                borderBottom: 1,
                borderColor: "divider",
                "&:hover": { bgcolor: "action.hover" },
                "&:last-of-type": { borderBottom: 0 },
              }}
            >
              <Box sx={{ position: "relative", width: 40, height: 40, borderRadius: 1, overflow: "hidden", flexShrink: 0 }}>
                <Image src={product.imagenPrincipal} alt={product.nombre} fill style={{ objectFit: "cover" }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">{product.nombre}</Typography>
                <Typography variant="caption" color="text.secondary">
                  ${product.precio.toFixed(2)} · {product.cantidadDisponible} disponibles
                </Typography>
              </Box>
              <AddIcon fontSize="small" color="primary" />
            </Box>
          ))}
        </Box>
      )}

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Productos en la venta
      </Typography>

      {saleItems.length === 0 ? (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Busca productos arriba para agregarlos a la venta.
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ mb: 3 }}>
          {saleItems.map(({ product, quantity }) => (
            <Box
              key={product.id}
              sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, border: 1, borderColor: "divider", borderRadius: 2 }}
            >
              <Box sx={{ position: "relative", width: 48, height: 48, borderRadius: 1, overflow: "hidden", flexShrink: 0 }}>
                <Image src={product.imagenPrincipal} alt={product.nombre} fill style={{ objectFit: "cover" }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">{product.nombre}</Typography>
                <Typography variant="caption" color="text.secondary">
                  ${product.precio.toFixed(2)} c/u
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => updateQuantity(product.id, quantity - 1)}>
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography>{quantity}</Typography>
              <IconButton
                size="small"
                onClick={() => updateQuantity(product.id, quantity + 1)}
                disabled={quantity >= product.cantidadDisponible}
              >
                <AddIcon fontSize="small" />
              </IconButton>
              <Typography sx={{ fontWeight: 700, width: 80, textAlign: "right" }}>
                ${(product.precio * quantity).toFixed(2)}
              </Typography>
              <IconButton size="small" onClick={() => updateQuantity(product.id, 0)}>
                <DeleteIcon fontSize="small" color="error" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Datos del cliente
      </Typography>
      <Stack spacing={2} sx={{ mb: 3 }}>
        <TextField label="Nombre del cliente" value={customerName} onChange={(e) => setCustomerName(e.target.value)} fullWidth />
        <TextField label="Teléfono (opcional)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} fullWidth />
        <TextField label="Correo (opcional)" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} fullWidth />
      </Stack>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Total: ${total.toFixed(2)}
        </Typography>
        <Button variant="contained" size="large" onClick={openConfirm}>
          Registrar venta
        </Button>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar venta</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>Cliente: {customerName}</Typography>
          <Typography sx={{ mb: 1 }}>{saleItems.length} producto(s) · Total ${total.toFixed(2)}</Typography>
          <Typography color="text.secondary">Se registrará como pago digital.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={registerSale} variant="contained" disabled={processing}>
            {processing ? "Registrando..." : "Confirmar venta"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={successOpen} onClose={() => setSuccessOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 56, color: "success.main", mb: 1 }} />
          <Typography>Venta registrada correctamente.</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button variant="contained" onClick={() => setSuccessOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}