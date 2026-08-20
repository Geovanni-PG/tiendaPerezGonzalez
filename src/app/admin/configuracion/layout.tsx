import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Información del sitio",
};

export default function ConfiguracionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}