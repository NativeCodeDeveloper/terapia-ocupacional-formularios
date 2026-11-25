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

/* Utilidades de la cinta superior, según el croquis del cliente. */
const UTILES = [
  { href: "/#genograma", label: "Tutoriales de uso" },
  { href: "/#sobre", label: "¿Qué es “¿Quién soy?”?" },
  { href: "#", label: "Ejemplos" },
  { href: "#redes", label: "Redes sociales" },
];

/* Menú principal con desplegables, según el croquis del cliente.
   El ítem destacado se representa como el botón principal del navbar. */
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

/* Cinta continua sobre celeste claro; se duplica el contenido para
   que el desplazamiento de 50% quede perfectamente enlazado. */
function Marquesina() {
  return (
    <div className="overflow-hidden py-1.5">
      <div className="animacion-marquesina flex w-max">
        {[0, 1].map((mitad) => (
          <div
            key={mitad}
            aria-hidden={mitad === 1}
            className="flex shrink-0 items-center whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.18em] text-marca-700"
          >
            {[0, 1, 2].map((r) => (
              <span key={r} className="flex items-center">
                {CINTA.map((frase) => (
                  <span key={frase} className="px-3">
                    {frase}
                  </span>
                ))}
                <span aria-hidden="true" className="px-3 text-marca-400">
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

  const cta = MENU.find((item) => item.destacado);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-marca-100/70 bg-white transition-shadow duration-300 ${
        conSombra ? "shadow-[0_12px_32px_-20px_rgba(38,50,56,0.28)]" : ""
      }`}
    >
      {/* Cinta de avisos y utilidades sobre la navegación */}
      <div className="flex items-stretch bg-marca-50">
        <div className="min-w-0 flex-1">
          <Marquesina />
        </div>
        <div className="hidden shrink-0 items-center gap-5 border-l border-marca-100/70 px-5 lg:flex xl:px-8">
          {UTILES.map((util) => (
            <a
              key={util.label}
              href={util.href}
              className="whitespace-nowrap text-[11px] font-semibold text-marca-800/70 transition-colors hover:text-marca-600"
            >
              {util.label}
            </a>
          ))}
        </div>
      </div>

      <nav
        aria-label="Navegación principal"
        className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5 lg:h-[72px] lg:px-0"
      >
        {/* Logo alineado a la izquierda */}
        <Link
          href="/#inicio"
          className="flex shrink-0 items-center lg:items-start lg:self-start lg:pt-0.5"
          aria-label="Tera Ocupame — ir al inicio"
          onClick={() => setAbierto(false)}
        >
          <Image
            src="/images/logo-teraocupame-superheroe.png"
            alt="Tera Ocupame"
            width={1234}
            height={1244}
            priority
            className="h-14 w-auto lg:h-[78px]"
          />
        </Link>

        {/* Menú principal con desplegables (escritorio) */}
        <ul className="hidden flex-1 items-center justify-center gap-6 lg:flex xl:gap-8">
          {MENU.filter((item) => !item.destacado).map((item) => {
            const activo = item.activoEn?.(ruta) ?? false;
            if (item.submenu) {
              return (
                <li key={item.label} className="group relative">
                  <button
                    type="button"
                    className={`flex items-center gap-1.5 whitespace-nowrap text-[13px] font-semibold transition-colors group-hover:text-marca-600 ${
                      activo ? "text-marca-600" : "text-marca-800"
                    }`}
                  >
                    {item.label}
                    <Chevron className="h-3.5 w-3.5 text-marca-azul-medio transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <div className="min-w-60 rounded-2xl border border-marca-100 bg-white p-2 shadow-[0_24px_50px_-24px_rgba(38,50,56,0.25)]">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          className="block rounded-xl px-4 py-2.5 text-[13px] font-medium text-marca-800 transition-colors hover:bg-marca-50 hover:text-marca-600"
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
                  className={`inline-flex items-center whitespace-nowrap text-[13px] font-semibold transition-colors hover:text-marca-600 ${
                    activo
                      ? "text-marca-600 underline decoration-marca-600 decoration-2 underline-offset-8"
                      : "text-marca-800"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Búsqueda, cuenta, carrito y acceso destacado a la derecha */}
        <div className="ml-auto flex shrink-0 items-center gap-1 lg:ml-0">
          {ACCIONES_CUENTA.map((accion) => (
            <a
              key={accion.etiqueta}
              href={accion.href}
              aria-label={accion.etiqueta}
              title={accion.etiqueta}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-marca-800/70 transition-colors hover:bg-marca-50 hover:text-marca-600 ${
                accion.etiqueta === "Buscar" ? "hidden lg:flex" : ""
              }`}
            >
              {accion.icono}
            </a>
          ))}
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-controls="menu-movil"
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-marca-800 transition-colors hover:bg-marca-50 lg:hidden"
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
          {cta && (
            <Link
              href={cta.href}
              className="ml-1 hidden h-10 items-center rounded-xl bg-marca-600 px-5 text-[13px] font-semibold text-white shadow-md shadow-marca-600/25 transition-colors hover:bg-marca-700 lg:inline-flex"
            >
              {cta.label}
            </Link>
          )}
        </div>
      </nav>

      {/* Menú móvil */}
      {abierto && (
        <div
          id="menu-movil"
          className="max-h-[calc(100svh-96px)] overflow-y-auto border-t border-marca-100/70 bg-white px-5 pb-6 pt-2 lg:hidden"
        >
          <ul className="flex flex-col">
            {MENU.map((item) =>
              item.submenu ? (
                <li key={item.label} className="border-b border-marca-100/70 py-2">
                  <p className="py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-marca-800/50">
                    {item.label}
                  </p>
                  <ul>
                    {item.submenu.map((sub) => (
                      <li key={sub.label}>
                        <Link
                          href={sub.href}
                          onClick={() => setAbierto(false)}
                          className="block rounded-xl px-3 py-2 text-sm font-medium text-marca-800 transition-colors hover:bg-marca-50 hover:text-marca-600"
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li
                  key={item.label}
                  className={item.destacado ? "py-3" : "border-b border-marca-100/70"}
                >
                  <Link
                    href={item.href}
                    onClick={() => setAbierto(false)}
                    className={
                      item.destacado
                        ? "flex w-full items-center justify-center rounded-xl bg-marca-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-marca-600/25 transition-colors hover:bg-marca-700"
                        : "block py-3 text-sm font-semibold text-marca-800 transition-colors hover:text-marca-600"
                    }
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
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-marca-800/60"
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
