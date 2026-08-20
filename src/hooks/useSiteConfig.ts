"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SiteConfig } from "@/types/SiteConfig";

const configPorDefecto: SiteConfig = {
  sobreNosotros: "",
  imagenSobreNosotros: "",
  direccion: "",
  horario: "",
  telefono: "",
  correo: "",
  whatsapp: "",
  instagram: "",
  facebook: "",
  heroEtiqueta: "",
  heroTitulo: "",
  heroTituloDestacado: "",
  heroSubtitulo: "",
};
export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(configPorDefecto);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "configuracion", "sitio"), (snapshot) => {
      if (snapshot.exists()) {
        setConfig({ ...configPorDefecto, ...(snapshot.data() as Partial<SiteConfig>) });
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  return { config, cargando };
}