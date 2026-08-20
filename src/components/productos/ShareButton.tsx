"use client";

import { useState } from "react";
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Snackbar } from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function ShareButton({ nombre }: { nombre: string }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [copiado, setCopiado] = useState(false);

  async function manejarClic(e: React.MouseEvent<HTMLElement>) {
    // En celular, usa el menú nativo para compartir (incluye WhatsApp, Instagram, etc.)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: nombre,
          url: window.location.href,
        });
      } catch {
        // El usuario canceló el share nativo, no hacemos nada
      }
      return;
    }

    // En escritorio, mostramos nuestro propio menú de opciones
    setAnchorEl(e.currentTarget);
  }

  function cerrarMenu() {
    setAnchorEl(null);
  }

  function compartirWhatsApp() {
    const texto = encodeURIComponent(`Mira este producto: ${nombre} - ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${texto}`, "_blank");
    cerrarMenu();
  }

  function compartirFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
    cerrarMenu();
  }

  async function copiarEnlace() {
    await navigator.clipboard.writeText(window.location.href);
    setCopiado(true);
    cerrarMenu();
  }

  return (
    <>
      <IconButton onClick={manejarClic} aria-label="Compartir producto">
        <ShareIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={cerrarMenu}>
        <MenuItem onClick={compartirWhatsApp}>
          <ListItemIcon>
            <WhatsAppIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>WhatsApp</ListItemText>
        </MenuItem>
        <MenuItem onClick={compartirFacebook}>
          <ListItemIcon>
            <FacebookIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Facebook</ListItemText>
        </MenuItem>
        <MenuItem onClick={copiarEnlace}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copiar enlace</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar
        open={copiado}
        autoHideDuration={2500}
        onClose={() => setCopiado(false)}
        message="Enlace copiado"
      />
    </>
  );
}