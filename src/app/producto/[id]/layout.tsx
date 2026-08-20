import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Producto",
};

export default function ProductoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}