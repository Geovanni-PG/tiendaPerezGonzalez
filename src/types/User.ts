export type RolUsuario = "cliente" | "admin";

export interface Direccion {
  calle: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  telefono: string;
  referencia?: string;
}

export interface Usuario {
  uid: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  direccion?: Direccion;
  favoritos?: string[];
  fechaRegistro?: string;
}