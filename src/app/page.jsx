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

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)] text-neutral-900">
      <Navbar />

      <main>
        {/* Portada con la distribución de la referencia: video a sangre
            completa a la izquierda con corte diagonal, mensaje a la derecha
            sobre panel celeste y navbar transparente por encima. */}
        <section
          id="inicio"
          className="relative scroll-mt-16 overflow-hidden border-b border-neutral-100 bg-[#d9eaf6] lg:min-h-[88svh]"
        >
          {/* Video con bordes diagonales: arriba y a sangre completa en móvil,
              a la izquierda en escritorio */}
          <div
            aria-hidden="true"
            className="relative h-[88vw] max-h-[560px] w-full overflow-hidden [clip-path:polygon(0_0,100%_0,100%_100%,0_84%)] lg:absolute lg:inset-y-0 lg:bottom-0 lg:left-0 lg:h-auto lg:max-h-none lg:w-[52%] lg:[clip-path:polygon(0_0,86%_0,100%_100%,0_100%)]"
          >
            <VideoHero />
          </div>

          {/* Contenido: en móvil va bajo el video; centrado en escritorio */}
          <div className="relative flex items-center px-5 pb-16 pt-2 sm:pb-20 lg:min-h-[88svh] lg:pb-0 lg:pl-[54%] lg:pr-16 lg:pt-0 xl:pr-28">
            <div className="lg:mt-20">
              <h1 className="text-[2.35rem] font-extrabold uppercase leading-[1.06] tracking-tight text-indigo-950 sm:text-5xl xl:text-[3.5rem]">
                <span className="block">Menos tiempo preparando.</span>
                <span className="block text-teal-700">Más tiempo transformando vidas</span>
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-7 text-neutral-700">
                Descubre evaluaciones automatizadas, materiales descargables y cursos
                especializados para facilitar tu práctica profesional y acompañar cada proceso
                terapéutico.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="/formularios"
                  className="group inline-flex h-12 items-center gap-2 rounded-xl bg-teal-600 px-7 text-sm font-semibold text-white shadow-lg shadow-teal-600/30 transition-colors hover:bg-teal-700"
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
                  className="inline-flex h-12 items-center rounded-xl border border-white/70 bg-white/60 px-7 text-sm font-semibold text-neutral-800 transition-colors hover:bg-white hover:text-teal-700"
                >
                  Saber más
                </a>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5">
                {CONFIANZA.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-[13px] font-medium text-neutral-700"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-teal-700"
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
              Lo que encontrarás
            </p>
            <h2
              id="titulo-encontraras"
              className="mt-3 text-3xl font-extrabold uppercase tracking-tight text-indigo-950 sm:text-4xl"
            >
              Herramientas que facilitan{" "}
              <span className="text-teal-700">tu trabajo</span>
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {ENCONTRARAS.map((tarjeta) => (
                <a
                  key={tarjeta.titulo}
                  href={tarjeta.href}
                  className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-7 shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_28px_60px_-28px_rgba(13,148,136,0.45)]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                    {tarjeta.icono}
                  </span>
                  <span className="mt-5 text-lg font-bold tracking-tight text-indigo-950">
                    {tarjeta.titulo}
                  </span>
                  <span className="mt-2 text-sm leading-6 text-neutral-600">
                    {tarjeta.texto}
                  </span>
                  <span className="mt-auto flex pt-6">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700 transition-colors group-hover:bg-teal-600 group-hover:text-white"
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
            <h2
              id="titulo-genograma"
              className="max-w-3xl text-3xl font-extrabold uppercase tracking-tight text-indigo-950 sm:text-4xl"
            >
              Genograma familiar{" "}
              <span className="text-teal-700">completo de tus pacientes</span>
            </h2>
            <figure className="mt-10 overflow-hidden rounded-[2rem] bg-white shadow-[0_45px_90px_-45px_rgba(13,148,136,0.45)] ring-1 ring-neutral-200/80">
              <VideoGenograma />
            </figure>
          </div>
        </section>

        {/* Material TO: carrusel elíptico con todas las portadas del módulo */}
        <section
          aria-labelledby="titulo-material-reel"
          className="bg-white pb-16 sm:pb-20"
        >
          <div className="mx-auto max-w-6xl px-5 lg:px-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
              Material TO
            </p>
            <h2
              id="titulo-material-reel"
              className="mt-3 text-3xl font-extrabold uppercase tracking-tight text-indigo-950 sm:text-4xl"
            >
              Material <span className="text-teal-700">Terapia Ocupacional</span>
            </h2>
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
                <p className="text-2xl font-extrabold uppercase tracking-tight text-indigo-950">
                  Todo el material{" "}
                  <span className="text-teal-700">listo para descargar</span>
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Manuales, pautas y evaluaciones para usar en tu práctica diaria.
                </p>
                <Link
                  href="/material"
                  className="mt-5 inline-flex h-11 items-center rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition-colors hover:bg-teal-700"
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
          className="bg-white pb-16 sm:pb-20"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-2 lg:gap-16 lg:px-0">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
                Para padres y estudiantes
              </p>
              <h2
                id="titulo-selectividad"
                className="mt-3 text-3xl font-extrabold uppercase tracking-tight text-indigo-950 sm:text-4xl"
              >
                Estrategias para la{" "}
                <span className="text-teal-700">selectividad alimentaria</span>
              </h2>
              <p className="mt-5 max-w-xl text-[15px] leading-7 text-neutral-700">
                Encontrarás herramientas claras para ampliar la tolerancia y transformar la hora
                de comer en un momento menos tenso y más positivo.
              </p>
              <a
                href={TIENDA_SELECTIVIDAD}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-teal-600 px-7 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition-colors hover:bg-teal-700"
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
            <figure className="relative overflow-hidden rounded-[2rem] shadow-[0_45px_90px_-45px_rgba(190,24,93,0.35)] ring-1 ring-neutral-200/80">
              <Image
                src="/images/selectividad-alimentaria.webp"
                alt="Manual Estrategias para la selectividad alimentaria, para padres y estudiantes"
                width={2560}
                height={2560}
                sizes="(min-width: 1024px) 560px, 100vw"
                className="h-auto w-full"
              />
            </figure>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-5 lg:px-0">
          {/* Cómo se puntúa */}

        {/* Cómo se puntúa */}
        <section
          id="sobre"
          aria-labelledby="titulo-puntuacion"
          className="scroll-mt-24 pb-16 sm:pb-20"
        >
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50/60 p-6 sm:p-10">
            <h2 id="titulo-puntuacion" className="text-2xl font-bold tracking-tight">
              Puntuación e informe automáticos
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
              Cada cuestionario aplica el criterio oficial del SPM-2 al momento de enviar las
              respuestas.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {VENTAJAS.map((v) => (
                <div key={v.titulo}>
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <span
                      aria-hidden="true"
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[11px] text-white"
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
        </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
