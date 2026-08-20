export type Insignia = "Nuevo" | "Oferta" | "Popular" | "";

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioOriginal?: number;
  costPrice: number;
  categoria: string;
  cantidadDisponible: number;
  insignia?: Insignia;
  destacado: boolean;
  imagenPrincipal: string;
  imagenesAdicionales?: string[];
  detalles?: string[];
  fechaCreacion?: string;
}