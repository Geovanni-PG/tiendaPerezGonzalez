"use client";

import Image from "next/image";
import { Box, Container, Typography, Grid } from "@mui/material";
import { useSiteConfig } from "@/hooks/useSiteConfig";

export default function AboutSection() {
  const { config } = useSiteConfig();

  return (
    <Box id="sobre-nosotros" sx={{ py: 6, scrollMarginTop: { xs: "72px", sm: "80px" } }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: config.imagenSobreNosotros ? 7 : 12 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Sobre nosotros
            </Typography>
            <Typography color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
              {config.sobreNosotros || "Próximamente contaremos más sobre nuestra historia."}
            </Typography>
          </Grid>

          {config.imagenSobreNosotros && (
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "4 / 3",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <Image
                  src={config.imagenSobreNosotros}
                  alt="Nuestra tienda"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}