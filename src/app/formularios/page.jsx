import Navbar from "@/components/Navbar";
import Formularios from "@/components/Formularios";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Formularios disponibles · Teraocupame.cl",
  description:
    "Selecciona el formulario SPM-2, Perfil Sensorial 2 o Evaluación Inicial que necesitas completar, con puntuación automática e informe descargable.",
};

/* Página aislada que muestra solo el listado de formularios. */
export default function FormulariosPage() {
  return (
    <div className="min-h-screen bg-[#d9eaf6] font-[family-name:var(--font-geist-sans)]">
      <Navbar />
      <main>
        <Formularios />
      </main>
      <Footer />
    </div>
  );
}
