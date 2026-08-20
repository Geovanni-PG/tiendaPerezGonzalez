"use client";

import { useState } from "react";
import { subirImagen } from "@/lib/cloudinary";

export default function PruebaCloudinary() {
  const [url, setUrl] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarCambio(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setCargando(true);
    try {
      const urlSubida = await subirImagen(archivo);
      setUrl(urlSubida);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al subir la imagen");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Prueba de subida a Cloudinary</h1>
      <input type="file" accept="image/*" onChange={manejarCambio} />
      {cargando && <p>Subiendo imagen...</p>}
      {url && (
        <div>
          <p>URL generada: {url}</p>
          <img src={url} alt="Imagen subida" width={200} />
        </div>
      )}
    </div>
  );
}