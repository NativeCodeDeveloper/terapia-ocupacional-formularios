import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import VideoHero from "@/components/VideoHero";
import VideoGenograma from "@/components/VideoGenograma";
import Footer from "@/components/Footer";
import HaloReel from "@/components/ui/halo-reel";
import { MATERIALES, TIENDA_TO } from "@/lib/materiales";

/* Portadas para el carrusel del módulo Material TO. */
const REEL_MATERIAL = MATERIALES.map((m) =>
  m.portada
    ? { src: m.portada, alt: `Portada de ${m.titulo}` }
    : { title: m.titulo, subtitle: "Próximamente" },
);


/* Tarjetas del módulo "Lo que encontrarás". El enlace de cursos
   queda pendiente hasta que exista la sección correspondiente. */
const ENCONTRARAS = [
  {
    titulo: "Evaluaciones automatizadas",
    texto: "Optimiza tus evaluaciones y ahorra tiempo en la aplicación, puntuación e informe.",
    href: "/formularios",
    icono: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    titulo: "Manuales digitales",
    texto: "Material de consulta y apoyo para tus intervenciones.",
    href: "/material",
    icono: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    titulo: "Cursos online",
    texto: "Aprende a tu ritmo y fortalece tus conocimientos profesionales.",
    href: "#",
    icono: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
];

const VENTAJAS = [
  {
    titulo: "Tablas normativas por edad",
    texto: "Cada respuesta se convierte a puntaje T y percentil con la tabla oficial del formulario según la edad evaluada.",
  },
  {
    titulo: "Puntuación automática",
    texto: "Los ítems de Participación Social redactados en positivo se invierten solos y el Total Sensorial se calcula al instante.",
  },
  {
    titulo: "Informe descargable",
    texto: "Hoja de resumen, perfil gráfico e interpretación por dimensión, listos para firmar y archivar en la ficha del usuario.",
  },
];

/* Sellos breves bajo los botones del hero. */
const CONFIANZA = [
  "Puntuación automática",
  "Descarga inmediata",
  "Material TO descargable",
];

/* Material destacado: enlace a su producto en la tienda. */
const SELECTIVIDAD = MATERIALES.find((m) => m.titulo === "Selectividad alimentaria");
const TIENDA_SELECTIVIDAD = SELECTIVIDAD?.tienda ?? TIENDA_TO;

/* Estrella de cuatro puntas, como los destellos de los banners de
   la tienda de referencia. */
function Chispa({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 1.5 14.3 9.7 22.5 12 14.3 14.3 12 22.5 9.7 14.3 1.5 12 9.7 9.7Z" />
    </svg>
  );
}

/* Encabezado de sección al estilo de la referencia: etiqueta rosa,
   título navy y subrayado corto oscuro, todo centrado. */
function TituloSeccion({ id, etiqueta, children }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-marca-rosa">
        {etiqueta}
      </p>
      <h2
        id={id}
        className="mt-3 text-3xl font-extrabold uppercase tracking-tight text-marca-navy sm:text-4xl"
      >
        {children}
      </h2>
      <span
        aria-hidden="true"
        className="mx-auto mt-5 block h-1.5 w-16 rounded-full bg-neutral-800"
      />
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)] text-neutral-900">
      <Navbar />

      <main>
        {/* Portada tipo banner de la referencia: fondo pastel, video en
            tarjeta blanca redondeada con destellos y mensaje con título
            estilo sticker. */}
        <section
          id="inicio"
          className="relative scroll-mt-28 overflow-hidden bg-gradient-to-br from-[#d9e4f8] via-[#e7eef9] to-[#e3f2ec] lg:min-h-[86svh]"
        >
          {/* Manchas y destellos pastel de fondo */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-marca-lavanda/70 blur-2xl" />
            <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-teal-100/70 blur-2xl" />
            <Chispa className="absolute right-[8%] top-28 hidden h-9 w-9 text-marca-amarillo lg:block" />
            <Chispa className="absolute left-[46%] top-[16%] hidden h-6 w-6 text-white lg:block" />
            <Chispa className="absolute bottom-[14%] left-[6%] hidden h-7 w-7 text-marca-rosa/50 lg:block" />
          </div>

          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-32 sm:pt-36 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-24 lg:pt-32 xl:gap-20">
            {/* Video en tarjeta blanca, levemente inclinada como un sticker */}
            <figure className="relative mx-auto w-full min-w-0 max-w-xl">
              <div className="relative aspect-[4/3] -rotate-1 overflow-hidden rounded-[2.5rem] shadow-[0_40px_80px_-40px_rgba(35,58,114,0.5)] ring-8 ring-white/70">
                <VideoHero />
              </div>
              <Chispa className="absolute -right-3 -top-5 h-10 w-10 text-marca-amarillo drop-shadow-[0_4px_8px_rgba(35,58,114,0.18)]" />
              <Chispa className="absolute -bottom-4 -left-4 h-6 w-6 text-white" />
            </figure>

            <div className="min-w-0 text-center lg:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-marca-rosa">
                Terapia ocupacional · Tera Ocupame
              </p>
              <h1 className="mt-4 text-[1.95rem] font-extrabold uppercase leading-[1.12] tracking-tight text-marca-navy sm:text-5xl xl:text-[3.4rem]">
                <span className="block">Menos tiempo preparando.</span>
                <span className="texto-sticker mt-2 block">
                  Más tiempo transformando vidas
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-neutral-700 lg:mx-0">
                Descubre evaluaciones automatizadas, materiales descargables y cursos
                especializados para facilitar tu práctica profesional y acompañar cada proceso
                terapéutico.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <a
                  href="/formularios"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-teal-500 px-8 text-sm font-semibold text-white shadow-lg shadow-teal-500/35 transition-colors hover:bg-teal-600"
                >
                  Explorar recursos
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </a>
                <a
                  href="#sobre"
                  className="inline-flex h-12 items-center rounded-full border-2 border-marca-navy/15 bg-white/80 px-8 text-sm font-semibold text-marca-navy transition-colors hover:border-teal-300 hover:bg-white"
                >
                  Saber más
                </a>
              </div>
              <ul className="mt-8 flex flex-wrap justify-center gap-x-3 gap-y-2.5 lg:justify-start">
                {CONFIANZA.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 rounded-full bg-white/70 py-1.5 pl-2 pr-4 text-[13px] font-semibold text-marca-navy"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3"
                      >
                        <path d="m5 13 4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Lo que encontrarás: tarjetas con las tres líneas de recursos */}
        <section aria-labelledby="titulo-encontraras" className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 lg:px-0">
            <TituloSeccion id="titulo-encontraras" etiqueta="Lo que encontrarás">
              Herramientas que facilitan{" "}
              <span className="[background-image:linear-gradient(transparent_62%,#b0e3d4_62%)] text-teal-700">
                tu trabajo
              </span>
            </TituloSeccion>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {ENCONTRARAS.map((tarjeta) => (
                <a
                  key={tarjeta.titulo}
                  href={tarjeta.href}
                  className="group flex flex-col rounded-[1.75rem] border border-neutral-200/80 bg-white p-7 transition-all hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    {tarjeta.icono}
                  </span>
                  <span className="mt-5 text-lg font-bold tracking-tight text-marca-navy">
                    {tarjeta.titulo}
                  </span>
                  <span className="mt-2 text-sm leading-6 text-neutral-600">
                    {tarjeta.texto}
                  </span>
                  <span className="mt-auto flex pt-6">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-700 transition-colors group-hover:bg-teal-500 group-hover:text-white"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      >
                        <path d="M5 12h14m-6-6 6 6-6 6" />
                      </svg>
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Genograma familiar: demostración en video (sin audio) */}
        <section aria-labelledby="titulo-genograma" className="bg-white pb-16 sm:pb-20">
          <div className="mx-auto max-w-6xl px-5 lg:px-0">
            <TituloSeccion id="titulo-genograma" etiqueta="Evaluación familiar">
              Genograma familiar{" "}
              <span className="[background-image:linear-gradient(transparent_62%,#fbc4de_62%)]">
                completo de tus pacientes
              </span>
            </TituloSeccion>
            <figure className="relative mx-auto mt-12 max-w-4xl">
              <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-[0_40px_80px_-45px_rgba(35,58,114,0.45)] ring-8 ring-white/70">
                <VideoGenograma />
              </div>
              <Chispa className="absolute -right-4 -top-4 h-9 w-9 text-marca-amarillo drop-shadow-[0_4px_8px_rgba(35,58,114,0.18)]" />
            </figure>
          </div>
        </section>

        {/* Material TO: carrusel elíptico con todas las portadas del módulo */}
        <section
          aria-labelledby="titulo-material-reel"
          className="bg-white pb-16 sm:pb-20"
        >
          <div className="mx-auto max-w-6xl px-5 lg:px-0">
            <TituloSeccion id="titulo-material-reel" etiqueta="Material TO">
              Material{" "}
              <span className="text-teal-600">Terapia Ocupacional</span>
            </TituloSeccion>
          </div>
          <HaloReel
            aria-label="Portadas del material de terapia ocupacional"
            items={REEL_MATERIAL}
            cardWidth={260}
            cardHeight={200}
            holdDuration={1600}
            stepDuration={800}
            className="mt-4 h-[440px] sm:h-[560px]"
            centerLabel={
              <div className="hidden max-w-sm text-center sm:block">
                <p className="text-2xl font-extrabold uppercase tracking-tight text-marca-navy">
                  Todo el material{" "}
                  <span className="text-teal-600">listo para descargar</span>
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Manuales, pautas y evaluaciones para usar en tu práctica diaria.
                </p>
                <Link
                  href="/material"
                  className="mt-5 inline-flex h-11 items-center rounded-full bg-teal-500 px-7 text-sm font-semibold text-white shadow-md shadow-teal-500/30 transition-colors hover:bg-teal-600"
                >
                  Ir al material TO →
                </Link>
              </div>
            }
          />
        </section>

        {/* Selectividad alimentaria: material destacado con enlace a la tienda */}
        <section
          aria-labelledby="titulo-selectividad"
          className="relative overflow-hidden bg-marca-rosa-suave py-16 sm:py-20"
        >
          <Chispa
            aria-hidden="true"
            className="absolute right-[6%] top-10 hidden h-8 w-8 text-marca-rosa/40 lg:block"
          />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-2 lg:gap-16 lg:px-0">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-marca-rosa">
                Para padres y estudiantes
              </p>
              <h2
                id="titulo-selectividad"
                className="mt-3 text-3xl font-extrabold uppercase tracking-tight text-marca-navy sm:text-4xl"
              >
                Estrategias para la{" "}
                <span className="[background-image:linear-gradient(transparent_62%,#fbc4de_62%)]">
                  selectividad alimentaria
                </span>
              </h2>
              <p className="mt-5 max-w-xl text-[15px] leading-7 text-neutral-700">
                Encontrarás herramientas claras para ampliar la tolerancia y transformar la hora
                de comer en un momento menos tenso y más positivo.
              </p>
              <a
                href={TIENDA_SELECTIVIDAD}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-marca-rosa px-8 text-sm font-semibold text-white shadow-lg shadow-marca-rosa/35 transition-colors hover:bg-[#d92273]"
              >
                Conseguir este material
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </a>
            </div>
            <figure className="relative mx-auto w-full max-w-lg rotate-1">
              <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-[0_40px_80px_-40px_rgba(244,49,135,0.45)] ring-8 ring-white/80">
                <Image
                  src="/images/selectividad-alimentaria.webp"
                  alt="Manual Estrategias para la selectividad alimentaria, para padres y estudiantes"
                  width={2560}
                  height={2560}
                  sizes="(min-width: 1024px) 480px, 100vw"
                  className="h-auto w-full"
                />
              </div>
              <Chispa className="absolute -left-4 -top-5 h-10 w-10 text-marca-amarillo drop-shadow-[0_4px_8px_rgba(35,58,114,0.18)]" />
            </figure>
          </div>
        </section>

        {/* Cómo se puntúa */}
        <section
          id="sobre"
          aria-labelledby="titulo-puntuacion"
          className="scroll-mt-32 bg-white pb-16 sm:pb-20"
        >
          <div className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20 lg:px-0">
            <div className="rounded-[2rem] border border-teal-100 bg-teal-50/70 p-6 sm:p-10">
              <h2
                id="titulo-puntuacion"
                className="text-2xl font-extrabold uppercase tracking-tight text-marca-navy"
              >
                Puntuación e informe automáticos
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                Cada cuestionario aplica el criterio oficial del SPM-2 al momento de enviar las
                respuestas.
              </p>
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                {VENTAJAS.map((v) => (
                  <div key={v.titulo}>
                    <p className="flex items-center gap-2 text-sm font-semibold text-marca-navy">
                      <span
                        aria-hidden="true"
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-[11px] text-white"
                      >
                        ✓
                      </span>
                      {v.titulo}
                    </p>
                    <p className="mt-2 text-[13px] leading-5 text-neutral-600">{v.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
