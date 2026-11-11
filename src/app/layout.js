import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Teraocupame.cl · Instrumentos de evaluación",
  description:
    "Formularios del SPM-2 y Perfil Sensorial 2 con fichas de Evaluación Inicial y descarga del informe en PDF",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white font-[family-name:var(--font-geist-sans)] text-neutral-900">
        {children}
      </body>
    </html>
  );
}
