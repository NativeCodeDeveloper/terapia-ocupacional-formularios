"use client";

import { useMemo, useRef, useState } from "react";
import {
  LEYENDA_GENOGRAMA,
  SEXOS,
  TIPOS_RELACION,
  TIPOS_VINCULO,
  cambiarTipoConexion,
  conexionAgregada,
  conexionEliminada,
  genogramaVacio,
  grupoActualizado,
  grupoAgregado,
  grupoEliminado,
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

const LIENZO_ANCHO = 680;
const LIENZO_ALTO = 540;

const OPCIONES_PAREJA = TIPOS_VINCULO.filter((t) => t.grupo === "pareja");
const ES_RELACION = (tipo) => TIPOS_RELACION.some((t) => t.valor === tipo);

/* La guía de uso se muestra abierta la primera vez que se
   edita un genograma vacío. */
function borradorInicialVacio(valor) {
  return normalizarGenograma(valor).personas.length === 0;
}

/* Pasos de la guía de uso del editor. */
const PASOS_GUIA = [
  ["Agrega a cada integrante", "usa los botones «+ Hombre», «+ Mujer» o «+ Otro»; cada figura aparece en el lienzo."],
  ["Ubica a las personas", "arrastra cada figura: deja arriba a los padres y abajo a los hijos."],
  [
    "Conecta con vínculos",
    "pulsa «Conectar», haz clic en una persona y luego en la otra, y elige: pareja (matrimonio, convivencia, separación o divorcio), «es hijo/a de», o una relación (cercana, fusión, distante, conflicto o corte). Para que un hijo descienda de dos personas —p. ej., de José y de María— conecta con cada progenitor; si forman pareja entre sí, la descendencia se dibuja como una sola línea desde la pareja.",
  ],
  ["Marca la convivencia", "pulsa «Círculo familiar» y haz clic en quienes viven juntos (dos o más): se dibuja un óvalo punteado que los rodea."],
  ["Edita o corrige", "haz clic en cualquier figura o línea para editar su nombre, edad, patologías (abreviaturas y detalle) o eliminarla."],
  ["Guarda el resultado", "«Usar en esta evaluación» lo adjunta al informe; «Guardar en biblioteca» lo deja guardado para reutilizarlo en otros formularios."],
];

export default function EditorGenograma({ valor, contexto = "", alGuardar, alCancelar }) {
  const [borrador, setBorrador] = useState(() => normalizarGenograma(valor));
  const [ayudaAbierta, setAyudaAbierta] = useState(() => borradorInicialVacio(valor));
  const [personaId, setPersonaId] = useState(null);
  const [conexionId, setConexionId] = useState(null);
  const [grupoId, setGrupoId] = useState(null);
  const [conectando, setConectando] = useState(false);
  const [desde, setDesde] = useState(null);
  const [modoCirculo, setModoCirculo] = useState(false);
  const [seleccionCirculo, setSeleccionCirculo] = useState([]);
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
  const grupo = (borrador.grupos ?? []).find((g) => g.id === grupoId) ?? null;
  const inicial = useMemo(() => JSON.stringify(normalizarGenograma(valor)), [valor]);
  const sucio = JSON.stringify(borrador) !== inicial;
  const nombreDe = (id) => borrador.personas.find((p) => p.id === id)?.nombre?.trim() || "sin nombre";
  /* Origen de una descendencia: «Ana y Luis» si sale de la línea de pareja. */
  const origenDe = (id) => {
    const pareja = borrador.vinculos.find((v) => v.id === id && v.tipo !== "hijo");
    return pareja ? `${nombreDe(pareja.de)} y ${nombreDe(pareja.a)}` : nombreDe(id);
  };
  const usuario = borrador.personas.find((p) => p.indicado) ?? null;

  function cancelarMenu() {
    setMenu(null);
    setDesde(null);
  }

  function deseleccionar() {
    setPersonaId(null);
    setConexionId(null);
    setGrupoId(null);
  }

  /* ---------- Interacción con el lienzo ---------- */

  function alAbajoPersona(personaClic, evento) {
    if (conectando || modoCirculo) return; // en conectar y círculo solo importa el clic
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
        x: Math.min(Math.max(punto.x, 72), LIENZO_ANCHO - 72),
        y: Math.min(Math.max(punto.y, 42), LIENZO_ALTO - 64),
      })
    );
  }

  function alSoltarPersona(personaClic) {
    const estado = arrastre.current;
    arrastre.current = null;
    if (estado?.movio) return;
    if (modoCirculo) {
      setSeleccionCirculo((prev) =>
        prev.includes(personaClic.id)
          ? prev.filter((id) => id !== personaClic.id)
          : [...prev, personaClic.id]
      );
      return;
    }
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
    setGrupoId(null);
  }

  function alClicConexion(conexionClic) {
    setConexionId(conexionClic.id);
    setPersonaId(null);
    setGrupoId(null);
  }

  function alClicGrupo(grupoClic) {
    if (modoCirculo) return; // en modo círculo solo se marcan personas
    setGrupoId(grupoClic.id);
    setPersonaId(null);
    setConexionId(null);
  }

  /* ---------- Círculo de convivencia ---------- */

  function crearCirculo() {
    if (seleccionCirculo.length < 2) return;
    const siguiente = grupoAgregado(borrador, seleccionCirculo);
    if (siguiente === borrador) return;
    setBorrador(siguiente);
    setGrupoId(siguiente.grupos[siguiente.grupos.length - 1].id);
    setSeleccionCirculo([]);
    setModoCirculo(false);
    setAviso("");
  }

  function disolverCirculo() {
    const objetivo = (borrador.grupos ?? []).find((g) => g.id === grupoId);
    if (!objetivo) return;
    if (!window.confirm(`¿Disolver el círculo «${objetivo.nombre?.trim() || "Convivencia"}»?`)) return;
    setBorrador((prev) => grupoEliminado(prev, grupoId));
    setGrupoId(null);
  }

  function elegirTipo(tipo) {
    if (!menu) return;
    setBorrador((prev) => conexionAgregada(prev, tipo, menu.de, menu.a));
    cancelarMenu();
    setAviso("");
  }

  /* ---------- Panel de persona ---------- */

  /* Los handlers trabajan sobre los ids seleccionados y buscan
     el objeto dentro del estado al momento del clic: así el
     compilador de React memoiza sobre valores primitivos y no
     lee propiedades de persona/conexion cuando son null. */
  const actualizarPersona = (cambios) => setBorrador((prev) => personaActualizada(prev, personaId, cambios));

  function eliminarPersona() {
    const objetivo = borrador.personas.find((p) => p.id === personaId);
    if (!objetivo) return;
    if (!window.confirm(`¿Quitar a ${objetivo.nombre?.trim() || "esta persona"} del genograma?`)) return;
    setBorrador((prev) => personaEliminada(prev, objetivo.id));
    setPersonaId(null);
  }

  /* ---------- Panel de conexión ---------- */

  function eliminarConexion() {
    const objetivo =
      borrador.vinculos.find((c) => c.id === conexionId) ??
      borrador.relaciones.find((c) => c.id === conexionId);
    if (!objetivo) return;
    const etiqueta = objetivo.tipo === "hijo"
      ? `la descendencia hacia ${nombreDe(objetivo.a)}`
      : `el registro entre ${nombreDe(objetivo.de)} y ${nombreDe(objetivo.a)}`;
    if (!window.confirm(`¿Eliminar ${etiqueta}?`)) return;
    setBorrador((prev) => conexionEliminada(prev, objetivo.id));
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
    setAyudaAbierta(true);
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
      x: Math.min(Math.max(LIENZO_ANCHO / 2 + Math.cos(angulo) * radio, 80), LIENZO_ANCHO - 80),
      y: Math.min(Math.max(LIENZO_ALTO / 2 + Math.sin(angulo) * radio, 70), LIENZO_ALTO - 80),
    };
    const siguiente = nuevaPersona(borrador, sexo, posicion);
    setBorrador(siguiente);
    setPersonaId(siguiente.personas[siguiente.personas.length - 1].id);
    setConexionId(null);
    setAviso("");
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 sm:p-5">
      {/* Guía de uso */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/60">
        <button
          type="button"
          onClick={() => setAyudaAbierta((prev) => !prev)}
          aria-expanded={ayudaAbierta}
          className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left"
        >
          <span className="text-[13px] font-semibold text-indigo-900">¿Cómo hacer el genograma?</span>
          <span
            aria-hidden="true"
            className={`text-xs text-indigo-500 transition-transform ${ayudaAbierta ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>
        {ayudaAbierta && (
          <ol className="list-decimal space-y-1.5 px-4 pb-3.5 pl-9 text-[13px] leading-relaxed text-neutral-700">
            {PASOS_GUIA.map(([titulo, detalle]) => (
              <li key={titulo}>
                <span className="font-semibold text-neutral-900">{titulo}: </span>
                {detalle}
              </li>
            ))}
          </ol>
        )}
      </div>

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
            setModoCirculo(false);
            setSeleccionCirculo([]);
            deseleccionar();
          }}
          className={conectando ? BOTON_PRIMARIO : BOTON_NEUTRO}
          aria-pressed={conectando}
        >
          {conectando ? "● Conectando…" : "Conectar"}
        </button>
        <button
          type="button"
          onClick={() => {
            setModoCirculo((prev) => !prev);
            setSeleccionCirculo([]);
            setConectando(false);
            setDesde(null);
            setMenu(null);
            deseleccionar();
          }}
          className={modoCirculo ? BOTON_PRIMARIO : BOTON_NEUTRO}
          aria-pressed={modoCirculo}
          title="Marca un círculo punteado alrededor de quienes viven juntos"
        >
          {modoCirculo ? "● Círculo familiar…" : "Círculo familiar"}
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
          personaSeleccionada={conectando || menu || modoCirculo ? null : personaId}
          personaActiva={conectando ? desde : null}
          idsActivos={modoCirculo ? seleccionCirculo : []}
          conexionSeleccionada={conexionId}
          grupoSeleccionado={grupoId}
          referenciaSvg={referenciaSvg}
          alPointerAbajoPersona={alAbajoPersona}
          alPointerMoverPersona={alMoverPersona}
          alPointerSoltarPersona={alSoltarPersona}
          alClicConexion={alClicConexion}
          alClicGrupo={alClicGrupo}
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
                  title="El color coincide con la línea que se dibuja"
                  className={`${BOTON} ${
                    t.valor === "cercana" || t.valor === "fusion"
                      ? "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                      : "border-red-200 bg-white text-red-700 hover:bg-red-50"
                  }`}
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
        ) : modoCirculo ? (
          <div className="flex flex-wrap items-center gap-2">
            <p>
              {seleccionCirculo.length < 2
                ? "Marca con clic a quienes viven juntos (dos o más personas)…"
                : `${seleccionCirculo.length} personas marcadas para el círculo.`}
            </p>
            <button
              type="button"
              onClick={crearCirculo}
              disabled={seleccionCirculo.length < 2}
              className={BOTON_PRIMARIO}
            >
              Crear círculo
            </button>
            <button
              type="button"
              onClick={() => {
                setModoCirculo(false);
                setSeleccionCirculo([]);
              }}
              className={BOTON_NEUTRO}
            >
              Cancelar
            </button>
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
              <div className="sm:col-span-2">
                <label htmlFor="genograma-patologias-abrev" className={ETIQUETA_CAMPO}>Patologías principales (abreviaturas)</label>
                <input
                  id="genograma-patologias-abrev"
                  type="text"
                  value={persona.patologiasAbrev}
                  onChange={(e) => actualizarPersona({ patologiasAbrev: e.target.value })}
                  placeholder="Se ven sobre el nombre, p. ej., DM, HTA, TDAH"
                  className={CONTROL}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="genograma-patologias" className={ETIQUETA_CAMPO}>Patologías o antecedentes (detalle, opcional)</label>
                <input
                  id="genograma-patologias"
                  type="text"
                  value={persona.patologias}
                  onChange={(e) => actualizarPersona({ patologias: e.target.value })}
                  placeholder="p. ej., diabetes tipo 2 diagnosticada en 2015"
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
                ? `${nombreDe(conexion.a)} es hijo/a de ${origenDe(conexion.de)}.`
                : `${nombreDe(conexion.de)} — ${nombreDe(conexion.a)}.`}
            </p>
            {conexion.tipo !== "hijo" && (
              <div className="mt-3">
                <label htmlFor="genograma-tipo-conexion" className={ETIQUETA_CAMPO}>Tipo</label>
                <select
                  id="genograma-tipo-conexion"
                  value={conexion.tipo}
                  onChange={(e) => setBorrador((prev) => cambiarTipoConexion(prev, conexionId, e.target.value))}
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

        {grupo && !menu && !modoCirculo && (
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-neutral-900">Círculo de convivencia</p>
              <button
                type="button"
                onClick={() => setGrupoId(null)}
                className="text-xs text-neutral-400 hover:text-neutral-600"
              >
                Cerrar
              </button>
            </div>
            <div className="mt-3">
              <label htmlFor="genograma-nombre-grupo" className={ETIQUETA_CAMPO}>Nombre (opcional)</label>
              <input
                id="genograma-nombre-grupo"
                type="text"
                value={grupo.nombre}
                onChange={(e) => setBorrador((prev) => grupoActualizado(prev, grupoId, { nombre: e.target.value }))}
                placeholder="p. ej., Casa de la abuela"
                className={CONTROL}
              />
            </div>
            <p className="mt-2 text-[13px] text-neutral-500">
              Viven juntos: {grupo.integrantes.map((id) => nombreDe(id)).join(", ")}.
            </p>
            <button
              type="button"
              onClick={disolverCirculo}
              className="mt-3 text-[13px] font-medium text-red-600 underline-offset-2 hover:underline"
            >
              Disolver círculo
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
