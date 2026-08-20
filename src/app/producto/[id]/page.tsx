"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Container,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Stack,
  Divider,
  CircularProgress,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Producto } from "@/types/Product";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { useAuthModal } from "@/context/AuthModalContext";
import Header from "@/components/layout/Header";
import ShareButton from "@/components/productos/ShareButton";

const colorInsignia: Record<string, "success" | "secondary" | "info"> = {
  Nuevo: "success",
  Oferta: "secondary",
  Popular: "info",
};

export default function DetalleProducto() {
  const { id } = useParams<{ id: string }>();
  const { usuario } = useAuth();
  const { esFavorito, alternarFavorito } = useFavorites();
  const { agregarAlCarrito } = useCart();
  const { abrirModal } = useAuthModal();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [imagenActiva, setImagenActiva] = useState("");
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "productos", id), (snapshot) => {
      if (snapshot.exists()) {
        const datos = { id: snapshot.id, ...snapshot.data() } as Producto;
        setProducto(datos);
        setImagenActiva((actual) => actual || datos.imagenPrincipal);
      } else {
        setProducto(null);
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (producto) {
      document.title = producto.nombre;
    }
  }, [producto]);

  function manejarFavorito() {
    if (!usuario) {
      abrirModal();
      return;
    }
    if (producto) alternarFavorito(producto.id);
  }

  function manejarAgregarCarrito() {
    if (producto) agregarAlCarrito(producto, cantidad);
  }

  if (cargando) {
    return (
      <>
        <Header />
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (!producto) {
    return (
      <>
        <Header />
        <Container sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            No encontramos este producto.
          </Typography>
          <Button component={Link} href="/#catalogo" variant="contained">
            Volver al catálogo
          </Button>
        </Container>
      </>
    );
  }

  const favorito = esFavorito(producto.id);
  const galeria = [producto.imagenPrincipal, ...(producto.imagenesAdicionales ?? [])];
  const sinStock = producto.cantidadDisponible === 0;

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          component={Link}
          href="/#catalogo"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2, textTransform: "none" }}
        >
          Volver al catálogo
        </Button>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 4,
          }}
        >
          {/* Galería de imágenes */}
          <Box>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                aspectRatio: "1 / 1",
                borderRadius: 3,
                overflow: "hidden",
                mb: 1,
                opacity: sinStock ? 0.6 : 1,
              }}
            >
              <Image
                src={imagenActiva}
                alt={producto.nombre}
                fill
                style={{ objectFit: "cover" }}
                priority
              />
            </Box>

            {galeria.length > 1 && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                {galeria.map((url) => (
                  <Box
                    key={url}
                    onClick={() => setImagenActiva(url)}
                    sx={{
                      position: "relative",
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: 2,
                      borderColor: imagenActiva === url ? "primary.main" : "transparent",
                    }}
                  >
                    <Image src={url} alt="" fill style={{ objectFit: "cover" }} />
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          {/* Información del producto */}
          <Box>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Chip label={producto.categoria} size="small" />
              {producto.insignia && (
                <Chip
                  label={producto.insignia}
                  size="small"
                  color={colorInsignia[producto.insignia] ?? "default"}
                />
              )}
              {sinStock && <Chip label="AGOTADO" size="small" color="error" />}
            </Stack>

            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {producto.nombre}
              </Typography>
              <Stack direction="row">
                <ShareButton nombre={producto.nombre} />
                <IconButton onClick={manejarFavorito} aria-label="Agregar a favoritos">
                  {favorito ? (
                    <FavoriteIcon color="secondary" />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
              </Stack>
            </Box>

            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, mb: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                ${producto.precio.toFixed(2)}
              </Typography>
              {producto.precioOriginal && (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ textDecoration: "line-through" }}
                >
                  ${producto.precioOriginal.toFixed(2)}
                </Typography>
              )}
            </Box>

            <Typography
              variant="body2"
              color={sinStock ? "error" : "text.secondary"}
              sx={{ mb: 3, fontWeight: sinStock ? 700 : 400 }}
            >
              {sinStock ? "Agotado" : `${producto.cantidadDisponible} disponibles`}
            </Typography>

            {!sinStock && (
              <>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                      disabled={cantidad <= 1}
                    >
                    <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ px: 2 }}>{cantidad}</Typography>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setCantidad((c) => Math.min(producto.cantidadDisponible, c + 1))
                      }
                      disabled={cantidad >= producto.cantidadDisponible}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={manejarAgregarCarrito}
                    sx={{ flex: 1 }}
                  >
                    Agregar al carrito
                  </Button>
                </Box>
              </>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Descripción
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, whiteSpace: "pre-line" }}>
              {producto.descripcion}
            </Typography>

            {producto.detalles && producto.detalles.length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Detalles y especificaciones
                </Typography>
                <Box component="ul" sx={{ color: "text.secondary", pl: 2.5, m: 0 }}>
                  {producto.detalles.map((detalle, i) => (
                    <li key={i}>
                      <Typography variant="body2">{detalle}</Typography>
                    </li>
                  ))}
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
}