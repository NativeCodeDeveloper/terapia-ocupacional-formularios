"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

/* Pendiente: conectar con autenticación y carrito cuando existan. */
const ACCIONES_CUENTA = [
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

const LINKS = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#sobre", label: "Sobre Tera Ocúpame" },
  { href: "/formularios", label: "Programas" },
  { href: "/material", label: "Material TO" },
];

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
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        conSombra
          ? "border-b border-neutral-200/70 bg-white/90 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 lg:px-0"
      >
        <Link
          href="/#inicio"
          className="flex items-center"
          aria-label="Tera Ocupame — ir al inicio"
          onClick={() => setAbierto(false)}
        >
          <Image
            src="/images/logo-teraocupame.png"
            alt="Tera Ocupame"
            width={620}
            height={295}
            priority
            className="h-[52px] w-auto"
          />
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {LINKS.map((enlace) => {
            const activo =
              enlace.href === ruta ||
              (enlace.href === "/#inicio" && ruta === "/");
            return (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  aria-current={activo ? "page" : undefined}
                  className={`text-[12px] font-bold uppercase tracking-[0.14em] transition-colors hover:text-teal-700 ${
                    activo
                      ? "text-teal-700 underline decoration-teal-300 decoration-2 underline-offset-[6px]"
                      : "text-neutral-600"
                  }`}
                >
                  {enlace.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-1 md:flex">
            {ACCIONES_CUENTA.map((accion) => (
              <a
                key={accion.etiqueta}
                href={accion.href}
                aria-label={accion.etiqueta}
                title={accion.etiqueta}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                {accion.icono}
              </a>
            ))}
          </div>
          <Link
            href="/formularios"
            className="ml-2 hidden h-10 items-center rounded-xl bg-teal-600 px-5 text-[13px] font-semibold text-white shadow-lg shadow-teal-600/25 transition-colors hover:bg-teal-700 sm:inline-flex"
          >
            Explorar recursos
          </Link>
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-controls="menu-movil"
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-xl text-neutral-700 transition-colors hover:bg-neutral-100 lg:hidden"
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
              {abierto ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {abierto && (
        <div
          id="menu-movil"
          className="border-t border-neutral-200/70 bg-white px-5 pb-6 pt-3 lg:hidden"
        >
          <ul className="flex flex-col">
            {LINKS.map((enlace) => (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  onClick={() => setAbierto(false)}
                  className="block border-b border-neutral-100 py-3 text-sm font-bold uppercase tracking-[0.12em] text-neutral-700 transition-colors hover:text-teal-700"
                >
                  {enlace.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center gap-2">
            {ACCIONES_CUENTA.map((accion) => (
              <a
                key={accion.etiqueta}
                href={accion.href}
                aria-label={accion.etiqueta}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500"
              >
                {accion.icono}
              </a>
            ))}
            <Link
              href="/formularios"
              onClick={() => setAbierto(false)}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-teal-600 px-5 text-[13px] font-semibold text-white shadow-lg shadow-teal-600/25"
            >
              Explorar recursos
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
