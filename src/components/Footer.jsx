import Link from "next/link";
import Image from "next/image";

/* Pendiente: reemplazar teléfono y correo por los definitivos. */
const TELEFONO = "+56 9 1234 5678";
const TELEFONO_LINK = "tel:+56912345678";
const CORREO = "contacto@teraocupame.cl";

const REDES = [
  {
    nombre: "Instagram",
    href: "#",
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
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    nombre: "WhatsApp",
    href: "#",
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
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
    ),
  },
  {
    nombre: "Facebook",
    href: "#",
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
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    nombre: "LinkedIn",
    href: "#",
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
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
];

const RECURSOS = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/formularios", label: "Formularios disponibles" },
  { href: "/material", label: "Material TO" },
  { href: "/#sobre", label: "Sobre Tera Ocúpame" },
];

/* Footer del sitio: tinte verde agua suave con texto oscuro,
   siguiendo el patrón de las tiendas de referencia. */
export default function Footer() {
  return (
    <footer className="bg-teal-50 text-neutral-700">
      <div className="mx-auto max-w-6xl px-5 py-14 lg:px-0">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Marca y redes */}
          <div id="redes" className="scroll-mt-48">
            <Image
              src="/images/logo-teraocupame.png"
              alt="Tera Ocupame"
              width={620}
              height={295}
              className="h-16 w-auto"
            />
            <p className="mt-4 max-w-xs text-sm leading-6 text-neutral-600">
              Evaluaciones automatizadas, material descargable y recursos para
              acompañar cada proceso terapéutico.
            </p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-neutral-800">
              Síguenos
            </p>
            <div className="mt-3 flex gap-2">
              {REDES.map((red) => (
                <a
                  key={red.nombre}
                  href={red.href}
                  aria-label={red.nombre}
                  title={red.nombre}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-teal-600 shadow-sm transition-colors hover:bg-teal-500 hover:text-white"
                >
                  {red.icono}
                </a>
              ))}
            </div>
          </div>

          {/* Recursos */}
          <nav aria-label="Recursos del sitio">
            <p className="text-sm font-bold text-neutral-900">Recursos</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {RECURSOS.map((recurso) => (
                <li key={recurso.label}>
                  <Link
                    href={recurso.href}
                    className="transition-colors hover:text-teal-600"
                  >
                    {recurso.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contacto */}
          <div>
            <p className="text-sm font-bold text-neutral-900">Contacto</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={TELEFONO_LINK}
                  className="flex items-center gap-2.5 transition-colors hover:text-teal-600"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-teal-600"
                    aria-hidden="true"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {TELEFONO}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CORREO}`}
                  className="flex items-center gap-2.5 transition-colors hover:text-teal-600"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-teal-600"
                    aria-hidden="true"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  {CORREO}
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-neutral-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-teal-600"
                  aria-hidden="true"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Chile · atención en línea
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-neutral-900/10 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Teraocupame.cl — Instrumentos de evaluación en salud mental</p>
          <p>SPM-2 © Western Psychological Services · Uso profesional</p>
        </div>
      </div>
    </footer>
  );
}
