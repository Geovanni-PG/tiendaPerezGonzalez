export interface ItemPedido {
  productoId: string;
  nombre: string;
  precio: number;
  costPrice: number;
  cantidad: number;
  imagen: string;
}

export interface DireccionPedido {
  calle: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  referencia?: string;
}

export interface Pedido {
  id: string;
  clienteNombre: string;
  clienteCorreo: string;
  clienteTelefono: string;
  direccion: DireccionPedido;
  items: ItemPedido[];
  total: number;
  metodoPago: string;
  estado: "pagado";
  usuarioUid: string | null;
  fecha: string;
}