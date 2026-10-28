import Link from "next/link";

const FORMULARIOS = [
  {
    href: "/formulario1",
    instrumento: "SPM-2 HOGAR",
    titulo: "Niños 2 - 5 años",
    descripcion: "Responde el padre, madre o cuidador sobre la conducta del niño.",
    informes: "PDF y Word",
  },
  {
    href: "/formulario7",
    instrumento: "SPM-2 ESCOLAR",
    titulo: "Preescolar 2 - 5 años",
    descripcion: "Responde el educador o la educadora de preescolar o guardería sobre la conducta del niño.",
    informes: "PDF y Word",
  },
  {
    href: "/formulario2",
    instrumento: "SPM-2 HOGAR",
    titulo: "Niños 5 - 12 años",
    descripcion: "Responde el padre, madre o cuidador sobre la conducta del niño.",
    informes: "PDF",
  },
  {
    href: "/formulario3",
    instrumento: "SPM-2 HOGAR",
    titulo: "Adolescente 12 - 21",
    descripcion: "Responde un evaluador o cuidador sobre el usuario.",
    informes: "PDF",
  },
  {
    href: "/formulario4",
    instrumento: "SPM-2 AUTOINFORME",
    titulo: "Adolescente 12 - 21",
    descripcion: "Lo responde el propio adolescente.",
    informes: "PDF y Word",
  },
  {
    href: "/formulario5",
    instrumento: "SPM-2",
    titulo: "Adulto (Evaluador) 21 - 87",
    descripcion: "Responde un evaluador o cuidador sobre el usuario.",
    informes: "PDF",
  },
  {
    href: "/formulario6",
    instrumento: "SPM-2",
    titulo: "Adulto (Autoinforme) 21 - 87",
    descripcion: "Lo responde el propio adulto.",
    informes: "PDF",
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

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)] text-neutral-900">
      <header className="sticky top-0 z-20 border-b border-neutral-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 lg:px-0">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-[15px] font-bold text-white"
            >
              T
            </span>
            <div>
              <p className="text-[15px] font-bold leading-4 tracking-tight">
                Teraocupame<span className="text-indigo-600">.cl</span>
              </p>
              <p className="text-[11px] leading-4 text-neutral-500">
                Instrumentos de evaluación en salud mental
              </p>
            </div>
          </div>
          <a
            href="#formularios"
            className="hidden h-9 items-center rounded-xl bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 sm:inline-flex"
          >
            Ver formularios
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 lg:px-0">
        {/* Portada */}
        <section className="border-b border-neutral-100 py-14 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
            Perfil Sensorial 2 · SPM-2
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Formularios e informes del SPM-2, listos para aplicar.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-neutral-600">
            Completar en línea los formularios oficiales del Perfil Sensorial 2 con puntuación
            automática según las tablas normativas y descarga inmediata del informe para la ficha
            clínica.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#formularios"
              className="inline-flex h-11 items-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Comenzar ahora
            </a>
            <p className="text-[13px] text-neutral-500">
              7 formularios · 80 preguntas cada uno · Escala Nunca a Siempre
            </p>
          </div>
        </section>

        {/* Formularios disponibles */}
        <section id="formularios" aria-labelledby="titulo-formularios" className="scroll-mt-24 py-12 sm:py-16">
          <div className="mb-8">
            <h2 id="titulo-formularios" className="text-2xl font-bold tracking-tight">
              SPM-2 · Formularios disponibles
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
              Selecciona el formulario que necesitas completar. Al terminar podrás revisar un
              resumen y descargar el informe con la puntuación interpretada.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FORMULARIOS.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-[0_16px_40px_-20px_rgba(79,70,229,0.35)]"
              >
                <span className="w-fit rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  {f.instrumento}
                </span>
                <span className="mt-3 text-[15px] font-bold tracking-tight">{f.titulo}</span>
                <span className="mt-1 text-[13px] leading-5 text-neutral-600">
                  {f.descripcion}
                </span>
                <span className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-400">
                  <span>80 preguntas · Informe {f.informes}</span>
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Cómo se puntúa */}
        <section aria-labelledby="titulo-puntuacion" className="scroll-mt-24 pb-16 sm:pb-20">
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
      </main>

      <footer className="border-t border-neutral-200/80 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 text-xs text-neutral-400 lg:px-0">
          <p>© 2026 Teraocupame.cl — Instrumentos de evaluación en salud mental</p>
          <p>SPM-2 © Western Psychological Services · Uso profesional</p>
        </div>
      </footer>
    </div>
  );
}
