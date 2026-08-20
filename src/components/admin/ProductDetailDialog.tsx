"use client";

import Image from "next/image";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  IconButton,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Producto } from "@/types/Product";

const badgeColor: Record<string, "success" | "secondary" | "info"> = {
  Nuevo: "success",
  Oferta: "secondary",
  Popular: "info",
};

interface ProductDetailDialogProps {
  product: Producto | null;
  onClose: () => void;
}

export default function ProductDetailDialog({ product, onClose }: ProductDetailDialogProps) {
  if (!product) return null;

  const profit = product.precio - (product.costPrice ?? 0);
  const gallery = [product.imagenPrincipal, ...(product.imagenesAdicionales ?? [])];

  return (
    <Dialog open={!!product} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Detalle del producto
        <IconButton onClick={onClose} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack direction="row" spacing={1} sx={{ overflowX: "auto", mb: 2 }}>
          {gallery.map((url) => (
            <Box key={url} sx={{ position: "relative", width: 96, height: 96, borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
              <Image src={url} alt={product.nombre} fill style={{ objectFit: "cover" }} />
            </Box>
          ))}
        </Stack>

        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {product.nombre}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ my: 1 }}>
          <Chip label={product.categoria} size="small" />
          {product.insignia && (
            <Chip label={product.insignia} size="small" color={badgeColor[product.insignia] ?? "default"} />
          )}
          {product.destacado && <Chip label="Destacado" size="small" color="primary" variant="outlined" />}
        </Stack>

        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {product.descripcion}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Precio de compra</Typography>
            <Typography sx={{ fontWeight: 700 }}>${(product.costPrice ?? 0).toFixed(2)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Precio de venta</Typography>
            <Typography sx={{ fontWeight: 700 }}>${product.precio.toFixed(2)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Ganancia por unidad</Typography>
            <Typography sx={{ fontWeight: 700 }} color={profit >= 0 ? "success.main" : "error.main"}>
              ${profit.toFixed(2)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Cantidad disponible</Typography>
            <Typography sx={{ fontWeight: 700 }}>{product.cantidadDisponible}</Typography>
          </Box>
        </Box>

        {product.detalles && product.detalles.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Detalles y especificaciones
            </Typography>
            <Box component="ul" sx={{ color: "text.secondary", pl: 2.5, m: 0 }}>
              {product.detalles.map((d, i) => (
                <li key={i}><Typography variant="body2">{d}</Typography></li>
              ))}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}