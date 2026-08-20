"use client";

import { Box, Container, Typography, Stack, IconButton, Divider } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import EmailIcon from "@mui/icons-material/Email";
import CallIcon from "@mui/icons-material/Call";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { useSiteConfig } from "@/hooks/useSiteConfig";

export default function ContactSection() {
  const { config } = useSiteConfig();

  const sinContacto =
    !config.correo && !config.whatsapp && !config.telefono && !config.instagram && !config.facebook;

  return (
    <Box id="contacto" sx={{ bgcolor: "background.paper", py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Encuéntranos en
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 4,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center", mb: 1 }}>
              <LocationOnIcon color="primary" />
              <Typography sx={{ fontWeight: 700 }}>Ubicación</Typography>
            </Box>
            <Typography color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
              {config.direccion || "Dirección pendiente por definir"}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1, alignItems: "center" }}>
              <ScheduleIcon color="primary" />
              <Typography sx={{ fontWeight: 700 }}>Horario</Typography>
            </Stack>
            <Typography color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
              {config.horario || "Horario pendiente por definir"}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Contacto y redes sociales</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              {config.correo && (
                <IconButton color="primary" component="a" href={`mailto:${config.correo}`} aria-label="Correo">
                  <EmailIcon />
                </IconButton>
              )}
              {config.whatsapp && (
                <IconButton
                  color="primary"
                  component="a"
                  href={`https://wa.me/${config.whatsapp}`}
                  target="_blank"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon />
                </IconButton>
              )}
              {config.telefono && (
                <IconButton color="primary" component="a" href={`tel:${config.telefono}`} aria-label="Llamar">
                  <CallIcon />
                </IconButton>
              )}
              {config.instagram && (
                <IconButton
                  color="primary"
                  component="a"
                  href={config.instagram}
                  target="_blank"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </IconButton>
              )}
              {config.facebook && (
                <IconButton
                  color="primary"
                  component="a"
                  href={config.facebook}
                  target="_blank"
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </IconButton>
              )}
              {sinContacto && (
                <Typography color="text.secondary" variant="body2">
                  Información de contacto próximamente.
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ mt: 4 }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
          © {new Date().getFullYear()} Puesto Pérez González. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
}