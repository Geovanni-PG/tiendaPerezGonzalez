"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Producto } from "@/types/Product";

export function useProducts() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "productos"), orderBy("fechaCreacion", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Producto
      );
      setProductos(lista);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  return { productos, cargando };
}