"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* Pendiente: devolver el video de portada cuando el cliente lo
   confirme; por ahora la diapositiva usa un fotograma fijo. */

/* Íconos de los sellos de la diapositiva Material TO. */
function IconoDescarga({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function IconoEscudo({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1 1 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconoUsuarios({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
      <path d="M16 3.1a4 4 0 0 1 0 7.8" />
    </svg>
  );
}

/* Sellos bajo el titular de la diapositiva Material TO. */
const SELLOS_MATERIAL = [
  { Icono: IconoDescarga, lineas: ["Recursos", "listos para usar"] },
  { Icono: IconoEscudo, lineas: ["Material", "validado"] },
  { Icono: IconoUsuarios, lineas: ["Para niños,", "jóvenes y adultos"] },
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

/* Diapositiva 1: portada con el mensaje principal centrado.
   Pendiente: devolver el video de portada cuando el cliente lo
   confirme; por ahora la diapositiva va sin imagen. */
function DiapositivaPortada() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 text-center">
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
      <p className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-marca-900/75">
        Descubre evaluaciones automatizadas, materiales descargables y cursos
        especializados para facilitar tu práctica profesional y acompañar cada
        proceso terapéutico.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href="/formularios"
          className="group inline-flex h-12 items-center gap-2 rounded-xl bg-marca-600 px-7 text-sm font-semibold text-white shadow-md shadow-marca-600/25 transition-colors hover:bg-marca-700"
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
          className="inline-flex h-12 items-center rounded-xl border border-marca-600 bg-white px-7 text-sm font-semibold text-marca-600 transition-colors hover:bg-marca-50"
        >
          Saber más
        </a>
      </div>
      <ul className="mt-8 flex flex-wrap justify-center gap-x-3 gap-y-2.5">
        {[
          "Puntuación automática",
          "Descarga inmediata",
          "Material TO descargable",
        ].map((item) => (
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
        ))}
      </ul>
    </div>
  );
}

/* Diapositiva 2: módulo Material TO con sellos y portadas sobre
   un podio, según el diseño de referencia del cliente. */
function DiapositivaMaterial() {
  return (
    <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-10">
      <div className="min-w-0 text-center lg:text-left">
        <span className="inline-flex items-center rounded-full bg-marca-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-marca-700 ring-1 ring-marca-100">
          Material TO
        </span>
        <p className="mt-5 text-[1.9rem] font-extrabold leading-[1.14] tracking-tight text-marca-800 sm:text-[2.6rem]">
          Todo el material listo para{" "}
          <span className="whitespace-nowrap text-marca-600">descargar y</span>{" "}
          <span className="relative inline-block whitespace-nowrap text-marca-600">
            usar
            <svg
              viewBox="0 0 100 14"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute -bottom-1.5 left-0 h-2.5 w-full text-marca-500"
            >
              <path
                d="M6 10C36 4 66 3 94 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </p>
        <p className="mx-auto mt-5 max-w-lg text-[15px] leading-7 text-marca-900/75 lg:mx-0">
          Manuales, pautas, actividades y estrategias de terapia ocupacional
          para la práctica diaria con tus usuarios.
        </p>

        <ul className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-y-4 text-left lg:mx-0 lg:max-w-none lg:justify-start lg:divide-x lg:divide-marca-100">
          {SELLOS_MATERIAL.map(({ Icono, lineas }) => (
            <li
              key={lineas[0]}
              className="flex items-center gap-3 px-4 first:pl-0 last:pr-0"
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-marca-50 text-marca-600 ring-1 ring-marca-100"
              >
                <Icono className="h-5 w-5" />
              </span>
              <span className="text-[13px] font-semibold leading-[1.3] text-marca-800">
                {lineas[0]}
                <span className="block">{lineas[1]}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-9 flex justify-center lg:justify-start">
          <Link
            href="/material"
            className="group inline-flex h-12 items-center gap-2.5 rounded-xl bg-marca-600 px-6 text-sm font-semibold text-white shadow-md shadow-marca-600/25 transition-colors hover:bg-marca-700"
          >
            <IconoDescarga className="h-[18px] w-[18px]" />
            Ver todo el material TO
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>
      </div>

      {/* Portadas de pie sobre un podio, con mancha de fondo */}
      <div className="relative mx-auto h-72 w-full max-w-md sm:h-[21rem] lg:h-[24rem] lg:max-w-none">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-2 bottom-8 rounded-[62%_38%_56%_44%/48%_60%_40%_52%] bg-gradient-to-br from-marca-50 via-marca-100/60 to-marca-100/80"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 h-12 w-[86%] -translate-x-1/2 rounded-[50%] bg-gradient-to-b from-marca-100 to-marca-200/50 sm:h-14"
        />
        <Image
          src="/material/estimulacion-cognitiva-1.webp"
          alt="Material de estimulación cognitiva"
          width={1200}
          height={920}
          sizes="(min-width: 1024px) 260px, 48vw"
          className="absolute bottom-4 left-[7%] z-10 w-[48%] lg:w-[52%]"
        />
        <Image
          src="/material/manual-ortesis.webp"
          alt="Manual de ortesis"
          width={1200}
          height={920}
          sizes="(min-width: 1024px) 340px, 60vw"
          className="absolute bottom-[1.15rem] left-1/2 z-20 w-[58%] -translate-x-1/2 lg:w-[64%]"
        />
        <Image
          src="/material/actividades-1.webp"
          alt="Cuaderno de actividades de terapia ocupacional"
          width={1200}
          height={920}
          sizes="(min-width: 1024px) 260px, 48vw"
          className="absolute bottom-4 right-[7%] z-10 w-[48%] lg:w-[52%]"
        />

        {/* Ráfaga superior izquierda */}
        <svg
          aria-hidden="true"
          viewBox="0 0 56 30"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          className="absolute left-[12%] top-0 h-5 w-9 text-marca-400"
        >
          <path d="M6 26 10 14" strokeWidth="5" />
          <path d="M24 22 26 8" strokeWidth="5" />
          <path d="M42 24 50 14" strokeWidth="5" />
        </svg>

        {/* Ícono de descarga superior derecha */}
        <span
          aria-hidden="true"
          className="absolute right-[6%] top-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-marca-400 to-marca-600 text-white shadow-lg shadow-marca-600/25 sm:h-14 sm:w-14"
        >
          <IconoDescarga className="h-6 w-6" />
        </span>
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
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            >
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
              i === activo
                ? "w-7 bg-marca-600"
                : "w-2.5 bg-marca-200 hover:bg-marca-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
