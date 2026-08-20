import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ganancias",
};

export default function GananciasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}