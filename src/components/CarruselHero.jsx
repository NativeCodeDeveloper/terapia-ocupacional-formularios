"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import VideoPortada from "@/components/VideoPortada";

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

function IconoRayo({ className }) {
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
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

function IconoDocumento({ className }) {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v5h5" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

function IconoGrafico({ className }) {
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
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}

function IconoCasa({ className }) {
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
      <path d="m3 10.5 9-7.5 9 7.5" />
      <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
    </svg>
  );
}

/* Íconos de la diapositiva de portada: badge, botones, pilares y
   tarjetas flotantes junto al video del superhéroe. */
function IconoBrote({ className }) {
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
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </svg>
  );
}

function IconoCohete({ className }) {
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
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function IconoPlay({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M7 4.8a1 1 0 0 1 1.53-.85l11.2 7.2a1 1 0 0 1 0 1.7l-11.2 7.2A1 1 0 0 1 7 19.2z" />
    </svg>
  );
}

function IconoCalendario({ className }) {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  );
}

function IconoRed({ className }) {
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
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4" />
      <path d="m15.4 6.5-6.8 4" />
    </svg>
  );
}

function IconoCapas({ className }) {
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
      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.75l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.75Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  );
}

function IconoGraduacion({ className }) {
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
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </svg>
  );
}

function IconoPortapapeles({ className }) {
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
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h.01" />
      <path d="M12 12h5" />
      <path d="M9 16h.01" />
      <path d="M12 16h5" />
    </svg>
  );
}

function IconoLibros({ className }) {
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
      <path d="m16 6 4 14" />
      <path d="M12 6v14" />
      <path d="M8 8v12" />
      <path d="M4 4v16" />
    </svg>
  );
}

function IconoLaptop({ className }) {
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
      <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9" />
      <path d="M2 19h20" />
      <path d="M8 12v-1.5" />
      <path d="M12 12V9" />
      <path d="M16 12v-2.5" />
    </svg>
  );
}

/* Sellos bajo el titular de la diapositiva Material TO. */
const SELLOS_MATERIAL = [
  { Icono: IconoDescarga, lineas: ["Recursos", "listos para usar"] },
  { Icono: IconoEscudo, lineas: ["Material", "validado"] },
  { Icono: IconoUsuarios, lineas: ["Para niños,", "jóvenes y adultos"] },
];

/* Pilares del titular de portada, con divisores finos como en el
   diseño de referencia del cliente. */
const PILARES = [
  { Icono: IconoCalendario, lineas: ["Evaluaciones", "automatizadas"] },
  { Icono: IconoRed, lineas: ["Genograma", "digital"] },
  { Icono: IconoCapas, lineas: ["Material", "especializado"] },
  { Icono: IconoGraduacion, lineas: ["Cursos y", "formación"] },
];

function Pilares() {
  return (
    <ul className="mx-auto mt-9 flex max-w-md flex-wrap items-center justify-center gap-y-4 text-left lg:mx-0 lg:max-w-none lg:justify-start lg:divide-x lg:divide-marca-100">
      {PILARES.map(({ Icono, lineas }) => (
        <li key={lineas[0]} className="flex items-center gap-2.5 px-3.5 first:pl-0 last:pr-0">
          <Icono className="h-6 w-6 shrink-0 text-marca-600" />
          <span className="text-[12px] font-semibold leading-[1.3] text-marca-800">
            {lineas[0]}
            <span className="block">{lineas[1]}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/* Sellos bajo el titular de la diapositiva de evaluaciones. */
const SELLOS_EVALUACIONES = [
  { Icono: IconoRayo, lineas: ["Tabulación automática", "en 1 segundo"] },
  { Icono: IconoDocumento, lineas: ["Informe PDF y Word", "al instante"] },
  { Icono: IconoGrafico, lineas: ["Resultados", "confiables"] },
];

/* Fila de sellos con ícono y divisores, compartida por las
   diapositivas de Material TO y Evaluaciones. */
function Sellos({ items }) {
  return (
    <ul className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-y-4 text-left lg:mx-0 lg:max-w-none lg:justify-start lg:divide-x lg:divide-marca-100">
      {items.map(({ Icono, lineas }) => (
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
  );
}

/* Palabra en verde con subrayado curvo, como en el diseño de
   referencia del cliente. */
function PalabraSubrayada({ children }) {
  return (
    <span className="relative inline-block whitespace-nowrap text-marca-600">
      {children}
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
  );
}

/* Ráfaga de tres trazos sobre las composiciones ilustradas. */
function Rafaga({ className }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 56 30"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      className={className}
    >
      <path d="M6 26 10 14" strokeWidth="5" />
      <path d="M24 22 26 8" strokeWidth="5" />
      <path d="M42 24 50 14" strokeWidth="5" />
    </svg>
  );
}

/* Diapositiva 1: portada con el mensaje principal a la izquierda y el
   video del superhéroe a la derecha, sobre una mancha celeste con
   tarjetas de íconos flotantes, según el diseño de referencia. */
function DiapositivaPortada() {
  return (
    <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
      <div className="min-w-0 text-center lg:text-left">
        <span className="inline-flex items-center gap-2 rounded-full bg-marca-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-marca-700 ring-1 ring-marca-100">
          <IconoBrote className="h-4 w-4" />
          Tecnología para terapeutas ocupacionales
        </span>
        <h1 className="mt-5 text-[2rem] font-extrabold leading-[1.08] tracking-tight text-marca-800 sm:text-[2.6rem] xl:text-[3.1rem]">
          <span className="block">Tu superpoder es</span>
          <span className="block">transformar vidas.</span>
          <span className="mt-2 block text-marca-600">
            Nosotros simplificamos <PalabraSubrayada>tu trabajo</PalabraSubrayada>.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-[15px] leading-7 text-marca-900/75 lg:mx-0">
          Descubre herramientas digitales, evaluaciones automatizadas y
          recursos diseñados para potenciar tu práctica profesional.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
          <a
            href="/formularios"
            className="group inline-flex h-12 items-center gap-2 rounded-xl bg-marca-600 px-6 text-sm font-semibold text-white shadow-md shadow-marca-600/25 transition-colors hover:bg-marca-700"
          >
            <IconoCohete className="h-[18px] w-[18px]" />
            Explorar herramientas
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </a>
          <a
            href="#sobre"
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-marca-600 bg-white px-6 text-sm font-semibold text-marca-600 transition-colors hover:bg-marca-50"
          >
            <IconoPlay className="h-3.5 w-3.5" />
            Conocer más
          </a>
        </div>

        <Pilares />
      </div>

      {/* Video del superhéroe: el fondo blanco se funde con la mancha
          celeste vía mix-blend-multiply; las tarjetas flotan por encima. */}
      <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-none">
        <div
          aria-hidden="true"
          className="absolute left-[6%] top-[2%] h-[94%] w-[74%] rounded-[62%_38%_56%_44%/48%_60%_40%_52%] bg-gradient-to-br from-marca-100 via-marca-50 to-marca-100/70"
        />

        <VideoPortada className="relative z-10 w-full mix-blend-multiply" />

        <Rafaga className="absolute left-[46%] top-1 z-20 h-6 w-11 text-marca-400" />

        {/* Tarjetas flotantes con íconos */}
        <span className="absolute left-[1%] top-[8%] z-20 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0_16px_32px_-18px_rgba(48,87,98,0.45)] ring-1 ring-marca-100 sm:h-14 sm:w-14">
          <IconoPortapapeles className="h-5 w-5 text-marca-600 sm:h-6 sm:w-6" />
        </span>
        <span className="absolute right-[4%] top-[2%] z-20 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0_16px_32px_-18px_rgba(48,87,98,0.45)] ring-1 ring-marca-100 sm:h-14 sm:w-14">
          <IconoRed className="h-5 w-5 text-marca-600 sm:h-6 sm:w-6" />
        </span>
        <span className="absolute -left-2 top-[52%] z-20 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0_16px_32px_-18px_rgba(48,87,98,0.45)] ring-1 ring-marca-100 sm:h-14 sm:w-14 lg:-left-4">
          <IconoLaptop className="h-5 w-5 text-marca-600 sm:h-6 sm:w-6" />
        </span>
        <span className="absolute -right-2 top-[58%] z-20 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0_16px_32px_-18px_rgba(48,87,98,0.45)] ring-1 ring-marca-100 sm:h-14 sm:w-14 lg:-right-4">
          <IconoLibros className="h-5 w-5 text-marca-600 sm:h-6 sm:w-6" />
        </span>
      </div>
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
          <PalabraSubrayada>usar</PalabraSubrayada>
        </p>
        <p className="mx-auto mt-5 max-w-lg text-[15px] leading-7 text-marca-900/75 lg:mx-0">
          Manuales, pautas, actividades y estrategias de terapia ocupacional
          para la práctica diaria con tus usuarios.
        </p>

        <Sellos items={SELLOS_MATERIAL} />

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
        <Rafaga className="absolute left-[12%] top-0 h-5 w-9 text-marca-400" />

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

/* Diapositiva 3: evaluaciones con puntuación automática, según el
   diseño de referencia del cliente. */
function DiapositivaEvaluaciones() {
  return (
    <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-10">
      <div className="min-w-0 text-center lg:text-left">
        <span className="inline-flex items-center rounded-full bg-marca-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-marca-700 ring-1 ring-marca-100">
          Evaluaciones automatizadas
        </span>
        <p className="mt-5 text-[1.9rem] font-extrabold leading-[1.14] tracking-tight text-marca-800 sm:text-[2.6rem]">
          <span className="block">Puntuación e informe</span>
          <span className="block">
            al <PalabraSubrayada>instante</PalabraSubrayada>
          </span>
        </p>
        <p className="mx-auto mt-5 max-w-lg text-[15px] leading-7 text-marca-900/75 lg:mx-0">
          Envía el enlace al usuario para que lo responda por WhatsApp y, en un
          segundo, tienes el informe en Word y PDF en tu correo. Sin Excel ni
          tabulación manual.
        </p>

        <Sellos items={SELLOS_EVALUACIONES} />

        <div className="mt-9 flex justify-center lg:justify-start">
          <Link
            href="/formularios"
            className="group inline-flex h-12 items-center gap-2 rounded-xl bg-marca-600 px-6 text-sm font-semibold text-white shadow-md shadow-marca-600/25 transition-colors hover:bg-marca-700"
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

      {/* Perfil Sensorial 2 al centro, flanqueado por SPM-2 Hogar y
          SPM-2 Escolar */}
      <div className="relative mx-auto h-72 w-full max-w-md sm:h-[21rem] lg:h-[24rem] lg:max-w-none">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-4 bottom-6 rounded-[58%_42%_48%_52%/52%_56%_44%_48%] bg-gradient-to-br from-marca-100/70 via-marca-200/40 to-marca-100/80"
        />

        {/* SPM-2 Hogar (izquierda) */}
        <div className="absolute left-0 top-[20%] z-10 w-[34%] -rotate-6 rounded-3xl bg-white py-4 pl-4 pr-7 text-center shadow-[0_30px_60px_-30px_rgba(48,87,98,0.35)] ring-1 ring-marca-100 sm:py-5 sm:pl-5 sm:pr-10">
          <IconoCasa className="mx-auto h-8 w-8 text-marca-600" />
          <p className="mt-2 text-lg font-extrabold tracking-tight text-marca-800">
            SPM-2
          </p>
          <p className="text-[13px] font-semibold text-marca-600">
            Hogar
          </p>
          <div aria-hidden="true" className="mx-auto mt-3 w-4/5 space-y-1.5">
            <div className="h-1.5 rounded-full bg-neutral-200" />
            <div className="h-1.5 rounded-full bg-neutral-200/80" />
            <div className="h-1.5 w-2/3 rounded-full bg-neutral-200/60" />
          </div>
        </div>

        {/* SPM-2 Escolar (derecha) */}
        <div className="absolute right-0 top-[28%] z-10 w-[34%] rotate-6 rounded-3xl bg-white py-4 pl-7 pr-4 text-center shadow-[0_30px_60px_-30px_rgba(48,87,98,0.35)] ring-1 ring-marca-100 sm:py-5 sm:pl-10 sm:pr-5">
          <IconoGraduacion className="mx-auto h-8 w-8 text-marca-600" />
          <p className="mt-2 text-lg font-extrabold tracking-tight text-marca-800">
            SPM-2
          </p>
          <p className="text-[13px] font-semibold text-marca-600">
            Escolar
          </p>
          <div aria-hidden="true" className="mx-auto mt-3 w-4/5 space-y-1.5">
            <div className="h-1.5 rounded-full bg-neutral-200" />
            <div className="h-1.5 rounded-full bg-neutral-200/80" />
            <div className="h-1.5 w-2/3 rounded-full bg-neutral-200/60" />
          </div>
        </div>

        {/* Tarjeta principal con el resultado */}
        <div className="absolute left-1/2 top-1/2 z-20 w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] bg-gradient-to-b from-white to-marca-50 p-5 text-left shadow-[0_40px_80px_-40px_rgba(48,87,98,0.45)] ring-1 ring-marca-100 sm:p-6">
          <p className="text-[1.7rem] font-extrabold leading-[1.1] tracking-tight text-marca-800 sm:text-4xl">
            Perfil Sensorial 2
          </p>
          <p className="mt-1 text-base font-bold tracking-tight text-marca-600 sm:text-lg">
            Hogar y Escolar
          </p>
          <ul className="mt-4 space-y-2.5 sm:space-y-3">
            {[
              "Informe PDF y Word al instante",
              "Tabla de resultados",
              "Descripción de cada ítem",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[13px] font-semibold leading-snug text-marca-800"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-marca-600 text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-2.5 w-2.5"
                  >
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>

          {/* Sello SIN EXCEL */}
          <span className="absolute -left-2 -top-3 z-10 -rotate-6 rounded-full bg-marca-600 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white shadow-md shadow-marca-600/30 sm:-left-4 sm:text-[11px]">
            Sin Excel
          </span>

          {/* Documento Word */}
          <div
            aria-hidden="true"
            className="absolute -left-3 bottom-12 h-16 w-12 -rotate-6 sm:-left-4"
          >
            <div className="absolute inset-0 rounded-lg bg-white shadow-md ring-1 ring-marca-100">
              <div className="absolute right-0 top-0 h-3 w-3 bg-marca-50 [clip-path:polygon(0_0,100%_0,100%_100%)]" />
              <div className="absolute right-0 top-0 h-3 w-3 bg-marca-100 [clip-path:polygon(0_0,100%_100%,0_100%)]" />
              <div className="space-y-1 px-2 pt-2.5">
                <div className="h-1 rounded-full bg-neutral-200" />
                <div className="h-1 rounded-full bg-neutral-200" />
                <div className="h-1 w-2/3 rounded-full bg-neutral-200/80" />
              </div>
              <span className="absolute bottom-1.5 left-1.5 rounded-[4px] bg-[#2b579a] px-1 py-0.5 text-[8px] font-bold tracking-wide text-white">
                WORD
              </span>
            </div>
          </div>

          {/* Documento PDF */}
          <div
            aria-hidden="true"
            className="absolute -right-2 bottom-10 h-20 w-16 rotate-3 sm:-right-3"
          >
            <div className="absolute inset-0 rounded-lg bg-white shadow-md ring-1 ring-marca-100">
              <div className="absolute right-0 top-0 h-4 w-4 bg-marca-50 [clip-path:polygon(0_0,100%_0,100%_100%)]" />
              <div className="absolute right-0 top-0 h-4 w-4 bg-marca-100 [clip-path:polygon(0_0,100%_100%,0_100%)]" />
              <div className="space-y-1.5 px-2.5 pt-3">
                <div className="h-1 rounded-full bg-neutral-200" />
                <div className="h-1 rounded-full bg-neutral-200" />
                <div className="h-1 w-2/3 rounded-full bg-neutral-200/80" />
              </div>
              <span className="absolute bottom-2 left-2 rounded-[4px] bg-red-500 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white">
                PDF
              </span>
            </div>
          </div>
        </div>

        {/* Ráfaga superior derecha */}
        <Rafaga className="absolute right-[4%] top-0 h-6 w-11 text-marca-400" />
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
