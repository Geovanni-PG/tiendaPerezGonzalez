"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, CircularProgress, Dialog, DialogContent, DialogActions, Typography, Button, Toolbar } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useAuth } from "@/context/AuthContext";
import AdminTopBar from "@/components/admin/AdminTopBar";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarAbierto, setSidebarAbierto] = useState(true);

  const esPaginaLogin = pathname === "/admin/login";
  const noAutorizado = !cargando && !esPaginaLogin && (!usuario || usuario.rol !== "admin");

  function volverInicio() {
    router.push("/");
  }

  if (cargando && !esPaginaLogin) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (noAutorizado) {
    return (
      <Dialog open onClose={volverInicio} maxWidth="xs" fullWidth>
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <LockOutlinedIcon sx={{ fontSize: 56, color: "secondary.main", mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Ingreso no autorizado
          </Typography>
          <Typography color="text.secondary">
            No tienes permiso para acceder a esta sección. Si crees que esto es
            un error, inicia sesión con una cuenta autorizada.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button variant="contained" onClick={volverInicio}>
            Volver al inicio
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (esPaginaLogin) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <AdminTopBar onToggleSidebar={() => setSidebarAbierto((prev) => !prev)} />
      <AdminSidebar abierto={sidebarAbierto} />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}