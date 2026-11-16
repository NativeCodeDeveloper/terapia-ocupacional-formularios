"use client";

import { useState } from "react";
import {
  copiarParaEvaluacion,
  eliminarDeBiblioteca,
  filasDeIntegrantes,
  leerBiblioteca,
  normalizarGenograma,
} from "@/lib/genograma";
import DiagramaGenograma from "./DiagramaGenograma";
import EditorGenograma from "./EditorGenograma";

/* ============================================================
   GENOGRAMA FAMILIAR · SECCIÓN OPCIONAL DE LAS EVALUACIONES
   INICIALES
   Componente único compartido por las cuatro fichas de
   Evaluación Inicial (Infantil, Adolescencia, Adulto y Persona
   Mayor). Estados que gestiona: sin genograma, en edición,
   guardado en la biblioteca del navegador, vinculado a esta
   evaluación y modo lectura. Es 100 % opcional: nunca valida,
   nunca bloquea el envío y no altera cálculos ni puntuaciones;
   solo entrega los datos al cuestionario con
   alCambiar(genograma | null) para que el informe los
   incorpore cuando existan.
   ============================================================ */

const TARJETA = "rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]";
const TITULO_SECCION = "text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500";
const BOTON =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors";
const BOTON_PRIMARIO = `${BOTON} border-indigo-600 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700`;
const BOTON_NEUTRO = `${BOTON} border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50`;

export default function GenogramaSeccion({ valor, alCambiar, contexto = "" }) {
  const [abierta, setAbierta] = useState(false);
  const [modo, setModo] = useState(null); // null · "editar" · "ver" · "biblioteca"
  const [biblioteca, setBiblioteca] = useState([]);

  // La biblioteca se lee del navegador al abrir el panel
  // (evento de usuario), nunca durante el render del servidor.
  const abrirBiblioteca = () => {
    setBiblioteca(leerBiblioteca());
    setModo("biblioteca");
  };

  const genograma = valor ? normalizarGenograma(valor) : null;
  const tieneIntegrantes = Boolean(genograma?.personas?.length);
  const estado = tieneIntegrantes
    ? `Vinculado a esta evaluación · ${genograma.personas.length} integrante${genograma.personas.length === 1 ? "" : "s"}`
    : "Sin genograma";

  function usarGenograma(genogramaNuevo) {
    alCambiar(genogramaNuevo?.personas?.length ? normalizarGenograma(genogramaNuevo) : null);
    setModo(null);
  }

  function quitarDeEvaluacion() {
    alCambiar(null);
    setModo(null);
  }

  function usarDeBiblioteca(entrada) {
    // Versión específica para esta evaluación: copia independiente.
    alCambiar(copiarParaEvaluacion(entrada.datos));
    setModo(null);
  }

  function eliminarEntrada(entrada) {
    if (!window.confirm(`¿Eliminar «${entrada.nombre}» de la biblioteca de este navegador?`)) return;
    setBiblioteca(eliminarDeBiblioteca(entrada.id));
  }

  return (
    <section aria-labelledby="genograma-titulo" className={`mb-10 p-6 ${TARJETA}`}>
      {/* Encabezado contraído/desplegado */}
      <button
        type="button"
        onClick={() => setAbierta((prev) => !prev)}
        aria-expanded={abierta}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <h2 id="genograma-titulo" className="text-lg font-bold tracking-tight">
            Genograma familiar{" "}
            <span className="text-[13px] font-medium text-neutral-400">— Opcional</span>
          </h2>
          <p className="mt-0.5 text-[13px] text-neutral-500">{estado}</p>
        </div>
        <span
          aria-hidden="true"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm text-neutral-500 transition-transform ${
            abierta ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {abierta && (
        <div className="mt-4">
          <p className="text-[15px] leading-relaxed text-neutral-700">
            Permite representar gráficamente la estructura familiar, los vínculos de parentesco y las
            relaciones relevantes del usuario. No es obligatorio: puedes continuar y enviar el formulario
            sin completarlo.
          </p>

          {modo === "editar" && (
            <div className="mt-4">
              <EditorGenograma
                valor={genograma}
                contexto={contexto}
                alGuardar={usarGenograma}
                alCancelar={() => setModo(null)}
              />
            </div>
          )}

          {modo === "ver" && genograma && (
            <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={TITULO_SECCION}>Vista del genograma · modo lectura</p>
                <button
                  type="button"
                  onClick={() => setModo(null)}
                  className="text-[13px] font-medium text-indigo-600 underline-offset-2 hover:underline"
                >
                  Cerrar vista
                </button>
              </div>
              <div className="mx-auto mt-3 max-w-2xl overflow-hidden rounded-xl border border-neutral-200 bg-white p-2">
                <DiagramaGenograma genograma={genograma} />
              </div>
              <TablaIntegrantes genograma={genograma} />
              {genograma.notas?.trim() && (
                <p className="mt-3 rounded-xl bg-white px-4 py-3 text-[13px] leading-relaxed text-neutral-600">
                  <span className="font-semibold text-neutral-800">Nota general: </span>
                  {genograma.notas}
                </p>
              )}
            </div>
          )}

          {modo === "biblioteca" && (
            <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={TITULO_SECCION}>Biblioteca del navegador · genogramas guardados</p>
                <button
                  type="button"
                  onClick={() => setModo(null)}
                  className="text-[13px] font-medium text-indigo-600 underline-offset-2 hover:underline"
                >
                  Cerrar
                </button>
              </div>
              {biblioteca.length === 0 ? (
                <p className="mt-3 text-[13px] text-neutral-500">
                  No hay genogramas guardados en este navegador. Crea uno y usa «Guardar en biblioteca»
                  para reutilizarlo en cualquier formulario.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
                  {biblioteca.map((entrada) => (
                    <li key={entrada.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-900">{entrada.nombre}</p>
                        <p className="text-xs text-neutral-500">
                          {entrada.datos.personas.length} integrante
                          {entrada.datos.personas.length === 1 ? "" : "s"}
                          {entrada.actualizado ? ` · actualizado el ${entrada.actualizado.slice(0, 10)}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button type="button" onClick={() => usarDeBiblioteca(entrada)} className={`${BOTON} h-8 border-indigo-600 bg-indigo-600 px-3 text-[13px] text-white hover:bg-indigo-700`}>
                          Usar en esta evaluación
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarEntrada(entrada)}
                          className={`${BOTON} h-8 border-neutral-200 px-3 text-[13px] text-neutral-500 hover:bg-neutral-100`}
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {modo === null && (
            <div className="mt-4">
              {tieneIntegrantes ? (
                <>
                  {/* Vista previa del genograma vinculado */}
                  <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-neutral-200 bg-white p-2">
                    <DiagramaGenograma genograma={genograma} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setModo("ver")} className={BOTON_NEUTRO}>
                      Ver completo
                    </button>
                    <button type="button" onClick={() => setModo("editar")} className={BOTON_NEUTRO}>
                      Editar
                    </button>
                    <button type="button" onClick={abrirBiblioteca} className={BOTON_NEUTRO}>
                      Reutilizar otro
                    </button>
                    <button
                      type="button"
                      onClick={quitarDeEvaluacion}
                      className={`${BOTON} border-transparent text-neutral-500 hover:text-neutral-800`}
                    >
                      Quitar de esta evaluación
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setModo("editar")} className={BOTON_PRIMARIO}>
                    + Crear genograma
                  </button>
                  <button type="button" onClick={abrirBiblioteca} className={BOTON_NEUTRO}>
                    Reutilizar genograma
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* Tabla de integrantes (modo lectura): nombre, vínculos y
   relaciones, edad y observación — igual que en el informe. */
function TablaIntegrantes({ genograma }) {
  const filas = filasDeIntegrantes(genograma);
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse overflow-hidden rounded-xl text-sm">
        <thead>
          <tr className="bg-neutral-100 text-left text-[11px] uppercase tracking-wide text-neutral-500">
            <th className="px-3 py-2 font-semibold">Integrante</th>
            <th className="px-3 py-2 font-semibold">Vínculos y relaciones</th>
            <th className="px-3 py-2 text-center font-semibold">Edad</th>
            <th className="px-3 py-2 font-semibold">Observación</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 bg-white">
          {filas.map((fila, i) => (
            <tr key={i}>
              <td className="px-3 py-2 font-medium">{fila.nombre}</td>
              <td className="px-3 py-2 text-neutral-600">{fila.conexiones}</td>
              <td className="px-3 py-2 text-center tabular-nums text-neutral-600">{fila.edad}</td>
              <td className="px-3 py-2 text-neutral-600">{fila.observacion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
