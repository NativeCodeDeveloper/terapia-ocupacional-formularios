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
  description: "Formularios del Perfil Sensorial 2 (SPM-2) con descarga en PDF y Word",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white font-[Arial,Helvetica,sans-serif] text-[#171717] dark:bg-[#0a0a0a] dark:text-[#ededed]">{children}</body>
    </html>
  );
}
