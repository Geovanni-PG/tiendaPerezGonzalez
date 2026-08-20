import { ThemeModeProvider } from "@/context/ThemeModeContext";
import { AuthProvider } from "@/context/AuthContext";
import { SearchProvider } from "@/context/SearchContext";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { AuthModalProvider } from "@/context/AuthModalContext";
import AuthModal from "@/components/auth/AuthModal";
import type { Metadata } from "next";
import { DrawerProvider } from "@/context/DrawerContext";
import FavoritesDrawer from "@/components/layout/FavoritesDrawer";
import CartDrawer from "@/components/layout/CartDrawer";

export const metadata: Metadata = {
  title: "Página Principal",
  description: "Tienda en línea de Puesto Pérez González",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body suppressHydrationWarning>
        <ThemeModeProvider>
          <AuthProvider>
            <FavoritesProvider>
              <CartProvider>
                <SearchProvider>
                  <AuthModalProvider>
                    <DrawerProvider>
                      {children}
                      <AuthModal />
                      <FavoritesDrawer />
                      <CartDrawer />
                    </DrawerProvider>
                  </AuthModalProvider>
                </SearchProvider>
              </CartProvider>
            </FavoritesProvider>
          </AuthProvider>
        </ThemeModeProvider>
      </body>
    </html>
  );
}