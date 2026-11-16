"use client";

import { useMemo, useRef, useState } from "react";
import {
  LEYENDA_GENOGRAMA,
  SEXOS,
  TIPOS_RELACION,
  TIPOS_VINCULO,
  conexionAgregada,
  conexionEliminada,
  cambiarTipoConexion,
  genogramaVacio,
  guardarEnBiblioteca,
  normalizarGenograma,
  nuevaPersona,
  personaActualizada,
  personaEliminada,
  personaIndicada,
} from "@/lib/genograma";
import DiagramaGenograma, { puntoSvg } from "./DiagramaGenograma";

/* ============================================================
   GENOGRAMA · EDITOR INTERACTIVO (SVG)
   Editor único de las fichas de Evaluación Inicial: figuras de
   género con arrastre, vínculos de pareja y de descendencia,
   relaciones de calidad y nota general. Se invoca desde
   GenogramaSeccion en modo edición; entrega el resultado con
   alGuardar(borrador) —usarlo en la evaluación— y solo escribe
   en la biblioteca del navegador con «Guardar en biblioteca».
   ============================================================ */

const BOTON =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border px-3 text-[13px] font-medium transition-colors";
const BOTON_PRIMARIO = `${BOTON} border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40`;
const BOTON_NEUTRO = `${BOTON} border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50`;
const ETIQUETA_CAMPO = "mb-1 block text-xs font-medium text-neutral-600";
const CONTROL =
  "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

const LIENZO_ANCHO = 960;
const LIENZO_ALTO = 620;

const OPCIONES_PAREJA = TIPOS_VINCULO.filter((t) => t.grupo === "pareja");
const ES_RELACION = (tipo) => TIPOS_RELACION.some((t) => t.valor === tipo);

export default function EditorGenograma({ valor, contexto = "", alGuardar, alCancelar }) {
  const [borrador, setBorrador] = useState(() => normalizarGenograma(valor));
  const [personaId, setPersonaId] = useState(null);
  const [conexionId, setConexionId] = useState(null);
  const [conectando, setConectando] = useState(false);
  const [desde, setDesde] = useState(null);
  const [menu, setMenu] = useState(null); // { de, a } a la espera del tipo de conexión
  const [nombreBiblioteca, setNombreBiblioteca] = useState("");
  const [guardandoEnBiblioteca, setGuardandoEnBiblioteca] = useState(false);
  const [aviso, setAviso] = useState("");
  const referenciaSvg = useRef(null);
  const arrastre = useRef(null);

  const persona = borrador.personas.find((p) => p.id === personaId) ?? null;
  const conexion =
    borrador.vinculos.find((v) => v.id === conexionId) ??
    borrador.relaciones.find((r) => r.id === conexionId) ??
    null;
  const inicial = useMemo(() => JSON.stringify(normalizarGenograma(valor)), [valor]);
  const sucio = JSON.stringify(borrador) !== inicial;
  const nombreDe = (id) => borrador.personas.find((p) => p.id === id)?.nombre?.trim() || "sin nombre";
  const usuario = borrador.personas.find((p) => p.indicado) ?? null;

  function cancelarMenu() {
    setMenu(null);
    setDesde(null);
  }

  function deseleccionar() {
    setPersonaId(null);
    setConexionId(null);
  }

  /* ---------- Interacción con el lienzo ---------- */

  function alAbajoPersona(personaClic, evento) {
    if (conectando) return; // en modo conectar solo importa el clic
    evento.currentTarget.setPointerCapture(evento.pointerId);
    arrastre.current = {
      id: personaClic.id,
      inicio: puntoSvg(referenciaSvg.current, evento.clientX, evento.clientY),
      movio: false,
    };
  }

  function alMoverPersona(personaClic, evento) {
    const estado = arrastre.current;
    if (!estado || estado.id !== personaClic.id) return;
    const punto = puntoSvg(referenciaSvg.current, evento.clientX, evento.clientY);
    if (!estado.movio && Math.hypot(punto.x - estado.inicio.x, punto.y - estado.inicio.y) < 5) return;
    estado.movio = true;
    setBorrador((prev) =>
      personaActualizada(prev, personaClic.id, {
        x: Math.min(Math.max(punto.x, 28), LIENZO_ANCHO - 28),
        y: Math.min(Math.max(punto.y, 28), LIENZO_ALTO - 28),
      })
    );
  }

  function alSoltarPersona(personaClic) {
    const estado = arrastre.current;
    arrastre.current = null;
    if (estado?.movio) return;
    if (conectando) {
      if (!desde) {
        setDesde(personaClic.id);
      } else if (desde === personaClic.id) {
        setDesde(null);
      } else {
        setMenu({ de: desde, a: personaClic.id });
        setDesde(null);
      }
      return;
    }
    setPersonaId(personaClic.id);
    setConexionId(null);
  }

  function alClicConexion(conexionClic) {
    setConexionId(conexionClic.id);
    setPersonaId(null);
  }

  function elegirTipo(tipo) {
    if (!menu) return;
    setBorrador((prev) => conexionAgregada(prev, tipo, menu.de, menu.a));
    cancelarMenu();
    setAviso("");
  }

  /* ---------- Panel de persona ---------- */

  const actualizarPersona = (cambios) => setBorrador((prev) => personaActualizada(prev, persona.id, cambios));

  function eliminarPersona() {
    if (!window.confirm(`¿Quitar a ${persona.nombre?.trim() || "esta persona"} del genograma?`)) return;
    setBorrador((prev) => personaEliminada(prev, persona.id));
    setPersonaId(null);
  }

  /* ---------- Panel de conexión ---------- */

  function eliminarConexion() {
    const etiqueta = conexion.tipo === "hijo"
      ? `la descendencia hacia ${nombreDe(conexion.a)}`
      : `el registro entre ${nombreDe(conexion.de)} y ${nombreDe(conexion.a)}`;
    if (!window.confirm(`¿Eliminar ${etiqueta}?`)) return;
    setBorrador((prev) => conexionEliminada(prev, conexion.id));
    setConexionId(null);
  }

  /* ---------- Biblioteca y acciones ---------- */

  const nombreSugerido =
    usuario?.nombre?.trim() || (contexto ? `Genograma · ${contexto}` : "Genograma familiar");

  function guardarEnLaBiblioteca() {
    const nombre = (nombreBiblioteca || nombreSugerido).trim();
    const guardado = guardarEnBiblioteca(borrador, nombre);
    setGuardandoEnBiblioteca(false);
    setNombreBiblioteca("");
    setAviso(guardado ? `Guardado en la biblioteca como «${nombre}».` : "No se pudo guardar en este navegador.");
  }

  function borrarTodo() {
    if (!window.confirm("¿Borrar todas las figuras y vínculos del genograma?")) return;
    setBorrador(genogramaVacio());
    deseleccionar();
    setAviso("");
  }

  /* Agrega una persona en un espacio libre del lienzo (en
     anillos alrededor del centro para no apilarlas). */
  function agregarPersona(sexo) {
    const n = borrador.personas.length;
    const anillo = Math.floor(n / 6);
    const angulo = (n % 6) * (Math.PI / 3) + anillo * 0.5;
    const radio = 110 + anillo * 95;
    const posicion = {
      x: Math.min(Math.max(LIENZO_ANCHO / 2 + Math.cos(angulo) * radio, 60), LIENZO_ANCHO - 60),
      y: Math.min(Math.max(LIENZO_ALTO / 2 + Math.sin(angulo) * radio, 60), LIENZO_ALTO - 60),
    };
    const siguiente = nuevaPersona(borrador, sexo, posicion);
    setBorrador(siguiente);
    setPersonaId(siguiente.personas[siguiente.personas.length - 1].id);
    setConexionId(null);
    setAviso("");
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 sm:p-5">
      {/* Barra de herramientas */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => agregarPersona("hombre")} className={BOTON_NEUTRO}>
          <span aria-hidden="true" className="text-indigo-600">＋</span> Hombre
        </button>
        <button type="button" onClick={() => agregarPersona("mujer")} className={BOTON_NEUTRO}>
          <span aria-hidden="true" className="text-indigo-600">＋</span> Mujer
        </button>
        <button type="button" onClick={() => agregarPersona("otro")} className={BOTON_NEUTRO}>
          <span aria-hidden="true" className="text-indigo-600">＋</span> Otro
        </button>
        <span aria-hidden="true" className="mx-1 hidden h-6 w-px bg-neutral-200 sm:block" />
        <button
          type="button"
          onClick={() => {
            setConectando((prev) => !prev);
            setDesde(null);
            setMenu(null);
            deseleccionar();
          }}
          className={conectando ? BOTON_PRIMARIO : BOTON_NEUTRO}
          aria-pressed={conectando}
        >
          {conectando ? "● Conectando…" : "Conectar"}
        </button>
        <span className="ml-auto text-xs text-neutral-400">{borrador.personas.length} integrantes</span>
        <button
          type="button"
          onClick={borrarTodo}
          className={`${BOTON} border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-100`}
        >
          Borrar todo
        </button>
      </div>

      {/* Lienzo */}
      <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <DiagramaGenograma
          genograma={borrador}
          interactivo={true}
          conRejilla={true}
          ancho={LIENZO_ANCHO}
          alto={LIENZO_ALTO}
          personaSeleccionada={conectando || menu ? null : personaId}
          personaActiva={conectando ? desde : null}
          conexionSeleccionada={conexionId}
          referenciaSvg={referenciaSvg}
          alPointerAbajoPersona={alAbajoPersona}
          alPointerMoverPersona={alMoverPersona}
          alPointerSoltarPersona={alSoltarPersona}
          alClicConexion={alClicConexion}
        />
      </div>

      {/* Ayuda contextual y menú de conexión */}
      <div className="mt-2 min-h-8 text-[13px] text-neutral-500">
        {menu ? (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3">
            <p className="text-[13px] font-medium text-indigo-900">
              {nombreDe(menu.de)} <span aria-hidden="true">→</span> {nombreDe(menu.a)} — ¿qué vínculo quieres crear?
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {OPCIONES_PAREJA.map((t) => (
                <button key={t.valor} type="button" onClick={() => elegirTipo(t.valor)} className={BOTON_NEUTRO}>
                  {t.etiqueta}
                </button>
              ))}
              <button type="button" onClick={() => elegirTipo("hijo")} className={BOTON_NEUTRO}>
                «{nombreDe(menu.a)}» es hijo/a de «{nombreDe(menu.de)}»
              </button>
              <button
                type="button"
                onClick={() => setMenu({ de: menu.a, a: menu.de })}
                className={`${BOTON} border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50`}
                title="Invertir el sentido de la conexión"
              >
                ⇄ Invertir
              </button>
              <span aria-hidden="true" className="mx-1 h-6 w-px bg-indigo-200" />
              {TIPOS_RELACION.map((t) => (
                <button
                  key={t.valor}
                  type="button"
                  onClick={() => elegirTipo(t.valor)}
                  className={`${BOTON} border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50`}
                >
                  {t.etiqueta}
                </button>
              ))}
              <button
                type="button"
                onClick={cancelarMenu}
                className={`${BOTON} border-transparent text-neutral-400 hover:text-neutral-600`}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : conectando ? (
          desde ? (
            <p>
              Ahora haz clic en la otra persona…{" "}
              <button
                type="button"
                onClick={() => setDesde(null)}
                className="text-indigo-600 underline-offset-2 hover:underline"
              >
                cancelar
              </button>
            </p>
          ) : (
            <p>Haz clic en la primera persona para conectar…</p>
          )
        ) : (
          <p>Arrastra las figuras para acomodarlas. Haz clic en una figura o en una línea para editarla.</p>
        )}
      </div>

      {/* Paneles de edición */}
      <div className="mt-1 grid gap-3 lg:grid-cols-2">
        {persona && !menu && (
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-neutral-900">Integrante</p>
              <button
                type="button"
                onClick={() => setPersonaId(null)}
                className="text-xs text-neutral-400 hover:text-neutral-600"
              >
                Cerrar
              </button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="genograma-nombre" className={ETIQUETA_CAMPO}>Nombre</label>
                <input
                  id="genograma-nombre"
                  type="text"
                  value={persona.nombre}
                  onChange={(e) => actualizarPersona({ nombre: e.target.value })}
                  placeholder="Nombre de la persona"
                  className={CONTROL}
                />
              </div>
              <div>
                <p className={ETIQUETA_CAMPO}>Sexo</p>
                <div className="flex gap-1.5">
                  {SEXOS.map((s) => (
                    <button
                      key={s.valor}
                      type="button"
                      onClick={() => actualizarPersona({ sexo: s.valor })}
                      className={`${BOTON} flex-1 ${
                        persona.sexo === s.valor
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                      }`}
                      aria-pressed={persona.sexo === s.valor}
                    >
                      {s.etiqueta}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="genograma-edad" className={ETIQUETA_CAMPO}>Edad</label>
                <input
                  id="genograma-edad"
                  type="number"
                  min="0"
                  step="1"
                  value={persona.edad}
                  onChange={(e) => actualizarPersona({ edad: e.target.value })}
                  className={CONTROL}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="genograma-ocupacion" className={ETIQUETA_CAMPO}>Ocupación o rol familiar (opcional)</label>
                <input
                  id="genograma-ocupacion"
                  type="text"
                  value={persona.ocupacion}
                  onChange={(e) => actualizarPersona({ ocupacion: e.target.value })}
                  placeholder="p. ej., estudiante, dueña de casa"
                  className={CONTROL}
                />
              </div>
              <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-[13px] text-neutral-700">
                  <input
                    type="checkbox"
                    checked={persona.fallecido}
                    onChange={(e) => actualizarPersona({ fallecido: e.target.checked })}
                    className="size-4 accent-indigo-600"
                  />
                  Fallecido/a
                </label>
                <button
                  type="button"
                  onClick={() => setBorrador((prev) => personaIndicada(prev, persona.id))}
                  className={`${BOTON} ${
                    persona.indicado
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                  aria-pressed={persona.indicado}
                  title="Marca a la persona evaluada en esta evaluación"
                >
                  {persona.indicado ? "✓ Es el usuario/a evaluado/a" : "Marcar como usuario/a evaluado/a"}
                </button>
              </div>
              {persona.fallecido && (
                <div className="sm:col-span-2">
                  <label htmlFor="genograma-causa" className={ETIQUETA_CAMPO}>Causa de fallecimiento (opcional)</label>
                  <input
                    id="genograma-causa"
                    type="text"
                    value={persona.causaMuerte}
                    onChange={(e) => actualizarPersona({ causaMuerte: e.target.value })}
                    className={CONTROL}
                  />
                </div>
              )}
              <div className="sm:col-span-2">
                <label htmlFor="genograma-nota-persona" className={ETIQUETA_CAMPO}>Observación de esta persona (opcional)</label>
                <input
                  id="genograma-nota-persona"
                  type="text"
                  value={persona.nota}
                  onChange={(e) => actualizarPersona({ nota: e.target.value })}
                  placeholder="p. ej., convive con el usuario parte de la semana"
                  className={CONTROL}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={eliminarPersona}
              className="mt-3 text-[13px] font-medium text-red-600 underline-offset-2 hover:underline"
            >
              Quitar del genograma
            </button>
          </div>
        )}

        {conexion && !menu && (
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-neutral-900">
                {conexion.tipo === "hijo" ? "Descendencia" : ES_RELACION(conexion.tipo) ? "Relación" : "Vínculo de pareja"}
              </p>
              <button
                type="button"
                onClick={() => setConexionId(null)}
                className="text-xs text-neutral-400 hover:text-neutral-600"
              >
                Cerrar
              </button>
            </div>
            <p className="mt-1 text-[13px] text-neutral-500">
              {conexion.tipo === "hijo"
                ? `${nombreDe(conexion.a)} es hijo/a de ${nombreDe(conexion.de)}.`
                : `${nombreDe(conexion.de)} — ${nombreDe(conexion.a)}.`}
            </p>
            {conexion.tipo !== "hijo" && (
              <div className="mt-3">
                <label htmlFor="genograma-tipo-conexion" className={ETIQUETA_CAMPO}>Tipo</label>
                <select
                  id="genograma-tipo-conexion"
                  value={conexion.tipo}
                  onChange={(e) => setBorrador((prev) => cambiarTipoConexion(prev, conexion.id, e.target.value))}
                  className={CONTROL}
                >
                  {(ES_RELACION(conexion.tipo) ? TIPOS_RELACION : OPCIONES_PAREJA).map((t) => (
                    <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="button"
              onClick={eliminarConexion}
              className="mt-3 text-[13px] font-medium text-red-600 underline-offset-2 hover:underline"
            >
              Eliminar {conexion.tipo === "hijo" ? "descendencia" : ES_RELACION(conexion.tipo) ? "relación" : "vínculo"}
            </button>
          </div>
        )}
      </div>

      {/* Nota general */}
      <div className="mt-3">
        <label htmlFor="genograma-notas" className={ETIQUETA_CAMPO}>Nota general del genograma (opcional)</label>
        <textarea
          id="genograma-notas"
          rows={2}
          value={borrador.notas}
          onChange={(e) => setBorrador((prev) => ({ ...prev, notas: e.target.value }))}
          placeholder="Observaciones de la estructura o dinámica familiar relevantes para la evaluación."
          className={`${CONTROL} resize-y`}
        />
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-neutral-400">{LEYENDA_GENOGRAMA}</p>

      {/* Guardar en biblioteca */}
      {guardandoEnBiblioteca && (
        <div className="mt-3 flex flex-wrap items-end gap-2 rounded-xl border border-neutral-200 bg-white p-3">
          <div className="min-w-56 flex-1">
            <label htmlFor="genograma-nombre-biblioteca" className={ETIQUETA_CAMPO}>
              Nombre con el que se guardará en este navegador
            </label>
            <input
              id="genograma-nombre-biblioteca"
              type="text"
              value={nombreBiblioteca}
              onChange={(e) => setNombreBiblioteca(e.target.value)}
              placeholder={nombreSugerido}
              className={CONTROL}
            />
          </div>
          <button type="button" onClick={guardarEnLaBiblioteca} className={BOTON_PRIMARIO}>Guardar</button>
          <button type="button" onClick={() => setGuardandoEnBiblioteca(false)} className={BOTON_NEUTRO}>Cancelar</button>
        </div>
      )}

      {/* Acciones */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => alGuardar(borrador)} className={BOTON_PRIMARIO}>
          Usar en esta evaluación
        </button>
        <button
          type="button"
          onClick={() => setGuardandoEnBiblioteca(true)}
          className={BOTON_NEUTRO}
          disabled={borrador.personas.length === 0}
          title={borrador.personas.length === 0 ? "Agrega integrantes antes de guardar" : undefined}
        >
          Guardar en biblioteca
        </button>
        <button
          type="button"
          onClick={alCancelar}
          className={`${BOTON} border-transparent text-neutral-500 hover:text-neutral-800`}
        >
          {sucio ? "Cancelar cambios" : "Cerrar editor"}
        </button>
        {aviso && <p className="ml-1 text-[13px] text-emerald-700">{aviso}</p>}
      </div>
    </div>
  );
}
