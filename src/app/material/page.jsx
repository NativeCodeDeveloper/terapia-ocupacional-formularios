import Image from "next/image";
import Link from "next/link";

/* ============================================================
   MATERIAL TERAPIA OCUPACIONAL · MÓDULO PROPIO
   Módulo independiente de los formularios de evaluación:
   reúne manuales, pautas, actividades y estrategias de TO.
   Cada material muestra la portada de su manual (las imágenes
   viven en /public/material). Los que aún no tienen portada
   muestran el recuadro provisional hasta recibir la imagen.
   ============================================================ */

/* Tienda de Esponsor del cliente: destino de cada material.
   Por ahora todos los recuadros llevan a la tienda; cuando haya
   enlaces por producto se reemplaza `href={TIENDA_TO}` por el
   enlace que corresponda a cada uno. */
const TIENDA_TO = "https://esponsor.com/teraocupame/shop/";

const MATERIALES = [
  { titulo: "Actividades de 1", portada: "/material/actividades-1.webp" },
  { titulo: "Actividades de 2", portada: "/material/actividades-2.webp" },
  { titulo: "Actividades de 3", portada: "/material/actividades-3.webp" },
  {
    titulo: "Estimulación cognitiva 1",
    portada: "/material/estimulacion-cognitiva-1.webp",
  },
  {
    titulo: "Estimulación cognitiva 2",
    portada: "/material/estimulacion-cognitiva-2.webp",
  },
  { titulo: "Estrategias de TO Online", portada: "/material/estrategias-to-online.webp" },
  {
    titulo: "Evaluación Inicial Infantil",
    portada: "/material/evaluacion-inicial-infantil.webp",
  },
  {
    titulo: "Evaluación Inicial Adolescencia",
    portada: "/material/evaluacion-inicial-adolescencia.webp",
  },
  {
    titulo: "Evaluación Inicial Adulto",
    portada: "/material/evaluacion-inicial-adulto.webp",
  },
  {
    titulo: "Evaluación Inicial Persona Mayor",
    portada: "/material/evaluacion-inicial-persona-mayor.webp",
  },
  { titulo: "Manual de ergoterapias", portada: "/material/manual-ergoterapias.webp" },
  { titulo: "Manual de objetivos", portada: "/material/manual-objetivos.webp" },
  { titulo: "Manual de órtesis", portada: "/material/manual-ortesis.webp" },
  {
    titulo: "Patologías asociadas a TO",
    portada: "/material/patologias-asociadas-to.webp",
  },
  { titulo: "Pautas de TO", portada: "/material/pautas-to.webp" },
  { titulo: "Talleres grupales", portada: "/material/talleres-grupales.webp" },
  { titulo: "Ya soy TO y ahora, ¿qué hago?", portada: "/material/ya-soy-to.webp" },
  { titulo: "Selectividad alimentaria", portada: "/material/selectividad-alimentaria.webp" },
  { titulo: "Manejo del dinero", portada: "/material/manejo-del-dinero.webp" },
  /* Sin portada todavía: se muestra el recuadro provisional. */
  { titulo: "TBA: ACE-R RUDAS" },
];

/* Dimensiones de las portadas convertidas (1200×920 px, WebP
   con transparencia). */
const PORTADA_ANCHO = 1200;
const PORTADA_ALTO = 920;

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
            práctica diaria. Este módulo es independiente de los formularios de evaluación: cada
            material se ve y se obtiene en la tienda oficial de TeraOcupame.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a
              href={TIENDA_TO}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
            >
              Visitar la tienda ↗
            </a>
            <p className="text-[13px] text-neutral-500">
              {MATERIALES.length} materiales disponibles en este módulo
            </p>
          </div>
        </section>

        {/* Recuadros de materiales */}
        <section aria-labelledby="titulo-material" className="scroll-mt-24 py-12 sm:py-16">
          <div className="mb-8">
            <h2 id="titulo-material" className="text-2xl font-bold tracking-tight">
              Materiales disponibles
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
              Cada recuadro corresponde a un material de terapia ocupacional y te lleva a la tienda de
              TeraOcupame, donde puedes verlo y obtenerlo.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MATERIALES.map(({ titulo, portada }) => (
              <a
                key={titulo}
                href={TIENDA_TO}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-2xl border border-teal-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-[0_16px_40px_-20px_rgba(13,148,136,0.35)]"
              >
                {portada ? (
                  /* Portada oficial del material */
                  <div className="aspect-[4/3] overflow-hidden rounded-xl border border-teal-100 bg-teal-50/50">
                    <Image
                      src={portada}
                      alt={`Portada del material ${titulo}`}
                      width={PORTADA_ANCHO}
                      height={PORTADA_ALTO}
                      sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  /* Zona reservada para la portada del material */
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
                )}
                <h3 className="mt-3 text-[15px] font-bold leading-5 tracking-tight">{titulo}</h3>
                <span className="mt-3 flex items-center justify-between border-t border-teal-100 pt-3 text-xs text-teal-700">
                  <span>Ver en la tienda de TeraOcupame</span>
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-50 text-teal-600 transition-transform group-hover:translate-x-0.5"
                  >
                    ↗
                  </span>
                </span>
              </a>
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
