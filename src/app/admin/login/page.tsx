"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { auth } from "@/lib/firebase";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function AdminLogin() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await signInWithEmailAndPassword(auth, correo, contrasena);
      router.push("/admin");
    } catch (err) {
      setError("Correo o contraseña incorrectos");
    } finally {
      setCargando(false);
    }
  }

  return (
    <Container maxWidth="xs">
      <Box
        component="form"
        onSubmit={manejarSubmit}
        sx={{
          minHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, textAlign: "center" }}>
          Panel de administrador
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

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

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={cargando}
          fullWidth
        >
          {cargando ? "Ingresando..." : "Iniciar sesión"}
        </Button>
      </Box>
    </Container>
  );
}