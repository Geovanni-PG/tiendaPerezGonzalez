"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CategoryIcon from "@mui/icons-material/Category";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";

interface UserMenuProps {
  ocultarEnlaceAdmin?: boolean;
  colorBoton?: string;
}

export default function UserMenu({ ocultarEnlaceAdmin = false, colorBoton }: UserMenuProps) {
  const { usuario } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmarAbierto, setConfirmarAbierto] = useState(false);

  const menuAbierto = Boolean(anchorEl);

  function abrirMenu(e: React.MouseEvent<HTMLElement>) {
    setAnchorEl(e.currentTarget);
  }

  function cerrarMenu() {
    setAnchorEl(null);
  }

  function pedirConfirmacionLogout() {
    cerrarMenu();
    setConfirmarAbierto(true);
  }

  async function confirmarLogout() {
    await signOut(auth);
    setConfirmarAbierto(false);
    router.push("/");
  }

  if (!usuario) return null;

  return (
    <>
      <Button
        onClick={abrirMenu}
        startIcon={<PersonOutlineIcon />}
        sx={{ textTransform: "none", whiteSpace: "nowrap", color: colorBoton }}
      >
        {usuario.nombre}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={menuAbierto}
        onClose={cerrarMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ px: 2, pt: 1 }}>
          Conectado como
        </Typography>
        <Typography variant="subtitle2" sx={{ px: 2, pb: 1, fontWeight: 700 }}>
          {usuario.nombre}
        </Typography>
        {usuario.rol === "admin" && (
        <Chip
            label="Administrador"
            size="small"
            color="primary"
            sx={{ mx: 2, mt: 0.5, mb: 1.5 }}
        />
        )}

        <Divider />

        <MenuItem component={Link} href="/perfil" onClick={cerrarMenu}>
        <ListItemIcon>
            <PersonOutlineIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Ver perfil</ListItemText>
        </MenuItem>

        {usuario.rol === "admin" && !ocultarEnlaceAdmin && (
          <>
            <MenuItem component={Link} href="/admin" onClick={cerrarMenu}>
              <ListItemIcon>
                <AdminPanelSettingsOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Panel de administrador</ListItemText>
            </MenuItem>

            <MenuItem component={Link} href="/admin/categorias" onClick={cerrarMenu}>
              <ListItemIcon>
                <CategoryIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Categorías</ListItemText>
            </MenuItem>

            <MenuItem component={Link} href="/admin/punto-venta" onClick={cerrarMenu}>
              <ListItemIcon>
                <PointOfSaleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Punto de Venta</ListItemText>
            </MenuItem>

            <MenuItem component={Link} href="/admin/ventas" onClick={cerrarMenu}>
              <ListItemIcon>
                <ReceiptLongIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Ventas</ListItemText>
            </MenuItem>

            <MenuItem component={Link} href="/admin/ganancias" onClick={cerrarMenu}>
              <ListItemIcon>
                <TrendingUpIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Ganancias</ListItemText>
            </MenuItem>

            <MenuItem component={Link} href="/admin/configuracion" onClick={cerrarMenu}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Información del sitio</ListItemText>
            </MenuItem>
          </>
        )}

        <Divider />

        <MenuItem onClick={pedirConfirmacionLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: "error.main" }}>Cerrar sesión</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={confirmarAbierto} onClose={() => setConfirmarAbierto(false)}>
        <DialogTitle>¿Cerrar sesión?</DialogTitle>
        <DialogContent>
          <Typography>¿Seguro que quieres cerrar tu sesión?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmarAbierto(false)}>Cancelar</Button>
          <Button onClick={confirmarLogout} color="error" variant="contained">
            Cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}