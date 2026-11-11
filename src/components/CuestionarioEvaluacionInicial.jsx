"use client";

import { useState } from "react";

/* ============================================================
   EVALUACIÓN INICIAL DE TERAPIA OCUPACIONAL · COMPONENTE COMÚN
   Interfaz compartida de las cuatro fichas de Evaluación
   Inicial (Infantil, Adolescencia, Adulto y Persona Mayor).
   A diferencia del SPM-2 y del Perfil Sensorial 2, no es un
   cuestionario de frecuencia: es una ficha de entrevista. Cada
   página entrega el esquema de sus secciones (campos de texto,
   texto largo, fecha, número, radio, sí/no y escala con
   observación) y la función `sintetizar` que construye la
   síntesis automatizada y las banderas clínicas que se muestran
   en el resumen y en el informe PDF (`descargarInformePDF`
   recibe el objeto de valores completo).
   ============================================================ */

const TARJETA = "rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]";
const TITULO_SECCION = "text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500";
const CONTROL_BASE =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors focus:ring-4";
const CONTROL_OK = "border-neutral-300 hover:border-neutral-400 focus:border-indigo-500 focus:ring-indigo-500/10";
const CONTROL_ERROR = "border-red-400 focus:border-red-500 focus:ring-red-500/10";

const TINTE_BANDERA = {
  critico: "bg-red-50 text-red-900 border-red-200",
  alerta: "bg-amber-50 text-amber-900 border-amber-200",
  ok: "bg-emerald-50 text-emerald-900 border-emerald-200",
  info: "bg-indigo-50 text-indigo-900 border-indigo-200",
};

const ETIQUETA_BANDERA = {
  critico: "Atención inmediata",
  alerta: "Alerta",
  ok: "Sin alertas",
  info: "Información",
};

const OPCIONES_SI_NO = [
  { valor: "si", etiqueta: "Sí" },
  { valor: "no", etiqueta: "No" },
];

/* Los campos de texto largo son narrativos: se completan durante
   la entrevista y no son obligatorios salvo que el esquema
   indique lo contrario. El resto de tipos sí lo son por defecto. */
function esRequerido(campo) {
  return campo.requerido ?? campo.tipo !== "textoLargo";
}

function BloqueBandera({ bloque }) {
  return (
    <div className={`rounded-2xl border px-5 py-4 text-sm ${TINTE_BANDERA[bloque.nivel] ?? TINTE_BANDERA.info}`}>
      <span className="text-[11px] font-bold uppercase tracking-wide">
        {ETIQUETA_BANDERA[bloque.nivel] ?? ETIQUETA_BANDERA.info}
        {bloque.titulo ? ` · ${bloque.titulo}` : ""}
      </span>
      <p className="mt-1 leading-relaxed">{bloque.texto}</p>
    </div>
  );
}

function BloqueTabla({ bloque }) {
  return (
    <div>
      {bloque.titulo && <p className="text-sm font-semibold">{bloque.titulo}</p>}
      <table className="mt-2 w-full border-collapse overflow-hidden rounded-2xl text-sm">
        <thead>
          <tr className="bg-neutral-100 text-left text-[11px] uppercase tracking-wide text-neutral-500">
            {bloque.columnas.map((c) => (
              <th key={c.titulo} className="px-3 py-2 font-semibold">
                {c.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {bloque.filas.map((fila, i) => (
            <tr key={i}>
              {fila.map((celda, j) => (
                <td key={j} className="px-3 py-2 align-top">
                  {celda || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BloquesSintesis({ bloques }) {
  return (
    <div className="space-y-4">
      {bloques.map((bloque, i) => {
        if (bloque.tipo === "bandera") return <BloqueBandera key={i} bloque={bloque} />;
        if (bloque.tipo === "tabla") return <BloqueTabla key={i} bloque={bloque} />;
        if (bloque.tipo === "lista") {
          return (
            <div key={i}>
              {bloque.titulo && <p className="text-sm font-semibold">{bloque.titulo}</p>}
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-relaxed text-neutral-700">
                {bloque.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          );
        }
        return (
          <div key={i}>
            {bloque.titulo && <p className="text-sm font-semibold">{bloque.titulo}</p>}
            <p className="mt-1 text-sm leading-relaxed text-neutral-700">{bloque.texto}</p>
          </div>
        );
      })}
    </div>
  );
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

/* Resumen compacto de los campos de escala dentro del informe. */
function TablaEscalasResumen({ campos, valores }) {
  return (
    <table className="mt-2 w-full border-collapse overflow-hidden rounded-2xl text-sm">
      <thead>
        <tr className="bg-neutral-100 text-left text-[11px] uppercase tracking-wide text-neutral-500">
          <th className="px-3 py-2 font-semibold">Ámbito</th>
          <th className="px-3 py-2 font-semibold">Nivel</th>
          <th className="px-3 py-2 font-semibold">Observación</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-100">
        {campos.map((campo) => {
          const elegida = campo.opciones?.find((o) => o.valor === valores[campo.id])?.etiqueta;
          return (
            <tr key={campo.id}>
              <td className="px-3 py-2 align-top font-medium">{campo.etiqueta}</td>
              <td className="px-3 py-2 align-top">{elegida ?? "—"}</td>
              <td className="px-3 py-2 align-top text-neutral-600">{valores[`${campo.id}Obs`] || "—"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function CuestionarioEvaluacionInicial({
  marca,
  rango,
  instrumento,
  intro,
  secciones,
  sintetizar,
  descargarInformePDF,
  confirmacion,
}) {
  const [valores, setValores] = useState({});
  const [errores, setErrores] = useState(new Set());
  const [verResumen, setVerResumen] = useState(false);

  const todosLosCampos = secciones.flatMap((s) => s.campos);
  const camposRequeridos = todosLosCampos.filter(esRequerido);
  const respondidos = camposRequeridos.filter((c) => (valores[c.id] ?? "").toString().trim() !== "").length;
  const progreso = Math.round((respondidos / Math.max(camposRequeridos.length, 1)) * 100);
  const seccionId = secciones.find((s) => s.identificacion);

  function actualizar(campo, valor) {
    setValores((prev) => ({ ...prev, [campo]: valor }));
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
    const sintesis = sintetizar(valores);
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
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

          {seccionId && (
            <>
              <h2 className={`mt-8 ${TITULO_SECCION}`}>Datos de identificación</h2>
              <dl className="mt-3 grid gap-x-6 gap-y-4 rounded-2xl bg-neutral-50 p-5 sm:grid-cols-2">
                {seccionId.campos.map((campo) => (
                  <div key={campo.id} className="min-w-0">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                      {campo.etiqueta}
                    </dt>
                    <dd className="mt-0.5 truncate text-sm font-medium">
                      {valores[campo.id] || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}

          <h2 className={`mt-8 ${TITULO_SECCION}`}>Síntesis automatizada</h2>
          <div className="mt-3">
            <BloquesSintesis bloques={sintesis} />
          </div>

          <h2 className={`mt-8 ${TITULO_SECCION}`}>Registro de respuestas</h2>
          <div className="mt-3 space-y-6">
            {secciones.map((seccion) => {
              const escalas = seccion.campos.filter((c) => c.tipo === "escala");
              const otros = seccion.campos.filter((c) => c.tipo !== "escala");
              return (
                <div key={seccion.id}>
                  <p className="text-[15px] font-bold tracking-tight">{seccion.titulo}</p>
                  {escalas.length > 0 && <TablaEscalasResumen campos={escalas} valores={valores} />}
                  <dl className="mt-3 space-y-3">
                    {otros.map((campo) => {
                      const valor = valores[campo.id];
                      const elegida =
                        (campo.tipo === "radio" || campo.tipo === "siNo") && campo.opciones
                          ? campo.opciones.find((o) => o.valor === valor)?.etiqueta
                          : null;
                      return (
                        <div key={campo.id} className="rounded-xl bg-neutral-50 px-4 py-3">
                          <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                            {campo.etiqueta}
                          </dt>
                          <dd className={`mt-0.5 whitespace-pre-line text-sm ${valor ? "text-neutral-900" : "text-neutral-400"}`}>
                            {elegida ?? (valor || "Sin información registrada")}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              );
            })}
          </div>

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
              Completar otra evaluación
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
                                type={campo.tipo}
                                value={valores[campo.id] ?? ""}
                                onChange={(e) => actualizar(campo.id, e.target.value)}
                                required={requerido}
                                aria-invalid={conError}
                                className={control}
                              />
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
