import { jsPDF } from "jspdf";

/* ============================================================
   INFANT SENSORY PROFILE 2 · NACIMIENTO A 6 MESES (0158700082)
   Puntuación y informe PDF del cuestionario para padres o
   tutores (Winnie Dunn, PhD, OTR, FAOTA — PsychCorp/Pearson).
   Escala: Casi siempre = 5 · Frecuentemente = 4 · La mitad del
   tiempo = 3 · Ocasionalmente = 2 · Casi nunca = 1 ·
   No aplicable = 0 (se excluye de la suma).
   - Cada sección (General, Auditivo, Visual, Táctil, Movimiento
     y Sensorial Oral) suma su puntuación cruda.
   - El total (máximo 125) se clasifica en la curva normal del
     Score Summary: ±1 DE = Más/Menos que los demás, ±2 DE =
     Mucho más/Mucho menos que los demás.
   - Cada ítem pertenece a un cuadrante del manual: BU Buscador
     (Seeking), EV Evitativo (Avoiding), SE Sensitivo
     (Sensitivity), RE Registro (Registration) o ninguno.
   ============================================================ */

const VERDE = [139, 178, 90];
const VERDE_OSCURO = [92, 122, 58];
const CREMA = [234, 240, 226];
const GRIS = 110;

const TINTES_RANGO = {
  "Mucho menos que los demás": [226, 238, 220],
  "Menos que los demás": [238, 245, 230],
  "Como la mayoría de los demás": [234, 240, 226],
  "Más que los demás": [253, 243, 216],
  "Mucho más que los demás": [251, 228, 228],
};

export const CUADRANTES = [
  { codigo: "BU", nombre: "Buscador" },
  { codigo: "EV", nombre: "Evitativo" },
  { codigo: "SE", nombre: "Sensitivo" },
  { codigo: "RE", nombre: "Registro" },
];

export const CLASIFICACIONES = [
  {
    nombre: "Mucho menos que los demás",
    min: 0,
    max: 30,
    descripcion:
      "una desviación estándar o más bajo la media",
    texto:
      "El puntaje total se ubica dos o más desviaciones estándar bajo la media. Estas conductas se observan con mucha menor frecuencia que en la mayoría de los bebés de la misma edad, por lo que conviene explorar con la familia las rutinas diarias de alimentación, sueño e interacción y monitorear el desarrollo sensorial del bebé.",
  },
  {
    nombre: "Menos que los demás",
    min: 31,
    max: 40,
    descripcion:
      "una desviación estándar o más bajo la media",
    texto:
      "El puntaje total se ubica una o más desviaciones estándar bajo la media. Estas conductas ocurren con menor frecuencia que en la mayoría de los bebés de la misma edad; vale la pena observar en qué situaciones cotidianas se ven limitadas las respuestas del bebé y apoyar a la familia para ofrecer más oportunidades de participación.",
  },
  {
    nombre: "Como la mayoría de los demás",
    min: 41,
    max: 61,
    descripcion:
      "en torno a la media (±1 desviación estándar)",
    texto:
      "El puntaje total se ubica dentro del rango esperado, con una frecuencia de conductas similar a la de la mayoría de los bebés de la misma edad. El procesamiento sensorial del bebé es típico y funcional para su participación en las rutinas diarias.",
  },
  {
    nombre: "Más que los demás",
    min: 62,
    max: 71,
    descripcion:
      "una desviación estándar o más sobre la media",
    texto:
      "El puntaje total se ubica una o más desviaciones estándar sobre la media. Estas conductas ocurren con mayor frecuencia que en la mayoría de los bebés de la misma edad; conviene identificar las situaciones en que la mayor reactividad o búsqueda interfiere con la alimentación, el sueño o la interacción, y entregar pautas de manejo a la familia.",
  },
  {
    nombre: "Mucho más que los demás",
    min: 72,
    max: 125,
    descripcion:
      "dos desviaciones estándar o más sobre la media",
    texto:
      "El puntaje total se ubica dos o más desviaciones estándar sobre la media. Estas conductas se observan con mucha mayor frecuencia que en la mayoría de los bebés de la misma edad, por lo que se sugiere un seguimiento más cercano de las rutinas de alimentación, sueño e interacción y, si la familia lo percibe como dificultoso, derivar a evaluación especializada.",
  },
];

export function clasificarTotal(total) {
  return CLASIFICACIONES.find((c) => total >= c.min && total <= c.max) ?? null;
}

// Número del primer ítem de cada sección (numeración acumulada 1-25).
export function iniciosDeSeccionInfante(secciones) {
  const inicios = [];
  let contador = 0;
  for (const seccion of secciones) {
    inicios.push(contador + 1);
    contador += seccion.preguntas.length;
  }
  return inicios;
}

export function calcularPuntuacionInfante({ secciones = [], respuestas = {}, opciones = [] }) {
  const puntajePorValor = Object.fromEntries(opciones.map((o) => [o.valor, o.puntaje]));
  const letraPorValor = Object.fromEntries(opciones.map((o) => [o.valor, o.etiqueta]));
  const inicios = iniciosDeSeccionInfante(secciones);

  let total = 0;
  let totalNoAplicables = 0;
  const seccionesResultado = secciones.map((seccion, si) => {
    const cuadrantes = Object.fromEntries(CUADRANTES.map((c) => [c.codigo, 0]));
    let raw = 0;
    let noAplicables = 0;
    const detalle = seccion.preguntas.map((pregunta, pi) => {
      const valor = respuestas[inicios[si] + pi];
      const puntaje = puntajePorValor[valor] ?? 0;
      const aplicada = valor !== "noAplicable" && valor != null;
      if (valor === "noAplicable") noAplicables += 1;
      if (aplicada && pregunta.cuadrante) cuadrantes[pregunta.cuadrante] += puntaje;
      raw += puntaje;
      return { ...pregunta, valor, puntaje, letra: letraPorValor[valor] ?? "—" };
    });
    total += raw;
    totalNoAplicables += noAplicables;
    return {
      titulo: seccion.titulo,
      raw,
      maximo: seccion.preguntas.length * 5,
      noAplicables,
      cuadrantes,
      detalle,
    };
  });

  const totalesCuadrante = Object.fromEntries(
    CUADRANTES.map((c) => [
      c.codigo,
      seccionesResultado.reduce((suma, s) => suma + s.cuadrantes[c.codigo], 0),
    ])
  );
  const maximoCuadrante = Math.max(...Object.values(totalesCuadrante));
  const dominantes = CUADRANTES.filter((c) => totalesCuadrante[c.codigo] === maximoCuadrante);

  return {
    secciones: seccionesResultado,
    total,
    totalMaximo: 125,
    totalNoAplicables,
    totalesCuadrante,
    dominantes,
    clasificacion: clasificarTotal(total),
  };
}

/* ============================================================
   INFORME EN PDF
   ============================================================ */

function fechaCorta() {
  return new Date().toLocaleDateString("es", { dateStyle: "long" });
}

function conMeses(valor) {
  if (/^\d+$/.test(valor)) return `${valor} ${valor === "1" ? "mes" : "meses"}`;
  return valor;
}

const INSTRUCCIONES_ESCALA = [
  "Casi siempre: responde de esta manera casi siempre (90% o más del tiempo).",
  "Frecuentemente: responde de esta manera frecuentemente (75% del tiempo).",
  "La mitad del tiempo: responde de esta manera la mitad del tiempo (50% del tiempo).",
  "Ocasionalmente: responde de esta manera ocasionalmente (25% del tiempo).",
  "Casi nunca: responde de esta manera casi nunca (10% o menos del tiempo).",
  "No aplicable: no se puede contestar porque no se ha observado ese comportamiento o no es aplicable al bebé (puntúa 0).",
];

export function descargarInformePDFInfante(config) {
  const { nombreArchivo, datos = [], secciones = [], respuestas = {}, opciones = [] } = config;
  const resultado = calcularPuntuacionInfante({ secciones, respuestas, opciones });
  const valorDato = (etiqueta) =>
    datos.find((d) => d.etiqueta.toLowerCase() === etiqueta.toLowerCase())?.valor?.trim() ?? "";

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();
  const margen = 48;
  const margenInferior = 68;
  const anchoUtil = anchoPagina - margen * 2;
  const limite = () => altoPagina - margenInferior;
  let y = margen;

  const nuevaPagina = () => {
    doc.addPage();
    y = margen;
  };
  const asegurar = (alto) => {
    if (y + alto > limite()) nuevaPagina();
  };
  const escribir = (texto, { tamano = 10.5, negrita = false, centrado = false, gris = false, espacio = 6, interlineado = 1.4 } = {}) => {
    doc.setFont("helvetica", negrita ? "bold" : "normal");
    doc.setFontSize(tamano);
    doc.setTextColor(gris ? GRIS : 25);
    for (const linea of doc.splitTextToSize(texto, anchoUtil)) {
      asegurar(tamano * interlineado + 2);
      doc.text(linea, centrado ? anchoPagina / 2 : margen, y, { align: centrado ? "center" : "left" });
      y += tamano * interlineado;
    }
    y += espacio;
  };

  /* ---- 1. Encabezado ---- */
  doc.setFillColor(...VERDE);
  doc.rect(margen, y, anchoUtil, 4, "F");
  y += 24;
  escribir("INFANT SENSORY PROFILE 2 · CUESTIONARIO PARA PADRES O TUTORES", { tamano: 10.5, negrita: true, centrado: true, gris: true, espacio: 4 });
  escribir("Informe de resultados · Nacimiento a 6 meses", { tamano: 17, negrita: true, centrado: true, espacio: 2 });
  escribir("Winnie Dunn, PhD, OTR, FAOTA", { tamano: 12, centrado: true, espacio: 6 });
  escribir("PsychCorp es una marca de Pearson Clinical Assessment · Traducción al español del formulario oficial", { tamano: 7.5, centrado: true, gris: true, espacio: 14 });

  /* ---- Franja de datos de identificación ---- */
  const celdasId = datos.map((celda) => ({
    etiqueta: celda.etiqueta,
    valor: celda.etiqueta === "EDAD" ? conMeses(valorDato(celda.etiqueta)) : valorDato(celda.etiqueta),
    fraccion: celda.fraccion ?? 0.5,
  }));
  celdasId.push({ etiqueta: "FECHA DE APLICACIÓN", valor: fechaCorta(), fraccion: 0.42 });

  const altoCeldaId = 34;
  for (let i = 0; i < celdasId.length; i += 2) {
    const par = celdasId.slice(i, i + 2);
    asegurar(altoCeldaId + 6);
    let x = margen;
    for (const celda of par) {
      const anchoCelda = anchoUtil * celda.fraccion;
      doc.setDrawColor(150);
      doc.setLineWidth(0.6);
      doc.setFillColor(252, 253, 250);
      doc.rect(x, y, anchoCelda, altoCeldaId, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(GRIS);
      doc.text(celda.etiqueta, x + 7, y + 12);
      doc.setFontSize(10.5);
      doc.setTextColor(25);
      const lineas = doc.splitTextToSize(celda.valor || "—", anchoCelda - 14).slice(0, 2);
      lineas.forEach((linea, li) => doc.text(linea, x + 7, y + 26 + li * 11));
      x += anchoCelda;
    }
    y += altoCeldaId + 6;
  }
  y += 8;

  escribir(config.intro ?? "", { espacio: 8 });

  /* ---- 2. Resumen de puntuación por sección ---- */
  escribir("Resumen de puntuación", { tamano: 13, negrita: true, espacio: 6 });
  escribir(
    "Cada sección suma los puntajes de sus ítems (Casi siempre = 5 … Casi nunca = 1). Los ítems marcados como No aplicable puntúan 0 y se excluyen de la suma. La suma de todas las secciones entrega el puntaje total del perfil.",
    { espacio: 10 }
  );

  const colResumen = [anchoUtil * 0.34, anchoUtil * 0.15, anchoUtil * 0.17, anchoUtil * 0.17, anchoUtil * 0.17];
  const xResumen = [margen];
  for (const w of colResumen) xResumen.push(xResumen[xResumen.length - 1] + w);
  const encabezadosResumen = ["SECCIÓN", "ÍTEMS", "P. BRUTO", "MÁXIMO", "NO APLICABLE"];

  const dibujarEncabezadoResumen = (tablaY) => {
    doc.setFillColor(...VERDE_OSCURO);
    doc.rect(margen, tablaY, anchoUtil, 20, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(255);
    doc.text("HOJA DE RESUMEN DE PUNTUACIÓN · SCORE SUMMARY", anchoPagina / 2, tablaY + 14, { align: "center" });
    doc.setFillColor(...VERDE);
    doc.rect(margen, tablaY + 20, anchoUtil, 18, "F");
    doc.setFontSize(8.5);
    encabezadosResumen.forEach((h, i) => {
      const centro = i > 0;
      const cx = centro ? xResumen[i] + colResumen[i] / 2 : xResumen[i] + 6;
      doc.text(h, cx, tablaY + 33, { align: centro ? "center" : "left" });
    });
    doc.setDrawColor(120);
    doc.setLineWidth(0.6);
    doc.rect(margen, tablaY, anchoUtil, 38);
  };

  const filasResumen = resultado.secciones.map((seccion) => ({
    celdas: [
      { texto: seccion.titulo, alinear: "izquierda" },
      { texto: String(seccion.detalle.length), alinear: "centro" },
      { texto: String(seccion.raw), alinear: "centro" },
      { texto: String(seccion.maximo), alinear: "centro" },
      { texto: String(seccion.noAplicables), alinear: "centro" },
    ],
    alto: 20,
    esTotal: false,
  }));
  filasResumen.push({
    celdas: [
      { texto: "PUNTAJE TOTAL DEL PERFIL", alinear: "izquierda" },
      { texto: String(resultado.secciones.reduce((n, s) => n + s.detalle.length, 0)), alinear: "centro" },
      { texto: String(resultado.total), alinear: "centro" },
      { texto: String(resultado.totalMaximo), alinear: "centro" },
      { texto: String(resultado.totalNoAplicables), alinear: "centro" },
    ],
    alto: 22,
    esTotal: true,
  });

  const altoBloqueResumen = 38 + filasResumen.reduce((a, f) => a + f.alto, 0);
  asegurar(altoBloqueResumen + 10);
  const resumenY = y;
  dibujarEncabezadoResumen(resumenY);
  let filaY = resumenY + 38;
  for (const fila of filasResumen) {
    if (fila.esTotal) {
      doc.setFillColor(...CREMA);
      doc.rect(margen, filaY, anchoUtil, fila.alto, "F");
    }
    fila.celdas.forEach((celda, ci) => {
      doc.setFont("helvetica", fila.esTotal || ci === 2 ? "bold" : "normal");
      doc.setFontSize(10);
      doc.setTextColor(25);
      const centro = celda.alinear === "centro";
      const cx = centro ? xResumen[ci] + colResumen[ci] / 2 : xResumen[ci] + 6;
      doc.text(celda.texto, cx, filaY + 14, { align: centro ? "center" : "left" });
    });
    filaY += fila.alto;
    doc.setDrawColor(120);
    doc.setLineWidth(0.5);
    doc.line(margen, filaY, margen + anchoUtil, filaY);
  }
  doc.rect(margen, resumenY, anchoUtil, filaY - resumenY);
  for (const x of xResumen.slice(1, -1)) doc.line(x, resumenY + 38, x, filaY);
  y = filaY + 14;

  /* ---- 3. Clasificación en la curva normal ---- */
  escribir("Clasificación en la curva normal", { tamano: 13, negrita: true, espacio: 4 });
  escribir(
    "Según el Score Summary, los puntajes a una desviación estándar o más de la media se expresan como Más o Menos que los demás, y a dos desviaciones estándar o más, como Mucho más o Mucho menos que los demás. El puntaje total de este perfil se clasifica de la siguiente manera:",
    { espacio: 10 }
  );

  const colClas = [anchoUtil * 0.28, anchoUtil * 0.18, anchoUtil * 0.54];
  const xClas = [margen];
  for (const w of colClas) xClas.push(xClas[xClas.length - 1] + w);
  const encabezadosClas = ["CLASIFICACIÓN", "RANGO", "CRITERIO"];
  asegurar(18 + CLASIFICACIONES.length * 20 + 16);
  const clasY = y;
  doc.setFillColor(...VERDE);
  doc.rect(margen, clasY, anchoUtil, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255);
  encabezadosClas.forEach((h, i) => {
    const cx = i === 2 ? xClas[i] + 6 : xClas[i] + colClas[i] / 2;
    doc.text(h, cx, clasY + 12.5, { align: i === 2 ? "left" : "center" });
  });
  doc.setDrawColor(120);
  doc.rect(margen, clasY, anchoUtil, 18 + CLASIFICACIONES.length * 20);
  doc.line(margen, clasY + 18, margen + anchoUtil, clasY + 18);
  CLASIFICACIONES.forEach((clasificacion, i) => {
    const filaY = clasY + 18 + i * 20;
    const esResultado = clasificacion.nombre === resultado.clasificacion?.nombre;
    const tinte = TINTES_RANGO[clasificacion.nombre];
    if (tinte) {
      doc.setFillColor(...tinte);
      doc.rect(xClas[0], filaY, colClas[0] + colClas[1], 20, "F");
    }
    doc.setFont("helvetica", esResultado ? "bold" : "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(25);
    doc.text(clasificacion.nombre, xClas[0] + colClas[0] / 2, filaY + 13.5, { align: "center" });
    doc.text(`${clasificacion.min} – ${clasificacion.max}`, xClas[1] + colClas[1] / 2, filaY + 13.5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text(clasificacion.descripcion, xClas[2] + 6, filaY + 13.5);
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(margen, filaY + 20, margen + anchoUtil, filaY + 20);
  });
  doc.setDrawColor(120);
  doc.rect(margen, clasY, anchoUtil, 18 + CLASIFICACIONES.length * 20);
  y = clasY + 18 + CLASIFICACIONES.length * 20 + 14;

  if (resultado.clasificacion) {
    escribir(
      `Resultado: con un puntaje total de ${resultado.total} sobre ${resultado.totalMaximo}, el perfil se clasifica como “${resultado.clasificacion.nombre}”.`,
      { negrita: true, espacio: 4 }
    );
    escribir(resultado.clasificacion.texto, { espacio: 12 });
  }

  /* ---- 4. Cuadrantes ---- */
  asegurar(150);
  escribir("Cuadrantes del procesamiento sensorial", { tamano: 13, negrita: true, espacio: 4 });
  escribir(
    "Cada ítem pertenece a un cuadrante del manual: BU Buscador (busca y disfruta los estímulos), EV Evitativo (reacciona retirándose de los estímulos), SE Sensitivo (detecta y responde con rapidez a los estímulos) y RE Registro (responde más lentamente o parece no notar los estímulos). La suma de cada cuadrante señala el estilo de respuesta que predomina: el mayor de ellos es el destacado.",
    { espacio: 10 }
  );

  const colCuad = [anchoUtil * 0.32, anchoUtil * 0.17, anchoUtil * 0.17, anchoUtil * 0.17, anchoUtil * 0.17];
  const xCuad = [margen];
  for (const w of colCuad) xCuad.push(xCuad[xCuad.length - 1] + w);
  const encabezadosCuad = ["SECCIÓN", ...CUADRANTES.map((c) => c.codigo)];

  const dibujarTablaCuadrantes = () => {
    const filas = resultado.secciones.map((seccion) => ({
      celdas: [seccion.titulo, ...CUADRANTES.map((c) => String(seccion.cuadrantes[c.codigo]))],
      esTotal: false,
    }));
    filas.push({
      celdas: ["TOTAL", ...CUADRANTES.map((c) => String(resultado.totalesCuadrante[c.codigo]))],
      esTotal: true,
    });
    const altoEnc = 18;
    const altoBloque = altoEnc + filas.length * 20;
    const tablaY = y;
    doc.setFillColor(...VERDE);
    doc.rect(margen, tablaY, anchoUtil, altoEnc, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255);
    encabezadosCuad.forEach((h, i) => {
      const cx = i === 0 ? xCuad[i] + 6 : xCuad[i] + colCuad[i] / 2;
      doc.text(h, cx, tablaY + 12.5, { align: i === 0 ? "left" : "center" });
    });
    doc.setDrawColor(120);
    doc.rect(margen, tablaY, anchoUtil, altoBloque);
    doc.line(margen, tablaY + altoEnc, margen + anchoUtil, tablaY + altoEnc);

    filas.forEach((fila, fi) => {
      const filaY = tablaY + altoEnc + fi * 20;
      if (fila.esTotal) {
        doc.setFillColor(...CREMA);
        doc.rect(margen, filaY, anchoUtil, 20, "F");
      }
      fila.celdas.forEach((celda, ci) => {
        const esMaximo = ci > 0 && Number(celda) > 0 && Number(celda) === Math.max(...fila.celdas.slice(1).map(Number));
        doc.setFont("helvetica", fila.esTotal || esMaximo ? "bold" : "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(25);
        const cx = ci === 0 ? xCuad[ci] + 6 : xCuad[ci] + colCuad[ci] / 2;
        doc.text(celda, cx, filaY + 13.5, { align: ci === 0 ? "left" : "center" });
      });
      doc.setDrawColor(200);
      doc.setLineWidth(0.5);
      doc.line(margen, filaY + 20, margen + anchoUtil, filaY + 20);
    });
    doc.setDrawColor(120);
    doc.rect(margen, tablaY, anchoUtil, altoBloque);
    for (const x of xCuad.slice(1, -1)) doc.line(x, tablaY + altoEnc, x, tablaY + altoBloque);
    y = tablaY + altoBloque + 10;
  };
  asegurar(18 + (resultado.secciones.length + 1) * 20 + 30);
  dibujarTablaCuadrantes();

  const nombresDominantes = resultado.dominantes.map((c) => `${c.nombre} (${c.codigo})`).join(" y ");
  escribir(
    resultado.total > 0
      ? `Cuadrante predominante: ${nombresDominantes}.`
      : "Sin respuestas puntuables en ningún cuadrante.",
    { negrita: true, espacio: 12 }
  );

  /* ---- 5. Detalle de respuestas por sección ---- */
  asegurar(60);
  escribir("Detalle de respuestas por sección", { tamano: 13, negrita: true, espacio: 4 });
  escribir(
    `Respuestas registradas para los ${resultado.secciones.reduce((n, s) => n + s.detalle.length, 0)} ítems del cuestionario, agrupados por sección.`,
    { espacio: 10 }
  );

  const colDetalle = [30, anchoUtil - 30 - 132, 132];
  const xDetalle = [margen, margen + colDetalle[0], margen + colDetalle[0] + colDetalle[1]];
  const lineasDe = (texto, ancho, { tamano = 9.5, negrita = false } = {}) => {
    doc.setFont("helvetica", negrita ? "bold" : "normal");
    doc.setFontSize(tamano);
    return doc.splitTextToSize(texto, ancho - 12);
  };

  resultado.secciones.forEach((seccion) => {
    const banda = 20;
    asegurar(banda + 18 + 40);
    doc.setFillColor(...VERDE_OSCURO);
    doc.rect(margen, y, anchoUtil, banda, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255);
    doc.text(seccion.titulo, anchoPagina / 2, y + 14, { align: "center" });
    y += banda;

    doc.setFillColor(...VERDE);
    doc.rect(margen, y, anchoUtil, 16, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255);
    doc.text("N.º", xDetalle[0] + 6, y + 11.5);
    doc.text("ÍTEM", xDetalle[1] + 6, y + 11.5);
    doc.text("RESPUESTA", xDetalle[2] + 6, y + 11.5);
    y += 16;

    seccion.detalle.forEach((item, pi) => {
      const respuesta = item.valor === "noAplicable" ? "No aplicable (0)" : `${item.letra} (${item.puntaje})`;
      const lineasItem = lineasDe(item.texto, colDetalle[1]);
      const lineasResp = lineasDe(respuesta, colDetalle[2], { negrita: true });
      const altoFila = Math.max(2, lineasItem.length, lineasResp.length) * 11.5 + 7;

      if (y + altoFila > limite()) {
        nuevaPagina();
        doc.setFillColor(...VERDE);
        doc.rect(margen, y, anchoUtil, 16, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(255);
        doc.text(`${seccion.titulo} (continúa)`, margen + 6, y + 11.5);
        y += 16;
      }

      if (pi % 2 === 1) {
        doc.setFillColor(248, 250, 245);
        doc.rect(margen, y, anchoUtil, altoFila, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(25);
      let ty = y + 13;
      for (const linea of lineasItem) {
        doc.text(linea, xDetalle[1] + 6, ty);
        ty += 11.5;
      }
      doc.setFont("helvetica", "bold");
      let tyResp = y + 13;
      for (const linea of lineasResp) {
        doc.text(linea, xDetalle[2] + 6, tyResp);
        tyResp += 11.5;
      }
      doc.setFont("helvetica", "normal");
      doc.text(String(pi + 1), xDetalle[0] + 6, y + 13);

      y += altoFila;
      doc.setDrawColor(200);
      doc.setLineWidth(0.5);
      doc.line(margen, y, margen + anchoUtil, y);
    });

    const altoSubtotal = 19;
    if (y + altoSubtotal > limite()) nuevaPagina();
    doc.setFillColor(...CREMA);
    doc.rect(margen, y, anchoUtil, altoSubtotal, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(25);
    doc.text(`Suma de la sección`, xDetalle[1] + 6, y + 13);
    doc.text(`${seccion.raw} de ${seccion.maximo}`, xDetalle[2] + 6, y + 13);
    y += altoSubtotal + 16;
  });

  /* ---- 6. Escala, nota y firma ---- */
  asegurar(120);
  escribir("Escala de respuesta del cuestionario", { tamano: 13, negrita: true, espacio: 4 });
  for (const linea of INSTRUCCIONES_ESCALA) {
    escribir(linea, { espacio: 2 });
  }
  y += 8;

  escribir("Nota", { tamano: 13, negrita: true, espacio: 4 });
  escribir(
    "Los resultados del Infant Sensory Profile 2 se interpretan junto con la observación clínica y la información de otras fuentes; no constituyen por sí mismos un diagnóstico. Los ítems respondidos como No aplicable puntúan 0, por lo que reducen el puntaje total: considere su cantidad al interpretar.",
    { espacio: 10 }
  );
  escribir(
    "Infant Sensory Profile 2 · Copyright © 2014 NCS Pearson, Inc. Todos los derechos reservados. Formulario Nacimiento a 6 meses, cuestionario para padres o tutores (producto 0158700082).",
    { tamano: 8, gris: true, espacio: 0 }
  );

  asegurar(90);
  y += 26;
  const lineaFirma = 230;
  doc.setDrawColor(25);
  doc.setLineWidth(0.8);
  doc.line(anchoPagina / 2 - lineaFirma / 2, y, anchoPagina / 2 + lineaFirma / 2, y);
  y += 14;
  const examinador = valorDato("Nombre del/la Examinador(a)") || valorDato("Nombre del/la examinador(a)");
  if (examinador) escribir(examinador, { centrado: true, negrita: true, espacio: 1 });
  escribir("Firma del/la examinador(a)", { tamano: 9, gris: true, centrado: true, espacio: 0 });

  /* ---- Pie de página y numeración ---- */
  const nombre = valorDato("Nombre del niño/a") || valorDato("Nombre del Niño o Niña");
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(margen, altoPagina - 40, anchoPagina - margen, altoPagina - 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(130);
    const pie = `Infant Sensory Profile 2 · Nacimiento a 6 meses${nombre ? ` · ${nombre}` : ""}`;
    doc.text(doc.splitTextToSize(pie, anchoUtil - 90)[0], margen, altoPagina - 28);
    doc.text(`Página ${i} de ${totalPaginas}`, anchoPagina - margen, altoPagina - 28, { align: "right" });
    doc.text("Generado por teraocupame", anchoPagina / 2, altoPagina - 16, { align: "center" });
  }

  doc.save(`${nombreArchivo}.pdf`);
}
