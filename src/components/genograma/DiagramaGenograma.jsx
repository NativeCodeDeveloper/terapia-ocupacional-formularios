"use client";

import {
  NODO,
  geometriaDeHijo,
  geometriaDePareja,
  geometriaDeRelacion,
  limitesDiagrama,
  puntosDeZigzag,
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
   Descendencia: codo desde la línea de pareja o el progenitor
   hasta el hijo. Relaciones: doble línea (cercana), triple
   (fusión), punteada (distante), zigzag (conflicto), línea con
   punto (corte).
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

function FiguraPersona({ persona, seleccionada, activa, interactivo, eventos }) {
  const { x, y } = persona;
  const lado = NODO.lado;
  const r = NODO.radio;
  const borde = seleccionada || activa ? TINTES.seleccion : TINTES.trazo;
  const grosor = seleccionada || activa ? 2.4 : GROSOR;
  const relleno = activa ? "#eef2ff" : "#ffffff";

  const forma =
    persona.sexo === "mujer" ? (
      <circle cx={x} cy={y} r={r} fill={relleno} stroke={borde} strokeWidth={grosor} />
    ) : persona.sexo === "otro" ? (
      <polygon
        points={`${x - r},${y} ${x},${y - r} ${x + r},${y} ${x},${y + r}`}
        fill={relleno}
        stroke={borde}
        strokeWidth={grosor}
      />
    ) : (
      <rect
        x={x - r}
        y={y - r}
        width={lado}
        height={lado}
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
      {persona.indicado && persona.sexo === "mujer" && (
        <circle cx={x} cy={y} r={r - 3} fill="none" stroke={borde} strokeWidth={1} />
      )}
      {persona.indicado && persona.sexo === "hombre" && (
        <rect
          x={x - r + 3}
          y={y - r + 3}
          width={lado - 6}
          height={lado - 6}
          rx={1.5}
          fill="none"
          stroke={borde}
          strokeWidth={1}
        />
      )}
      {persona.indicado && persona.sexo === "otro" && (
        <polygon
          points={`${x - r + 4.5},${y} ${x},${y - r + 4.5} ${x + r - 4.5},${y} ${x},${y + r - 4.5}`}
          fill="none"
          stroke={borde}
          strokeWidth={1}
        />
      )}
      {persona.fallecido && (
        <g stroke={borde} strokeWidth={GROSOR}>
          <line x1={x - r * 0.72} y1={y - r * 0.72} x2={x + r * 0.72} y2={y + r * 0.72} />
          <line x1={x - r * 0.72} y1={y + r * 0.72} x2={x + r * 0.72} y2={y - r * 0.72} />
        </g>
      )}
      {!persona.fallecido && persona.edad?.toString().trim() && (
        <text
          x={x}
          y={y + 4}
          textAnchor="middle"
          fontSize="11"
          fill={TINTES.etiqueta}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {persona.edad}
        </text>
      )}
      <text
        x={x}
        y={y + r + 13}
        textAnchor="middle"
        fontSize="11.5"
        fontWeight={persona.indicado ? 700 : 500}
        fill={TINTES.etiqueta}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {persona.nombre?.trim() || "Sin nombre"}
      </text>
      {persona.indicado && (
        <text
          x={x}
          y={y - r - 7}
          textAnchor="middle"
          fontSize="9.5"
          fontStyle="italic"
          fill={TINTES.secundario}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          usuario/a
        </text>
      )}
    </g>
  );
}

function LineaConexion({ geometria, seleccionada, alClic }) {
  if (!geometria) return null;
  const color = seleccionada ? TINTES.seleccion : TINTES.trazo;
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
          stroke={color}
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
                  stroke={color}
                  strokeWidth={grosor}
                />
              ))
            : tieneLinea && (
                <line
                  x1={extremos.inicio.x}
                  y1={extremos.inicio.y}
                  x2={extremos.fin.x}
                  y2={extremos.fin.y}
                  stroke={color}
                  strokeWidth={grosor}
                  strokeDasharray={geometria.discontinua ? "6 5" : undefined}
                />
              )}
          {geometria.recorrido && (
            <polyline
              points={geometria.recorrido.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={color}
              strokeWidth={grosor}
              strokeLinejoin="round"
            />
          )}
          {geometria.barras?.map((barra, i) => (
            <line
              key={i}
              x1={barra.x - geometria.barrasDireccion.x * barra.largo}
              y1={barra.y - geometria.barrasDireccion.y * barra.largo}
              x2={barra.x + geometria.barrasDireccion.x * barra.largo}
              y2={barra.y + geometria.barrasDireccion.y * barra.largo}
              stroke={color}
              strokeWidth={grosor + 0.4}
            />
          ))}
          {geometria.punto && <circle cx={geometria.punto.x} cy={geometria.punto.y} r={3.4} fill={color} />}
        </>
      )}
      <line
        x1={extremos.inicio?.x}
        y1={extremos.inicio?.y}
        x2={extremos.fin?.x}
        y2={extremos.fin?.y}
        stroke="transparent"
        strokeWidth={14}
        style={{ pointerEvents: alClic ? "stroke" : "none" }}
      />
    </g>
  );
}

export default function DiagramaGenograma({
  genograma,
  interactivo = false,
  personaSeleccionada = null,
  conexionSeleccionada = null,
  personaActiva = null,
  ancho = null,
  alto = null,
  conRejilla = false,
  alClicConexion = null,
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
    ? `0 0 ${ancho ?? 960} ${alto ?? 620}`
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

      {/* Vínculos y relaciones por debajo de las figuras */}
      <g>
        {genograma.vinculos.map((v) => {
          let g = null;
          if (v.tipo === "hijo") {
            const ruta = geometriaDeHijo(genograma, v);
            g = ruta ? { recorrido: ruta.recorrido } : null;
          } else {
            const pareja = geometriaDePareja(genograma, v);
            if (!pareja) return null;
            g = {
              inicio: pareja.inicio,
              fin: pareja.fin,
              discontinua: pareja.discontinua,
              barras: pareja.barras?.posiciones.map((p) => ({ ...p, largo: pareja.barras.largo })),
              barrasDireccion: pareja.barras?.direccion,
            };
          }
          return (
            <LineaConexion
              key={v.id}
              geometria={g}
              seleccionada={conexionSeleccionada === v.id}
              alClic={interactivo && alClicConexion ? () => alClicConexion(v) : null}
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
            g = { inicio, fin, punto: { x: (inicio.x + fin.x) / 2, y: (inicio.y + fin.y) / 2 } };
          }
          return (
            <LineaConexion
              key={r.id}
              geometria={g}
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
            seleccionada={personaSeleccionada === p.id}
            activa={personaActiva === p.id}
            interactivo={interactivo}
            eventos={eventosDe(p)}
          />
        ))}
      </g>
    </svg>
  );
}
