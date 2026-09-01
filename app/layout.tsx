
import type { Metadata } from "next";
import "./globals.css";
import "react-phone-input-2/lib/style.css";
import { AeonikFont, RecoletaFont } from "@/utils/customFonts";
import ClientProvider from "./ClientProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

export const metadata: Metadata = {
  title: "Dream Planet",
  description: "Dream Planet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${AeonikFont.className} ${RecoletaFont.variable}`}>
        <ClientProvider>{children}
        <Toaster />
        <SonnerToaster richColors position="top-right" />
        </ClientProvider>

      </body>
    </html>
  );
}
