"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

/* Pendiente: conectar con autenticación, buscador y carrito cuando
   existan. */
const ACCIONES_CUENTA = [
  {
    href: "#",
    etiqueta: "Buscar",
    icono: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    href: "#",
    etiqueta: "Iniciar sesión",
    icono: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: "#",
    etiqueta: "Carrito de compras",
    icono: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
];

/* Fila de utilidades sobre el logo, según el croquis del cliente. */
const UTILES = [
  { href: "/#genograma", label: "Tutoriales de uso" },
  { href: "/#sobre", label: "¿Qué es “¿Quién soy?”?" },
  { href: "#", label: "Ejemplos" },
  { href: "#redes", label: "Redes sociales" },
];

/* Menú principal con desplegables, según el croquis del cliente. */
const MENU = [
  { label: "Inicio", href: "/", activoEn: (ruta) => ruta === "/" },
  {
    label: "Automatizaciones",
    submenu: [
      { label: "SPM-2 Hogar", href: "/formularios" },
      { label: "SPM-2 Escolar", href: "/formularios" },
      { label: "Perfil Sensorial 2", href: "/formularios" },
    ],
  },
  {
    label: "Evaluaciones automatizadas",
    submenu: [
      { label: "Evaluación infantil", href: "/formulario16" },
      { label: "Evaluación adolescente", href: "/formulario17" },
      { label: "Evaluación adulto", href: "/formulario18" },
      { label: "Evaluación persona mayor", href: "/formulario19" },
    ],
    activoEn: (ruta) => ruta.startsWith("/formulario"),
  },
  { label: "Genograma", href: "/#genograma" },
  { label: "Material TO", href: "/material", activoEn: (ruta) => ruta === "/material" },
  {
    label: "Cursos",
    submenu: [{ label: "SPM-2", href: "#" }],
  },
  { label: "Recursos Gratis", href: "#", destacado: true },
];

/* Frases de la cinta superior de Black Friday. */
const CINTA = ["Black Friday", "10% dscto", "en todo el sitio"];

function Chevron({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/* Cinta continua en verde agua; se duplica el contenido para que el
   desplazamiento de 50% quede perfectamente enlazado. */
function Marquesina() {
  return (
    <div className="overflow-hidden bg-teal-500 py-1.5 text-white">
      <div className="animacion-marquesina flex w-max">
        {[0, 1].map((mitad) => (
          <div
            key={mitad}
            aria-hidden={mitad === 1}
            className="flex shrink-0 items-center whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.18em]"
          >
            {[0, 1, 2].map((r) => (
              <span key={r} className="flex items-center">
                {CINTA.map((frase) => (
                  <span key={frase} className="px-3">
                    {frase}
                  </span>
                ))}
                <span aria-hidden="true" className="px-3 text-teal-100">
                  ✦
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const [conSombra, setConSombra] = useState(false);
  const ruta = usePathname();

  useEffect(() => {
    const alDesplazar = () => setConSombra(window.scrollY > 8);
    alDesplazar();
    window.addEventListener("scroll", alDesplazar, { passive: true });
    return () => window.removeEventListener("scroll", alDesplazar);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-white transition-shadow duration-300 ${
        conSombra ? "shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)]" : ""
      }`}
    >
      <Marquesina />

      {/* Utilidades sobre el logo (solo escritorio) */}
      <div className="hidden border-b border-neutral-100 lg:block">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-6 px-5 py-1.5 lg:px-0">
          {UTILES.map((util) => (
            <a
              key={util.label}
              href={util.href}
              className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 transition-colors hover:text-teal-600"
            >
              {util.label}
            </a>
          ))}
        </div>
      </div>

      <nav
        aria-label="Navegación principal"
        className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 lg:h-14 lg:px-0"
      >
        {/* Menú móvil a la izquierda; buscador a la izquierda en escritorio */}
        <div className="flex flex-1 items-center gap-1">
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-controls="menu-movil"
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-700 transition-colors hover:bg-teal-50 lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              {abierto ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
          {ACCIONES_CUENTA.filter((a) => a.etiqueta === "Buscar").map((accion) => (
            <a
              key={accion.etiqueta}
              href={accion.href}
              aria-label={accion.etiqueta}
              title={accion.etiqueta}
              className="hidden h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition-colors hover:bg-teal-50 hover:text-neutral-900 lg:flex"
            >
              {accion.icono}
            </a>
          ))}
        </div>

        {/* Logo centrado, como en la referencia */}
        <Link
          href="/#inicio"
          className="flex shrink-0 items-center"
          aria-label="Tera Ocupame — ir al inicio"
          onClick={() => setAbierto(false)}
        >
          <Image
            src="/images/logo-teraocupame.png"
            alt="Tera Ocupame"
            width={620}
            height={295}
            priority
            className="h-11 w-auto lg:h-12"
          />
        </Link>

        {/* Cuenta y carrito a la derecha */}
        <div className="flex flex-1 items-center justify-end gap-1">
          {ACCIONES_CUENTA.filter((a) => a.etiqueta !== "Buscar").map((accion) => (
            <a
              key={accion.etiqueta}
              href={accion.href}
              aria-label={accion.etiqueta}
              title={accion.etiqueta}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition-colors hover:bg-teal-50 hover:text-neutral-900"
            >
              {accion.icono}
            </a>
          ))}
        </div>
      </nav>

      {/* Menú principal con desplegables (escritorio) */}
      <nav
        aria-label="Secciones"
        className="hidden border-t border-neutral-100 lg:block"
      >
        <ul className="mx-auto flex max-w-6xl items-center justify-center gap-7 px-5 lg:px-0">
          {MENU.map((item) => {
            const activo = item.activoEn?.(ruta) ?? false;
            if (item.submenu) {
              return (
                <li key={item.label} className="group relative">
                  <button
                    type="button"
                    className={`flex items-center gap-1.5 py-3 text-[12px] font-bold uppercase tracking-[0.14em] transition-colors group-hover:text-teal-600 ${
                      activo ? "text-teal-700" : "text-neutral-800"
                    }`}
                  >
                    {item.label}
                    <Chevron className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-1 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <div className="min-w-60 rounded-2xl border border-neutral-100 bg-white p-2 shadow-[0_24px_50px_-24px_rgba(15,23,42,0.3)]">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          className="block rounded-xl px-4 py-2.5 text-[13px] font-semibold text-neutral-700 transition-colors hover:bg-teal-50 hover:text-teal-700"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </li>
              );
            }
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={activo ? "page" : undefined}
                  className={`inline-flex items-center py-3 text-[12px] font-bold uppercase tracking-[0.14em] transition-colors hover:text-teal-600 ${
                    item.destacado
                      ? "rounded-full bg-teal-500 px-4 text-white shadow-md shadow-teal-500/30 hover:text-white"
                      : activo
                        ? "text-teal-700 underline decoration-teal-400 decoration-2 underline-offset-[6px]"
                        : "text-neutral-800"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Menú móvil */}
      {abierto && (
        <div
          id="menu-movil"
          className="max-h-[calc(100svh-96px)] overflow-y-auto border-t border-neutral-100 bg-white px-5 pb-6 pt-2 lg:hidden"
        >
          <ul className="flex flex-col">
            {MENU.map((item) =>
              item.submenu ? (
                <li key={item.label} className="border-b border-neutral-100 py-2">
                  <p className="py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                    {item.label}
                  </p>
                  <ul>
                    {item.submenu.map((sub) => (
                      <li key={sub.label}>
                        <Link
                          href={sub.href}
                          onClick={() => setAbierto(false)}
                          className="block rounded-xl px-3 py-2 text-[13px] font-semibold text-neutral-700 transition-colors hover:bg-teal-50 hover:text-teal-700"
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={item.label} className="border-b border-neutral-100">
                  <Link
                    href={item.href}
                    onClick={() => setAbierto(false)}
                    className={`block py-3 text-[13px] font-bold uppercase tracking-[0.12em] transition-colors hover:text-teal-700 ${
                      item.destacado ? "text-teal-600" : "text-neutral-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {UTILES.map((util) => (
              <a
                key={util.label}
                href={util.href}
                onClick={() => setAbierto(false)}
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500"
              >
                {util.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
