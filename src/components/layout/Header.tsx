"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthModal } from "@/context/AuthModalContext";
import {
  AppBar,
  Toolbar,
  Box,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Badge,
  Stack,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import UserMenu from "@/components/layout/UserMenu";
import { useDrawer } from "@/context/DrawerContext";


import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useThemeMode } from "@/context/ThemeModeContext";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";

const enlacesNav = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Productos", href: "/#catalogo" },
  { label: "Sobre nosotros", href: "/#sobre-nosotros" },
  { label: "Contacto", href: "/#contacto" },
];

export default function Header() {
  const theme = useTheme();
  const esMovil = useMediaQuery(theme.breakpoints.down("md"));

  const { mode, toggleMode } = useThemeMode();
  const { usuario } = useAuth();
  const { busqueda, setBusqueda } = useSearch();
  const { abrirFavoritos, abrirCarrito } = useDrawer();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const { abrirModal } = useAuthModal();

  // Contadores temporales — se conectarán a CartContext/FavoritesContext
    const { totalItems: cantidadCarrito } = useCart();
    const { favoritos } = useFavorites();
    const cantidadFavoritos = favoritos.length;

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "#0B1F3A",
          color: "#FFFFFF",
        }}
      >
        <Toolbar sx={{ gap: 2, py: 1 }}>
          {/* Menú hamburguesa (solo en móvil/tablet) */}
          {esMovil && (
            <IconButton onClick={() => setMenuAbierto(true)} edge="start" color="inherit">
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <Image src="/logo.png" alt="Puesto Pérez González" width={44} height={44} priority />
          </Link>

          {/* Buscador */}
          <TextField
            size="small"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            sx={{
              flex: 1,
              maxWidth: 420,
              bgcolor: "background.paper",
              borderRadius: 1,
            }}
            slotProps={{
                input: {
                startAdornment: (
                    <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                    </InputAdornment>
                ),
                },
            }}
            />

          {/* Enlaces de navegación (solo en escritorio) */}
          {!esMovil && (
            <Stack direction="row" spacing={3} sx={{ ml: 2 }}>
              {enlacesNav.map((enlace) => (
                <Link
                  key={enlace.href}
                  href={enlace.href}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    fontWeight: 500,
                  }}
                >
                  {enlace.label}
                </Link>
              ))}
            </Stack>
          )}

          {/* Espaciador para empujar los íconos a la derecha */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Íconos de acción */}
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <IconButton onClick={toggleMode} aria-label="Cambiar modo claro/oscuro" color="inherit">
              {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>

            {usuario?.rol !== "admin" && (
              <>
                <IconButton onClick={abrirFavoritos} aria-label="Favoritos" color="inherit">
                  <Badge badgeContent={cantidadFavoritos} color="secondary">
                    <FavoriteBorderIcon />
                  </Badge>
                </IconButton>

                <IconButton onClick={abrirCarrito} aria-label="Carrito" color="inherit">
                  <Badge badgeContent={cantidadCarrito} color="secondary">
                    <ShoppingCartOutlinedIcon />
                  </Badge>
                </IconButton>
              </>
            )}
            {usuario ? (
              <UserMenu colorBoton="inherit" />
            ) : (
              <Button
                onClick={abrirModal}
                startIcon={<PersonOutlineIcon />}
                color="inherit"
                sx={{ textTransform: "none", whiteSpace: "nowrap" }}
              >
                Iniciar sesión
              </Button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
      {/* Menú lateral para móvil */}
      <Drawer anchor="left" open={menuAbierto} onClose={() => setMenuAbierto(false)}>
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {enlacesNav.map((enlace) => (
              <ListItemButton
                key={enlace.href}
                component={Link}
                href={enlace.href}
                onClick={() => setMenuAbierto(false)}
              >
                <ListItemText primary={enlace.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}