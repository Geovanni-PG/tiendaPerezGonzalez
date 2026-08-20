"use client";

import Link from "next/link";
import { AppBar, Toolbar, IconButton, Typography, Box, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import StorefrontIcon from "@mui/icons-material/Storefront";
import UserMenu from "@/components/layout/UserMenu";

interface AdminTopBarProps {
  onToggleSidebar: () => void;
}

export default function AdminTopBar({ onToggleSidebar }: AdminTopBarProps) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{ bgcolor: "#0B1F3A", color: "#FFFFFF", zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar sx={{ gap: 1.5 }}>
        <IconButton onClick={onToggleSidebar} color="inherit" aria-label="Mostrar/ocultar menú">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Panel de administrador
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Button component={Link} href="/" startIcon={<StorefrontIcon />} sx={{ color: "inherit", textTransform: "none" }}>
          Volver a la tienda
        </Button>

        <UserMenu ocultarEnlaceAdmin colorBoton="inherit" />
      </Toolbar>
    </AppBar>
  );
}