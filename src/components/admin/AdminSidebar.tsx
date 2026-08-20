"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Tooltip, Box } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SettingsIcon from "@mui/icons-material/Settings";
import CategoryIcon from "@mui/icons-material/Category";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";

export const SIDEBAR_ANCHO_ABIERTO = 240;
export const SIDEBAR_ANCHO_CERRADO = 72;

const enlaces = [
  { label: "Panel", href: "/admin", icon: <DashboardIcon /> },
  { label: "Ventas", href: "/admin/ventas", icon: <ReceiptLongIcon /> },
  { label: "Categorías", href: "/admin/categorias", icon: <CategoryIcon /> },
  { label: "Punto de venta", href: "/admin/punto-venta", icon: <PointOfSaleIcon /> },
  { label: "Ganancias", href: "/admin/ganancias", icon: <TrendingUpIcon /> },
  { label: "Información del sitio", href: "/admin/configuracion", icon: <SettingsIcon /> },
];

export default function AdminSidebar({ abierto }: { abierto: boolean }) {
  const pathname = usePathname();
  const ancho = abierto ? SIDEBAR_ANCHO_ABIERTO : SIDEBAR_ANCHO_CERRADO;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: ancho,
        flexShrink: 0,
        whiteSpace: "nowrap",
        "& .MuiDrawer-paper": {
          width: ancho,
          overflowX: "hidden",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          bgcolor: "#0B1F3A",
          color: "#FFFFFF",
          borderRight: "none",
        },
      }}
    >
      <Toolbar />
      <List sx={{ mt: 1 }}>
        {enlaces.map((enlace) => {
          const activo = pathname === enlace.href;
          const boton = (
            <ListItemButton
              component={Link}
              href={enlace.href}
              selected={activo}
              sx={{
                minHeight: 48,
                justifyContent: abierto ? "initial" : "center",
                px: 2.5,
                color: "inherit",
                "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.15)" },
                "&.Mui-selected:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              }}
            >
              <ListItemIcon
                sx={{ minWidth: 0, mr: abierto ? 2 : "auto", justifyContent: "center", color: "inherit" }}
              >
                {enlace.icon}
              </ListItemIcon>
              <ListItemText primary={enlace.label} sx={{ opacity: abierto ? 1 : 0 }} />
            </ListItemButton>
          );

          return (
            <Box key={enlace.href}>
              {abierto ? boton : <Tooltip title={enlace.label} placement="right">{boton}</Tooltip>}
            </Box>
          );
        })}
      </List>
    </Drawer>
  );
}