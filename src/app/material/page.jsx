import Link from "next/link";

/* ============================================================
   MATERIAL TERAPIA OCUPACIONAL · MÓDULO PROPIO
   Módulo independiente de los formularios de evaluación:
   reúne manuales, pautas, actividades y estrategias de TO.
   Por ahora cada material es un recuadro con su título y el
   espacio reservado para su portada; el contenido y las
   imágenes se incorporan cuando esté el material final.
   ============================================================ */

const MATERIALES = [
  "Actividades de 1",
  "Actividades de 2",
  "Actividades de 3",
  "Estimulación cognitiva 1",
  "Estimulación cognitiva 2",
  "Estrategias de TO Online",
  "Manual de ergoterapias",
  "Manual de objetivos",
  "Manual de órtesis",
  "Patologías asociadas a TO",
  "Pautas de TO",
  "Talleres grupales",
  "Ya soy TO y ahora, ¿qué hago?",
  "Selectividad alimentaria",
  "Manejo del dinero",
  "TBA: ACE-R RUDAS",
];

export const metadata = {
  title: "Material Terapia Ocupacional · Teraocupame.cl",
  description:
    "Manuales, pautas, actividades y estrategias de terapia ocupacional de TeraOcupame para descargar y usar en la práctica.",
};

export default function MaterialTO() {
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)] text-neutral-900">
      <header className="sticky top-0 z-20 border-b border-teal-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 lg:px-0">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-[15px] font-bold text-white"
            >
              T
            </span>
            <div>
              <p className="text-[15px] font-bold leading-4 tracking-tight">
                Material Terapia Ocupacional
              </p>
              <p className="text-[11px] leading-4 text-neutral-500">
                Recursos de TeraOcupame para la práctica
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex h-9 items-center rounded-xl border border-teal-600 px-4 text-[13px] font-semibold text-teal-700 transition-colors hover:bg-teal-50"
          >
            ← Formularios e informes
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 lg:px-0">
        {/* Portada del módulo */}
        <section className="border-b border-teal-100 py-14 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
            Material TO · Descargas
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Material Terapia Ocupacional
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-neutral-600">
            Manuales, pautas, actividades y estrategias de terapia ocupacional listos para usar en la
            práctica diaria. Este módulo es independiente de los formularios de evaluación: aquí
            encontrarás los recursos organizados por tema.
          </p>
          <p className="mt-6 text-[13px] text-neutral-500">
            {MATERIALES.length} materiales disponibles en este módulo
          </p>
        </section>

        {/* Recuadros de materiales */}
        <section aria-labelledby="titulo-material" className="scroll-mt-24 py-12 sm:py-16">
          <div className="mb-8">
            <h2 id="titulo-material" className="text-2xl font-bold tracking-tight">
              Materiales disponibles
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
              Cada recuadro corresponde a un material de terapia ocupacional. Pronto cada uno tendrá
              su portada y su descarga directa.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MATERIALES.map((titulo) => (
              <article
                key={titulo}
                className="flex flex-col rounded-2xl border border-teal-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.06)]"
              >
                {/* Zona reservada para la portada del material */}
                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-teal-200 bg-teal-50/50 text-center">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-teal-600 shadow-sm"
                  >
                    📄
                  </span>
                  <span className="px-4 text-[11px] font-medium uppercase tracking-wider text-teal-700/70">
                    Portada próximamente
                  </span>
                </div>
                <h3 className="mt-3 text-[15px] font-bold leading-5 tracking-tight">{titulo}</h3>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-teal-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 text-xs text-neutral-400 lg:px-0">
          <p>© 2026 Teraocupame.cl — Material Terapia Ocupacional</p>
          <p>Uso profesional</p>
        </div>
      </footer>
    </div>
  );
}
