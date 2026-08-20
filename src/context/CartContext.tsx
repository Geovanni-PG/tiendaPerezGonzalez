"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { doc, onSnapshot, updateDoc, deleteField } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { Producto } from "@/types/Product";

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

interface CartContextType {
  items: ItemCarrito[];
  agregarAlCarrito: (producto: Producto, cantidad?: number) => void;
  quitarDelCarrito: (idProducto: string) => void;
  actualizarCantidad: (idProducto: string, cantidad: number) => void;
  vaciarCarrito: () => void;
  totalItems: number;
  totalPrecio: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { usuarioFirebase } = useAuth();
  const { productos } = useProducts();

  const [cantidadesInvitado, setCantidadesInvitado] = useState<Record<string, number>>({});
  const [cantidadesCuenta, setCantidadesCuenta] = useState<Record<string, number>>({});

  // Sincroniza en tiempo real el carrito guardado en la cuenta, mientras haya sesión
  useEffect(() => {
    if (!usuarioFirebase) {
      setCantidadesCuenta({});
      return;
    }

    const refUsuario = doc(db, "usuarios", usuarioFirebase.uid);
    const unsubscribe = onSnapshot(refUsuario, (snapshot) => {
      const datos = snapshot.data();
      setCantidadesCuenta(datos?.carrito ?? {});
    });

    return () => unsubscribe();
  }, [usuarioFirebase]);

  // Al cerrar sesión, se limpia cualquier carrito de invitado que hubiera quedado
  useEffect(() => {
    if (!usuarioFirebase) {
      setCantidadesInvitado({});
    }
  }, [usuarioFirebase]);

  const cantidades = usuarioFirebase ? cantidadesCuenta : cantidadesInvitado;

  function guardarCantidad(idProducto: string, cantidad: number) {
    if (usuarioFirebase) {
      const refUsuario = doc(db, "usuarios", usuarioFirebase.uid);
      updateDoc(refUsuario, {
        [`carrito.${idProducto}`]: cantidad <= 0 ? deleteField() : cantidad,
      });
    } else {
      setCantidadesInvitado((prev) => {
        const nuevo = { ...prev };
        if (cantidad <= 0) {
          delete nuevo[idProducto];
        } else {
          nuevo[idProducto] = cantidad;
        }
        return nuevo;
      });
    }
  }

  function agregarAlCarrito(producto: Producto, cantidad: number = 1) {
    const actual = cantidades[producto.id] ?? 0;
    guardarCantidad(producto.id, actual + cantidad);
  }

  function quitarDelCarrito(idProducto: string) {
    guardarCantidad(idProducto, 0);
  }

  function actualizarCantidad(idProducto: string, cantidad: number) {
    guardarCantidad(idProducto, cantidad);
  }

  function vaciarCarrito() {
    if (usuarioFirebase) {
      const refUsuario = doc(db, "usuarios", usuarioFirebase.uid);
      const actualizaciones: Record<string, ReturnType<typeof deleteField>> = {};
      Object.keys(cantidades).forEach((id) => {
        actualizaciones[`carrito.${id}`] = deleteField();
      });
      if (Object.keys(actualizaciones).length > 0) {
        updateDoc(refUsuario, actualizaciones);
      }
    } else {
      setCantidadesInvitado({});
    }
  }

  const items: ItemCarrito[] = Object.entries(cantidades)
    .map(([idProducto, cantidad]) => {
      const producto = productos.find((p) => p.id === idProducto);
      return producto ? { producto, cantidad } : null;
    })
    .filter((item): item is ItemCarrito => item !== null);

  const totalItems = items.reduce((suma, item) => suma + item.cantidad, 0);
  const totalPrecio = items.reduce((suma, item) => suma + item.producto.precio * item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{ items, agregarAlCarrito, quitarDelCarrito, actualizarCantidad, vaciarCarrito, totalItems, totalPrecio }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const contexto = useContext(CartContext);
  if (!contexto) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return contexto;
}

