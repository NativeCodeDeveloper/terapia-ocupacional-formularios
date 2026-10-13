import Link from "next/link";

const FORMULARIOS = [
  {
    href: "/formulario1",
    instrumento: "SPM-2 HOGAR",
    titulo: "Niños 2 - 5 años",
    descripcion: "Responde el padre, madre o cuidador sobre la conducta del niño.",
  },
  {
    href: "/formulario2",
    instrumento: "SPM-2 HOGAR",
    titulo: "Niños 5 - 12 años",
    descripcion: "Responde el padre, madre o cuidador sobre la conducta del niño.",
  },
  {
    href: "/formulario3",
    instrumento: "SPM-2 HOGAR",
    titulo: "Adolescente 12 - 21",
    descripcion: "Responde un evaluador o cuidador sobre el usuario.",
  },
  {
    href: "/formulario4",
    instrumento: "SPM-2 AUTOINFORME",
    titulo: "Adolescente 12 - 21",
    descripcion: "Lo responde el propio adolescente.",
  },
  {
    href: "/formulario5",
    instrumento: "SPM-2",
    titulo: "Adulto (Evaluador) 21 - 87",
    descripcion: "Responde un evaluador o cuidador sobre el usuario.",
  },
  {
    href: "/formulario6",
    instrumento: "SPM-2",
    titulo: "Adulto (Autoinforme) 21 - 87",
    descripcion: "Lo responde el propio adulto.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">SPM-2 · Formularios</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Perfil Sensorial 2. Selecciona el formulario que necesitas completar. Al terminar podrás
          descargar tus respuestas en PDF o Word.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {FORMULARIOS.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/5"
          >
            <span className="mb-2 w-fit rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
              {f.instrumento}
            </span>
            <span className="flex items-center justify-between gap-3">
              <span className="text-lg font-bold">{f.titulo}</span>
              <span
                aria-hidden="true"
                className="text-indigo-600 transition-transform group-hover:translate-x-1 dark:text-indigo-400"
              >
                →
              </span>
            </span>
            <span className="mt-1 text-sm leading-snug text-neutral-600 dark:text-neutral-400">
              {f.descripcion}
            </span>
            <span className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
              80 preguntas · Respuestas descargables en PDF y Word
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
