"use client";

import { useState } from "react";
import { descargarInformeWord } from "@/lib/informe";

/* ============================================================
   CUESTIONARIO SPM-2 · COMPONENTE COMPARTIDO
   Interfaz única para los 7 formularios: fondo blanco,
   tipografía jerárquica y controles con estados claros
   (selección, enfoque y error). Cada página entrega sus
   datos (secciones, campos de identificación, textos y
   función de informe PDF); la lógica de puntuación no vive
   aquí, solo se recopilan las respuestas.
   ============================================================ */

const OPCIONES = [
  {
    valor: "nunca",
    etiqueta: "NUNCA",
    descripcion: "La conducta nunca o casi nunca ocurre.",
    puntaje: 1,
  },
  {
    valor: "ocasionalmente",
    etiqueta: "OCASIONALMENTE",
    descripcion: "La conducta ocurre a veces.",
    puntaje: 2,
  },
  {
    valor: "frecuentemente",
    etiqueta: "FRECUENTEMENTE",
    descripcion: "La conducta ocurre a menudo.",
    puntaje: 3,
  },
  {
    valor: "siempre",
    etiqueta: "SIEMPRE",
    descripcion: "La conducta ocurre siempre o casi siempre.",
    puntaje: 4,
  },
];

const TARJETA = "rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]";
const TITULO_SECCION = "text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500";
const CONTROL_BASE =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors focus:ring-4";
const CONTROL_OK = "border-neutral-300 hover:border-neutral-400 focus:border-indigo-500 focus:ring-indigo-500/10";
const CONTROL_ERROR = "border-red-400 focus:border-red-500 focus:ring-red-500/10";

export default function CuestionarioSPM2({
  marca,
  rango,
  instrumento,
  nombreArchivo,
  norma,
  secciones,
  datos,
  intro,
  notaAngustia = null,
  edadMin = null,
  edadMax = null,
  descargarPDF,
  conWord = false,
  confirmacion,
}) {
  const [valores, setValores] = useState(Object.fromEntries(datos.map((d) => [d.campo, ""])));
  const [respuestas, setRespuestas] = useState({});
  const [errores, setErrores] = useState(new Set());
  const [resultado, setResultado] = useState(null);
  const [verResumen, setVerResumen] = useState(false);

  const totalPreguntas = secciones.reduce((n, s) => n + s.preguntas.length, 0);
  const respondidas = Object.keys(respuestas).length;
  const progreso = Math.round((respondidas / totalPreguntas) * 100);

  function actualizarDato(campo, valor) {
    setValores((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => {
      if (!prev.has(`dato-${campo}`)) return prev;
      const next = new Set(prev);
      next.delete(`dato-${campo}`);
      return next;
    });
  }

  function responder(numero, valor) {
    setRespuestas((prev) => ({ ...prev, [numero]: valor }));
    setErrores((prev) => {
      if (!prev.has(`q${numero}`)) return prev;
      const next = new Set(prev);
      next.delete(`q${numero}`);
      return next;
    });
  }

  function alEnviar(e) {
    e.preventDefault();

    const nuevosErrores = new Set();
    for (const d of datos) {
      if (!valores[d.campo].toString().trim()) nuevosErrores.add(d.id);
    }
    const edad = Number(valores.edad);
    if (edadMin != null && (!Number.isInteger(edad) || edad < edadMin || edad > edadMax)) {
      nuevosErrores.add("dato-edad");
    }
    secciones.forEach((seccion, si) => {
      for (let i = 0; i < seccion.preguntas.length; i++) {
        const numero = si * 10 + i + 1;
        if (!respuestas[numero]) nuevosErrores.add(`q${numero}`);
      }
    });

    setErrores(nuevosErrores);

    if (nuevosErrores.size > 0) {
      const primero = document.getElementById(nuevosErrores.values().next().value);
      primero?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const conteo = { nunca: 0, ocasionalmente: 0, frecuentemente: 0, siempre: 0 };
    let puntajeTotal = 0;
    secciones.forEach((seccion, si) => {
      for (let i = 0; i < seccion.preguntas.length; i++) {
        const valor = respuestas[si * 10 + i + 1];
        conteo[valor] += 1;
        puntajeTotal += OPCIONES.find((o) => o.valor === valor).puntaje;
      }
    });

    setResultado({ conteo, puntajeTotal });
    setVerResumen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reiniciar() {
    setValores(Object.fromEntries(datos.map((d) => [d.campo, ""])));
    setRespuestas({});
    setErrores(new Set());
    setResultado(null);
    setVerResumen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (verResumen && resultado) {
    const informe = {
      nombreArchivo,
      instrumento,
      norma,
      datos: datos.map((d) => ({ etiqueta: d.etiqueta, valor: valores[d.campo] })),
      secciones,
      respuestas,
      opciones: OPCIONES,
    };
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <div className={`p-6 sm:p-10 ${TARJETA}`}>
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xl text-emerald-600">
              ✓
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Respuestas registradas</h1>
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">{confirmacion}</p>
            </div>
          </div>

          <h2 className={`mt-8 ${TITULO_SECCION}`}>Datos de identificación</h2>
          <dl className="mt-3 grid gap-x-6 gap-y-4 rounded-2xl bg-neutral-50 p-5 sm:grid-cols-2">
            {datos.map((d) => (
              <div key={d.id} className="min-w-0">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                  {d.etiqueta}
                </dt>
                <dd className="mt-0.5 truncate text-sm font-medium">{valores[d.campo]}</dd>
              </div>
            ))}
          </dl>

          <h2 className={`mt-8 ${TITULO_SECCION}`}>Resumen de frecuencia</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {OPCIONES.map((o) => (
              <div
                key={o.valor}
                className="rounded-2xl border border-neutral-200 px-4 py-4 text-center"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                  {o.etiqueta}
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-indigo-600">
                  {resultado.conteo[o.valor]}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm text-indigo-900">
            <span className="font-semibold">Puntaje total: </span>
            {resultado.puntajeTotal} de {totalPreguntas * 4}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => descargarPDF(informe)}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Descargar informe PDF
            </button>
            {conWord && (
              <button
                type="button"
                onClick={() => descargarInformeWord(informe)}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                Descargar informe Word
              </button>
            )}
            <button
              type="button"
              onClick={() => setVerResumen(false)}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 px-5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Volver al formulario
            </button>
            <button
              type="button"
              onClick={reiniciar}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 px-5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Completar otro formulario
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20">
      {/* Barra de progreso fija */}
      <div className="sticky top-0 z-20 -mx-4 mb-8 border-b border-neutral-200/80 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <p className="min-w-0 flex-1 truncate text-[13px] font-semibold tracking-tight">
            {marca}
            <span className="font-normal text-neutral-400"> · {rango}</span>
          </p>
          <p className="shrink-0 text-xs tabular-nums text-neutral-500">
            {respondidas} de {totalPreguntas} respondidas
          </p>
        </div>
        <div className="mx-auto mt-2 h-1 max-w-3xl overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      <header className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-600">
          SPM-2 · Sensory Processing Measure, Second Edition
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {marca}
          <span className="text-neutral-300" aria-hidden="true">
            {" "}
            →{" "}
          </span>
          {rango}
        </h1>
      </header>

      {/* Instrucciones */}
      <section className={`mb-10 p-6 ${TARJETA}`}>
        <h2 className={TITULO_SECCION}>Instrucciones</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">{intro}</p>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {OPCIONES.map((o) => (
            <div key={o.valor} className="rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 py-3">
              <p className="text-xs font-bold tracking-wide text-neutral-900">{o.etiqueta}</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">{o.descripcion}</p>
            </div>
          ))}
        </div>
        {notaAngustia && (
          <p className="mt-4 text-[13px] leading-relaxed text-neutral-500">{notaAngustia}</p>
        )}
        <p className="mt-4 text-xs text-neutral-400">* Indica que la pregunta es obligatoria.</p>
      </section>

      <form onSubmit={alEnviar} noValidate>
        {/* Datos de identificación */}
        <section className={`mb-10 p-6 ${TARJETA}`}>
          <h2 className={TITULO_SECCION}>Datos de identificación</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {datos.map((d) => {
              const conError = errores.has(d.id);
              const esEdad = d.campo === "edad";
              const control = `${CONTROL_BASE} ${conError ? CONTROL_ERROR : CONTROL_OK}`;
              return (
                <div key={d.id} id={d.id} className={d.tipo === "textarea" ? "sm:col-span-2" : ""}>
                  <label htmlFor={d.id} className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                    {d.etiqueta} <span className="text-red-500">*</span>
                  </label>
                  {d.tipo === "textarea" ? (
                    <textarea
                      id={d.id}
                      rows={3}
                      value={valores[d.campo]}
                      onChange={(e) => actualizarDato(d.campo, e.target.value)}
                      required
                      aria-invalid={conError}
                      className={`${control} resize-y`}
                    />
                  ) : (
                    <input
                      id={d.id}
                      type={d.tipo}
                      value={valores[d.campo]}
                      onChange={(e) => actualizarDato(d.campo, e.target.value)}
                      min={esEdad && edadMin != null ? edadMin : undefined}
                      max={esEdad && edadMax != null ? edadMax : undefined}
                      step={esEdad ? 1 : undefined}
                      required
                      aria-invalid={conError}
                      className={control}
                    />
                  )}
                  {conError && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {esEdad && edadMin != null
                        ? `Ingresa una edad entera entre ${edadMin} y ${edadMax} años.`
                        : "Este campo es obligatorio."}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Secciones de preguntas */}
        {secciones.map((seccion, indice) => {
          const desde = indice * 10 + 1;
          const hasta = desde + seccion.preguntas.length - 1;
          return (
            <section key={seccion.titulo} className="mb-10">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold tracking-tight">{seccion.titulo}</h2>
                <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-medium text-neutral-500">
                  Preguntas {desde} a {hasta}
                </span>
              </div>
              <div className="space-y-3.5">
                {seccion.preguntas.map((texto, i) => {
                  const numero = desde + i;
                  const clave = `q${numero}`;
                  const conError = errores.has(clave);
                  return (
                    <div
                      key={numero}
                      id={clave}
                      className={`p-5 transition-colors ${TARJETA} ${
                        conError ? "border-red-300 ring-4 ring-red-500/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
                          {numero}
                        </span>
                        <p className="text-[15px] font-medium leading-relaxed text-neutral-900">
                          {texto} <span className="text-red-500">*</span>
                        </p>
                      </div>
                      <div
                        role="radiogroup"
                        aria-label={texto}
                        className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"
                      >
                        {OPCIONES.map((o) => {
                          const seleccionado = respuestas[numero] === o.valor;
                          return (
                            <label
                              key={o.valor}
                              className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border px-2 py-2 text-center transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-indigo-500/25 ${
                                seleccionado
                                  ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                                  : "border-neutral-200 bg-white text-neutral-600 hover:border-indigo-300 hover:bg-indigo-50/50"
                              }`}
                            >
                              <input
                                type="radio"
                                name={clave}
                                value={o.valor}
                                checked={seleccionado}
                                onChange={() => responder(numero, o.valor)}
                                className="sr-only"
                              />
                              <span
                                aria-hidden="true"
                                className={`size-1.5 shrink-0 rounded-full ${
                                  seleccionado ? "bg-white" : "bg-neutral-300"
                                }`}
                              />
                              <span className="text-[11px] font-semibold uppercase tracking-wide sm:text-xs">
                                {o.etiqueta}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      {conError && (
                        <p className="mt-3 text-xs text-red-600">
                          Seleccione una opción para continuar.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Envío */}
        <section className={`p-6 ${TARJETA}`}>
          {errores.size > 0 && (
            <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Faltan {errores.size} respuesta{errores.size === 1 ? "" : "s"} obligatoria
              {errores.size === 1 ? "" : "s"} por completar. Revise los campos marcados en rojo.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-7 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Enviar respuestas
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Seguro que desea borrar todas las respuestas?")) reiniciar();
              }}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 px-5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Borrar respuestas
            </button>
          </div>
        </section>
      </form>
    </main>
  );
}
