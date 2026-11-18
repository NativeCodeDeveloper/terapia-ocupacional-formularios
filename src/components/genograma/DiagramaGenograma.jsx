"use client";

import {
  COLOR_DESCENDENCIA,
  COLOR_RELACION,
  NODO,
  envolverTexto,
  geometriaDeGrupo,
  geometriaDePareja,
  geometriaDeRelacion,
  ladoDeAbreviaturas,
  limitesDiagrama,
  listaDeAbreviaturas,
  puntosDeZigzag,
  rutasDeDescendencia,
} from "@/lib/genograma";

/* ============================================================
   GENOGRAMA · DIAGRAMA SVG COMPARTIDO
   Dibuja el diagrama del genograma (figuras, vínculos de
   pareja y descendencia, relaciones de calidad y etiquetas).
   Lo usan la vista previa de la sección, el modo lectura y el
   lienzo del editor. Sin interacción (`interactivo = false`)
   solo renderiza; el editor le pasa los callbacks de puntero.

   Símbolos: cuadrado = hombre, círculo = mujer, rombo = otro;
   X = fallecido; doble borde = usuario/a evaluado/a.
   Vínculos: línea continua (matrimonio), discontinua
   (convivencia), una barra (separación), dos barras (divorcio).
   Descendencia: una sola línea desde la pareja (o codo desde el
   progenitor) hasta el hijo; los hermanos comparten tallo y
   guía. Relaciones (en color): doble línea verde (cercana),
   triple verde (fusión), punteada roja (distante), zigzag rojo
   (conflicto), línea roja con dos barras (corte).
   ============================================================ */

const TINTES = {
  trazo: "#1f2937",
  etiqueta: "#374151",
  secundario: "#6b7280",
  seleccion: "#4f46e5",
  conexionActiva: "#4f46e5",
};

const GROSOR = 1.6;

/* Convierte coordenadas de cliente (evento de puntero) a
   coordenadas del lienzo SVG usando el viewBox actual. */
export function puntoSvg(svg, clienteX, clienteY) {
  const rect = svg.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  const escalaX = rect.width ? vb.width / rect.width : 1;
  const escalaY = rect.height ? vb.height / rect.height : 1;
  return { x: vb.x + (clienteX - rect.left) * escalaX, y: vb.y + (clienteY - rect.top) * escalaY };
}

function FiguraPersona({ persona, seleccionada, activa, interactivo, lado, eventos }) {
  const { x, y } = persona;
  /* Abreviaturas de las patologías principales: lista al costado
     de la figura (una línea por patología), en cursiva y gris,
     hacia afuera del centro del genograma. */
  const lineasAbrev = listaDeAbreviaturas(persona);
  const abrevALaDerecha = lado === "derecha";
  const lineasPatologias = persona.patologias?.trim() ? envolverTexto(persona.patologias, 26, 3) : [];
  const r = NODO.radio;
  const esTriangulo = ["embarazo", "abortoEspontaneo", "abortoInducido"].includes(persona.simbolo);
  const esMuerteFetal = persona.simbolo === "muerteFetal";
  const rr = esMuerteFetal ? r * 0.55 : r;
  const borde = seleccionada || activa ? TINTES.seleccion : TINTES.trazo;
  const grosor = seleccionada || activa ? 2.4 : GROSOR;
  const relleno = persona.indicado ? "#fef3c7" : activa ? "#eef2ff" : "#ffffff";

  const forma = esTriangulo ? (
    <polygon
      points={`${x - r * 1.1},${y + r * 0.85} ${x},${y - r} ${x + r * 1.1},${y + r * 0.85}`}
      fill={relleno}
      stroke={borde}
      strokeWidth={grosor}
      strokeLinejoin="round"
    />
  ) : persona.sexo === "mujer" ? (
    <circle cx={x} cy={y} r={rr} fill={relleno} stroke={borde} strokeWidth={grosor} />
  ) : persona.sexo === "otro" ? (
    <polygon
      points={`${x - rr},${y} ${x},${y - rr} ${x + rr},${y} ${x},${y + rr}`}
      fill={relleno}
      stroke={borde}
      strokeWidth={grosor}
    />
  ) : (
    <rect
      x={x - rr}
      y={y - rr}
      width={rr * 2}
      height={rr * 2}
      rx={2.5}
      fill={relleno}
      stroke={borde}
      strokeWidth={grosor}
    />
  );

  return (
    <g
      {...(interactivo ? eventos : {})}
      style={interactivo ? { cursor: "pointer" } : undefined}
      aria-label={persona.nombre?.trim() || "Persona sin nombre"}
    >
      {forma}
      {/* Aborto: X dentro del triángulo; el inducido lleva una
          línea horizontal que cruza el símbolo. */}
      {(persona.simbolo === "abortoEspontaneo" || persona.simbolo === "abortoInducido") && (
        <g stroke={borde} strokeWidth={GROSOR}>
          <line x1={x - r * 0.62} y1={y - r * 0.42} x2={x + r * 0.62} y2={y + r * 0.52} />
          <line x1={x + r * 0.62} y1={y - r * 0.42} x2={x - r * 0.62} y2={y + r * 0.52} />
        </g>
      )}
      {persona.simbolo === "abortoInducido" && (
        <line
          x1={x - r * 1.4}
          y1={y + r * 0.05}
          x2={x + r * 1.4}
          y2={y + r * 0.05}
          stroke={borde}
          strokeWidth={GROSOR}
        />
      )}
      {persona.indicado && !esTriangulo && persona.sexo === "mujer" && (
        <circle cx={x} cy={y} r={rr - 3} fill="none" stroke={borde} strokeWidth={1} />
      )}
      {persona.indicado && !esTriangulo && persona.sexo === "hombre" && (
        <rect
          x={x - rr + 3}
          y={y - rr + 3}
          width={rr * 2 - 6}
          height={rr * 2 - 6}
          rx={1.5}
          fill="none"
          stroke={borde}
          strokeWidth={1}
        />
      )}
      {persona.indicado && !esTriangulo && persona.sexo === "otro" && (
        <polygon
          points={`${x - rr + 4.5},${y} ${x},${y - rr + 4.5} ${x + rr - 4.5},${y} ${x},${y + rr - 4.5}`}
          fill="none"
          stroke={borde}
          strokeWidth={1}
        />
      )}
      {(persona.fallecido || esMuerteFetal) && (
        <g stroke={borde} strokeWidth={GROSOR}>
          <line x1={x - rr * 0.72} y1={y - rr * 0.72} x2={x + rr * 0.72} y2={y + rr * 0.72} />
          <line x1={x - rr * 0.72} y1={y + rr * 0.72} x2={x + rr * 0.72} y2={y - rr * 0.72} />
        </g>
      )}
      {/* Edad: dentro de la figura, también en los fallecidos
          (con halo blanco para leerla sobre la X). */}
      {!esTriangulo && persona.edad?.toString().trim() && (
        <text
          x={x}
          y={y + 4.5}
          textAnchor="middle"
          fontSize="12"
          fill={TINTES.etiqueta}
          stroke={persona.fallecido ? "#ffffff" : undefined}
          strokeWidth={persona.fallecido ? 3.5 : undefined}
          paintOrder={persona.fallecido ? "stroke" : undefined}
          strokeLinejoin="round"
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {persona.edad}
        </text>
      )}
      <text
        x={x}
        y={y + r + 13}
        textAnchor="middle"
        fontSize="12.5"
        fontWeight={persona.indicado ? 700 : 500}
        fill={TINTES.etiqueta}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {persona.nombre?.trim() || "Sin nombre"}
      </text>
      {lineasPatologias.map((linea, i) => (
        <text
          key={i}
          x={x}
          y={y + r + 25 + i * 11}
          textAnchor="middle"
          fontSize="10.5"
          fontStyle="italic"
          fill={TINTES.secundario}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {linea}
        </text>
      ))}
      {persona.indicado && !esTriangulo && (
        <text
          x={x}
          y={y - r - 7}
          textAnchor="middle"
          fontSize="10"
          fontStyle="italic"
          fill={TINTES.secundario}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          usuario/a
        </text>
      )}
      {/* Abreviaturas al costado de la figura, hacia afuera. */}
      <g>
        {lineasAbrev.map((linea, i) => (
          <text
            key={`${i}-${linea}`}
            x={abrevALaDerecha ? x + r + 5 : x - r - 5}
            y={y - r + 8 + i * 11}
            textAnchor={abrevALaDerecha ? "start" : "end"}
            fontSize="10.5"
            fontStyle="italic"
            fill={TINTES.secundario}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {linea}
          </text>
        ))}
      </g>
    </g>
  );
}

function LineaConexion({ geometria, seleccionada, alClic, color = null }) {
  if (!geometria) return null;
  const colorLinea = seleccionada ? TINTES.seleccion : color ?? TINTES.trazo;
  const grosor = seleccionada ? 2.6 : GROSOR;
  /* El recorrido (descendencia) define sus propios extremos
     para la zona de clic. */
  const extremos = geometria.recorrido
    ? {
        inicio: geometria.recorrido[0],
        fin: geometria.recorrido[geometria.recorrido.length - 1],
      }
    : geometria;
  const tieneLinea = Boolean(extremos.inicio && extremos.fin);

  return (
    <g onClick={alClic} style={alClic ? { cursor: "pointer" } : undefined}>
      {geometria.zigzag ? (
        <polyline
          points={geometria.zigzag.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke={colorLinea}
          strokeWidth={grosor}
          strokeLinejoin="round"
        />
      ) : (
        <>
          {geometria.lineasParalelas
            ? geometria.lineasParalelas.map((desvio, i) => (
                <line
                  key={i}
                  x1={geometria.inicio.x + geometria.normal.x * desvio}
                  y1={geometria.inicio.y + geometria.normal.y * desvio}
                  x2={geometria.fin.x + geometria.normal.x * desvio}
                  y2={geometria.fin.y + geometria.normal.y * desvio}
                  stroke={colorLinea}
                  strokeWidth={grosor}
                />
              ))
            : tieneLinea && !geometria.segmentos && (
                <line
                  x1={extremos.inicio.x}
                  y1={extremos.inicio.y}
                  x2={extremos.fin.x}
                  y2={extremos.fin.y}
                  stroke={colorLinea}
                  strokeWidth={grosor}
                  strokeDasharray={geometria.discontinua ? "6 5" : undefined}
                />
              )}
          {/* Corte (relación rota): dos tramos con espacio al medio. */}
          {geometria.segmentos?.map(([a, b], i) => (
            <line
              key={`s${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={colorLinea}
              strokeWidth={grosor}
            />
          ))}
          {geometria.ticks?.map((p, i) => (
            <line
              key={`t${i}`}
              x1={p.x - geometria.direccion.x * 6}
              y1={p.y - geometria.direccion.y * 6}
              x2={p.x + geometria.direccion.x * 6}
              y2={p.y + geometria.direccion.y * 6}
              stroke={colorLinea}
              strokeWidth={grosor + 0.4}
            />
          ))}
          {geometria.recorrido && (
            <polyline
              points={geometria.recorrido.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={colorLinea}
              strokeWidth={grosor}
              strokeLinejoin="round"
              strokeDasharray={geometria.discontinua ? "6 5" : undefined}
            />
          )}
          {geometria.barras?.map((barra, i) => (
            <line
              key={i}
              x1={barra.x - geometria.barrasDireccion.x * barra.largo}
              y1={barra.y - geometria.barrasDireccion.y * barra.largo}
              x2={barra.x + geometria.barrasDireccion.x * barra.largo}
              y2={barra.y + geometria.barrasDireccion.y * barra.largo}
              stroke={colorLinea}
              strokeWidth={grosor + 0.4}
            />
          ))}
          {geometria.punto && <circle cx={geometria.punto.x} cy={geometria.punto.y} r={3.4} fill={colorLinea} />}
        </>
      )}
      {/* Zona de clic: sigue todo el recorrido (codos y guías),
          no solo la línea recta entre los extremos. */}
      {geometria.recorrido ? (
        <polyline
          points={geometria.recorrido.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="transparent"
          strokeWidth={14}
          style={{ pointerEvents: alClic ? "stroke" : "none" }}
        />
      ) : (
        <line
          x1={extremos.inicio?.x}
          y1={extremos.inicio?.y}
          x2={extremos.fin?.x}
          y2={extremos.fin?.y}
          stroke="transparent"
          strokeWidth={14}
          style={{ pointerEvents: alClic ? "stroke" : "none" }}
        />
      )}
    </g>
  );
}

export default function DiagramaGenograma({
  genograma,
  interactivo = false,
  personaSeleccionada = null,
  conexionSeleccionada = null,
  grupoSeleccionado = null,
  idsActivos = [],
  personaActiva = null,
  ancho = null,
  alto = null,
  conRejilla = false,
  alClicConexion = null,
  alClicGrupo = null,
  alPointerAbajoPersona = null,
  alPointerMoverPersona = null,
  alPointerSoltarPersona = null,
  referenciaSvg = null,
}) {
  const limites = limitesDiagrama(genograma);
  if (!limites) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-[13px] text-neutral-400">
        El lienzo está vacío: agrega integrantes con los botones de arriba.
      </div>
    );
  }

  const viewBox = interactivo
    ? `0 0 ${ancho ?? 680} ${alto ?? 540}`
    : `${limites.minX} ${limites.minY} ${limites.ancho} ${limites.alto}`;

  const eventosDe = (persona) => ({
    onPointerDown: (e) => {
      e.preventDefault();
      alPointerAbajoPersona?.(persona, e);
    },
    onPointerMove: (e) => alPointerMoverPersona?.(persona, e),
    onPointerUp: (e) => alPointerSoltarPersona?.(persona, e),
  });

  return (
    <svg
      ref={referenciaSvg ?? undefined}
      viewBox={viewBox}
      className="block w-full select-none bg-white"
      style={{ height: "auto", touchAction: interactivo ? "none" : undefined }}
      role="img"
      aria-label="Diagrama del genograma familiar"
    >
      {conRejilla && (
        <defs>
          <pattern id="genograma-rejilla" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e5e7eb" strokeWidth="1" />
          </pattern>
        </defs>
      )}
      {conRejilla && <rect width="100%" height="100%" fill="url(#genograma-rejilla)" />}

      {/* Círculos de convivencia, detrás de líneas y figuras */}
      <g>
        {(genograma.grupos ?? []).map((grupo) => {
          const geo = geometriaDeGrupo(genograma, grupo);
          if (!geo) return null;
          const seleccionado = grupoSeleccionado === grupo.id;
          const color = seleccionado ? TINTES.seleccion : TINTES.secundario;
          const puntos = geo.puntos.map((p) => `${p.x},${p.y}`).join(" ");
          return (
            <g
              key={grupo.id}
              onClick={interactivo && alClicGrupo ? () => alClicGrupo(grupo) : null}
              style={interactivo && alClicGrupo ? { cursor: "pointer" } : undefined}
            >
              <polygon
                points={puntos}
                fill="none"
                stroke={color}
                strokeWidth={seleccionado ? 2.4 : 1.8}
                strokeDasharray="7 6"
              />
              <text
                x={(geo.minX + geo.maxX) / 2}
                y={geo.minY + 15}
                textAnchor="middle"
                fontSize="11"
                fontStyle="italic"
                fill={color}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {geo.etiqueta}
              </text>
              {interactivo && alClicGrupo && (
                <polygon
                  points={puntos}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={16}
                  style={{ pointerEvents: "stroke" }}
                />
              )}
            </g>
          );
        })}
      </g>

      {/* Vínculos y relaciones por debajo de las figuras */}
      <g>
        {genograma.vinculos
          .filter((v) => v.tipo !== "hijo")
          .map((v) => {
            const pareja = geometriaDePareja(genograma, v);
            if (!pareja) return null;
            const g = {
              inicio: pareja.inicio,
              fin: pareja.fin,
              discontinua: pareja.discontinua,
              barras: pareja.barras?.posiciones.map((p) => ({ ...p, largo: pareja.barras.largo })),
              barrasDireccion: pareja.barras?.direccion,
            };
            return (
              <LineaConexion
                key={v.id}
                geometria={g}
                seleccionada={conexionSeleccionada === v.id}
                alClic={interactivo && alClicConexion ? () => alClicConexion(v) : null}
              />
            );
          })}
        {/* Descendencia: tallo y guía compartidos por origen,
            una caída por hijo (o por progenitor); adoptado y
            crianza se dibujan discontinuos y con color. */}
        {rutasDeDescendencia(genograma).map((ruta) => {
          const vinculoRuta = genograma.vinculos.find((w) => w.id === ruta.id);
          const especial =
            vinculoRuta?.tipo === "adoptado" || vinculoRuta?.tipo === "crianza";
          return (
            <LineaConexion
              key={ruta.clave}
              geometria={{ recorrido: ruta.recorrido, discontinua: especial }}
              color={
                vinculoRuta?.tipo === "adoptado"
                  ? COLOR_DESCENDENCIA.adoptado
                  : vinculoRuta?.tipo === "crianza"
                    ? COLOR_DESCENDENCIA.crianza
                    : null
              }
              seleccionada={conexionSeleccionada === ruta.id}
              alClic={interactivo && alClicConexion ? () => alClicConexion({ id: ruta.id }) : null}
            />
          );
        })}
        {genograma.relaciones.map((r) => {
          const base = geometriaDeRelacion(genograma, r);
          if (!base) return null;
          const { inicio, fin, normal } = base;
          let g;
          if (r.tipo === "conflicto") {
            g = { zigzag: puntosDeZigzag(inicio, fin) };
          } else if (r.tipo === "cercana") {
            g = { inicio, fin, normal, lineasParalelas: [-2.6, 2.6] };
          } else if (r.tipo === "fusion") {
            g = { inicio, fin, normal, lineasParalelas: [-4.6, 0, 4.6] };
          } else if (r.tipo === "distante") {
            g = { inicio, fin, discontinua: true };
          } else {
            // corte (relación rota): la línea se separa al medio
            // y cada extremo lleva una marca perpendicular
            const medio = { x: (inicio.x + fin.x) / 2, y: (inicio.y + fin.y) / 2 };
            const dx = fin.x - inicio.x;
            const dy = fin.y - inicio.y;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const p1 = { x: medio.x - ux * 6, y: medio.y - uy * 6 };
            const p2 = { x: medio.x + ux * 6, y: medio.y + uy * 6 };
            g = {
              inicio,
              fin,
              segmentos: [
                [inicio, p1],
                [p2, fin],
              ],
              ticks: [p1, p2],
              direccion: { x: -uy, y: ux },
            };
          }
          return (
            <LineaConexion
              key={r.id}
              geometria={g}
              color={COLOR_RELACION[r.tipo] ?? null}
              seleccionada={conexionSeleccionada === r.id}
              alClic={interactivo && alClicConexion ? () => alClicConexion(r) : null}
            />
          );
        })}
      </g>

      <g>
        {genograma.personas.map((p) => (
          <FiguraPersona
            key={p.id}
            persona={p}
            lado={ladoDeAbreviaturas(genograma, p)}
            seleccionada={personaSeleccionada === p.id}
            activa={personaActiva === p.id || idsActivos.includes(p.id)}
            interactivo={interactivo}
            eventos={eventosDe(p)}
          />
        ))}
      </g>
    </svg>
  );
}
