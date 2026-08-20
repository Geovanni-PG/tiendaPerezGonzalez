"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface CambiarContrasenaDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CambiarContrasenaDialog({
  open,
  onClose,
}: CambiarContrasenaDialogProps) {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  function limpiarYcerrar() {
    setActual("");
    setNueva("");
    setConfirmar("");
    setMostrarActual(false);
    setMostrarNueva(false);
    setMostrarConfirmar(false);
    setError("");
    setExito(false);
    onClose();
  }

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (nueva.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (nueva !== confirmar) {
      setError("La confirmación no coincide con la nueva contraseña");
      return;
    }

    const usuarioActual = auth.currentUser;
    if (!usuarioActual || !usuarioActual.email) {
      setError("No se pudo identificar tu sesión, intenta iniciar sesión de nuevo");
      return;
    }

    setCargando(true);
    try {
      const credencial = EmailAuthProvider.credential(usuarioActual.email, actual);
      await reauthenticateWithCredential(usuarioActual, credencial);
      await updatePassword(usuarioActual, nueva);
      setExito(true);
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("La contraseña actual es incorrecta");
      } else if (err.code === "auth/too-many-requests") {
        setError("Demasiados intentos, espera un momento e intenta de nuevo");
      } else {
        setError("Hubo un error al cambiar la contraseña");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <Dialog open={open} onClose={limpiarYcerrar} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Cambiar contraseña
        <IconButton onClick={limpiarYcerrar} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {exito ? (
          <Alert severity="success">Tu contraseña se actualizó correctamente.</Alert>
        ) : (
          <Box
            component="form"
            id="form-cambiar-contrasena"
            onSubmit={manejarSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
          >
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Contraseña actual"
              type={mostrarActual ? "text" : "password"}
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setMostrarActual((p) => !p)}
                        edge="end"
                        aria-label={mostrarActual ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {mostrarActual ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Nueva contraseña"
              type={mostrarNueva ? "text" : "password"}
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setMostrarNueva((p) => !p)}
                        edge="end"
                        aria-label={mostrarNueva ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {mostrarNueva ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Confirmar nueva contraseña"
              type={mostrarConfirmar ? "text" : "password"}
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setMostrarConfirmar((p) => !p)}
                        edge="end"
                        aria-label={mostrarConfirmar ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {mostrarConfirmar ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {exito ? (
          <Button variant="contained" onClick={limpiarYcerrar} fullWidth>
            Cerrar
          </Button>
        ) : (
          <>
            <Button onClick={limpiarYcerrar}>Cancelar</Button>
            <Button
              type="submit"
              form="form-cambiar-contrasena"
              variant="contained"
              disabled={cargando}
            >
              {cargando ? "Guardando..." : "Cambiar contraseña"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}