import Link from "next/link";

const FORMULARIOS = [
  {
    href: "/formulario1",
    instrumento: "SPM-2 HOGAR",
    titulo: "Niños 2 - 5 años",
    descripcion: "Responde el padre, madre o cuidador sobre la conducta del niño.",
    informes: "PDF y Word",
    preguntas: 80,
  },
  {
    href: "/formulario7",
    instrumento: "SPM-2 ESCOLAR",
    titulo: "Preescolar 2 - 5 años",
    descripcion: "Responde el educador o la educadora de preescolar o guardería sobre la conducta del niño.",
    informes: "PDF y Word",
    preguntas: 80,
  },
  {
    href: "/formulario2",
    instrumento: "SPM-2 HOGAR",
    titulo: "Niños 5 - 12 años",
    descripcion: "Responde el padre, madre o cuidador sobre la conducta del niño.",
    informes: "PDF",
    preguntas: 80,
  },
  {
    href: "/formulario9",
    instrumento: "SPM-2 ESCOLAR",
    titulo: "Niños 5 - 12 años",
    descripcion: "Responde un docente o evaluador del establecimiento sobre el o la estudiante.",
    informes: "PDF",
    preguntas: 80,
  },
  {
    href: "/formulario10",
    instrumento: "PERFIL SENSORIAL 2 INFANT",
    titulo: "Bebés 0 - 6 meses",
    descripcion: "Cuestionario para padres o tutores sobre la conducta sensorial del bebé.",
    informes: "PDF",
    preguntas: 25,
  },
  {
    href: "/formulario11",
    instrumento: "PERFIL SENSORIAL 2 TODDLER",
    titulo: "Niños 7 - 35 meses",
    descripcion: "Cuestionario para padres o tutores sobre la conducta sensorial del niño.",
    informes: "PDF",
    preguntas: 54,
  },
  {
    href: "/formulario12",
    instrumento: "PERFIL SENSORIAL 2 BREVE",
    titulo: "Niños 3:0 - 14:11 años",
    descripcion: "Cuestionario breve para los padres o el cuidador sobre la conducta sensorial del niño.",
    informes: "PDF",
    preguntas: 34,
  },
  {
    href: "/formulario13",
    instrumento: "PERFIL SENSORIAL 2 NIÑO",
    titulo: "Niños 3:0 - 14:11 años",
    descripcion: "Cuestionario completo para los padres o el cuidador sobre la conducta sensorial del niño.",
    informes: "PDF",
    preguntas: 86,
  },
  {
    href: "/formulario15",
    instrumento: "PERFIL SENSORIAL 2 ESCOLAR",
    titulo: "Alumnos 3:0 - 14:11 años",
    descripcion: "Cuestionario para el profesor sobre la conducta sensorial del alumno en la escuela.",
    informes: "PDF",
    preguntas: 44,
  },
  {
    href: "/formulario14",
    instrumento: "PERFIL SENSORIAL ADOLESCENTES Y ADULTOS",
    titulo: "Autoinforme 11 años en adelante",
    descripcion: "Auto cuestionario sobre la frecuencia de las respuestas sensoriales propias.",
    informes: "PDF",
    preguntas: 60,
  },
  {
    href: "/formulario3",
    instrumento: "SPM-2 HOGAR",
    titulo: "Adolescente 12 - 21",
    descripcion: "Responde un evaluador o cuidador sobre el usuario.",
    informes: "PDF",
    preguntas: 80,
  },
  {
    href: "/formulario8",
    instrumento: "SPM-2 ESCOLAR",
    titulo: "Adolescente 12 - 21",
    descripcion: "Responde un docente o evaluador del establecimiento sobre el o la estudiante.",
    informes: "PDF",
    preguntas: 80,
  },
  {
    href: "/formulario4",
    instrumento: "SPM-2 AUTOINFORME",
    titulo: "Adolescente 12 - 21",
    descripcion: "Lo responde el propio adolescente.",
    informes: "PDF y Word",
    preguntas: 80,
  },
  {
    href: "/formulario5",
    instrumento: "SPM-2",
    titulo: "Adulto (Evaluador) 21 - 87",
    descripcion: "Responde un evaluador o cuidador sobre el usuario.",
    informes: "PDF",
    preguntas: 80,
  },
  {
    href: "/formulario6",
    instrumento: "SPM-2",
    titulo: "Adulto (Autoinforme) 21 - 87",
    descripcion: "Lo responde el propio adulto.",
    informes: "PDF",
    preguntas: 80,
  },
  {
    href: "/formulario16",
    instrumento: "EVALUACIÓN INICIAL · INFANTIL",
    titulo: "Niño · entrevista inicial",
    descripcion: "Ficha de primera atención de terapia ocupacional que completa el tutor o cuidador junto al terapeuta.",
    informes: "PDF y Word",
    preguntas: 104,
  },
  {
    href: "/formulario17",
    instrumento: "EVALUACIÓN INICIAL · ADOLESCENCIA",
    titulo: "Adolescente · entrevista inicial",
    descripcion: "Ficha de primera atención con el tutor o el propio adolescente, con área académica e independencia funcional.",
    informes: "PDF y Word",
    preguntas: 103,
  },
  {
    href: "/formulario18",
    instrumento: "EVALUACIÓN INICIAL · ADULTO",
    titulo: "Adulto · entrevista inicial",
    descripcion: "Ficha de primera atención con independencia funcional básica e instrumental, área física y salud mental.",
    informes: "PDF y Word",
    preguntas: 125,
  },
  {
    href: "/formulario19",
    instrumento: "EVALUACIÓN INICIAL · PERSONA MAYOR",
    titulo: "Persona mayor · entrevista inicial",
    descripcion: "Ficha de primera atención con síndromes geriátricos, entorno y adaptaciones, área física y salud mental.",
    informes: "PDF y Word",
    preguntas: 136,
  },
];

/* Apartado de formularios: banda celeste con el mismo patrón de
   colores del hero (navy + verde agua sobre panel #d9eaf6). */
export default function Formularios() {
  return (
    <section
      id="formularios"
      aria-labelledby="titulo-formularios"
      className="bg-[#d9eaf6] pt-28 pb-16 sm:pt-32 sm:pb-24"
    >
      <div className="mx-auto max-w-6xl px-5 lg:px-0">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
            Evaluaciones
          </p>
          <h2
            id="titulo-formularios"
            className="mt-3 text-3xl font-extrabold uppercase tracking-tight text-indigo-950 sm:text-4xl"
          >
            Formularios <span className="text-teal-700">disponibles</span>
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-neutral-700">
            Selecciona el formulario que necesitas completar. Al terminar podrás revisar un
            resumen y descargar el informe con la puntuación interpretada.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {FORMULARIOS.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group flex flex-col rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_28px_60px_-28px_rgba(13,148,136,0.45)]"
            >
              <span className="w-fit rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-800">
                {f.instrumento}
              </span>
              <span className="mt-3 text-[15px] font-bold tracking-tight text-indigo-950">
                {f.titulo}
              </span>
              <span className="mt-1 pb-4 text-[13px] leading-5 text-neutral-600">
                {f.descripcion}
              </span>
              <span className="mt-auto flex items-center justify-between gap-3 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
                <span>{f.preguntas} preguntas · Informe {f.informes}</span>
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 transition-colors group-hover:bg-teal-600 group-hover:text-white"
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
