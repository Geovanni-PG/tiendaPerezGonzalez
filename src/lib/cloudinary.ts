export async function subirImagen(archivo: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const formData = new FormData();
  formData.append("file", archivo);
  formData.append("upload_preset", uploadPreset!);

  const respuesta = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!respuesta.ok) {
    throw new Error("Error al subir la imagen a Cloudinary");
  }

  const datos = await respuesta.json();
  return datos.secure_url;
}
export async function subirVariasImagenes(archivos: File[]): Promise<string[]> {
  const urls = await Promise.all(archivos.map((archivo) => subirImagen(archivo)));
  return urls;
}