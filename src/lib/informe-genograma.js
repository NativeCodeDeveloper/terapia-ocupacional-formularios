import {
  LEYENDA_GENOGRAMA,
  NODO,
  envolverTexto,
  filasDeIntegrantes,
  geometriaDeGrupo,
  geometriaDePareja,
  geometriaDeRelacion,
  limitesDiagrama,
  listaDeAbreviaturas,
  puntosDeZigzag,
  rutasDeDescendencia,
} from "./genograma.js";

/* ============================================================
   GENOGRAMA FAMILIAR · SECCIÓN DE LOS INFORMES
   Render compartido para los motores de informe:
   - dibujarSeccionGenogramaPDF: sección vectorial en un
     documento jsPDF ya abierto (título, diagrama escalado,
     leyenda y tabla de integrantes). Recibe la `y` inicial y
     devuelve la `y` final; gestiona sus propios saltos de
     página con los márgenes del motor que la invoca.
   - seccionGenogramaHTML: bloque HTML (tabla de integrantes y
     nota) para los informes Word; el diagrama vectorial solo
     se imprime en el PDF.
   Solo dibuja cuando hay integrantes: sin genograma la
   sección no existe en el informe (ni páginas vacías).
   ============================================================ */

const TRAZO = [25, 25, 25];
const GRIS_TEXTO = 110;

const GROSOR = 1;

/* ---- Diagrama vectorial ---- */

function dibujarFigura(doc, persona, ox, oy, escala) {
  const cx = ox + persona.x * escala;
  const cy = oy + persona.y * escala;
  const r = NODO.radio * escala;
  const lado = NODO.lado * escala;

  doc.setDrawColor(...TRAZO);
  doc.setLineWidth(GROSOR * Math.max(escala, 0.75));
  doc.setFillColor(255, 255, 255);

  const dibujarInterior = () => {
    if (!persona.indicado) return;
    doc.setLineWidth(GROSOR * Math.max(escala, 0.75) * 0.7);
    const margen = 3.2 * escala;
    if (persona.sexo === "mujer") doc.circle(cx, cy, r - margen);
    else if (persona.sexo === "otro") {
      const rr = r - margen;
      doc.lines([[rr, -rr], [rr, rr], [-rr, rr]], cx - rr, cy + rr, [1, 1], null, true);
    } else {
      doc.rect(cx - r + margen, cy - r + margen, lado - margen * 2, lado - margen * 2);
    }
    doc.setLineWidth(GROSOR * Math.max(escala, 0.75));
  };

  if (persona.sexo === "mujer") {
    doc.circle(cx, cy, r, "FD");
    dibujarInterior();
  } else if (persona.sexo === "otro") {
    doc.lines([[r, -r], [r, r], [-r, r]], cx - r, cy + r, [1, 1], "FD", true);
    dibujarInterior();
  } else {
    doc.rect(cx - r, cy - r, lado, lado, "FD");
    dibujarInterior();
  }

  if (persona.fallecido) {
    const d = r * 0.72;
    doc.line(cx - d, cy - d, cx + d, cy + d);
    doc.line(cx - d, cy + d, cx + d, cy - d);
  } else if (persona.edad?.toString().trim()) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9 * Math.max(escala, 0.75));
    doc.setTextColor(...TRAZO);
    doc.text(persona.edad.toString(), cx, cy + 3.5 * Math.max(escala, 0.75), { align: "center" });
  }

  doc.setFont("helvetica", persona.indicado ? "bold" : "normal");
  doc.setFontSize(9.5 * Math.max(escala, 0.75));
  doc.setTextColor(...TRAZO);
  const nombre = doc.splitTextToSize(persona.nombre?.trim() || "Sin nombre", 150 * escala);
  doc.text(nombre[0], cx, cy + r + 12 * escala, { align: "center" });

  if (persona.patologias?.trim()) {
    const lineas = envolverTexto(persona.patologias, 26, 3);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8 * Math.max(escala, 0.75));
    doc.setTextColor(GRIS_TEXTO);
    lineas.forEach((linea, i) => {
      doc.text(linea, cx, cy + r + (21 + i * 9.5) * escala, { align: "center" });
    });
  }

  if (persona.indicado) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8 * Math.max(escala, 0.75));
    doc.setTextColor(GRIS_TEXTO);
    doc.text("usuario/a", cx, cy - r - 6 * escala, { align: "center" });
  }

  /* Abreviaturas de las patologías principales: lista sobre la
     figura, en cursiva y gris. */
  const lineasAbrev = listaDeAbreviaturas(persona);
  if (lineasAbrev.length > 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8 * Math.max(escala, 0.75));
    doc.setTextColor(GRIS_TEXTO);
    lineasAbrev.forEach((linea, i) => {
      const yLinea =
        cy - r - (6 + (persona.indicado ? 9.5 : 0) + (lineasAbrev.length - 1 - i) * 9.5) * escala;
      doc.text(linea, cx, yLinea, { align: "center" });
    });
  }
}

function trazoDeLinea(doc, escala) {
  doc.setDrawColor(...TRAZO);
  doc.setLineWidth(GROSOR * Math.max(escala, 0.75));
}

function dibujarSegmento(doc, a, b) {
  doc.line(a.x, a.y, b.x, b.y);
}

function dibujarRecorrido(doc, puntos) {
  for (let i = 1; i < puntos.length; i++) dibujarSegmento(doc, puntos[i - 1], puntos[i]);
}

/* Línea de pareja (la descendencia se dibuja con
   dibujarRutaDescendencia, compartiendo tallo y guía). */
function dibujarVinculo(doc, genograma, vinculo, ox, oy, escala) {
  const pareja = geometriaDePareja(genograma, vinculo);
  if (!pareja) return;
  const inicio = { x: ox + pareja.inicio.x * escala, y: oy + pareja.inicio.y * escala };
  const fin = { x: ox + pareja.fin.x * escala, y: oy + pareja.fin.y * escala };
  trazoDeLinea(doc, escala);
  if (pareja.discontinua) doc.setLineDashPattern([4, 3], 0);
  dibujarSegmento(doc, inicio, fin);
  doc.setLineDashPattern([], 0);
  if (pareja.barras) {
    const d = pareja.barras.direccion;
    for (const barra of pareja.barras.posiciones) {
      const bx = ox + barra.x * escala;
      const by = oy + barra.y * escala;
      const largo = pareja.barras.largo * escala;
      doc.setLineWidth(GROSOR * Math.max(escala, 0.75) + 0.2);
      doc.line(bx - d.x * largo, by - d.y * largo, bx + d.x * largo, by + d.y * largo);
    }
    trazoDeLinea(doc, escala);
  }
}

function dibujarRutaDescendencia(doc, ruta, ox, oy, escala) {
  trazoDeLinea(doc, escala);
  dibujarRecorrido(doc, ruta.recorrido.map((p) => ({ x: ox + p.x * escala, y: oy + p.y * escala })));
}

/* Colores de las relaciones de calidad (mismos que el SVG). */
const VERDE_RELACION = [21, 128, 61];
const ROJO_RELACION = [220, 38, 38];

function dibujarRelacion(doc, genograma, relacion, ox, oy, escala) {
  const base = geometriaDeRelacion(genograma, relacion);
  if (!base) return;
  const inicio = { x: ox + base.inicio.x * escala, y: oy + base.inicio.y * escala };
  const fin = { x: ox + base.fin.x * escala, y: oy + base.fin.y * escala };
  const normal = base.normal;
  trazoDeLinea(doc, escala);
  const positiva = relacion.tipo === "cercana" || relacion.tipo === "fusion";
  doc.setDrawColor(...(positiva ? VERDE_RELACION : ROJO_RELACION));

  if (relacion.tipo === "conflicto") {
    const puntos = puntosDeZigzag(inicio, fin, 4.5 * escala, 12 * escala);
    doc.lines(
      puntos.slice(1).map((p, i) => [p[0] - puntos[i][0], p[1] - puntos[i][1]]),
      puntos[0][0],
      puntos[0][1],
      [1, 1],
      null,
      false
    );
  } else if (positiva) {
    const desvios = relacion.tipo === "cercana" ? [-2.6, 2.6] : [-4.6, 0, 4.6];
    for (const desvio of desvios) {
      dibujarSegmento(
        doc,
        { x: inicio.x + normal.x * desvio * escala, y: inicio.y + normal.y * desvio * escala },
        { x: fin.x + normal.x * desvio * escala, y: fin.y + normal.y * desvio * escala }
      );
    }
  } else if (relacion.tipo === "distante") {
    doc.setLineDashPattern([3, 4], 0);
    dibujarSegmento(doc, inicio, fin);
    doc.setLineDashPattern([], 0);
  } else {
    // corte (relación rota): la línea se separa al medio y cada
    // extremo lleva una marca perpendicular
    const dx = fin.x - inicio.x;
    const dy = fin.y - inicio.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;
    const hueco = 6 * escala;
    const medio = { x: (inicio.x + fin.x) / 2, y: (inicio.y + fin.y) / 2 };
    dibujarSegmento(doc, inicio, { x: medio.x - ux * hueco, y: medio.y - uy * hueco });
    dibujarSegmento(doc, { x: medio.x + ux * hueco, y: medio.y + uy * hueco }, fin);
    const marca = 6 * Math.max(escala, 0.75);
    doc.setLineWidth(GROSOR * Math.max(escala, 0.75) + 0.2);
    for (const s of [-1, 1]) {
      const px = medio.x + ux * hueco * s;
      const py = medio.y + uy * hueco * s;
      doc.line(px - nx * marca, py - ny * marca, px + nx * marca, py + ny * marca);
    }
  }
  trazoDeLinea(doc, escala);
}

/* Contorno punteado de convivencia, detrás de líneas y figuras. */
function dibujarGrupo(doc, genograma, grupo, ox, oy, escala) {
  const geo = geometriaDeGrupo(genograma, grupo);
  if (!geo) return;
  const puntos = geo.puntos.map((p) => ({ x: ox + p.x * escala, y: oy + p.y * escala }));
  trazoDeLinea(doc, escala);
  doc.setLineDashPattern([5, 4], 0);
  doc.lines(
    puntos.slice(1).map((p, i) => [p.x - puntos[i].x, p.y - puntos[i].y]),
    puntos[0].x,
    puntos[0].y,
    [1, 1],
    null,
    true
  );
  doc.setLineDashPattern([], 0);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5 * Math.max(escala, 0.75));
  doc.setTextColor(GRIS_TEXTO);
  doc.text(geo.etiqueta, ox + ((geo.minX + geo.maxX) / 2) * escala, oy + (geo.minY + 14) * escala, {
    align: "center",
  });
}

function dibujarDiagrama(doc, genograma, { y, margen, anchoUtil, altoPagina, margenInferior }) {
  const limite = () => altoPagina - margenInferior;
  const limites = limitesDiagrama(genograma);
  const altoDeseado = 430;

  let altoDisponible = limite() - y - 12;
  if (altoDisponible < 190) {
    doc.addPage();
    y = margen;
    altoDisponible = limite() - y - 12;
  }
  const altoMaximo = Math.min(altoDeseado, altoDisponible);
  const escala = Math.min(anchoUtil / limites.ancho, altoMaximo / limites.alto, 1.5);
  const ox = margen + (anchoUtil - limites.ancho * escala) / 2 - limites.minX * escala;
  const oy = y - limites.minY * escala;

  for (const grupo of genograma.grupos ?? []) dibujarGrupo(doc, genograma, grupo, ox, oy, escala);
  for (const v of genograma.vinculos) {
    if (v.tipo !== "hijo") dibujarVinculo(doc, genograma, v, ox, oy, escala);
  }
  for (const ruta of rutasDeDescendencia(genograma)) dibujarRutaDescendencia(doc, ruta, ox, oy, escala);
  for (const r of genograma.relaciones) dibujarRelacion(doc, genograma, r, ox, oy, escala);
  for (const p of genograma.personas) dibujarFigura(doc, p, ox, oy, escala);

  /* El borde inferior del contenido (coordenada maxY del
     diagrama) queda en página en y + alto · escala. */
  return y + limites.alto * escala + 16;
}

/* ---- Sección completa del informe en PDF ---- */

export function dibujarSeccionGenogramaPDF(doc, genograma, contexto = {}) {
  const { y: yInicial, margen = 48, anchoUtil, altoPagina, margenInferior = 68 } = contexto;
  if (!genograma || !Array.isArray(genograma.personas) || genograma.personas.length === 0) {
    return yInicial;
  }
  const limite = () => altoPagina - margenInferior;
  let y = yInicial;

  const avanzar = (alto) => {
    if (y + alto > limite()) {
      doc.addPage();
      y = margen;
    }
  };
  const escribir = (texto, { tamano = 10.5, negrita = false, gris = false, espacio = 6 } = {}) => {
    doc.setFont("helvetica", negrita ? "bold" : "normal");
    doc.setFontSize(tamano);
    doc.setTextColor(gris ? GRIS_TEXTO : 25);
    for (const linea of doc.splitTextToSize(texto, anchoUtil)) {
      avanzar(tamano * 1.4 + 2);
      doc.text(linea, margen, y);
      y += tamano * 1.4;
    }
    y += espacio;
  };

  escribir("Genograma familiar", { tamano: 13, negrita: true, espacio: 2 });
  escribir(
    "Estructura familiar, vínculos de parentesco y relaciones relevantes registrados durante la evaluación.",
    { tamano: 9, gris: true, espacio: 12 }
  );

  y = dibujarDiagrama(doc, genograma, { y, margen, anchoUtil, altoPagina, margenInferior });

  escribir(LEYENDA_GENOGRAMA, { tamano: 8, gris: true, espacio: 12 });

  /* Tabla de integrantes */
  const filas = filasDeIntegrantes(genograma);
  const colAnchos = [anchoUtil * 0.24, anchoUtil * 0.4, anchoUtil * 0.1, anchoUtil * 0.26];
  const xs = colAnchos.reduce((acc, w) => [...acc, acc[acc.length - 1] + w], [margen]).slice(0, -1);
  const encabezados = ["INTEGRANTE", "VÍNCULOS Y RELACIONES", "EDAD", "OBSERVACIÓN"];
  const altoEncabezado = 18;

  avanzar(altoEncabezado + 34);
  doc.setFillColor(55, 65, 81);
  doc.rect(margen, y, anchoUtil, altoEncabezado, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255);
  encabezados.forEach((h, i) => doc.text(h, xs[i] + 6, y + 12.5));
  y += altoEncabezado;

  for (const fila of filas) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const celdas = [fila.nombre, fila.conexiones, fila.edad, fila.observacion];
    const lineas = celdas.map((celda, i) => doc.splitTextToSize(String(celda), colAnchos[i] - 12));
    const alto = Math.max(...lineas.map((l) => l.length)) * 12 + 10;
    avanzar(alto);
    doc.setDrawColor(180);
    doc.setLineWidth(0.5);
    celdas.forEach((_, i) => doc.rect(xs[i], y, colAnchos[i], alto));
    doc.setTextColor(25);
    lineas.forEach((ls, i) => ls.forEach((linea, li) => doc.text(linea, xs[i] + 6, y + 14 + li * 12)));
    y += alto;
  }
  y += 12;

  if (genograma.notas?.trim()) {
    escribir("Nota general del genograma", { tamano: 10.5, negrita: true, espacio: 2 });
    escribir(genograma.notas.trim(), { espacio: 8 });
  }

  return y;
}

/* ---- Sección en HTML para los informes Word ---- */

function escaparHTML(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function seccionGenogramaHTML(genograma) {
  if (!genograma || !Array.isArray(genograma.personas) || genograma.personas.length === 0) return "";
  const filas = filasDeIntegrantes(genograma)
    .map(
      (fila) =>
        `<tr><td style="border:1px solid #999;"><b>${escaparHTML(fila.nombre)}</b></td><td style="border:1px solid #999;">${escaparHTML(fila.conexiones)}</td><td align="center" style="border:1px solid #999;">${escaparHTML(fila.edad)}</td><td style="border:1px solid #999;">${escaparHTML(fila.observacion)}</td></tr>`
    )
    .join("\n");
  const nota = genograma.notas?.trim()
    ? `<p style="margin:8px 0 0;"><b>Nota general del genograma:</b> ${escaparHTML(genograma.notas.trim())}</p>`
    : "";
  return `<h2 style="font-size:13pt;color:#1f2937;margin:18px 0 4px;">Genograma familiar</h2>
<p style="margin:0 0 8px;font-size:9pt;color:#666;">Estructura familiar, vínculos de parentesco y relaciones relevantes registrados durante la evaluación. El diagrama del genograma se incluye en la versión PDF del informe. Leyenda: ${escaparHTML(LEYENDA_GENOGRAMA.toLowerCase())}.</p>
<table cellspacing="0" cellpadding="5" style="border-collapse:collapse;width:100%;font-size:10pt;table-layout:fixed;">
  <tr><th align="left" style="border:1px solid #666;background:#374151;color:#fff;">Integrante</th><th align="left" style="border:1px solid #666;background:#374151;color:#fff;">Vínculos y relaciones</th><th style="border:1px solid #666;background:#374151;color:#fff;">Edad</th><th align="left" style="border:1px solid #666;background:#374151;color:#fff;">Observación</th></tr>
  ${filas}
</table>
${nota}`;
}
