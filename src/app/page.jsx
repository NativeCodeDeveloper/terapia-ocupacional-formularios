import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CarruselHero from "@/components/CarruselHero";
import VideoPortada from "@/components/VideoPortada";
import VideoGenograma from "@/components/VideoGenograma";
import Footer from "@/components/Footer";
import HaloReel from "@/components/ui/halo-reel";
import Aparicion from "@/components/ui/aparicion";
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

/* Material destacado: enlace a su producto en la tienda. */
const SELECTIVIDAD = MATERIALES.find((m) => m.titulo === "Selectividad alimentaria");
const TIENDA_SELECTIVIDAD = SELECTIVIDAD?.tienda ?? TIENDA_TO;

/* Destello de cuatro puntas, discreto y en tonos de la marca. */
function Chispa({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 1.5 14.3 9.7 22.5 12 14.3 14.3 12 22.5 9.7 14.3 1.5 12 9.7 9.7Z" />
    </svg>
  );
}

/* Encabezado de sección: etiqueta en verde petróleo, título en azul
   petróleo oscuro y subrayado corto en degradado, todo centrado. */
function TituloSeccion({ id, etiqueta, children }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-marca-700">{etiqueta}</p>
      <h2 id={id} className="mt-3 text-3xl font-extrabold tracking-tight text-marca-800 sm:text-4xl">
        {children}
      </h2>
      <span
        aria-hidden="true"
        className="mx-auto mt-5 block h-1.5 w-16 rounded-full bg-gradient-to-r from-marca-600 to-marca-400"
      />
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)] text-neutral-900">
      <Navbar />

      <main>
        {/* Video de portada: superhéroe en loop infinito y sin sonido,
            entre el navbar y el carrusel de banners. */}
        <div aria-hidden="true" className="bg-white pb-3 pt-28 lg:pb-4 lg:pt-32">
          <VideoPortada />
        </div>

        {/* Portada con carrusel de banners: fondo blanco con brillos
            celeste muy suaves y tres diapositivas rotativas. */}
        <section id="inicio" className="relative scroll-mt-28 overflow-hidden bg-white">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-16 h-80 w-80 rounded-full bg-marca-50 blur-3xl" />
            <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-marca-50/80 blur-3xl" />
            <Chispa className="absolute right-[8%] top-32 hidden h-8 w-8 text-marca-200 lg:block" />
            <Chispa className="absolute bottom-[16%] left-[5%] hidden h-6 w-6 text-marca-400/50 lg:block" />
          </div>

          <CarruselHero />
        </section>

        {/* Lo que encontrarás: tarjetas con las tres líneas de recursos */}
        <section aria-labelledby="titulo-encontraras" className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 lg:px-0">
            <Aparicion>
              <TituloSeccion id="titulo-encontraras" etiqueta="Lo que encontrarás">
                Herramientas que facilitan{" "}
                <span className="[background-image:linear-gradient(transparent_62%,#d3eff4_62%)] text-marca-600">
                  tu trabajo
                </span>
              </TituloSeccion>
            </Aparicion>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {ENCONTRARAS.map((tarjeta, i) => (
                <Aparicion key={tarjeta.titulo} demora={i * 0.08} className="h-full">
                  <a
                    href={tarjeta.href}
                    className="group flex h-full flex-col rounded-[1.75rem] border border-marca-100 bg-white p-7 shadow-[0_2px_12px_-6px_rgba(38,50,56,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-marca-200 hover:shadow-[0_24px_48px_-28px_rgba(6,148,148,0.4)]"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-marca-50 text-marca-600">
                      {tarjeta.icono}
                    </span>
                    <span className="mt-5 text-lg font-bold tracking-tight text-marca-800">
                      {tarjeta.titulo}
                    </span>
                    <span className="mt-2 text-sm leading-6 text-marca-900/70">
                      {tarjeta.texto}
                    </span>
                    <span className="mt-auto flex pt-6">
                      <span
                        aria-hidden="true"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-marca-50 text-marca-600 transition-colors group-hover:bg-marca-600 group-hover:text-white"
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
                </Aparicion>
              ))}
            </div>
          </div>
        </section>

        {/* Genograma familiar: demostración en video (sin audio) */}
        <section
          id="genograma"
          aria-labelledby="titulo-genograma"
          className="scroll-mt-40 bg-white pb-16 sm:pb-20"
        >
          <div className="mx-auto max-w-6xl px-5 lg:px-0">
            <Aparicion>
              <TituloSeccion id="titulo-genograma" etiqueta="Evaluación familiar">
                Genograma familiar{" "}
                <span className="text-marca-600 [background-image:linear-gradient(transparent_62%,#d3eff4_62%)]">
                  completo de tus pacientes
                </span>
              </TituloSeccion>
            </Aparicion>
            <Aparicion className="mt-12">
              <figure className="relative mx-auto max-w-4xl">
                <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_40px_80px_-45px_rgba(48,87,98,0.45)] ring-1 ring-marca-100">
                  <VideoGenograma />
                </div>
                <Chispa className="absolute -right-4 -top-4 h-8 w-8 text-marca-300 drop-shadow-[0_4px_8px_rgba(48,87,98,0.15)]" />
              </figure>
            </Aparicion>
          </div>
        </section>

        {/* Material TO: carrusel elíptico con todas las portadas del módulo */}
        <section
          aria-labelledby="titulo-material-reel"
          className="bg-white pb-16 sm:pb-20"
        >
          <div className="mx-auto max-w-6xl px-5 lg:px-0">
            <Aparicion>
              <TituloSeccion id="titulo-material-reel" etiqueta="Material TO">
                Material{" "}
                <span className="text-marca-600">Terapia Ocupacional</span>
              </TituloSeccion>
            </Aparicion>
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
                <p className="text-2xl font-extrabold tracking-tight text-marca-800">
                  Todo el material{" "}
                  <span className="text-marca-600">listo para descargar</span>
                </p>
                <p className="mt-2 text-sm leading-6 text-marca-900/70">
                  Manuales, pautas y evaluaciones para usar en tu práctica diaria.
                </p>
                <Link
                  href="/material"
                  className="mt-5 inline-flex h-11 items-center rounded-xl bg-marca-600 px-7 text-sm font-semibold text-white shadow-md shadow-marca-600/25 transition-colors hover:bg-marca-700"
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
          className="relative overflow-hidden bg-marca-50 py-16 sm:py-20"
        >
          <Chispa
            aria-hidden="true"
            className="absolute right-[6%] top-10 hidden h-7 w-7 text-marca-300/70 lg:block"
          />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-2 lg:gap-16 lg:px-0">
            <Aparicion>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-marca-700">
                  Para padres y estudiantes
                </p>
                <h2
                  id="titulo-selectividad"
                  className="mt-3 text-3xl font-extrabold tracking-tight text-marca-800 sm:text-4xl"
                >
                  Estrategias para la{" "}
                  <span className="text-marca-600 [background-image:linear-gradient(transparent_62%,#d3eff4_62%)]">
                    selectividad alimentaria
                  </span>
                </h2>
                <p className="mt-5 max-w-xl text-[15px] leading-7 text-marca-900/75">
                  Encontrarás herramientas claras para ampliar la tolerancia y transformar la hora
                  de comer en un momento menos tenso y más positivo.
                </p>
                <a
                  href={TIENDA_SELECTIVIDAD}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-marca-600 px-7 text-sm font-semibold text-white shadow-md shadow-marca-600/25 transition-colors hover:bg-marca-700"
                >
                  Conseguir este material
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </a>
              </div>
            </Aparicion>
            <Aparicion demora={0.1}>
              <figure className="relative mx-auto w-full max-w-lg">
                <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_40px_80px_-40px_rgba(48,87,98,0.4)] ring-1 ring-marca-100">
                  <Image
                    src="/images/selectividad-alimentaria.webp"
                    alt="Manual Estrategias para la selectividad alimentaria, para padres y estudiantes"
                    width={2560}
                    height={2560}
                    sizes="(min-width: 1024px) 480px, 100vw"
                    className="h-auto w-full"
                  />
                </div>
                <Chispa className="absolute -left-4 -top-5 h-9 w-9 text-marca-300 drop-shadow-[0_4px_8px_rgba(48,87,98,0.15)]" />
              </figure>
            </Aparicion>
          </div>
        </section>

        {/* Cómo se puntúa */}
        <section
          id="sobre"
          aria-labelledby="titulo-puntuacion"
          className="scroll-mt-40 bg-white pb-16 sm:pb-20"
        >
          <div className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20 lg:px-0">
            <Aparicion>
              <div className="rounded-[2rem] border border-marca-100 bg-marca-50/60 p-6 sm:p-10">
                <h2
                  id="titulo-puntuacion"
                  className="text-2xl font-extrabold tracking-tight text-marca-800"
                >
                  Puntuación e informe automáticos
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-marca-900/70">
                  Cada cuestionario aplica el criterio oficial del SPM-2 al momento de enviar las
                  respuestas.
                </p>
                <div className="mt-8 grid gap-6 sm:grid-cols-3">
                  {VENTAJAS.map((v) => (
                    <div key={v.titulo}>
                      <p className="flex items-center gap-2 text-sm font-semibold text-marca-800">
                        <span
                          aria-hidden="true"
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-marca-600 text-[11px] text-white"
                        >
                          ✓
                        </span>
                        {v.titulo}
                      </p>
                      <p className="mt-2 text-[13px] leading-5 text-marca-900/70">{v.texto}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Aparicion>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
