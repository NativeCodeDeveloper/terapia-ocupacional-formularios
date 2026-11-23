"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* Pendiente: devolver el video de portada cuando el cliente lo
   confirme; por ahora la diapositiva usa un fotograma fijo. */

/* Collage del carrusel: portadas del módulo Material TO. */
const COLLAGE_MATERIAL = [
  { src: "/material/estimulacion-cognitiva-1.webp", alt: "Material de estimulación cognitiva" },
  { src: "/material/actividades-1.webp", alt: "Cuaderno de actividades de terapia ocupacional" },
  { src: "/material/manual-ortesis.webp", alt: "Manual de ortesis" },
];

/* Verificaciones de la diapositiva de evaluaciones. */
const EVALUACIONES = [
  "SPM-2 Hogar y Escolar",
  "Perfil Sensorial 2",
  "Evaluación inicial por etapa vital",
];

/* Destello de cuatro puntas; en la nueva identidad va en tonos
   turquesa y celeste, muy discreto sobre el fondo blanco. */
function Chispa({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 1.5 14.3 9.7 22.5 12 14.3 14.3 12 22.5 9.7 14.3 1.5 12 9.7 9.7Z" />
    </svg>
  );
}

/* Diapositiva 1: portada con mensaje principal (fotograma fijo,
   sin video por ahora). */
function DiapositivaPortada() {
  return (
    <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 lg:grid-cols-[1.05fr_1fr] lg:gap-14 xl:gap-20">
      <figure className="relative mx-auto w-full min-w-0 max-w-xl">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-[0_36px_72px_-36px_rgba(48,87,98,0.45)] ring-1 ring-marca-100">
          <Image
            src="/videos/hero-superheroe.jpg"
            alt="Terapeuta ocupacional superheroína lista para acompañar a sus usuarios"
            fill
            sizes="(min-width: 1024px) 576px, 100vw"
            className="object-cover object-[53%_50%]"
            priority
          />
        </div>
        <Chispa className="absolute -right-3 -top-5 h-9 w-9 text-marca-300" />
        <Chispa className="absolute -bottom-4 -left-4 h-6 w-6 text-marca-200" />
      </figure>

      <div className="min-w-0 text-center lg:text-left">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-marca-700">
          Terapia ocupacional · Tera Ocupame
        </p>
        <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.1] tracking-tight text-marca-800 sm:text-5xl xl:text-[3.4rem]">
          <span className="block">Menos tiempo preparando.</span>
          <span className="mt-2 block">
            Más tiempo{" "}
            <span className="bg-gradient-to-r from-marca-600 to-marca-400 bg-clip-text text-transparent">
              transformando vidas
            </span>
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-marca-900/75 lg:mx-0">
          Descubre evaluaciones automatizadas, materiales descargables y cursos
          especializados para facilitar tu práctica profesional y acompañar cada proceso
          terapéutico.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
          <a
            href="/formularios"
            className="group inline-flex h-12 items-center gap-2 rounded-xl bg-marca-600 px-7 text-sm font-semibold text-white shadow-md shadow-marca-600/25 transition-colors hover:bg-marca-700"
          >
            Explorar recursos
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </a>
          <a
            href="#sobre"
            className="inline-flex h-12 items-center rounded-xl border border-marca-600 bg-white px-7 text-sm font-semibold text-marca-600 transition-colors hover:bg-marca-50"
          >
            Saber más
          </a>
        </div>
        <ul className="mt-8 flex flex-wrap justify-center gap-x-3 gap-y-2.5 lg:justify-start">
          {["Puntuación automática", "Descarga inmediata", "Material TO descargable"].map(
            (item) => (
              <li
                key={item}
                className="flex items-center gap-2 rounded-full bg-marca-50 py-1.5 pl-2 pr-4 text-[13px] font-semibold text-marca-800"
              >
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-marca-600 text-white"
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
            ),
          )}
        </ul>
      </div>
    </div>
  );
}

/* Diapositiva 2: collage con portadas del módulo Material TO. */
function DiapositivaMaterial() {
  return (
    <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 lg:grid-cols-2 lg:gap-14">
      <div className="min-w-0 text-center lg:text-left">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-marca-700">
          Material TO
        </p>
        <p className="mt-4 text-[1.9rem] font-extrabold leading-[1.14] tracking-tight text-marca-800 sm:text-4xl">
          Todo el material{" "}
          <span className="text-marca-600">listo para descargar</span>
        </p>
        <p className="mx-auto mt-5 max-w-lg text-[15px] leading-7 text-marca-900/75 lg:mx-0">
          Manuales, pautas, actividades y estrategias de terapia ocupacional para usar en la
          práctica diaria con tus usuarios.
        </p>
        <div className="mt-7 flex justify-center lg:justify-start">
          <Link
            href="/material"
            className="group inline-flex h-12 items-center gap-2 rounded-xl bg-marca-600 px-7 text-sm font-semibold text-white shadow-md shadow-marca-600/25 transition-colors hover:bg-marca-700"
          >
            Ver todo el material TO
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </div>

      <div className="relative mx-auto h-72 w-full max-w-md sm:h-80">
        {COLLAGE_MATERIAL.map((item, i) => (
          <div
            key={item.src}
            className={`absolute overflow-hidden rounded-[1.75rem] bg-white shadow-[0_30px_60px_-30px_rgba(48,87,98,0.4)] ring-1 ring-marca-100 ${
              ["left-0 top-8 w-40 -rotate-3 sm:w-48", "right-0 top-12 w-36 rotate-2 sm:w-44", "left-1/2 top-0 w-44 -translate-x-1/2 rotate-1 sm:w-52"][i]
            }`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={1200}
              height={920}
              sizes="(min-width: 1024px) 200px, 45vw"
              className="h-auto w-full"
            />
          </div>
        ))}
        <Chispa className="absolute -top-3 right-10 h-8 w-8 text-marca-300" />
        <Chispa className="absolute bottom-2 left-4 h-6 w-6 text-marca-200" />
      </div>
    </div>
  );
}

/* Diapositiva 3: evaluaciones con puntuación automática. */
function DiapositivaEvaluaciones() {
  return (
    <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 lg:grid-cols-2 lg:gap-14">
      <div className="min-w-0 text-center lg:text-left">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-marca-700">
          Evaluaciones automatizadas
        </p>
        <p className="mt-4 text-[1.9rem] font-extrabold leading-[1.14] tracking-tight text-marca-800 sm:text-4xl">
          Puntuación e informe{" "}
          <span className="text-marca-600">al instante</span>
        </p>
        <ul className="mx-auto mt-6 flex max-w-md flex-col items-start gap-2.5 text-left lg:mx-0">
          {EVALUACIONES.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2.5 rounded-full bg-marca-50 py-1.5 pl-2 pr-5 text-[13px] font-semibold text-marca-800"
            >
              <span
                aria-hidden="true"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-marca-600 text-white"
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
        <div className="mt-7 flex justify-center lg:justify-start">
          <Link
            href="/formularios"
            className="group inline-flex h-12 items-center gap-2 rounded-xl bg-marca-600 px-7 text-sm font-semibold text-white shadow-md shadow-marca-600/25 transition-colors hover:bg-marca-700"
          >
            Explorar evaluaciones
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-sm">
        <div className="rounded-[2rem] bg-white px-8 py-10 text-center shadow-[0_40px_80px_-40px_rgba(48,87,98,0.45)] ring-1 ring-marca-100">
          <p className="text-6xl font-extrabold uppercase tracking-tight text-marca-800">
            SPM-2
          </p>
          <span
            aria-hidden="true"
            className="mx-auto my-5 block h-1.5 w-14 rounded-full bg-gradient-to-r from-marca-600 to-marca-400"
          />
          <p className="text-2xl font-extrabold tracking-tight text-marca-600">
            Perfil Sensorial 2
          </p>
          <p className="mt-4 text-sm font-semibold text-marca-900/60">
            Puntaje T, percentil e informe PDF al instante
          </p>
        </div>
        <Chispa className="absolute -right-4 -top-5 h-9 w-9 text-marca-300" />
        <Chispa className="absolute -bottom-3 -left-3 h-6 w-6 text-marca-200" />
      </div>
    </div>
  );
}

const DIAPOSITIVAS = [
  { contenido: <DiapositivaPortada />, etiqueta: "Portada" },
  { contenido: <DiapositivaMaterial />, etiqueta: "Material TO" },
  { contenido: <DiapositivaEvaluaciones />, etiqueta: "Evaluaciones" },
];

const INTERVALO_MS = 6500;

/* Carrusel de la portada: banners a sangre completa sobre fondo
   blanco, con autoplay, flechas y puntos. */
export default function CarruselHero() {
  const [activo, setActivo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const toqueInicio = useRef(null);

  useEffect(() => {
    if (pausado) return;
    const id = setInterval(
      () => setActivo((i) => (i + 1) % DIAPOSITIVAS.length),
      INTERVALO_MS,
    );
    return () => clearInterval(id);
  }, [pausado, activo]);

  const mover = (delta) =>
    setActivo((i) => (i + delta + DIAPOSITIVAS.length) % DIAPOSITIVAS.length);

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label="Destacados de la portada"
      className="relative"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      onTouchStart={(e) => {
        toqueInicio.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (toqueInicio.current == null) return;
        const delta = toqueInicio.current - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 40) mover(delta > 0 ? 1 : -1);
        toqueInicio.current = null;
      }}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${activo * 100}%)` }}
        >
          {DIAPOSITIVAS.map((d, i) => (
            <div
              key={d.etiqueta}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${DIAPOSITIVAS.length}: ${d.etiqueta}`}
              aria-hidden={i !== activo}
              inert={i !== activo}
              className="grow-0 basis-full shrink-0 pb-16 pt-28 lg:pb-24 lg:pt-44"
            >
              {d.contenido}
            </div>
          ))}
        </div>
      </div>

      {/* Flechas laterales (escritorio) */}
      <button
        type="button"
        onClick={() => mover(-1)}
        aria-label="Diapositiva anterior"
        className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-marca-800 shadow-md ring-1 ring-marca-100 transition-colors hover:bg-marca-50 hover:text-marca-600 lg:flex"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => mover(1)}
        aria-label="Diapositiva siguiente"
        className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-marca-800 shadow-md ring-1 ring-marca-100 transition-colors hover:bg-marca-50 hover:text-marca-600 lg:flex"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      {/* Puntos */}
      <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
        {DIAPOSITIVAS.map((d, i) => (
          <button
            key={d.etiqueta}
            type="button"
            onClick={() => setActivo(i)}
            aria-label={`Ir a la diapositiva ${i + 1}: ${d.etiqueta}`}
            aria-current={i === activo}
            className={`h-2.5 rounded-full transition-all ${
              i === activo ? "w-7 bg-marca-600" : "w-2.5 bg-marca-200 hover:bg-marca-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
