import { jsPDF } from "jspdf";

/* ============================================================
   PERFIL SENSORIAL 2 · BREVE (ADAPTACIÓN ESPAÑOLA)
   Puntuación e informe PDF del cuestionario breve para los
   padres o el cuidador, de 3:0 a 14:11 años (Winnie Dunn —
   PsychCorp/Pearson; adaptación española © 2016 NCS Pearson,
   Inc., ISBN 978-84-9035-544-2).
   Escala: Casi siempre o siempre = 5 · Frecuentemente = 4 ·
   La mitad de las veces = 3 · Ocasionalmente = 2 · Casi nunca
   o nunca = 1 · No aplicable = 0 (se excluye de la suma).
   - Secciones: Procesamiento Sensorial (ítems 1-14, /70) y
     Respuesta Conductual (ítems 15-34, /100).
   - Cada ítem pertenece a un cuadrante: BU Búsqueda/Buscador,
     EV Evitación/Evitativo, SE Sensibilidad/Sensitivo o RE
     Registro/Espectador (BU /35 con 7 ítems, EV /45 con 9,
     SE /50 con 10 y RE /40 con 8).
   - Las 6 filas (4 cuadrantes + 2 secciones) se clasifican en
     la tabla de corte única 3:0-14:11 del manual (Tabla 4.12):
     ±1 Dt = Más/Menos que los demás, ±2 Dt = Mucho más/Mucho
     menos que los demás.
   ============================================================ */

const VERDE = [45, 125, 91];
const VERDE_OSCURO = [27, 84, 61];
const CREMA = [236, 244, 240];
const GRIS = 110;

const TINTES_RANGO = {
  "Mucho menos que los demás": [226, 238, 220],
  "Menos que los demás": [238, 245, 230],
  "Como los demás": [234, 240, 226],
  "Más que los demás": [253, 243, 216],
  "Mucho más que los demás": [251, 228, 228],
};

export const CUADRANTES = [
  { codigo: "BU", nombre: "Búsqueda/Buscador" },
  { codigo: "EV", nombre: "Evitación/Evitativo" },
  { codigo: "SE", nombre: "Sensibilidad/Sensitivo" },
  { codigo: "RE", nombre: "Registro/Espectador" },
];

/* Bandas del sistema de clasificación (Tabla 4.12 del manual):
   `texto` recibe el sujeto con su verbo (p. ej. "el procesamiento
   sensorial se observa"). */
const BANDAS = [
  {
    nombre: "Mucho menos que los demás",
    descripcion: "dos desviaciones típicas o más bajo la media",
    texto: (dominio) =>
      `${capitalizar(dominio)} con mucha menor frecuencia que en la mayoría de los niños de 3:0 a 14:11 años. Conviene explorar con la familia en qué rutinas del día (juego, alimentación, sueño, interacción) el niño aprovecha menos los estímulos y considerar cómo enriquecer sus oportunidades de participación.`,
  },
  {
    nombre: "Menos que los demás",
    descripcion: "una desviación típica o más bajo la media",
    texto: (dominio) =>
      `${capitalizar(dominio)} con menor frecuencia que en la mayoría de los niños de la misma edad. Vale la pena observar en qué situaciones cotidianas se ven limitadas estas respuestas y favorecer más oportunidades de participación.`,
  },
  {
    nombre: "Como los demás",
    descripcion: "en torno a la media (±1 desviación típica)",
    texto: (dominio) =>
      `${capitalizar(dominio)} con una frecuencia similar a la de la mayoría de los niños de la misma edad, dentro del rango esperado y funcional para las rutinas diarias.`,
  },
  {
    nombre: "Más que los demás",
    descripcion: "una desviación típica o más sobre la media",
    texto: (dominio) =>
      `${capitalizar(dominio)} con mayor frecuencia que en la mayoría de los niños de la misma edad. Conviene identificar las situaciones en que estas conductas interfieren con la participación y las rutinas de la familia, y entregar pautas de manejo.`,
  },
  {
    nombre: "Mucho más que los demás",
    descripcion: "dos desviaciones típicas o más sobre la media",
    texto: (dominio) =>
      `${capitalizar(dominio)} con mucha mayor frecuencia que en la mayoría de los niños de la misma edad. Se sugiere un seguimiento más cercano de las rutinas de juego, alimentación, sueño e interacción y, si la familia lo percibe como dificultoso, derivar a evaluación especializada.`,
  },
];

/* Tabla de corte del Breve: 4 cuadrantes y 2 secciones, cada una
   con sus cinco bandas (Tabla 4.12 del manual; idéntica a la de
   la página de resumen del cuestionario). */
export const TABLA_CLASIFICACION = [
  {
    nombre: "Búsqueda/Buscador",
    tipo: "cuadrante",
    codigo: "BU",
    maximo: 35,
    dominio: "la conducta de búsqueda sensorial se observa",
    cortes: [
      { nombre: "Mucho menos que los demás", min: 0, max: 1 },
      { nombre: "Menos que los demás", min: 2, max: 6 },
      { nombre: "Como los demás", min: 7, max: 17 },
      { nombre: "Más que los demás", min: 18, max: 22 },
      { nombre: "Mucho más que los demás", min: 23, max: 35 },
    ],
  },
  {
    nombre: "Evitación/Evitativo",
    tipo: "cuadrante",
    codigo: "EV",
    maximo: 45,
    dominio: "la conducta de evitación sensorial se observa",
    cortes: [
      { nombre: "Mucho menos que los demás", min: 0, max: 2 },
      { nombre: "Menos que los demás", min: 3, max: 8 },
      { nombre: "Como los demás", min: 9, max: 20 },
      { nombre: "Más que los demás", min: 21, max: 26 },
      { nombre: "Mucho más que los demás", min: 27, max: 45 },
    ],
  },
  {
    nombre: "Sensibilidad/Sensitivo",
    tipo: "cuadrante",
    codigo: "SE",
    maximo: 50,
    dominio: "la conducta de sensibilidad sensorial se observa",
    cortes: [
      { nombre: "Mucho menos que los demás", min: 0, max: 3 },
      { nombre: "Menos que los demás", min: 4, max: 9 },
      { nombre: "Como los demás", min: 10, max: 24 },
      { nombre: "Más que los demás", min: 25, max: 31 },
      { nombre: "Mucho más que los demás", min: 32, max: 50 },
    ],
  },
  {
    nombre: "Registro/Espectador",
    tipo: "cuadrante",
    codigo: "RE",
    maximo: 40,
    dominio: "la conducta de registro (espectador) se observa",
    cortes: [
      { nombre: "Mucho menos que los demás", min: 0, max: 2 },
      { nombre: "Menos que los demás", min: 3, max: 5 },
      { nombre: "Como los demás", min: 6, max: 14 },
      { nombre: "Más que los demás", min: 15, max: 18 },
      { nombre: "Mucho más que los demás", min: 19, max: 40 },
    ],
  },
  {
    nombre: "Sensoriales",
    tipo: "seccion",
    indice: 0,
    maximo: 70,
    dominio: "el procesamiento sensorial se observa",
    cortes: [
      { nombre: "Mucho menos que los demás", min: 0, max: 5 },
      { nombre: "Menos que los demás", min: 6, max: 12 },
      { nombre: "Como los demás", min: 13, max: 27 },
      { nombre: "Más que los demás", min: 28, max: 34 },
      { nombre: "Mucho más que los demás", min: 35, max: 70 },
    ],
  },
  {
    nombre: "Conductuales",
    tipo: "seccion",
    indice: 1,
    maximo: 100,
    dominio:
      "las respuestas conductuales asociadas con el procesamiento sensorial se observan",
    cortes: [
      { nombre: "Mucho menos que los demás", min: 0, max: 7 },
      { nombre: "Menos que los demás", min: 8, max: 18 },
      { nombre: "Como los demás", min: 19, max: 43 },
      { nombre: "Más que los demás", min: 44, max: 55 },
      { nombre: "Mucho más que los demás", min: 56, max: 100 },
    ],
  },
];

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function clasificarFila(fila, bruto) {
  return (
    fila.cortes.find((corte) => corte.min != null && bruto >= corte.min && bruto <= corte.max) ??
    null
  );
}

// Número del primer ítem de cada sección (numeración acumulada 1-34).
export function iniciosDeSeccionBreve(secciones) {
  const inicios = [];
  let contador = 0;
  for (const seccion of secciones) {
    inicios.push(contador + 1);
    contador += seccion.preguntas.length;
  }
  return inicios;
}

export function calcularPuntuacionBreve({ secciones = [], respuestas = {}, opciones = [] }) {
  const puntajePorValor = Object.fromEntries(opciones.map((o) => [o.valor, o.puntaje]));
  const letraPorValor = Object.fromEntries(opciones.map((o) => [o.valor, o.etiqueta]));
  const inicios = iniciosDeSeccionBreve(secciones);

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

  // Ítems que componen cada fila: los cuadrantes se cuentan en
  // las secciones y las secciones usan su propio largo.
  const filasClasificacion = TABLA_CLASIFICACION.map((fila) => {
    const bruto =
      fila.tipo === "cuadrante"
        ? totalesCuadrante[fila.codigo]
        : (seccionesResultado[fila.indice]?.raw ?? 0);
    const items =
      fila.tipo === "cuadrante"
        ? seccionesResultado.reduce(
            (n, s) => n + s.detalle.filter((d) => d.cuadrante === fila.codigo).length,
            0
          )
        : (seccionesResultado[fila.indice]?.detalle.length ?? 0);
    return {
      nombre: fila.nombre,
      items,
      bruto,
      maximo: fila.maximo,
      clasificacion: clasificarFila(fila, bruto),
    };
  });

  return {
    secciones: seccionesResultado,
    total,
    totalMaximo: seccionesResultado.reduce((n, s) => n + s.maximo, 0),
    totalNoAplicables,
    totalesCuadrante,
    dominantes,
    filasClasificacion,
    clasificacion: null,
  };
}

/* ============================================================
   INFORME EN PDF
   ============================================================ */

function fechaCorta() {
  return new Date().toLocaleDateString("es", { dateStyle: "long" });
}

function conAnios(valor) {
  if (/^\d+$/.test(valor)) return `${valor} ${valor === "1" ? "año" : "años"}`;
  return valor;
}

const INSTRUCCIONES_ESCALA = [
  "Casi siempre o siempre: responde de esta manera casi siempre o siempre (en el 90% o más de los casos).",
  "Frecuentemente: responde de esta manera frecuentemente (en el 75% de los casos).",
  "La mitad de las veces: responde de esta manera la mitad de las veces (en el 50% de los casos).",
  "Ocasionalmente: responde de esta manera ocasionalmente (en el 25% de los casos).",
  "Casi nunca o nunca: responde de esta manera casi nunca o nunca (en el 10% o menos de los casos).",
  "No aplicable: no se puede contestar porque no se ha podido observar el comportamiento en el niño o no le es aplicable (puntúa 0).",
];

export function descargarInformePDFBreve(config) {
  const { nombreArchivo, datos = [], secciones = [], respuestas = {}, opciones = [], intro } = config;
  const resultado = calcularPuntuacionBreve({ secciones, respuestas, opciones });
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
  escribir("PERFIL SENSORIAL 2 BREVE · CUESTIONARIO PARA LOS PADRES O EL CUIDADOR", { tamano: 10.5, negrita: true, centrado: true, gris: true, espacio: 4 });
  escribir("Informe de resultados · 3:0 a 14:11 años", { tamano: 17, negrita: true, centrado: true, espacio: 2 });
  escribir("Winnie Dunn, PhD, OTR, FAOTA", { tamano: 12, centrado: true, espacio: 6 });
  escribir("Adaptación española de Pearson Clinical Assessment · Traducción al español del formulario oficial", { tamano: 7.5, centrado: true, gris: true, espacio: 14 });

  /* ---- Franja de datos de identificación ---- */
  const celdasId = datos.map((celda) => ({
    etiqueta: celda.etiqueta,
    valor: celda.etiqueta === "EDAD" ? conAnios(valorDato(celda.etiqueta)) : celda.valor,
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
      doc.setFillColor(250, 253, 251);
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

  escribir(intro ?? "", { espacio: 8 });

  /* ---- 2. Hoja de resumen de puntuación ---- */
  escribir("Hoja de resumen de puntuación", { tamano: 13, negrita: true, espacio: 6 });
  escribir(
    "Cada cuadrante y cada sección suma los puntajes de sus ítems (Casi siempre o siempre = 5 … Casi nunca o nunca = 1). Los ítems marcados como No aplicable puntúan 0 y se excluyen de la suma. Cada suma se clasifica en la tabla de corte única (3:0-14:11) como Mucho menos, Menos, Como, Más o Mucho más que los demás.",
    { espacio: 10 }
  );

  const colResumen = [anchoUtil * 0.32, anchoUtil * 0.1, anchoUtil * 0.13, anchoUtil * 0.13, anchoUtil * 0.32];
  const xResumen = [margen];
  for (const w of colResumen) xResumen.push(xResumen[xResumen.length - 1] + w);
  const encabezadosResumen = ["FILA", "ÍTEMS", "P. BRUTO", "MÁXIMO", "CLASIFICACIÓN"];

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

  const filasResumen = [];
  filasResumen.push({ grupo: "CUADRANTES" });
  for (const fila of resultado.filasClasificacion.slice(0, 4)) filasResumen.push({ fila });
  filasResumen.push({ grupo: "SECCIONES SENSORIALES Y CONDUCTUALES" });
  for (const fila of resultado.filasClasificacion.slice(4)) filasResumen.push({ fila });
  filasResumen.push({
    celdas: [
      { texto: "PUNTAJE TOTAL DEL PERFIL", alinear: "izquierda" },
      { texto: "34", alinear: "centro" },
      { texto: String(resultado.total), alinear: "centro" },
      { texto: String(resultado.totalMaximo), alinear: "centro" },
      { texto: "—", alinear: "centro" },
    ],
    esTotal: true,
  });

  const altoFilaResumen = (f) => (f.grupo ? 16 : f.esTotal ? 22 : 20);
  const altoBloqueResumen = 38 + filasResumen.reduce((a, f) => a + altoFilaResumen(f), 0);
  asegurar(altoBloqueResumen + 10);
  const resumenY = y;
  dibujarEncabezadoResumen(resumenY);
  let filaY = resumenY + 38;
  for (const fila of filasResumen) {
    if (fila.grupo) {
      doc.setFillColor(...CREMA);
      doc.rect(margen, filaY, anchoUtil, 16, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...VERDE_OSCURO);
      doc.text(fila.grupo, margen + 6, filaY + 11);
    } else if (fila.esTotal) {
      doc.setFillColor(...CREMA);
      doc.rect(margen, filaY, anchoUtil, altoFilaResumen(fila), "F");
      fila.celdas.forEach((celda, ci) => {
        doc.setFont("helvetica", ci === 2 ? "bold" : "normal");
        doc.setFontSize(10);
        doc.setTextColor(25);
        const centro = celda.alinear === "centro";
        const cx = centro ? xResumen[ci] + colResumen[ci] / 2 : xResumen[ci] + 6;
        doc.text(celda.texto, cx, filaY + 14, { align: centro ? "center" : "left" });
      });
    } else {
      const f = fila.fila;
      fila.celdas = [
        { texto: f.nombre, alinear: "izquierda" },
        { texto: String(f.items), alinear: "centro" },
        { texto: String(f.bruto), alinear: "centro" },
        { texto: String(f.maximo), alinear: "centro" },
        { texto: f.clasificacion ? f.clasificacion.nombre : "—", alinear: "centro", tinte: f.clasificacion ? TINTES_RANGO[f.clasificacion.nombre] : null },
      ];
      const celdaClas = fila.celdas[4];
      if (celdaClas.tinte) {
        doc.setFillColor(...celdaClas.tinte);
        doc.rect(xResumen[4], filaY, colResumen[4], altoFilaResumen(fila), "F");
      }
      fila.celdas.forEach((celda, ci) => {
        doc.setFont("helvetica", ci === 2 || ci === 4 ? "bold" : "normal");
        doc.setFontSize(10);
        doc.setTextColor(25);
        const centro = celda.alinear === "centro";
        const cx = centro ? xResumen[ci] + colResumen[ci] / 2 : xResumen[ci] + 6;
        doc.text(celda.texto, cx, filaY + 13.5, { align: centro ? "center" : "left" });
      });
    }
    filaY += altoFilaResumen(fila);
    doc.setDrawColor(120);
    doc.setLineWidth(0.5);
    doc.line(margen, filaY, margen + anchoUtil, filaY);
  }
  doc.rect(margen, resumenY, anchoUtil, filaY - resumenY);
  for (const x of xResumen.slice(1, -1)) doc.line(x, resumenY + 38, x, filaY);
  y = filaY + 14;

  /* ---- 3. Sistema de clasificación ---- */
  escribir("Sistema de clasificación de las puntuaciones", { tamano: 13, negrita: true, espacio: 4 });
  escribir(
    "Las puntuaciones con una desviación típica o más por encima o por debajo de la media se incluyen en «Más que los demás» o «Menos que los demás», respectivamente. Las puntuaciones con dos o más desviaciones típicas por encima o por debajo de la media se consideran «Mucho más que los demás» o «Mucho menos que los demás». La celda destacada de cada fila corresponde a la clasificación obtenida.",
    { espacio: 10 }
  );

  const colClas = [anchoUtil * 0.22, ...Array(5).fill(anchoUtil * 0.156)];
  const xClas = [margen];
  for (const w of colClas) xClas.push(xClas[xClas.length - 1] + w);
  const encabezadosClas = ["FILA", ...BANDAS.map((b) => b.nombre)];
  const altoEncClas = 26;
  const altoFilaClas = 18;

  const dibujarTablaClasificacion = () => {
    const altoBloque = altoEncClas + TABLA_CLASIFICACION.length * altoFilaClas;
    const tablaY = y;
    doc.setFillColor(...VERDE);
    doc.rect(margen, tablaY, anchoUtil, altoEncClas, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255);
    encabezadosClas.forEach((h, i) => {
      const lineas = doc.splitTextToSize(h, colClas[i] - 8);
      const centro = i > 0;
      const cx = centro ? xClas[i] + colClas[i] / 2 : xClas[i] + 6;
      lineas.forEach((linea, li) =>
        doc.text(linea, cx, tablaY + 11 + li * 8, { align: centro ? "center" : "left" })
      );
    });

    TABLA_CLASIFICACION.forEach((filaTabla, fi) => {
      const filaYT = tablaY + altoEncClas + fi * altoFilaClas;
      const filaResultado = resultado.filasClasificacion.find((f) => f.nombre === filaTabla.nombre);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(25);
      doc.text(filaTabla.nombre, xClas[0] + 6, filaYT + 12.5);
      filaTabla.cortes.forEach((corte, ci) => {
        const activo = corte.min != null && filaResultado?.clasificacion?.nombre === corte.nombre;
        if (activo) {
          doc.setFillColor(...(TINTES_RANGO[corte.nombre] ?? CREMA));
          doc.rect(xClas[ci + 1], filaYT, colClas[ci + 1], altoFilaClas, "F");
        }
        const etiqueta = `${corte.min}–${corte.max}`;
        doc.setFont("helvetica", activo ? "bold" : "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(activo ? 25 : 130);
        doc.text(etiqueta, xClas[ci + 1] + colClas[ci + 1] / 2, filaYT + 12.5, { align: "center" });
      });
      doc.setDrawColor(200);
      doc.setLineWidth(0.5);
      doc.line(margen, filaYT + altoFilaClas, margen + anchoUtil, filaYT + altoFilaClas);
    });
    doc.setDrawColor(120);
    doc.rect(margen, tablaY, anchoUtil, altoBloque);
    for (const x of xClas.slice(1, -1)) doc.line(x, tablaY, x, tablaY + altoBloque);
    doc.setDrawColor(120);
    doc.line(xClas[1], tablaY + altoEncClas, xClas[1], tablaY + altoBloque);
    y = tablaY + altoBloque + 12;
  };
  asegurar(altoEncClas + TABLA_CLASIFICACION.length * altoFilaClas + 30);
  dibujarTablaClasificacion();

  /* ---- 4. Interpretación por fila ---- */
  escribir("Interpretación por cuadrante y sección", { tamano: 13, negrita: true, espacio: 4 });
  const bandaPorNombre = (nombre) => BANDAS.find((b) => b.nombre === nombre);
  for (const fila of resultado.filasClasificacion) {
    if (!fila.clasificacion) continue;
    const textoBanda = bandaPorNombre(fila.clasificacion.nombre);
    asegurar(40);
    escribir(
      `${fila.nombre}: ${fila.bruto} de ${fila.maximo} puntos — ${fila.clasificacion.nombre} (${fila.clasificacion.min}–${fila.clasificacion.max}).`,
      { negrita: true, espacio: 2 }
    );
    escribir(textoBanda ? textoBanda.texto(dominioDeFila(fila.nombre)) : "", { espacio: 8 });
  }
  y += 4;

  /* ---- 5. Cuadrantes por sección ---- */
  asegurar(150);
  escribir("Cuadrantes por sección", { tamano: 13, negrita: true, espacio: 4 });
  escribir(
    "Cada ítem pertenece a un cuadrante del manual: BU Búsqueda/Buscador (busca y disfruta los estímulos), EV Evitación/Evitativo (reacciona retirándose de los estímulos), SE Sensibilidad/Sensitivo (detecta y responde con rapidez a los estímulos) y RE Registro/Espectador (responde más lentamente o parece no notar los estímulos). La suma de cada cuadrante señala el estilo de respuesta que predomina: el mayor de ellos es el destacado.",
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
    // Los títulos largos de sección se parten en líneas y la fila crece.
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const lineasFila = filas.map((fila) =>
      fila.esTotal ? ["TOTAL"] : doc.splitTextToSize(fila.celdas[0], colCuad[0] - 12)
    );
    const alturas = filas.map((_fila, fi) => Math.max(20, lineasFila[fi].length * 11.5 + 9));
    const altoBloque = altoEnc + alturas.reduce((a, b) => a + b, 0);
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

    let filaYT = tablaY + altoEnc;
    filas.forEach((fila, fi) => {
      const altoFila = alturas[fi];
      if (fila.esTotal) {
        doc.setFillColor(...CREMA);
        doc.rect(margen, filaYT, anchoUtil, altoFila, "F");
      }
      const centroY = filaYT + altoFila / 2 + 3.5;
      lineasFila[fi].forEach((linea, li) => {
        doc.setFont("helvetica", fila.esTotal ? "bold" : "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(25);
        doc.text(linea, xCuad[0] + 6, centroY - (lineasFila[fi].length - 1 - li) * 11.5);
      });
      fila.celdas.slice(1).forEach((celda, ci) => {
        const esMaximo = Number(celda) > 0 && Number(celda) === Math.max(...fila.celdas.slice(1).map(Number));
        doc.setFont("helvetica", fila.esTotal || esMaximo ? "bold" : "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(25);
        doc.text(celda, xCuad[ci + 1] + colCuad[ci + 1] / 2, centroY, { align: "center" });
      });
      filaYT += altoFila;
      doc.setDrawColor(200);
      doc.setLineWidth(0.5);
      doc.line(margen, filaYT, margen + anchoUtil, filaYT);
    });
    doc.setDrawColor(120);
    doc.rect(margen, tablaY, anchoUtil, altoBloque);
    for (const x of xCuad.slice(1, -1)) doc.line(x, tablaY + altoEnc, x, tablaY + altoBloque);
    y = tablaY + altoBloque + 10;
  };
  asegurar(
    18 +
      resultado.secciones.reduce((n, s) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        return n + Math.max(20, doc.splitTextToSize(s.titulo, anchoUtil * 0.32 - 12).length * 11.5 + 9);
      }, 20) +
      30
  );
  dibujarTablaCuadrantes();

  const nombresDominantes = resultado.dominantes.map((c) => `${c.nombre} (${c.codigo})`).join(" y ");
  escribir(
    resultado.total > 0
      ? `Cuadrante predominante: ${nombresDominantes}.`
      : "Sin respuestas puntuables en ningún cuadrante.",
    { negrita: true, espacio: 12 }
  );

  /* ---- 6. Detalle de respuestas por sección ---- */
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
        doc.setFillColor(247, 251, 249);
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

  /* ---- 7. Escala, nota y firma ---- */
  asegurar(120);
  escribir("Escala de respuesta del cuestionario", { tamano: 13, negrita: true, espacio: 4 });
  for (const linea of INSTRUCCIONES_ESCALA) {
    escribir(linea, { espacio: 2 });
  }
  y += 8;

  escribir("Nota", { tamano: 13, negrita: true, espacio: 4 });
  escribir(
    "Los resultados del Perfil Sensorial 2 Breve se interpretan junto con la observación clínica y la información de otras fuentes; no constituyen por sí mismos un diagnóstico. Los ítems respondidos como No aplicable puntúan 0, por lo que reducen las sumas: considere su cantidad al interpretar. Las puntuaciones de corte son únicas para todo el rango 3:0-14:11 años.",
    { espacio: 10 }
  );
  escribir(
    "Sensory Profile 2, Copyright © 2014 NCS Pearson, Inc. Adaptación española copyright © 2016 NCS Pearson, Inc. Todos los derechos reservados. Cuestionario Breve para los padres o el cuidador, 3:0 a 14:11 años (ISBN 978-84-9035-544-2).",
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
  const nombre = valorDato("Nombre del niño/a");
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(margen, altoPagina - 40, anchoPagina - margen, altoPagina - 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(130);
    const pie = `Perfil Sensorial 2 Breve · 3:0 a 14:11 años${nombre ? ` · ${nombre}` : ""}`;
    doc.text(doc.splitTextToSize(pie, anchoUtil - 90)[0], margen, altoPagina - 28);
    doc.text(`Página ${i} de ${totalPaginas}`, anchoPagina - margen, altoPagina - 28, { align: "right" });
    doc.text("Generado por teraocupame", anchoPagina / 2, altoPagina - 16, { align: "center" });
  }

  doc.save(`${nombreArchivo}.pdf`);
}

/* Dominio (sujeto con verbo) de cada fila para los textos de
   interpretación, buscado por nombre en la tabla de corte. */
function dominioDeFila(nombre) {
  return TABLA_CLASIFICACION.find((f) => f.nombre === nombre)?.dominio ?? "la conducta se observa";
}
