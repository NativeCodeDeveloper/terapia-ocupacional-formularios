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
    <div className="relative isolate min-h-screen overflow-hidden bg-[#f8f8ff] font-[family-name:var(--font-geist-sans)] text-[#100d50]">
      <svg aria-hidden="true" className="absolute size-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <symbol id="personas" viewBox="0 0 24 24"><circle cx="9" cy="7" r="3.5"/><circle cx="18" cy="8" r="2.7"/><path d="M2 20v-3a7 7 0 0 1 14 0v3H2Zm15-8a5 5 0 0 1 6 5v3h-5v-3a9 9 0 0 0-1-5Z"/></symbol>
          <symbol id="flecha" viewBox="0 0 24 24"><path d="M4 12h15m-6-6 6 6-6 6" className="fill-none stroke-current stroke-[1.7]"/></symbol>
          <symbol id="candado" viewBox="0 0 24 24"><path d="M6 9V6a6 6 0 0 1 12 0v3h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2h1Zm3 0h6V6a3 3 0 0 0-6 0v3Z"/><path d="M12 14v4" className="stroke-white stroke-2"/></symbol>
        </defs>
      </svg>
      <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-32 -z-10 size-56 rounded-full bg-violet-100/40" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-48 top-40 -z-10 size-96 rounded-full bg-fuchsia-100/25" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-72 top-[350px] -z-10 size-[480px] rounded-full border-[70px] border-blue-100/35" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-56 top-[730px] -z-10 size-96 rounded-full bg-fuchsia-100/25" />
      <header className="h-auto border-b border-violet-100/40 bg-white/75 lg:h-[54px]">
        <div className="mx-auto flex min-h-[54px] max-w-[1268px] flex-wrap items-center justify-between gap-4 px-5 py-2 lg:px-0 lg:py-0">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="block h-[30px] w-[27px] shrink-0 bg-[url('/images/referencia-terapeutame.png')] bg-size-[1352px_901px] bg-position-[-119px_-8px] bg-no-repeat" />
            <div><p className="text-[19px] leading-5 font-bold tracking-[-0.6px]">Teraocupame<span className="text-[#d937b7]">.cl</span></p><p className="text-[10px] leading-3.5 text-[#686996]">Instrumentos de evaluación en salud mental</p></div>
          </div>
          <nav aria-label="Navegación principal" className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-[#575d96] sm:gap-6">
            <button type="button" className="hidden py-2 transition-colors hover:text-violet-600 sm:block">Cómo funciona</button>
            <button type="button" className="hidden py-2 transition-colors hover:text-violet-600 sm:block">Contacto</button>
            <button type="button" className="rounded-full border border-[#8c6aff] px-5 py-2 text-[#4924ff] transition-colors hover:bg-violet-50">Iniciar sesión</button>
            <button type="button" className="rounded-full border border-[#5c31dc] bg-linear-to-b from-[#6539ff] to-[#5930dc] px-6 py-2 text-white shadow-sm shadow-violet-300/50 transition-colors hover:from-violet-600">Crear cuenta</button>
          </nav>
        </div>
      </header>
      <main>
        <section aria-label="Introducción" className="relative mx-auto max-w-[1268px] px-5 pt-5 pb-5 lg:flex lg:h-[193px] lg:items-center lg:px-0 lg:pb-0 lg:pt-0">
          <div aria-hidden="true" className="pointer-events-none absolute top-0 -right-[22px] hidden h-[193px] w-[455px] bg-[url('/images/referencia-terapeutame.png')] bg-size-[1075px_717px] bg-position-[-546px_-38px] bg-no-repeat lg:block" />
          <div className="relative z-10 max-w-[650px]">
            <p className="max-w-[560px] text-[14px] leading-[19px] tracking-[-0.2px] text-[#71749f]">Accede a una amplia colección de instrumentos psicológicos validados para todas las etapas de la vida. Evalúa, interpreta y apoya el bienestar mental de tus pacientes de forma simple y segura.</p>
            <div className="mt-[14px] flex flex-wrap items-center gap-x-8 gap-y-3 text-[11px] font-medium text-[#565b90]">
              <span className="flex items-center gap-2"><span aria-hidden="true" className="flex size-5 items-center justify-center rounded-full bg-linear-to-br from-[#54d3bd] to-[#20a88e] text-[13px] text-white">✓</span>Instrumentos validados</span>
              <span className="flex items-center gap-2"><svg aria-hidden="true" className="size-5 fill-[#7555ff]"><use href="#personas" /></svg>Todas las etapas de vida</span>
              <span className="flex items-center gap-2"><svg aria-hidden="true" className="size-5 fill-[#6a5aff]"><use href="#candado" /></svg>Uso seguro y confidencial</span>
            </div>
          </div>
        </section>
        <div className="mx-auto max-w-[1420px] px-4 pb-12 lg:px-0">
          <section aria-label="Buscar instrumentos" className="flex flex-col gap-3 rounded-[22px] border border-[#ebe9fa] bg-white/50 px-[14px] py-[11px] shadow-[0_8px_30px_-20px_#bcb6ec] md:flex-row md:items-center lg:h-[58px] lg:gap-8">
            <div className="flex h-9 min-w-0 flex-1 items-center gap-3 rounded-[15px] border border-[#e2e3f1] px-3 text-[#7b7e9e]">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0 fill-none stroke-[#666b97] stroke-2"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></svg>
              <span className="truncate text-[11px]">Buscar instrumento (ej. ACE-R, Barthel, Yesavage...)</span>
            </div>
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 md:w-[552px] lg:grid-cols-[148px_180px_198px] lg:gap-[14px]">
              <button type="button" className="flex h-9 items-center justify-between gap-3 rounded-[15px] border border-[#e2e3f1] px-3 text-left text-[10px] text-[#42466d]">Todas las edades<span aria-hidden="true" className="-mt-1 size-1.5 rotate-45 border-r border-b border-[#7d83aa]" /></button>
              <button type="button" className="flex h-9 items-center justify-between gap-3 rounded-[15px] border border-[#e2e3f1] px-3 text-left text-[10px] text-[#42466d]">Todas las áreas<span aria-hidden="true" className="-mt-1 size-1.5 rotate-45 border-r border-b border-[#7d83aa]" /></button>
              <button type="button" className="flex h-9 items-center justify-between gap-3 rounded-[15px] border border-[#e2e3f1] px-3 text-left text-[10px] text-[#42466d]">Ordenar por nombre<span aria-hidden="true" className="text-base text-[#737b9f]">↕</span></button>
            </div>
          </section>
          <section aria-labelledby="titulo-cognitiva" className="mt-0 rounded-[23px] bg-white/35 px-3 pb-3">
            <div className="flex min-h-[42px] items-center justify-between gap-3">
              <div className="flex items-center gap-2"><span aria-hidden="true" className="-ml-[7px] block size-[44px] shrink-0 rounded-full bg-[url('/images/referencia-terapeutame.png')] bg-size-[1536px_1024px] bg-position-[-63px_-390px] bg-no-repeat" /><h2 id="titulo-cognitiva" className="text-[15px] leading-tight font-bold tracking-[-0.4px]">Área cognitiva</h2></div>
              <button type="button" className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-[#4a32ff] hover:text-violet-700">Ver todos<svg aria-hidden="true" className="size-[18px]"><use href="#flecha" /></svg></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[14px]">
              <article className="relative flex min-h-[176px] min-w-0 flex-col overflow-hidden rounded-[15px] bg-linear-to-br from-[#f1edff] to-[#f3efff] px-[17px] pt-3 pb-[11px]">
                <span aria-hidden="true" className="pointer-events-none absolute top-[13px] right-3 h-[108px] w-[104px] bg-[url('/images/referencia-terapeutame.png')] bg-size-[1536px_1024px] bg-position-[-230px_-448px] bg-no-repeat" />
                <span className="relative mb-[7px] flex h-7 w-fit min-w-[38px] items-center justify-center rounded-[9px] border border-white/70 bg-linear-to-b from-[#9c63ff] to-[#7238ee] text-white px-2 text-[11px] font-semibold shadow-[0_1px_3px_#ffffff80]">SPM</span>
                <h3 className="relative max-w-[75%] text-[14px] leading-[18px] font-bold tracking-[-0.3px]">SPM-2 Hogar</h3>
                <p className="relative mt-[2px] max-w-[85%] text-[11px] leading-[14px] text-[#72769e]">Procesamiento sensorial<br />en el contexto del hogar.</p>
                <p className="mt-auto flex items-center gap-2 pt-[3px] text-[11px] leading-4 font-medium text-[#57628f]"><svg aria-hidden="true" className="size-[17px] shrink-0 fill-current"><use href="#personas" /></svg>Niños y jóvenes</p>
                <button type="button" className="mt-2 flex h-7 w-full items-center justify-center gap-2 rounded-[10px] bg-[#e5dcff] text-[#4e12b7] text-[11px] font-semibold transition-[filter] hover:brightness-95">Abrir instrumento<svg aria-hidden="true" className="size-[18px]"><use href="#flecha" /></svg></button>
              </article>
              <article className="relative flex min-h-[176px] min-w-0 flex-col overflow-hidden rounded-[15px] bg-linear-to-br from-[#f1edff] to-[#f3efff] px-[17px] pt-3 pb-[11px]">
                <span aria-hidden="true" className="pointer-events-none absolute top-[13px] right-3 h-[105px] w-[108px] bg-[url('/images/referencia-terapeutame.png')] bg-size-[1536px_1024px] bg-position-[-515px_-448px] bg-no-repeat" />
                <span className="relative mb-[7px] flex h-7 w-fit min-w-[38px] items-center justify-center rounded-[9px] border border-white/70 bg-linear-to-b from-[#9c63ff] to-[#7238ee] text-white px-2 text-[11px] font-semibold shadow-[0_1px_3px_#ffffff80]">SPM</span>
                <h3 className="relative max-w-[75%] text-[14px] leading-[18px] font-bold tracking-[-0.3px]">SPM-2 Escolar</h3>
                <p className="relative mt-[2px] max-w-[85%] text-[11px] leading-[14px] text-[#72769e]">Procesamiento sensorial<br />en el entorno escolar.</p>
                <p className="mt-auto flex items-center gap-2 pt-[3px] text-[11px] leading-4 font-medium text-[#57628f]"><svg aria-hidden="true" className="size-[17px] shrink-0 fill-current"><use href="#personas" /></svg>Niños y jóvenes</p>
                <button type="button" className="mt-2 flex h-7 w-full items-center justify-center gap-2 rounded-[10px] bg-[#e5dcff] text-[#4e12b7] text-[11px] font-semibold transition-[filter] hover:brightness-95">Abrir instrumento<svg aria-hidden="true" className="size-[18px]"><use href="#flecha" /></svg></button>
              </article>
              <article className="relative flex min-h-[176px] min-w-0 flex-col overflow-hidden rounded-[15px] bg-linear-to-br from-[#e7f2ff] to-[#e6f1ff] px-[17px] pt-3 pb-[11px]">
                <span aria-hidden="true" className="pointer-events-none absolute top-[13px] right-3 h-[77px] w-[82px] bg-[url('/images/referencia-terapeutame.png')] bg-size-[1536px_1024px] bg-position-[-801px_-448px] bg-no-repeat" />
                <span className="relative mb-[7px] flex h-7 w-fit min-w-[38px] items-center justify-center rounded-[9px] border border-white/70 bg-linear-to-b from-[#429cff] to-[#1677f6] text-white px-2 text-[11px] font-semibold shadow-[0_1px_3px_#ffffff80]">AC</span>
                <h3 className="relative max-w-[75%] text-[14px] leading-[18px] font-bold tracking-[-0.3px]">ACE-R</h3>
                <p className="relative mt-[2px] max-w-[85%] text-[11px] leading-[14px] text-[#72769e]">Examen cognitivo de<br />Addenbrooke para detectar<br />deterioro cognitivo.</p>
                <p className="mt-auto flex items-center gap-2 pt-[3px] text-[11px] leading-4 font-medium text-[#57628f]"><svg aria-hidden="true" className="size-[17px] shrink-0 fill-current"><use href="#personas" /></svg>Adultos y personas mayores</p>
                <button type="button" className="mt-2 flex h-7 w-full items-center justify-center gap-2 rounded-[10px] bg-[#cfe5ff] text-[#003de0] text-[11px] font-semibold transition-[filter] hover:brightness-95">Abrir instrumento<svg aria-hidden="true" className="size-[18px]"><use href="#flecha" /></svg></button>
              </article>
              <article className="relative flex min-h-[176px] min-w-0 flex-col overflow-hidden rounded-[15px] bg-linear-to-br from-[#e7f2ff] to-[#e6f1ff] px-[17px] pt-3 pb-[11px]">
                <span aria-hidden="true" className="pointer-events-none absolute top-[13px] right-3 h-[84px] w-[80px] bg-[url('/images/referencia-terapeutame.png')] bg-size-[1536px_1024px] bg-position-[-1080px_-449px] bg-no-repeat" />
                <span className="relative mb-[7px] flex h-7 w-fit min-w-[38px] items-center justify-center rounded-[9px] border border-white/70 bg-linear-to-b from-[#429cff] to-[#1677f6] text-white px-2 text-[11px] font-semibold shadow-[0_1px_3px_#ffffff80]">Mi</span>
                <h3 className="relative max-w-[75%] text-[14px] leading-[18px] font-bold tracking-[-0.3px]">Minimental</h3>
                <p className="relative mt-[2px] max-w-[85%] text-[11px] leading-[14px] text-[#72769e]">Tamizaje breve del<br />estado cognitivo.</p>
                <p className="mt-auto flex items-center gap-2 pt-[3px] text-[11px] leading-4 font-medium text-[#57628f]"><svg aria-hidden="true" className="size-[17px] shrink-0 fill-current"><use href="#personas" /></svg>Personas mayores</p>
                <button type="button" className="mt-2 flex h-7 w-full items-center justify-center gap-2 rounded-[10px] bg-[#cfe5ff] text-[#003de0] text-[11px] font-semibold transition-[filter] hover:brightness-95">Abrir instrumento<svg aria-hidden="true" className="size-[18px]"><use href="#flecha" /></svg></button>
              </article>
              <article className="relative flex min-h-[176px] min-w-0 flex-col overflow-hidden rounded-[15px] bg-linear-to-br from-[#e7f2ff] to-[#e6f1ff] px-[17px] pt-3 pb-[11px]">
                <span aria-hidden="true" className="pointer-events-none absolute top-[13px] right-3 h-[80px] w-[84px] bg-[url('/images/referencia-terapeutame.png')] bg-size-[1536px_1024px] bg-position-[-1358px_-447px] bg-no-repeat" />
                <span className="relative mb-[7px] flex h-7 w-fit min-w-[38px] items-center justify-center rounded-[9px] border border-white/70 bg-linear-to-b from-[#429cff] to-[#1677f6] text-white px-2 text-[11px] font-semibold shadow-[0_1px_3px_#ffffff80]">RU</span>
                <h3 className="relative max-w-[75%] text-[14px] leading-[18px] font-bold tracking-[-0.3px]">RUDAS</h3>
                <p className="relative mt-[2px] max-w-[85%] text-[11px] leading-[14px] text-[#72769e]">Evaluación cognitiva con baja<br />influencia cultural y educativa.</p>
                <p className="mt-auto flex items-center gap-2 pt-[3px] text-[11px] leading-4 font-medium text-[#57628f]"><svg aria-hidden="true" className="size-[17px] shrink-0 fill-current"><use href="#personas" /></svg>Personas mayores</p>
                <button type="button" className="mt-2 flex h-7 w-full items-center justify-center gap-2 rounded-[10px] bg-[#cfe5ff] text-[#003de0] text-[11px] font-semibold transition-[filter] hover:brightness-95">Abrir instrumento<svg aria-hidden="true" className="size-[18px]"><use href="#flecha" /></svg></button>
              </article>
            </div>
          </section>
          <section aria-labelledby="titulo-emocional" className="mt-0 rounded-[23px] bg-white/35 px-3 pb-3">
            <div className="flex min-h-[42px] items-center justify-between gap-3">
              <div className="flex items-center gap-2"><span aria-hidden="true" className="-ml-[7px] block size-[44px] shrink-0 rounded-full bg-[url('/images/referencia-terapeutame.png')] bg-size-[1536px_1024px] bg-position-[-63px_-641px] bg-no-repeat" /><h2 id="titulo-emocional" className="text-[15px] leading-tight font-bold tracking-[-0.4px]">Estado emocional y salud mental</h2></div>
              <button type="button" className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-[#4a32ff] hover:text-violet-700">Ver todos<svg aria-hidden="true" className="size-[18px]"><use href="#flecha" /></svg></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
              <article className="relative flex min-h-[146px] min-w-0 flex-col overflow-hidden rounded-[15px] bg-linear-to-br from-[#fceaf2] to-[#fcebf3] px-[17px] pt-3 pb-[11px]">
                <span aria-hidden="true" className="pointer-events-none absolute top-[14px] right-8 h-[96px] w-[88px] bg-[url('/images/referencia-terapeutame.png')] bg-size-[1536px_1024px] bg-position-[-396px_-699px] bg-no-repeat" />
                <span className="relative mb-[7px] flex h-7 w-fit min-w-[38px] items-center justify-center rounded-[9px] border border-white/70 bg-linear-to-b from-[#ff6194] to-[#ff3678] text-white px-2 text-[11px] font-semibold shadow-[0_1px_3px_#ffffff80]">Ye</span>
                <h3 className="relative max-w-[75%] text-[14px] leading-[18px] font-bold tracking-[-0.3px]">Yesavage</h3>
                <p className="relative mt-[2px] max-w-[85%] text-[11px] leading-[14px] text-[#72769e]">Escala de depresión<br />geriátrica.</p>
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-[10px]">
                  <p className="flex flex-1 items-center gap-2 whitespace-nowrap text-[11px] font-medium text-[#57628f]"><svg aria-hidden="true" className="size-[17px] shrink-0 fill-current"><use href="#personas" /></svg>Personas mayores</p>
                  <button type="button" className="flex h-7 min-w-[55%] flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#ffcfe0] text-[#a50065] text-[11px] font-semibold transition-[filter] hover:brightness-95">Abrir instrumento<svg aria-hidden="true" className="size-[18px]"><use href="#flecha" /></svg></button>
                </div>
              </article>
              <article className="relative flex min-h-[146px] min-w-0 flex-col overflow-hidden rounded-[15px] bg-linear-to-br from-[#fceaf2] to-[#fcebf3] px-[17px] pt-3 pb-[11px]">
                <span aria-hidden="true" className="pointer-events-none absolute top-[14px] right-8 h-[92px] w-[90px] bg-[url('/images/referencia-terapeutame.png')] bg-size-[1536px_1024px] bg-position-[-854px_-701px] bg-no-repeat" />
                <span className="relative mb-[7px] flex h-7 w-fit min-w-[38px] items-center justify-center rounded-[9px] border border-white/70 bg-linear-to-b from-[#ff6194] to-[#ff3678] text-white px-2 text-[11px] font-semibold shadow-[0_1px_3px_#ffffff80]">PA</span>
                <h3 className="relative max-w-[75%] text-[14px] leading-[18px] font-bold tracking-[-0.3px]">PAI</h3>
                <p className="relative mt-[2px] max-w-[85%] text-[11px] leading-[14px] text-[#72769e]">Inventario de evaluación<br />de la personalidad.</p>
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-[10px]">
                  <button type="button" className="flex h-7 w-full items-center justify-center gap-2 rounded-[10px] bg-[#ffcfe0] text-[#a50065] text-[11px] font-semibold transition-[filter] hover:brightness-95">Abrir instrumento<svg aria-hidden="true" className="size-[18px]"><use href="#flecha" /></svg></button>
                </div>
              </article>
              <article className="relative flex min-h-[146px] min-w-0 flex-col overflow-hidden rounded-[15px] bg-linear-to-br from-[#fff0e7] to-[#fdefe7] px-[17px] pt-3 pb-[11px]">
                <span aria-hidden="true" className="pointer-events-none absolute top-[14px] right-8 h-[92px] w-[90px] bg-[url('/images/referencia-terapeutame.png')] bg-size-[1536px_1024px] bg-position-[-1330px_-701px] bg-no-repeat" />
                <span className="relative mb-[7px] flex h-7 w-fit min-w-[38px] items-center justify-center rounded-[9px] border border-white/70 bg-linear-to-b from-[#ff995b] to-[#ff7939] text-[#451600] px-2 text-[11px] font-semibold shadow-[0_1px_3px_#ffffff80]">Li</span>
                <h3 className="relative max-w-[75%] text-[14px] leading-[18px] font-bold tracking-[-0.3px]">Listado de Intereses</h3>
                <p className="relative mt-[2px] max-w-[85%] text-[11px] leading-[14px] text-[#72769e]">Identifica intereses y<br />preferencias ocupacionales.</p>
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-[10px]">
                  <button type="button" className="flex h-7 w-full items-center justify-center gap-2 rounded-[10px] bg-[#ffd5b8] text-[#962900] text-[11px] font-semibold transition-[filter] hover:brightness-95">Abrir instrumento<svg aria-hidden="true" className="size-[18px]"><use href="#flecha" /></svg></button>
                </div>
              </article>
            </div>
          </section>
          <section aria-labelledby="titulo-funcionalidad" className="mt-0 rounded-[23px] bg-white/35 px-3 pb-3">
            <div className="flex min-h-[42px] items-center justify-between gap-3">
              <div className="flex items-center gap-2"><span aria-hidden="true" className="-ml-[7px] block size-[44px] shrink-0 rounded-full bg-[url('/images/referencia-terapeutame.png')] bg-size-[1536px_1024px] bg-position-[-63px_-853px] bg-no-repeat" /><h2 id="titulo-funcionalidad" className="text-[15px] leading-tight font-bold tracking-[-0.4px]">Funcionalidad y vida diaria</h2></div>
              <button type="button" className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-[#4a32ff] hover:text-violet-700">Ver todos<svg aria-hidden="true" className="size-[18px]"><use href="#flecha" /></svg></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.08fr_0.98fr_1fr] gap-[14px]">
              <article className="relative flex min-h-[176px] min-w-0 flex-col overflow-hidden rounded-[15px] bg-linear-to-br from-[#fff7df] to-[#fff9eb] px-[17px] pt-3 pb-[11px]">
                <span aria-hidden="true" className="pointer-events-none absolute top-[13px] right-3 h-[88px] w-[69px] bg-[url('/images/referencia-terapeutame.png')] bg-size-[1536px_1024px] bg-position-[-330px_-912px] bg-no-repeat" />
                <span className="relative mb-[7px] flex h-7 w-fit min-w-[38px] items-center justify-center rounded-[9px] border border-white/70 bg-linear-to-b from-[#ffd76b] to-[#ffc33b] text-[#4a2c00] px-2 text-[11px] font-semibold shadow-[0_1px_3px_#ffffff80]">Ev</span>
                <h3 className="relative max-w-[75%] text-[14px] leading-[18px] font-bold tracking-[-0.3px]">Evaluaciones iniciales</h3>
                <p className="relative mt-[2px] max-w-[85%] text-[11px] leading-[14px] text-[#72769e]">Entrevista y evaluación de ingreso<br />por etapa de vida.</p>
                <p className="mt-auto flex items-center gap-2 pt-[3px] text-[11px] leading-4 font-medium text-[#57628f]"><svg aria-hidden="true" className="size-[17px] shrink-0 fill-current"><use href="#personas" /></svg>Infantil · Adolescente · Adulto · Persona mayor</p>
                <button type="button" className="mt-2 flex h-7 w-full items-center justify-center gap-2 rounded-[10px] bg-[#ffe7a8] text-[#805200] text-[11px] font-semibold transition-[filter] hover:brightness-95">Abrir instrumento<svg aria-hidden="true" className="size-[18px]"><use href="#flecha" /></svg></button>
              </article>
              <article className="relative flex min-h-[176px] min-w-0 flex-col overflow-hidden rounded-[15px] bg-linear-to-br from-[#e1faf4] to-[#eafaf7] px-[17px] pt-3 pb-[11px]">
                <span aria-hidden="true" className="pointer-events-none absolute top-[13px] right-3 h-[80px] w-[64px] bg-[url('/images/referencia-terapeutame.png')] bg-size-[1536px_1024px] bg-position-[-700px_-912px] bg-no-repeat" />
                <span className="relative mb-[7px] flex h-7 w-fit min-w-[38px] items-center justify-center rounded-[9px] border border-white/70 bg-linear-to-b from-[#09c9b5] to-[#00a893] text-white px-2 text-[11px] font-semibold shadow-[0_1px_3px_#ffffff80]">Ín</span>
                <h3 className="relative max-w-[75%] text-[14px] leading-[18px] font-bold tracking-[-0.3px]">Índice de Barthel</h3>
                <p className="relative mt-[2px] max-w-[85%] text-[11px] leading-[14px] text-[#72769e]">Nivel de independencia en actividades<br />de la vida diaria. Incluye Neumann AVDB-1.</p>
                <p className="mt-auto flex items-center gap-2 pt-[3px] text-[11px] leading-4 font-medium text-[#57628f]"><svg aria-hidden="true" className="size-[17px] shrink-0 fill-current"><use href="#personas" /></svg>Adultos y personas mayores</p>
                <button type="button" className="mt-2 flex h-7 w-full items-center justify-center gap-2 rounded-[10px] bg-[#bdf0e6] text-[#007a6d] text-[11px] font-semibold transition-[filter] hover:brightness-95">Abrir instrumento<svg aria-hidden="true" className="size-[18px]"><use href="#flecha" /></svg></button>
              </article>
              <article className="relative flex min-h-[176px] min-w-0 flex-col overflow-hidden rounded-[15px] bg-linear-to-br from-[#e1faf4] to-[#eafaf7] px-[17px] pt-3 pb-[11px]">
                <span aria-hidden="true" className="pointer-events-none absolute top-[13px] right-3 h-[78px] w-[80px] bg-[url('/images/referencia-terapeutame.png')] bg-size-[1536px_1024px] bg-position-[-1022px_-914px] bg-no-repeat" />
                <span className="relative mb-[7px] flex h-7 w-fit min-w-[38px] items-center justify-center rounded-[9px] border border-white/70 bg-linear-to-b from-[#09c9b5] to-[#00a893] text-white px-2 text-[11px] font-semibold shadow-[0_1px_3px_#ffffff80]">EM</span>
                <h3 className="relative max-w-[75%] text-[14px] leading-[18px] font-bold tracking-[-0.3px]">EMPAM</h3>
                <p className="relative mt-[2px] max-w-[85%] text-[11px] leading-[14px] text-[#72769e]">Examen de Medicina<br />Preventiva del Adulto Mayor.</p>
                <p className="mt-auto flex items-center gap-2 pt-[3px] text-[11px] leading-4 font-medium text-[#57628f]"><svg aria-hidden="true" className="size-[17px] shrink-0 fill-current"><use href="#personas" /></svg>Personas mayores</p>
                <button type="button" className="mt-2 flex h-7 w-full items-center justify-center gap-2 rounded-[10px] bg-[#bdf0e6] text-[#007a6d] text-[11px] font-semibold transition-[filter] hover:brightness-95">Abrir instrumento<svg aria-hidden="true" className="size-[18px]"><use href="#flecha" /></svg></button>
              </article>
              <article className="relative flex min-h-[176px] min-w-0 flex-col overflow-hidden rounded-[15px] bg-linear-to-br from-[#fff7df] to-[#fff9eb] px-[17px] pt-3 pb-[11px]">
                <span aria-hidden="true" className="pointer-events-none absolute top-[13px] right-3 h-[108px] w-[95px] bg-[url('/images/referencia-terapeutame.png')] bg-size-[1536px_1024px] bg-position-[-1360px_-910px] bg-no-repeat" />
                <span className="relative mb-[7px] flex h-7 w-fit min-w-[38px] items-center justify-center rounded-[9px] border border-white/70 bg-linear-to-b from-[#ffd76b] to-[#ffc33b] text-[#4a2c00] px-2 text-[11px] font-semibold shadow-[0_1px_3px_#ffffff80]">VMI</span>
                <h3 className="relative max-w-[75%] text-[14px] leading-[18px] font-bold tracking-[-0.3px]">VMI</h3>
                <p className="relative mt-[2px] max-w-[85%] text-[11px] leading-[14px] text-[#72769e]">Integración visomotora y<br />habilidades de copia de formas.</p>
                <p className="mt-auto flex items-center gap-2 pt-[3px] text-[11px] leading-4 font-medium text-[#57628f]"><svg aria-hidden="true" className="size-[17px] shrink-0 fill-current"><use href="#personas" /></svg>Niños</p>
                <button type="button" className="mt-2 flex h-7 w-full items-center justify-center gap-2 rounded-[10px] bg-[#ffe7a8] text-[#805200] text-[11px] font-semibold transition-[filter] hover:brightness-95">Abrir instrumento<svg aria-hidden="true" className="size-[18px]"><use href="#flecha" /></svg></button>
              </article>
            </div>
          </section>
          <section aria-labelledby="formularios-disponibles" className="mt-6 rounded-[22px] border border-violet-100 bg-white/70 p-4 sm:p-5">
            <h2 id="formularios-disponibles" className="text-[15px] font-bold tracking-[-0.3px]">SPM-2 · Formularios disponibles</h2>
            <p className="mt-1 mb-4 text-[12px] text-[#71749f]">Selecciona el formulario que necesitas completar. Al terminar podrás descargar tus respuestas en PDF o Word.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FORMULARIOS.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-4 transition-colors hover:border-indigo-400 hover:bg-indigo-50/50"
          >
            <span className="mb-2 w-fit rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
              {f.instrumento}
            </span>
            <span className="flex items-center justify-between gap-3">
              <span className="text-[14px] font-bold">{f.titulo}</span>
              <span
                aria-hidden="true"
                className="text-indigo-600 transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </span>
            <span className="mt-1 text-[12px] leading-snug text-neutral-600">
              {f.descripcion}
            </span>
            <span className="mt-2.5 text-[11px] text-neutral-400">
              80 preguntas · Respuestas descargables en PDF y Word
            </span>
          </Link>
        ))}
      </div>
          </section>
        </div>
      </main>
    </div>
  );
}
