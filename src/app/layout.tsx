import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { AlertProvider } from "@/components/alert-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AcadEvent",
  description: "Plataforma para gestionar eventos académicos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AlertProvider>
          <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-foreground">
            <Header />
            <main className="mx-auto max-w-6xl px-6 py-12 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300">
              {children}
            </main>
          </div>
        </AlertProvider>
      </body>
    </html>
  );
}
