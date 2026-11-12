"use client";

import { useState } from "react";
import { calcularEdad, fechaLarga } from "@/lib/informe-evaluacion-inicial";

/* ============================================================
   EVALUACIÓN INICIAL DE TERAPIA OCUPACIONAL · COMPONENTE COMÚN
   Interfaz compartida de las cuatro fichas de Evaluación
   Inicial (Infantil, Adolescencia, Adulto y Persona Mayor).
   A diferencia del SPM-2 y del Perfil Sensorial 2, no es un
   cuestionario de frecuencia: es una ficha de entrevista. Cada
   página entrega el esquema de sus secciones (campos de texto,
   texto largo, fecha, número, radio, sí/no y escala con
   observación) y las funciones de descarga del informe
   (`descargarInformePDF` y `descargarInformeWord` reciben el
   objeto de valores completo). Al enviar se muestra una
   pantalla de confirmación mínima solo con las descargas; la
   síntesis automatizada y el registro viven dentro del
   informe. Los campos con `autoDesde` (p. ej. Edad desde la
   fecha de nacimiento) se completan automáticamente.
   ============================================================ */

const TARJETA = "rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]";
const TITULO_SECCION = "text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500";
const CONTROL_BASE =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors focus:ring-4";
const CONTROL_OK = "border-neutral-300 hover:border-neutral-400 focus:border-indigo-500 focus:ring-indigo-500/10";
const CONTROL_ERROR = "border-red-400 focus:border-red-500 focus:ring-red-500/10";

const OPCIONES_SI_NO = [
  { valor: "si", etiqueta: "Sí" },
  { valor: "no", etiqueta: "No" },
];

/* Los tipos del esquema se traducen a tipos nativos de input
   (fecha → date con calendario y formato del navegador,
   numero → number). Un tipo no válido degradaría a texto. */
const TIPO_INPUT = { texto: "text", numero: "number", fecha: "date" };

/* Los campos de texto largo son narrativos: se completan durante
   la entrevista y no son obligatorios salvo que el esquema
   indique lo contrario. El resto de tipos sí lo son por defecto. */
function esRequerido(campo) {
  return campo.requerido ?? campo.tipo !== "textoLargo";
}

/* Botonera de opciones (radio, sí/no y escala). */
function BotonesOpciones({ nombre, opciones, valor, conError, alElegir }) {
  return (
    <div
      role="radiogroup"
      aria-label={nombre}
      className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
    >
      {opciones.map((o) => {
        const seleccionado = valor === o.valor;
        return (
          <label
            key={o.valor}
            className={`flex min-h-10 cursor-pointer items-center justify-center rounded-xl border px-2 py-2 text-center transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-indigo-500/25 ${
              seleccionado
                ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                : conError
                  ? "border-neutral-200 bg-white text-neutral-600 hover:border-red-300 hover:bg-red-50/50"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-indigo-300 hover:bg-indigo-50/50"
            }`}
          >
            <input
              type="radio"
              name={nombre}
              value={o.valor}
              checked={seleccionado}
              onChange={() => alElegir(o.valor)}
              className="sr-only"
            />
            <span className="text-xs font-semibold sm:text-[13px]">{o.etiqueta}</span>
          </label>
        );
      })}
    </div>
  );
}

/* Fila de independencia funcional (u otra escala): etiqueta,
   niveles y observación, como la pauta impresa. */
function CampoEscala({ campo, valores, conError, alCambiar }) {
  const claveObs = `${campo.id}Obs`;
  const opciones = campo.opciones ?? [];
  return (
    <div id={`campo-${campo.id}`} className={`p-5 transition-colors ${TARJETA} ${conError ? "border-red-300 ring-4 ring-red-500/5" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] font-medium leading-relaxed text-neutral-900">{campo.etiqueta}</p>
        {campo.hint && <p className="shrink-0 text-xs text-neutral-400">{campo.hint}</p>}
      </div>
      <BotonesOpciones
        nombre={campo.id}
        opciones={opciones}
        valor={valores[campo.id]}
        conError={conError}
        alElegir={(valor) => alCambiar(campo.id, valor)}
      />
      {campo.obs !== false && (
        <div className="mt-3">
          <label htmlFor={claveObs} className="mb-1 block text-xs font-medium text-neutral-500">
            Obs
          </label>
          <textarea
            id={claveObs}
            rows={2}
            value={valores[claveObs] ?? ""}
            onChange={(e) => alCambiar(claveObs, e.target.value)}
            className={`${CONTROL_BASE} text-sm ${CONTROL_OK}`}
          />
        </div>
      )}
      {conError && (
        <p className="mt-3 text-xs text-red-600">Seleccione el nivel que corresponde para continuar.</p>
      )}
    </div>
  );
}

export default function CuestionarioEvaluacionInicial({
  marca,
  rango,
  instrumento,
  intro,
  secciones,
  descargarInformePDF,
  descargarInformeWord,
  confirmacion,
}) {
  const [valores, setValores] = useState({});
  const [errores, setErrores] = useState(new Set());
  const [verResumen, setVerResumen] = useState(false);

  const todosLosCampos = secciones.flatMap((s) => s.campos);
  const camposRequeridos = todosLosCampos.filter(esRequerido);
  const respondidos = camposRequeridos.filter((c) => (valores[c.id] ?? "").toString().trim() !== "").length;
  const progreso = Math.round((respondidos / Math.max(camposRequeridos.length, 1)) * 100);

  function actualizar(campo, valor) {
    setValores((prev) => {
      const next = { ...prev, [campo]: valor };
      // Campos calculados (p. ej. Edad desde la fecha de nacimiento).
      for (const c of todosLosCampos) {
        if (c.autoDesde === campo) {
          const edad = calcularEdad(valor);
          next[c.id] = edad == null ? "" : String(edad);
        }
      }
      return next;
    });
    setErrores((prev) => {
      const clave = campo.startsWith("campo-") ? campo : `campo-${campo}`;
      if (!prev.has(clave)) return prev;
      const next = new Set(prev);
      next.delete(clave);
      return next;
    });
  }

  function alEnviar(e) {
    e.preventDefault();

    const nuevosErrores = new Set();
    for (const campo of camposRequeridos) {
      if ((valores[campo.id] ?? "").toString().trim() === "") nuevosErrores.add(`campo-${campo.id}`);
    }

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
    setValores({});
    setErrores(new Set());
    setVerResumen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (verResumen) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
        <div className={`p-6 sm:p-10 ${TARJETA}`}>
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xl text-emerald-600">
              ✓
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Registro completado</h1>
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">{confirmacion}</p>
            </div>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-neutral-600">
            Descarga el informe con la síntesis automatizada de la evaluación y el plan de
            intervención, listo para firmar e integrar a la ficha.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => descargarInformePDF(valores)}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Descargar informe PDF
            </button>
            <button
              type="button"
              onClick={() => descargarInformeWord(valores)}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Descargar informe Word
            </button>
          </div>

          <button
            type="button"
            onClick={reiniciar}
            className="mt-6 text-[13px] font-medium text-neutral-400 underline-offset-4 transition-colors hover:text-neutral-600 hover:underline"
          >
            Completar otra evaluación
          </button>
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
            {respondidos} de {camposRequeridos.length} campos completados
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
          {instrumento}
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
        <p className="mt-4 text-xs text-neutral-400">
          Los campos marcados con * son obligatorios. Los campos de texto largo pueden quedar
          vacíos si no aplica durante la entrevista.
        </p>
      </section>

      <form onSubmit={alEnviar} noValidate>
        {secciones.map((seccion) => (
          <section key={seccion.id} className="mb-10">
            <div className="mb-4">
              <h2 className="text-lg font-bold tracking-tight">{seccion.titulo}</h2>
              {seccion.descripcion && (
                <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">{seccion.descripcion}</p>
              )}
            </div>

            {(() => {
              const escalas = seccion.campos.filter((c) => c.tipo === "escala");
              const otros = seccion.campos.filter((c) => c.tipo !== "escala");
              return (
                <>
                  {escalas.length > 0 && (
                    <div className="space-y-3.5">
                      {escalas.map((campo) => (
                        <CampoEscala
                          key={campo.id}
                          campo={campo}
                          valores={valores}
                          conError={errores.has(`campo-${campo.id}`)}
                          alCambiar={actualizar}
                        />
                      ))}
                    </div>
                  )}
                  {otros.length > 0 && (
                    <div className={`mt-4 space-y-5 p-6 ${TARJETA}`}>
                      {otros.map((campo) => {
                        const clave = `campo-${campo.id}`;
                        const conError = errores.has(clave);
                        const requerido = esRequerido(campo);
                        const control = `${CONTROL_BASE} ${conError ? CONTROL_ERROR : CONTROL_OK}`;
                        const opciones =
                          campo.tipo === "siNo" && !campo.opciones ? OPCIONES_SI_NO : campo.opciones;
                        return (
                          <div key={campo.id} id={clave}>
                            <label
                              htmlFor={campo.tipo === "texto" || campo.tipo === "numero" || campo.tipo === "fecha" || campo.tipo === "textoLargo" ? campo.id : undefined}
                              className="mb-1.5 block text-[13px] font-medium text-neutral-700"
                            >
                              {campo.etiqueta}{" "}
                              {requerido ? (
                                <span className="text-red-500">*</span>
                              ) : (
                                <span className="text-neutral-400">(opcional)</span>
                              )}
                            </label>

                            {(campo.tipo === "texto" || campo.tipo === "numero" || campo.tipo === "fecha") && (
                              <input
                                id={campo.id}
                                type={TIPO_INPUT[campo.tipo] ?? "text"}
                                placeholder={campo.placeholder}
                                value={valores[campo.id] ?? ""}
                                onChange={(e) => actualizar(campo.id, e.target.value)}
                                required={requerido}
                                aria-invalid={conError}
                                className={control}
                              />
                            )}

                            {campo.tipo === "fecha" && (
                              <p className="mt-1.5 text-xs text-neutral-400">
                                {valores[campo.id]
                                  ? `Fecha seleccionada: ${fechaLarga(valores[campo.id])}`
                                  : "Formato DD/MM/AAAA · elige la fecha en el calendario."}
                              </p>
                            )}
                            {campo.autoDesde && valores[campo.id] !== undefined && valores[campo.id] !== "" && (
                              <p className="mt-1 text-xs text-neutral-400">
                                Calculada automáticamente desde la fecha de nacimiento.
                              </p>
                            )}

                            {campo.tipo === "textoLargo" && (
                              <textarea
                                id={campo.id}
                                rows={campo.filas ?? 3}
                                placeholder={campo.placeholder}
                                value={valores[campo.id] ?? ""}
                                onChange={(e) => actualizar(campo.id, e.target.value)}
                                required={requerido}
                                aria-invalid={conError}
                                className={control}
                              />
                            )}

                            {(campo.tipo === "radio" || campo.tipo === "siNo") && (
                              <BotonesOpciones
                                nombre={campo.id}
                                opciones={opciones}
                                valor={valores[campo.id]}
                                conError={conError}
                                alElegir={(valor) => actualizar(campo.id, valor)}
                              />
                            )}

                            {campo.hint && (
                              <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">{campo.hint}</p>
                            )}
                            {conError && (
                              <p className="mt-1.5 text-xs text-red-600">Este campo es obligatorio.</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </section>
        ))}

        {/* Envío */}
        <section className={`p-6 ${TARJETA}`}>
          {errores.size > 0 && (
            <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Faltan {errores.size} campo{errores.size === 1 ? "" : "s"} obligatorio
              {errores.size === 1 ? "" : "s"} por completar. Revise los campos marcados en rojo.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-7 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Enviar evaluación
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Seguro que desea borrar todos los datos de la evaluación?")) reiniciar();
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
