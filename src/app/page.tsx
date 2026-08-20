"use client";

import { useMemo, useState } from "react";
import { Box, Container, Typography, Grid } from "@mui/material";
import Header from "@/components/layout/Header";
import ContactSection from "@/components/layout/ContactSection";
import CategoryFilterBar from "@/components/productos/CategoryFilterBar";
import ProductCard from "@/components/productos/ProductCard";
import HeroSection from "@/components/layout/HeroSection";
import AboutSection from "@/components/layout/AboutSection";
import ProductCardSkeleton from "@/components/productos/ProductCardSkeleton";
import { useProducts } from "@/hooks/useProducts";
import { useSearch } from "@/context/SearchContext";

export default function Home() {
  const { productos, cargando } = useProducts();
  const { busqueda } = useSearch();
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");

  const categorias = useMemo(
    () => Array.from(new Set(productos.map((p) => p.categoria))),
    [productos]
  );

  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const coincideCategoria =
        categoriaActiva === "Todos" || producto.categoria === categoriaActiva;
      const coincideBusqueda =
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(busqueda.toLowerCase());
      return coincideCategoria && coincideBusqueda;
    });
  }, [productos, categoriaActiva, busqueda]);

  return (
    <>
      <Header />
      <HeroSection
        totalProductos={productos.length}
        totalCategorias={categorias.length}
        categoriasEjemplo={categorias}
      />
      <Container id="catalogo" maxWidth="lg" sx={{ py: 4, scrollMarginTop: { xs: "72px", sm: "80px" } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Catálogo
        </Typography>
        <Box sx={{ mb: 3 }}>
          <CategoryFilterBar
            categorias={categorias}
            categoriaActiva={categoriaActiva}
            onCambiarCategoria={setCategoriaActiva}
          />
        </Box>

        {!cargando && productosFiltrados.length === 0 && (
          <Typography color="text.secondary" sx={{ mt: 4 }}>
            No se encontraron productos con esos filtros.
          </Typography>
        )}

        <Grid container spacing={2}>
          {cargando
            ? Array.from({ length: 8 }).map((_, i) => (
                <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
                  <ProductCardSkeleton />
                </Grid>
              ))
            : productosFiltrados.map((producto) => (
                <Grid key={producto.id} size={{ xs: 6, sm: 4, md: 3 }}>
                  <ProductCard producto={producto} />
                </Grid>
              ))}
        </Grid>
      </Container>

      <AboutSection />
      <ContactSection />
    </>
  );
}