"use client";

import Link from "next/link";
import { Box, Container, Typography, Button, Grid } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CategoryIcon from "@mui/icons-material/Category";
import { useSiteConfig } from "@/hooks/useSiteConfig";

interface HeroSectionProps {
  totalProductos: number;
  totalCategorias: number;
  categoriasEjemplo: string[];
}

export default function HeroSection({
  totalProductos,
  totalCategorias,
  categoriasEjemplo,
}: HeroSectionProps) {
  const { config } = useSiteConfig();

  const etiqueta = config.heroEtiqueta || categoriasEjemplo.slice(0, 3).join(" · ");
  const tituloPrincipal = config.heroTitulo || "Tu estilo,";
  const tituloDestacado = config.heroTituloDestacado || "a un precio justo.";
  const textoCategorias = categoriasEjemplo.slice(0, 4).join(", ");
  const subtitulo =
    config.heroSubtitulo ||
    (textoCategorias
      ? `${textoCategorias} y los mejores productos para ti.`
      : "Los mejores productos para ti, directo desde nuestra tienda.");

  return (
    <Box
      id="inicio"
      sx={{
        position: "relative",
        scrollMarginTop: { xs: "72px", sm: "80px" },
        backgroundImage: 'url(/portada-tienda.png)',
        backgroundSize: "cover",
        backgroundPosition: "center",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          bgcolor: "#0B1F3A",
          opacity: 0.85,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", py: { xs: 6, md: 10 } }}>
        <Grid container spacing={4} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 6 }}>
            {etiqueta && (
              <Typography
                variant="overline"
                sx={{ color: "secondary.light", fontWeight: 700, letterSpacing: 1.5 }}
              >
                {etiqueta}
              </Typography>
            )}

            <Typography
              variant="h3"
              sx={{ color: "#FFFFFF", fontWeight: 800, lineHeight: 1.15, mt: 1 }}
            >
              {tituloPrincipal}
              <br />
              <Box component="span" sx={{ color: "secondary.light", fontStyle: "italic" }}>
                {tituloDestacado}
              </Box>
            </Typography>

            <Typography sx={{ color: "#FFFFFF", opacity: 0.9, mt: 2, mb: 3 }}>
              {subtitulo}
            </Typography>

            <Button
              component={Link}
              href="#catalogo"
              variant="contained"
              color="primary"
              size="large"
              sx={{ borderRadius: 5, px: 3, textTransform: "none", fontWeight: 700 }}
            >
              Ver catálogo →
            </Button>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TarjetaStat icono={<Inventory2Icon />} valor={totalProductos} etiqueta="productos" />
              </Grid>
              <Grid size={6}>
                <TarjetaStat icono={<CategoryIcon />} valor={totalCategorias} etiqueta="categorías" />
              </Grid>
              <Grid size={6}>
                <TarjetaStat icono={<StarIcon />} valor="4.9★" etiqueta="calificación" />
              </Grid>
              <Grid size={6}>
                <TarjetaStat icono={<LocalShippingIcon />} valor="Envío" etiqueta="rápido y seguro" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function TarjetaStat({
  icono,
  valor,
  etiqueta,
}: {
  icono: React.ReactNode;
  valor: string | number;
  etiqueta: string;
}) {
  return (
    <Box
      sx={{
        bgcolor: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(4px)",
        borderRadius: 3,
        p: 2.5,
        textAlign: "center",
        color: "#FFFFFF",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>{icono}</Box>
      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
        {valor}
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.85 }}>
        {etiqueta}
      </Typography>
    </Box>
  );
}