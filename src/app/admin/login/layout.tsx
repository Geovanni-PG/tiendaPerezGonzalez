import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión - Administrador",
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}