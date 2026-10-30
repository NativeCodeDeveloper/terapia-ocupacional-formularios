"use client";

import { useState } from "react";
import {
  calcularPuntuacionInfante,
  CUADRANTES,
} from "@/lib/informe-infantil";

/* ============================================================
   CUESTIONARIO INFANT SENSORY PROFILE 2 · COMPONENTE
   Interfaz del cuestionario para padres o tutores (nacimiento
   a 6 meses). A diferencia del SPM-2, la escala tiene seis
   opciones (Casi siempre = 5 … No aplicable = 0) y el
   resultado se clasifica en la curva normal, no en puntaje T.
   Cada página entrega sus secciones (ítems con cuadrante),
   datos, textos y la función de informe PDF.
   ============================================================ */

const OPCIONES = [
  {
    valor: "casiSiempre",
    etiqueta: "CASI SIEMPRE",
    descripcion: "Responde de esta manera casi siempre (90% o más del tiempo).",
    puntaje: 5,
  },
  {
    valor: "frecuentemente",
    etiqueta: "FRECUENTEMENTE",
    descripcion: "Responde de esta manera frecuentemente (75% del tiempo).",
    puntaje: 4,
  },
  {
    valor: "laMitad",
    etiqueta: "LA MITAD DEL TIEMPO",
    descripcion: "Responde de esta manera la mitad del tiempo (50% del tiempo).",
    puntaje: 3,
  },
  {
    valor: "ocasionalmente",
    etiqueta: "OCASIONALMENTE",
    descripcion: "Responde de esta manera ocasionalmente (25% del tiempo).",
    puntaje: 2,
  },
  {
    valor: "casiNunca",
    etiqueta: "CASI NUNCA",
    descripcion: "Responde de esta manera casi nunca (10% o menos del tiempo).",
    puntaje: 1,
  },
  {
    valor: "noAplicable",
    etiqueta: "NO APLICABLE",
    descripcion:
      "No puede contestar porque no ha observado ese comportamiento o no es aplicable a su bebé. Puntúa 0.",
    puntaje: 0,
  },
];

const TARJETA = "rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]";
const TITULO_SECCION = "text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500";
const CONTROL_BASE =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors focus:ring-4";
const CONTROL_OK = "border-neutral-300 hover:border-neutral-400 focus:border-indigo-500 focus:ring-indigo-500/10";
const CONTROL_ERROR = "border-red-400 focus:border-red-500 focus:ring-red-500/10";

const TINTE_CLASIFICACION = {
  "Mucho menos que los demás": "bg-emerald-50 text-emerald-900 border-emerald-200",
  "Menos que los demás": "bg-lime-50 text-lime-900 border-lime-200",
  "Como la mayoría de los demás": "bg-indigo-50 text-indigo-900 border-indigo-200",
  "Más que los demás": "bg-amber-50 text-amber-900 border-amber-200",
  "Mucho más que los demás": "bg-red-50 text-red-900 border-red-200",
};

/* Numeración oficial de los ítems: se acumula con el largo real
   de cada sección (las seis secciones tienen largos distintos). */
function iniciosDeSeccion(secciones) {
  const inicios = [];
  let contador = 0;
  for (const seccion of secciones) {
    inicios.push(contador + 1);
    contador += seccion.preguntas.length;
  }
  return inicios;
}

export default function CuestionarioInfante({
  marca,
  rango,
  instrumento,
  nombreArchivo,
  secciones,
  datos,
  intro,
  notaEscala = null,
  edadMin = null,
  edadMax = null,
  descargarPDF,
  confirmacion,
}) {
  const [valores, setValores] = useState(Object.fromEntries(datos.map((d) => [d.campo, ""])));
  const [respuestas, setRespuestas] = useState({});
  const [errores, setErrores] = useState(new Set());
  const [verResumen, setVerResumen] = useState(false);

  const totalPreguntas = secciones.reduce((n, s) => n + s.preguntas.length, 0);
  const inicios = iniciosDeSeccion(secciones);
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
      if (d.requerido === false) continue;
      if (!valores[d.campo].toString().trim()) nuevosErrores.add(d.id);
    }
    const edad = Number(valores.edadMeses);
    if (edadMin != null && (!Number.isInteger(edad) || edad < edadMin || edad > edadMax)) {
      nuevosErrores.add("dato-edadMeses");
    }
    secciones.forEach((seccion, si) => {
      seccion.preguntas.forEach((_texto, i) => {
        const numero = inicios[si] + i;
        if (!respuestas[numero]) nuevosErrores.add(`q${numero}`);
      });
    });

    setErrores(nuevosErrores);

    if (nuevosErrores.size > 0) {
      const primero = document.getElementById(nuevosErrores.values().next().value);
      primero?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setVerResumen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reiniciar() {
    setValores(Object.fromEntries(datos.map((d) => [d.campo, ""])));
    setRespuestas({});
    setErrores(new Set());
    setVerResumen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (verResumen) {
    const resultado = calcularPuntuacionInfante({ secciones, respuestas, opciones: OPCIONES });
    const informe = {
      nombreArchivo,
      instrumento,
      intro,
      datos: datos.map((d) => ({ etiqueta: d.etiqueta, valor: valores[d.campo] })),
      secciones,
      respuestas,
      opciones: OPCIONES,
    };
    const tinteClasificacion = resultado.clasificacion
      ? TINTE_CLASIFICACION[resultado.clasificacion.nombre]
      : "";

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
                <dd className="mt-0.5 truncate text-sm font-medium">{valores[d.campo] || "—"}</dd>
              </div>
            ))}
          </dl>

          <h2 className={`mt-8 ${TITULO_SECCION}`}>Resumen de puntuación</h2>
          <table className="mt-3 w-full border-collapse overflow-hidden rounded-2xl text-sm">
            <thead>
              <tr className="bg-neutral-100 text-left text-[11px] uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-2.5 font-semibold">Sección</th>
                <th className="px-3 py-2.5 text-center font-semibold">Bruto</th>
                <th className="px-3 py-2.5 text-center font-semibold">Máximo</th>
                <th className="px-3 py-2.5 text-center font-semibold">No aplica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {resultado.secciones.map((s) => (
                <tr key={s.titulo}>
                  <td className="px-4 py-2.5 font-medium">{s.titulo}</td>
                  <td className="px-3 py-2.5 text-center tabular-nums font-semibold">{s.raw}</td>
                  <td className="px-3 py-2.5 text-center tabular-nums text-neutral-500">{s.maximo}</td>
                  <td className="px-3 py-2.5 text-center tabular-nums text-neutral-500">{s.noAplicables}</td>
                </tr>
              ))}
              <tr className="bg-neutral-50">
                <td className="px-4 py-3 font-bold">Puntaje total</td>
                <td className="px-3 py-3 text-center text-lg font-bold tabular-nums text-indigo-600">
                  {resultado.total}
                </td>
                <td className="px-3 py-3 text-center tabular-nums font-semibold text-neutral-500">
                  {resultado.totalMaximo}
                </td>
                <td className="px-3 py-3 text-center tabular-nums text-neutral-500">
                  {resultado.totalNoAplicables}
                </td>
              </tr>
            </tbody>
          </table>

          {resultado.clasificacion && (
            <div className={`mt-6 rounded-2xl border px-5 py-4 text-sm ${tinteClasificacion}`}>
              <span className="font-semibold">Clasificación en la curva: </span>
              {resultado.clasificacion.nombre} ({resultado.clasificacion.min}–
              {resultado.clasificacion.max} puntos).
            </div>
          )}

          <h2 className={`mt-8 ${TITULO_SECCION}`}>Cuadrantes por sección</h2>
          <table className="mt-3 w-full border-collapse overflow-hidden rounded-2xl text-sm">
            <thead>
              <tr className="bg-neutral-100 text-left text-[11px] uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-2.5 font-semibold">Sección</th>
                {CUADRANTES.map((c) => (
                  <th key={c.codigo} className="px-3 py-2.5 text-center font-semibold">
                    {c.codigo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {resultado.secciones.map((s) => {
                const maximo = Math.max(...CUADRANTES.map((c) => s.cuadrantes[c.codigo]));
                return (
                  <tr key={s.titulo}>
                    <td className="px-4 py-2.5 font-medium">{s.titulo}</td>
                    {CUADRANTES.map((c) => (
                      <td
                        key={c.codigo}
                        className={`px-3 py-2.5 text-center tabular-nums ${
                          maximo > 0 && s.cuadrantes[c.codigo] === maximo
                            ? "font-bold text-indigo-600"
                            : "text-neutral-500"
                        }`}
                      >
                        {s.cuadrantes[c.codigo]}
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr className="bg-neutral-50">
                <td className="px-4 py-3 font-bold">Total</td>
                {(() => {
                  const maximo = Math.max(...CUADRANTES.map((c) => resultado.totalesCuadrante[c.codigo]));
                  return CUADRANTES.map((c) => (
                    <td
                      key={c.codigo}
                      className={`px-3 py-3 text-center tabular-nums ${
                        maximo > 0 && resultado.totalesCuadrante[c.codigo] === maximo
                          ? "font-bold text-indigo-600"
                          : "font-medium text-neutral-500"
                      }`}
                    >
                      {resultado.totalesCuadrante[c.codigo]}
                    </td>
                  ));
                })()}
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-xs text-neutral-500">
            BU = Buscador · EV = Evitativo · SE = Sensitivo · RE = Registro. El mayor de la fila queda
            destacado.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => descargarPDF(informe)}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Descargar informe PDF
            </button>
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
          INFANT SENSORY PROFILE 2 · Winnie Dunn, PhD, OTR, FAOTA
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
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">
          <span className="font-semibold">Cuando se le presenta la oportunidad, mi bebé…</span>
        </p>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {OPCIONES.map((o) => (
            <div key={o.valor} className="rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 py-3">
              <p className="text-xs font-bold tracking-wide text-neutral-900">
                {o.etiqueta} <span className="text-indigo-600">{o.puntaje}</span>
              </p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">{o.descripcion}</p>
            </div>
          ))}
        </div>
        {notaEscala && <p className="mt-4 text-[13px] leading-relaxed text-neutral-500">{notaEscala}</p>}
        <p className="mt-4 text-xs text-neutral-400">* Indica que la pregunta es obligatoria.</p>
      </section>

      <form onSubmit={alEnviar} noValidate>
        {/* Datos de identificación */}
        <section className={`mb-10 p-6 ${TARJETA}`}>
          <h2 className={TITULO_SECCION}>Datos de identificación</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {datos.map((d) => {
              const conError = errores.has(d.id);
              const esEdad = d.campo === "edadMeses";
              const opcional = d.requerido === false;
              const control = `${CONTROL_BASE} ${conError ? CONTROL_ERROR : CONTROL_OK}`;
              return (
                <div key={d.id} id={d.id}>
                  <label htmlFor={d.id} className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                    {d.etiqueta} {opcional ? <span className="text-neutral-400">(opcional)</span> : <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id={d.id}
                    type={d.tipo}
                    value={valores[d.campo]}
                    onChange={(e) => actualizarDato(d.campo, e.target.value)}
                    min={esEdad && edadMin != null ? edadMin : undefined}
                    max={esEdad && edadMax != null ? edadMax : undefined}
                    step={esEdad ? 1 : undefined}
                    required={!opcional}
                    aria-invalid={conError}
                    className={control}
                  />
                  {conError && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {esEdad && edadMin != null
                        ? `Ingresa una edad entera entre ${edadMin} y ${edadMax} meses.`
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
          const desde = inicios[indice];
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
                {seccion.preguntas.map((pregunta, i) => {
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
                          {pregunta.texto} <span className="text-red-500">*</span>
                        </p>
                      </div>
                      <div
                        role="radiogroup"
                        aria-label={pregunta.texto}
                        className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3"
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
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                  seleccionado ? "bg-white text-indigo-600" : "bg-neutral-100 text-neutral-500"
                                }`}
                              >
                                {o.puntaje}
                              </span>
                              <span className="text-[10px] font-semibold uppercase tracking-wide sm:text-[11px]">
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
