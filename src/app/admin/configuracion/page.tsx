"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subirImagen } from "@/lib/cloudinary";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function ConfiguracionSitio() {
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [heroEtiqueta, setHeroEtiqueta] = useState("");
  const [heroTitulo, setHeroTitulo] = useState("");
  const [heroTituloDestacado, setHeroTituloDestacado] = useState("");
  const [heroSubtitulo, setHeroSubtitulo] = useState("");

  const [sobreNosotros, setSobreNosotros] = useState("");
  const [imagenSobreNosotros, setImagenSobreNosotros] = useState("");
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [direccion, setDireccion] = useState("");
  const [horario, setHorario] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");

  useEffect(() => {
    async function cargar() {
      const snapshot = await getDoc(doc(db, "configuracion", "sitio"));
      if (snapshot.exists()) {
        const datos = snapshot.data();
        setHeroEtiqueta(datos.heroEtiqueta ?? "");
        setHeroTitulo(datos.heroTitulo ?? "");
        setHeroTituloDestacado(datos.heroTituloDestacado ?? "");
        setHeroSubtitulo(datos.heroSubtitulo ?? "");
        setSobreNosotros(datos.sobreNosotros ?? "");
        setDireccion(datos.direccion ?? "");
        setHorario(datos.horario ?? "");
        setTelefono(datos.telefono ?? "");
        setCorreo(datos.correo ?? "");
        setWhatsapp(datos.whatsapp ?? "");
        setInstagram(datos.instagram ?? "");
        setFacebook(datos.facebook ?? "");
        setImagenSobreNosotros(datos.imagenSobreNosotros ?? "");
      }
      setCargando(false);
    }
    cargar();
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      await setDoc(
        doc(db, "configuracion", "sitio"),
        {
          sobreNosotros,
          imagenSobreNosotros,
          direccion,
          horario,
          telefono,
          correo,
          whatsapp,
          instagram,
          facebook,
          heroEtiqueta,
          heroTitulo,
          heroTituloDestacado,
          heroSubtitulo,
        },
        { merge: true }
      );
      setMensaje("Cambios guardados correctamente");
    } catch {
      setError("Hubo un error al guardar los cambios");
    } finally {
      setGuardando(false);
    }
  }

  async function manejarImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setSubiendoImagen(true);
    setError("");
    try {
      const url = await subirImagen(archivo);
      setImagenSobreNosotros(url);
    } catch {
      setError("Error al subir la imagen");
    } finally {
      setSubiendoImagen(false);
    }
  }

  if (cargando) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Información del sitio
      </Typography>

      {mensaje && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {mensaje}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={guardar} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Portada de inicio
        </Typography>
        <TextField
          label="Etiqueta superior"
          value={heroEtiqueta}
          onChange={(e) => setHeroEtiqueta(e.target.value)}
          fullWidth
          placeholder="Ej. Accesorios, Cuidado de la piel y Desodorante"
          helperText="El texto pequeño en color rosa, arriba del título"
        />
        <TextField
          label="Título"
          value={heroTitulo}
          onChange={(e) => setHeroTitulo(e.target.value)}
          fullWidth
          placeholder="Ej. Tu estilo,"
        />
        <TextField
          label="Título resaltado"
          value={heroTituloDestacado}
          onChange={(e) => setHeroTituloDestacado(e.target.value)}
          fullWidth
          placeholder="Ej. a un precio justo."
          helperText="Aparece en color rosa, debajo del título"
        />
        <TextField
          label="Texto descriptivo"
          value={heroSubtitulo}
          onChange={(e) => setHeroSubtitulo(e.target.value)}
          fullWidth
          multiline
          rows={2}
          placeholder="Ej. Playeras, carteras, cinturones, calcetines y los mejores productos de belleza."
        />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Sobre nosotros
        </Typography>
        <TextField
          label="Nuestra historia"
          value={sobreNosotros}
          onChange={(e) => setSobreNosotros(e.target.value)}
          multiline
          rows={5}
          fullWidth
          helperText="Este texto aparece en la sección 'Sobre nosotros' de la tienda"
        />
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Imagen de la tienda (aparece junto al texto de &quot;Sobre nosotros&quot;)
          </Typography>

          {imagenSobreNosotros && (
            <Box
              sx={{
                position: "relative",
                width: 160,
                height: 160,
                borderRadius: 2,
                overflow: "hidden",
                mb: 1,
              }}
            >
              <Image
                src={imagenSobreNosotros}
                alt="Imagen de la tienda"
                fill
                style={{ objectFit: "cover" }}
              />
            </Box>
          )}

          <Button
            component="label"
            variant="outlined"
            startIcon={subiendoImagen ? <CircularProgress size={18} /> : <CloudUploadIcon />}
            disabled={subiendoImagen}
          >
            {imagenSobreNosotros ? "Cambiar imagen" : "Subir imagen"}
            <input type="file" accept="image/*" hidden onChange={manejarImagen} />
          </Button>
        </Box>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
          Contacto
        </Typography>
        <TextField
          label="Dirección"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />
        <TextField
          label="Horario de atención"
          value={horario}
          onChange={(e) => setHorario(e.target.value)}
          fullWidth
          multiline
          rows={2}
          placeholder="Ej. Lunes a sábado: 9:00 am - 7:00 pm"
        />
        <TextField
          label="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          fullWidth
        />
        <TextField
          label="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          fullWidth
        />
        <TextField
          label="WhatsApp (solo número con lada, ej. 5217711234567)"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          fullWidth
        />
        <TextField
          label="Instagram (enlace completo)"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          fullWidth
        />
        <TextField
          label="Facebook (enlace completo)"
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
          fullWidth
        />

        <Button type="submit" variant="contained" size="large" startIcon={<SaveIcon />} disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar cambios"}
        </Button>
      </Box>
    </Container>
  );
}