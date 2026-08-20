"use client";

import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import Header from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import CambiarContrasenaDialog from "@/components/perfil/CambiarContrasenaDialog";
import Snackbar from "@mui/material/Snackbar";

export default function Perfil() {
  const { usuario, usuarioFirebase, cargando } = useAuth();
  const { abrirModal } = useAuthModal();

  const [modalContrasenaAbierto, setModalContrasenaAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [calle, setCalle] = useState("");
  const [colonia, setColonia] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [estado, setEstado] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [telefono, setTelefono] = useState("");
  const [referencia, setReferencia] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!usuario) return;
    setNombre(usuario.nombre ?? "");
    setCalle(usuario.direccion?.calle ?? "");
    setColonia(usuario.direccion?.colonia ?? "");
    setCiudad(usuario.direccion?.ciudad ?? "");
    setEstado(usuario.direccion?.estado ?? "");
    setCodigoPostal(usuario.direccion?.codigoPostal ?? "");
    setTelefono(usuario.direccion?.telefono ?? "");
    setReferencia(usuario.direccion?.referencia ?? "");
  }, [usuario]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      if (!usuarioFirebase) return;

      await updateDoc(doc(db, "usuarios", usuarioFirebase.uid), {
        nombre,
        direccion: { calle, colonia, ciudad, estado, codigoPostal, telefono, referencia },
      });
      setMensaje("Información del perfil actualizada");
    } catch {
      setError("Hubo un error al guardar los cambios");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <>
        <Header />
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (!usuario) {
    return (
      <>
        <Header />
        <Container sx={{ py: 6, textAlign: "center" }}>
          <Typography sx={{ mb: 2 }}>Inicia sesión para ver tu perfil.</Typography>
          <Button variant="contained" onClick={abrirModal}>
            Iniciar sesión
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Mi perfil
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          {usuario.correo}
        </Typography>
        {usuario.rol === "admin" && (
          <Chip label="Administrador" size="small" color="primary" sx={{ mb: 2 }} />
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={guardar} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            fullWidth
          />
          <Button
            type="button"
            variant="outlined"
            onClick={() => setModalContrasenaAbierto(true)}
            sx={{ alignSelf: "flex-start" }}
            >
            Cambiar contraseña
          </Button>

          {usuario.rol === "cliente" && (
            <>
              <Divider sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Dirección de entrega
                </Typography>
              </Divider>

              <TextField
                label="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                fullWidth
              />
              <TextField
                label="Calle y número"
                value={calle}
                onChange={(e) => setCalle(e.target.value)}
                fullWidth
              />
              <TextField
                label="Colonia o fraccionamiento"
                value={colonia}
                onChange={(e) => setColonia(e.target.value)}
                fullWidth
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Ciudad"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Estado"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  fullWidth
                />
              </Box>
              <TextField
                label="Código postal"
                value={codigoPostal}
                onChange={(e) => setCodigoPostal(e.target.value)}
                fullWidth
              />
              <TextField
                label="Referencia (opcional)"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
            </>
          )}

          <Button type="submit" variant="contained" size="large" startIcon={<SaveIcon />} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </Button>
        </Box>
      </Container>
      <Snackbar
        open={!!mensaje}
        autoHideDuration={3000}
        onClose={() => setMensaje("")}
        message={mensaje}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
      <CambiarContrasenaDialog
        open={modalContrasenaAbierto}
        onClose={() => setModalContrasenaAbierto(false)}
      />
    </>
  );
}