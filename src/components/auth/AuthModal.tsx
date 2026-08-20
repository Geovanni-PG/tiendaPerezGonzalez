"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Tabs,
  Tab,
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
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthModal } from "@/context/AuthModalContext";

export default function AuthModal() {
  const { abierto, cerrarModal } = useAuthModal();

  const [pestana, setPestana] = useState<"login" | "registro">("login");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [calle, setCalle] = useState("");
  const [colonia, setColonia] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [estado, setEstado] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [referencia, setReferencia] = useState("");

    function limpiarFormulario() {
    setNombre("");
    setCorreo("");
    setContrasena("");
    setTelefono("");
    setCalle("");
    setColonia("");
    setCiudad("");
    setEstado("");
    setCodigoPostal("");
    setReferencia("");
    setError("");
    setMostrarContrasena(false);
    }

  function manejarCierre() {
    limpiarFormulario();
    cerrarModal();
  }

  function cambiarPestana(_: React.SyntheticEvent, nuevaPestana: "login" | "registro") {
    setPestana(nuevaPestana);
    setError("");
  }

  async function manejarLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await signInWithEmailAndPassword(auth, correo, contrasena);
      manejarCierre();
    } catch (err) {
      setError("Correo o contraseña incorrectos");
    } finally {
      setCargando(false);
    }
  }

  async function manejarRegistro(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const credencial = await createUserWithEmailAndPassword(auth, correo, contrasena);

      await setDoc(doc(db, "usuarios", credencial.user.uid), {
        nombre,
        correo,
        rol: "cliente",
        favoritos: [],
        fechaRegistro: new Date().toISOString(),
      });

      manejarCierre();
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Ese correo ya está registrado");
      } else if (err.code === "auth/weak-password") {
        setError("La contraseña debe tener al menos 6 caracteres");
      } else {
        setError("Hubo un error al crear la cuenta");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <Dialog open={abierto} onClose={manejarCierre} maxWidth="xs" fullWidth>
      <DialogContent sx={{ p: 4, position: "relative" }}>
        <IconButton
          onClick={manejarCierre}
          sx={{ position: "absolute", top: 12, right: 12 }}
          aria-label="Cerrar"
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          {pestana === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {pestana === "login" ? "Inicia sesión para continuar" : "Regístrate gratis"}
        </Typography>

        <Tabs
          value={pestana}
          onChange={cambiarPestana}
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab label="Iniciar sesión" value="login" />
          <Tab label="Registrarse" value="registro" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {pestana === "login" ? (
          <Box
            component="form"
            onSubmit={manejarLogin}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Correo electrónico"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Contraseña"
              type={mostrarContrasena ? "text" : "password"}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setMostrarContrasena((prev) => !prev)}
                        edge="end"
                        aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {mostrarContrasena ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button type="submit" variant="contained" size="large" disabled={cargando} fullWidth>
              {cargando ? "Entrando..." : "Entrar"}
            </Button>
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={manejarRegistro}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
            label="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            fullWidth
            />
            <TextField
            label="Correo electrónico"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            fullWidth
            />
            <TextField
            label="Contraseña"
            type={mostrarContrasena ? "text" : "password"}
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            fullWidth
            slotProps={{
                input: {
                endAdornment: (
                    <InputAdornment position="end">
                    <IconButton
                        onClick={() => setMostrarContrasena((prev) => !prev)}
                        edge="end"
                        aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {mostrarContrasena ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                    </InputAdornment>
                ),
                },
            }}
            />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>
            Dirección de entrega
            </Typography>

            <TextField
            label="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
            fullWidth
            />
            <TextField
            label="Calle y número"
            value={calle}
            onChange={(e) => setCalle(e.target.value)}
            required
            fullWidth
            />
            <TextField
            label="Colonia o fraccionamiento"
            value={colonia}
            onChange={(e) => setColonia(e.target.value)}
            required
            fullWidth
            />
            <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
                label="Ciudad"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                required
                fullWidth
            />
            <TextField
                label="Estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                required
                fullWidth
            />
            </Box>
            <TextField
            label="Código postal"
            value={codigoPostal}
            onChange={(e) => setCodigoPostal(e.target.value)}
            required
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

            <Button type="submit" variant="contained" size="large" disabled={cargando} fullWidth>
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}