import { jsPDF } from "jspdf";
import { TABLAS_NORMAS, rangoDeT } from "./normas-spm2.js";

/* ============================================================
   PUNTUACIÓN OFICIAL SPM-2
   - Cada escala (VIS, HEA, TOU, T&S, BOD, BAL, PLN, SOC) suma los
     puntajes 1-4 de sus 10 ítems (bruto 10-40).
   - Ítems 71-80 (Participación Social) redactados en positivo: se
     puntúan INVERTIDOS (N=4, O=3, F=2, S=1) según la Scoring
     Worksheet oficial de cada formulario (ver ITEMS_SOC_INVERTIDOS).
   - ST (Total Sensorial) = VIS + HEA + TOU + T&S + BOD + BAL (60-240);
     SOC y PLN no entran en el ST.
   - El puntaje bruto se convierte a puntaje T y percentil con las
     tablas normativas del AutoScore (src/lib/normas-spm2.js).
   - Rangos de interpretación: Típico (T 40-59),
     Dificultades moderadas (T 60-69), Dificultades severas (T ≥ 70).
   ============================================================ */

const PUNTAJES_OPCION = { nunca: 1, ocasionalmente: 2, frecuentemente: 3, siempre: 4 };

/* Ítems de Participación Social (71-80) redactados en positivo.
   En el SPM-2 esos ítems se puntúan invertidos (N = 4, O = 3,
   F = 2, S = 1); los ítems 71-80 redactados en negativo se puntúan
   directos. Direcciones tomadas de la Scoring Worksheet oficial de
   cada formulario (W-709E y W-708E: los diez ítems son positivos;
   W-707E, W-707G, W-706F y W-706E: mixtos según su redacción). */
const ITEMS_SOC_INVERTIDOS = {
  preescolar: [71, 72, 73, 74, 75, 76, 77, 78, 79, 80],
  preescolarEscolar: [71, 72, 73, 74, 75, 76, 77, 78, 79, 80],
  child: [71, 72, 73, 74, 75, 76, 77, 78, 79, 80],
  adolescenteHogar: [71, 72, 73, 76, 77],
  adolescenteAuto: [71, 72, 73, 74, 77],
  adultoEvaluador: [71, 72, 74, 75, 76, 77, 78, 79],
  adultoAuto: [71, 72, 74, 75, 80],
};

// Puntaje de un ítem: directo (N=1, O=2, F=3, S=4) o invertido (5 - directo).
function puntajeItem(valor, invertido) {
  const directo = PUNTAJES_OPCION[valor];
  if (!directo) return 0;
  return invertido ? 5 - directo : directo;
}

// Suma los 10 ítems de la sección `indice` (0-7) de un formulario.
export function sumaDeSeccion(respuestas, indice, norma) {
  const invertidos = ITEMS_SOC_INVERTIDOS[norma] ?? [];
  let suma = 0;
  for (let i = 1; i <= 10; i++) {
    const numero = indice * 10 + i;
    suma += puntajeItem(respuestas[numero], invertidos.includes(numero));
  }
  return suma;
}

// Orden de las secciones del formulario -> código de escala oficial
const SECCIONES_A_ESCALA = [
  { titulo: "VISIÓN", escala: "VIS" },
  { titulo: "OÍDO", escala: "HEA" },
  { titulo: "TACTO", escala: "TOU" },
  { titulo: "GUSTO Y OLFATO", escala: "TS" },
  { titulo: "CONCIENCIA CORPORAL", escala: "BOD", alias: ["CONCIENCIA DEL CUERPO"] },
  { titulo: "EQUILIBRIO Y MOVIMIENTO", escala: "BAL" },
  { titulo: "PLANIFICACIÓN E IDEAS", escala: "PLN" },
  { titulo: "PARTICIPACIÓN SOCIAL", escala: "SOC" },
];

const ETIQUETAS_ESCALA = {
  VIS: "Visión (VIS)",
  HEA: "Auditivo (HEA)",
  TOU: "Táctil (TOU)",
  TS: "Gusto y Olfato (T&S)",
  BOD: "Conciencia Corporal (BOD)",
  BAL: "Equilibrio y Movimiento (BAL)",
  ST: "Total Sensorial (ST)",
  PLN: "Planificación e Ideas (PLN)",
  SOC: "Participación Social (SOC)",
};

export const SENSORIALES = ["VIS", "HEA", "TOU", "TS", "BOD", "BAL"];

function sumaSeccion(secciones, respuestas, definicion, norma) {
  const candidatos = [definicion.titulo, ...(definicion.alias ?? [])];
  const indice = secciones.findIndex((s) => candidatos.includes(s.titulo));
  if (indice === -1) return null;
  return sumaDeSeccion(respuestas, indice, norma);
}

export function calcularPuntuacion(config) {
  const { secciones, respuestas, datos = [], norma } = config;

  let tablaNorma = norma;
  if (norma === "preescolar" || norma === "preescolarEscolar") {
    // Las tablas del Preescolar se dividen entre 2-4 años y 5 años
    const edad = Number(datos.find((d) => d.etiqueta === "Edad")?.valor ?? "");
    tablaNorma = edad === 5 ? `${norma}5` : `${norma}24`;
  }
  const mapa = TABLAS_NORMAS[tablaNorma];

  const brutos = {};
  for (const def of SECCIONES_A_ESCALA) {
    brutos[def.escala] = sumaSeccion(secciones, respuestas, def, norma);
  }
  brutos.ST = SENSORIALES.reduce((total, e) => total + (brutos[e] ?? 0), 0);

  const orden = [...SENSORIALES, "ST", "PLN", "SOC"];
  const escalas = orden.map((escala) => {
    const raw = brutos[escala];
    const norma_ = mapa?.[escala]?.[raw] ?? null;
    const t = norma_ ? norma_.t : null;
    return {
      escala,
      etiqueta: ETIQUETAS_ESCALA[escala],
      raw,
      t,
      pct: norma_ ? norma_.pct : null,
      rango: t != null ? rangoDeT(t) : null,
    };
  });

  return { escalas, tablaNorma };
}

/* ============================================================
   TEXTOS DE INTERPRETACIÓN POR ESCALA Y RANGO
   ============================================================ */

const TEXTOS_ESCALA = {
  VIS: {
    tipico: "Su procesamiento visual es típico, esperado y funcional. Se adapta adecuadamente a la iluminación ambiental, logra encontrar objetos en un fondo complejo y puede filtrar distracciones visuales irrelevantes para mantener la atención.",
    moderado: "Su procesamiento visual muestra diferencias respecto de lo esperado. Se distrae con elementos visuales del entorno, le cuesta filtrar información irrelevante y puede incomodarse con luces brillantes o movimiento visual frecuente.",
    severo: "Su procesamiento visual difiere significativamente de lo esperado. Los estímulos visuales capturan su atención de forma constante y pueden generar incomodidad importante, afectando su capacidad de concentrarse y desenvolverse en ambientes visualmente complejos.",
  },
  HEA: {
    tipico: "Su procesamiento auditivo es típico, esperado y funcional. Reacciona a los sonidos del entorno de manera adecuada, logrando filtrar el ruido de fondo irrelevante y prestando atención a lo importante, como escuchar cuando lo llaman por su nombre.",
    moderado: "Su procesamiento auditivo muestra diferencias respecto de lo esperado. Reacciona con mayor frecuencia o intensidad a los sonidos del entorno, se distrae o se molesta con ruidos que otros ignoran, lo que puede afectar su atención en ambientes con ruido.",
    severo: "Su procesamiento auditivo difiere significativamente de lo esperado. Los sonidos cotidianos pueden resultar intensos o invasivos, generando respuestas frecuentes de molestia, evitación o sobresalto que impactan su participación en ambientes con ruido.",
  },
  TOU: {
    tipico: "Su procesamiento táctil es típico, esperado y funcional. Acepta el contacto físico adecuado, tolera las texturas cotidianas de la ropa, reacciona de forma proporcional al dolor o la temperatura, y participa en el juego exploratorio de forma natural.",
    moderado: "Su procesamiento táctil muestra diferencias respecto de lo esperado. Reacciona con incomodidad o rechazo ante contactos, texturas o temperaturas que otros toleran sin dificultad, lo que puede afectar rutinas como el vestirse, el aseo o el juego.",
    severo: "Su procesamiento táctil difiere significativamente de lo esperado. Las sensaciones táctiles cotidianas (roce de la ropa, contacto físico, texturas) pueden generar respuestas intensas de rechazo o malestar, impactando de manera relevante sus rutinas diarias y su participación.",
  },
  TS: {
    tipico: "Su procesamiento del gusto y el olfato es típico, esperado y funcional. Tiene preferencias y rechazos alimentarios normales, tolera adecuadamente los olores del entorno y no presenta conductas de búsqueda o evitación oral significativas.",
    moderado: "Su procesamiento del gusto y el olfato muestra diferencias respecto de lo esperado. Presenta preferencias o rechazos alimentarios más marcados de lo habitual, puede incomodarse con ciertos sabores u olores y evitar comidas o entornos por sus características sensoriales.",
    severo: "Su procesamiento del gusto y el olfato difiere significativamente de lo esperado. Presenta rechazos alimentarios intensos, incomodidad importante frente a sabores y olores, o búsqueda oral constante, impactando la alimentación y la participación cotidiana.",
  },
  BOD: {
    tipico: "Su conciencia corporal es típica, esperada y funcional. Utiliza la fuerza adecuada para las tareas, mantiene una buena postura al sentarse y se mueve por el espacio con una coordinación acorde a su edad.",
    moderado: "Su conciencia corporal muestra diferencias respecto de lo esperado. Puede usar más o menos fuerza de la necesaria, apoyarse en superficies o personas y presentar dificultades para mantener posturas estables durante las actividades.",
    severo: "Su conciencia corporal difiere significativamente de lo esperado. Presenta dificultades marcadas para regular la fuerza, mantener posturas y coordinar su cuerpo en el espacio, lo que afecta tareas cotidianas como escribir, vestirse o desplazarse.",
  },
  BAL: {
    tipico: "Su procesamiento del movimiento es típico, esperado y funcional. Participa con normalidad en actividades que implican movimiento, sin mostrar rechazo excesivo ni búsqueda constante de estímulos vestibulares.",
    moderado: "Su procesamiento del movimiento muestra diferencias respecto de lo esperado. Busca o evita con mayor frecuencia actividades de movimiento (columpiarse, girar, subir o bajar), lo que puede observarse como inquietud o necesidad de moverse durante las tareas.",
    severo: "Su procesamiento del movimiento difiere significativamente de lo esperado. Presenta una búsqueda intensa o un rechazo marcado frente a las actividades de movimiento, lo que impacta su participación en el juego, los desplazamientos y las actividades diarias.",
  },
  ST: {
    tipico: "En conjunto, el procesamiento de la información sensorial se encuentra dentro de lo esperado, sin indicadores relevantes de dificultades en los sistemas visual, auditivo, táctil, gustativo/olfativo, de conciencia corporal ni de movimiento.",
    moderado: "En conjunto, el procesamiento de la información sensorial evidencia dificultades moderadas, con respuestas a los estímulos del entorno que se alejan de lo esperado y que pueden influir en la atención, la regulación y la participación en las actividades diarias.",
    severo: "En conjunto, el procesamiento de la información sensorial evidencia dificultades severas. Las respuestas frente a los estímulos del entorno difieren de manera importante de lo esperado y repercuten de forma significativa en la atención, la regulación, la conducta y la participación funcional.",
  },
  PLN: {
    tipico: "Su planificación e ideas son típicas, esperadas y funcionales. Planifica y organiza las acciones necesarias para las tareas, sigue los pasos de una rutina en secuencia lógica y genera ideas propias para el juego y la construcción con facilidad.",
    moderado: "Su planificación e ideas muestran diferencias respecto de lo esperado. Le cuesta planificar y organizar las acciones de una tarea, seguir secuencias de pasos o generar ideas propias, y suele necesitar más práctica y más tiempo que otros para adquirir habilidades nuevas o completar actividades rutinarias.",
    severo: "Su planificación e ideas difieren significativamente de lo esperado. Presenta dificultades marcadas para planificar y secuenciar acciones, imitar modelos y generar ideas propias, lo que afecta de manera importante su autonomía en las rutinas diarias, el aprendizaje y el juego.",
  },
  SOC: {
    tipico: "Su desarrollo socioemocional y sus interacciones son típicas, esperadas y funcionales. Participa con otros de manera adecuada a su edad, expresa sus emociones con normalidad y forma relaciones sociales saludables.",
    moderado: "Su desarrollo socioemocional muestra diferencias respecto de lo esperado. Puede presentar dificultades para regular sus emociones, participar con otros o manejar situaciones sociales, con mayor frecuencia que la mayoría.",
    severo: "Su desarrollo socioemocional difiere significativamente de lo esperado. Presenta dificultades importantes en la regulación emocional y la interacción social, lo que impacta su participación en las relaciones y las actividades grupales.",
  },
};

const CLAVE_RANGO = { Típico: "tipico", "Dificultades moderadas": "moderado", "Dificultades severas": "severo" };

export function textoInterpretacion(escala, rango) {
  return TEXTOS_ESCALA[escala]?.[CLAVE_RANGO[rango]] ?? "";
}

/* ============================================================
   UTILIDADES
   ============================================================ */

function fechaRegistro() {
  return new Date().toLocaleString("es", { dateStyle: "long", timeStyle: "short" });
}

function calcularEdad(fechaNac) {
  const nac = new Date(`${fechaNac}T00:00:00`);
  if (Number.isNaN(nac.getTime())) return null;
  const hoy = new Date();
  let anos = hoy.getFullYear() - nac.getFullYear();
  let meses = hoy.getMonth() - nac.getMonth();
  if (hoy.getDate() < nac.getDate()) meses -= 1;
  if (meses < 0) {
    anos -= 1;
    meses += 12;
  }
  return `${anos} ${anos === 1 ? "año" : "años"}, ${meses} ${meses === 1 ? "mes" : "meses"}.`;
}

function filasEncabezado(datos) {
  const valor = (etiqueta) => datos.find((d) => d.etiqueta === etiqueta)?.valor?.trim() ?? "";
  const fechaNac = valor("Fecha de Nacimiento");
  const edadCalculada = fechaNac ? calcularEdad(fechaNac) : null;

  const filas = [];
  for (const d of datos) {
    let v = d.valor?.trim();
    if (d.etiqueta === "Edad" && edadCalculada) v = edadCalculada;
    if (v) filas.push({ etiqueta: d.etiqueta.toUpperCase(), valor: v });
  }
  filas.push({ etiqueta: "FECHA", valor: fechaRegistro() });
  return filas;
}

function escaparHTML(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function parrafoDiagnostico(escalas) {
  const porRango = (rango) => escalas.filter((e) => e.rango === rango).map((e) => e.etiqueta);
  const severas = porRango("Dificultades severas");
  const moderadas = porRango("Dificultades moderadas");
  const tipicas = porRango("Típico");

  const partes = [];
  partes.push(
    `Con los resultados obtenidos, ${severas.length} escala(s) se ubican en el rango de dificultades severas (T 70 o más), ${moderadas.length} en dificultades moderadas (T 60-69) y ${tipicas.length} en el rango típico (T 40-59).`
  );
  if (severas.length) partes.push(`Escalas con dificultades severas: ${severas.join("; ")}.`);
  if (moderadas.length) partes.push(`Escalas con dificultades moderadas: ${moderadas.join("; ")}.`);
  if (tipicas.length) partes.push(`Escalas dentro del rango típico: ${tipicas.join("; ")}.`);
  return partes.join(" ");
}

/* ============================================================
   INFORME EN PDF
   ============================================================ */

export function descargarInformePDF(config) {
  const { instrumento, datos, } = config;
  const { escalas } = calcularPuntuacion(config);
  const encabezado = filasEncabezado(datos);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margen = 48;
  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();
  const anchoUtil = anchoPagina - margen * 2;
  let y = margen;

  const escribir = (texto, { tamano = 11, negrita = false, centrado = false, gris = false, espacio = 6 } = {}) => {
    doc.setFont("helvetica", negrita ? "bold" : "normal");
    doc.setFontSize(tamano);
    doc.setTextColor(gris ? 110 : 25);
    for (const linea of doc.splitTextToSize(texto, anchoUtil)) {
      if (y > altoPagina - margen) {
        doc.addPage();
        y = margen;
      }
      doc.text(linea, centrado ? anchoPagina / 2 : margen, y, { align: centrado ? "center" : "left" });
      y += tamano * 1.35;
    }
    y += espacio;
  };

  // ---- Encabezado ----
  escribir("PERFIL SENSORIAL 2 - INFORME DE RESULTADOS", { tamano: 16, negrita: true, centrado: true, espacio: 2 });
  escribir(instrumento, { tamano: 12, centrado: true, espacio: 14 });

  doc.setFontSize(11);
  for (const f of encabezado) {
    if (y > altoPagina - margen) {
      doc.addPage();
      y = margen;
    }
    doc.setFont("helvetica", "bold");
    doc.setTextColor(25);
    doc.text(`${f.etiqueta}: `, margen, y);
    const etiquetaAncho = doc.getTextWidth(`${f.etiqueta}: `);
    doc.setFont("helvetica", "normal");
    const lineas = doc.splitTextToSize(f.valor, anchoUtil - etiquetaAncho);
    lineas.forEach((linea, i) => {
      if (i > 0) y += 11 * 1.35;
      doc.text(linea, margen + etiquetaAncho, y);
    });
    y += 11 * 1.35 + 3;
  }
  y += 6;

  escribir(
    "A continuación, se presentan los hallazgos y resultados obtenidos a partir del instrumento aplicado, estructurados según las dimensiones evaluadas. Los puntajes brutos se convierten a puntaje T y percentil según las tablas normativas del SPM-2 para el formulario correspondiente.",
    { espacio: 12 }
  );

  // ---- Tabla de puntajes ----
  const colAnchos = [140, 55, 62, 48, anchoUtil - 305];
  const xCols = [margen];
  for (const w of colAnchos) xCols.push(xCols[xCols.length - 1] + w);
  const encabezadosTabla = ["ESCALA", "P. BRUTO", "PUNTAJE T", "%IL", "RANGO DE INTERPRETACIÓN"];

  const celdasDe = (e) => [
    { texto: e.etiqueta, alinear: "izquierda" },
    { texto: String(e.raw), alinear: "centro" },
    { texto: e.t != null ? String(e.t) : "—", alinear: "centro" },
    { texto: String(e.pct ?? "—"), alinear: "centro" },
    { texto: e.rango ?? "—", alinear: "izquierda" },
  ];

  const lineasDe = (texto, ancho, { tamano = 10, negrita = false } = {}) => {
    doc.setFont("helvetica", negrita ? "bold" : "normal");
    doc.setFontSize(tamano);
    return doc.splitTextToSize(texto, ancho - 12);
  };

  const interlineado = 12;
  const lineasFilas = escalas.map((e) =>
    celdasDe(e).map((c, i) => lineasDe(c.texto, colAnchos[i], { negrita: i === 4 }))
  );
  const altosFilas = lineasFilas.map((ls) => Math.max(1, ...ls.map((l) => l.length)) * interlineado + 10);
  const altoEncabezado = 24;
  const altoTabla = altoEncabezado + altosFilas.reduce((a, b) => a + b, 0);
  if (y + altoTabla > altoPagina - margen) {
    doc.addPage();
    y = margen;
  }
  const tablaY = y;
  const tablaX = margen;
  const verde = [139, 178, 90];

  // Encabezado de la tabla
  doc.setFillColor(...verde);
  doc.rect(tablaX, tablaY, anchoUtil, altoEncabezado, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  encabezadosTabla.forEach((h, i) => {
    const alinearCentro = i === 1 || i === 2 || i === 3;
    const cx = alinearCentro ? xCols[i] + colAnchos[i] / 2 : xCols[i] + 6;
    doc.text(h, cx, tablaY + 15, { align: alinearCentro ? "center" : "left" });
  });

  // Filas
  let filaY = tablaY + altoEncabezado;
  escalas.forEach((e, i) => {
    const alto = altosFilas[i];
    const esST = e.escala === "ST";
    if (esST) {
      doc.setFillColor(234, 240, 226);
      doc.rect(tablaX, filaY, anchoUtil, alto, "F");
    }
    celdasDe(e).forEach((c, ci) => {
      const lineas = lineasFilas[i][ci];
      doc.setFont("helvetica", esST || ci === 4 ? "bold" : "normal");
      doc.setFontSize(10);
      doc.setTextColor(25);
      const bloque = lineas.length * interlineado;
      let ty = filaY + (alto - bloque) / 2 + 9;
      for (const linea of lineas) {
        const alinearCentro = c.alinear === "centro";
        const cx = alinearCentro ? xCols[ci] + colAnchos[ci] / 2 : xCols[ci] + 6;
        doc.text(linea, cx, ty, { align: alinearCentro ? "center" : "left" });
        ty += interlineado;
      }
    });
    filaY += alto;
  });

  // Bordes
  doc.setDrawColor(120);
  doc.setLineWidth(0.6);
  doc.rect(tablaX, tablaY, anchoUtil, altoTabla);
  let bordeY = tablaY + altoEncabezado;
  doc.line(tablaX, bordeY, tablaX + anchoUtil, bordeY);
  for (const alto of altosFilas) {
    bordeY += alto;
    doc.line(tablaX, bordeY, tablaX + anchoUtil, bordeY);
  }
  for (const x of xCols.slice(1, -1)) {
    doc.line(x, tablaY, x, tablaY + altoTabla);
  }

  y = tablaY + altoTabla + 20;

  // ---- Diagnóstico ----
  escribir("Diagnóstico", { tamano: 13, negrita: true, espacio: 6 });
  escribir(parrafoDiagnostico(escalas), { espacio: 12 });

  // ---- Interpretación por escalas ----
  escribir("Interpretación de resultados", { tamano: 13, negrita: true, espacio: 8 });
  for (const e of escalas) {
    escribir(`${e.etiqueta}: ${e.raw}/${e.escala === "ST" ? 240 : 40} – T ${e.t ?? "—"}, percentil ${e.pct ?? "—"} – ${e.rango ?? "—"}.`, {
      negrita: true,
      espacio: 2,
    });
    const texto = textoInterpretacion(e.escala, e.rango);
    if (texto) escribir(texto, { espacio: 10 });
  }

  // ---- Gráfico ----
  const sensoriales = escalas.filter((e) => SENSORIALES.includes(e.escala));
  if (y > altoPagina - 220) {
    doc.addPage();
    y = margen;
  }
  escribir("Gráfico de resultados sección sensorial", { tamano: 13, negrita: true, espacio: 10 });

  const etiquetaAncho = 175;
  const numeroAncho = 34;
  const barraAnchoMax = anchoUtil - etiquetaAncho - numeroAncho;
  const barraAlto = 14;
  const barraGap = 12;
  doc.setFontSize(9);
  doc.setTextColor(25);
  for (const e of sensoriales) {
    if (y > altoPagina - margen - 20) {
      doc.addPage();
      y = margen;
    }
    doc.setFont("helvetica", "normal");
    doc.text(e.etiqueta, tablaX + etiquetaAncho - 6, y + barraAlto - 3, { align: "right" });
    const ancho = Math.max(1, (e.raw / 40) * barraAnchoMax);
    doc.setFillColor(224, 102, 102);
    doc.rect(tablaX + etiquetaAncho, y, ancho, barraAlto, "F");
    doc.text(`${e.raw}`, tablaX + etiquetaAncho + ancho + 5, y + barraAlto - 3);
    y += barraAlto + barraGap;
  }
  doc.setDrawColor(120);
  doc.line(tablaX + etiquetaAncho, y, tablaX + etiquetaAncho + barraAnchoMax, y);
  doc.setFont("helvetica", "normal");
  for (let t = 0; t <= 4; t++) {
    doc.text(String((40 / 4) * t), tablaX + etiquetaAncho + (barraAnchoMax / 4) * t, y + 12, { align: "center" });
  }
  y += 26;

  // ---- Firma y nota ----
  if (y > altoPagina - 130) {
    doc.addPage();
    y = margen;
  }
  y += 20;
  const lineaFirma = 200;
  doc.setDrawColor(25);
  doc.line(anchoPagina / 2 - lineaFirma / 2, y, anchoPagina / 2 + lineaFirma / 2, y);
  y += 14;
  escribir("Firma Profesional", { centrado: true, espacio: 18 });

  escribir(
    "Nota: Los resultados del SPM-2 no deben interpretarse de manera aislada ni constituyen por sí mismos un diagnóstico. Su finalidad es aportar información sobre el desempeño y las características de procesamiento sensorial observadas en el contexto evaluado.",
    { tamano: 9, gris: true, espacio: 0 }
  );

  doc.save(`${config.nombreArchivo}.pdf`);
}

/* ============================================================
   INFORME EN WORD
   ============================================================ */

export function descargarInformeWord(config) {
  const { instrumento, datos } = config;
  const { escalas } = calcularPuntuacion(config);
  const encabezado = filasEncabezado(datos);

  const encabezadoHTML = encabezado
    .map((f) => `<p style="margin:2px 0;"><b>${escaparHTML(f.etiqueta)}:</b> ${escaparHTML(f.valor)}</p>`)
    .join("\n");

  const tablaHTML = `
<table cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%;font-size:10pt;table-layout:fixed;">
  <colgroup>
    <col style="width:30%" /><col style="width:12%" /><col style="width:14%" /><col style="width:11%" /><col style="width:33%" />
  </colgroup>
  <tr>
    <th align="left" style="border:1px solid #666;background:#8bb25a;color:#fff;">ESCALA</th>
    <th style="border:1px solid #666;background:#8bb25a;color:#fff;">P. BRUTO</th>
    <th style="border:1px solid #666;background:#8bb25a;color:#fff;">PUNTAJE T</th>
    <th style="border:1px solid #666;background:#8bb25a;color:#fff;">%IL</th>
    <th align="left" style="border:1px solid #666;background:#8bb25a;color:#fff;">RANGO DE INTERPRETACIÓN</th>
  </tr>
  ${escalas
    .map((e) => {
      const fondo = e.escala === "ST" ? ' style="background:#eaf0e2;"' : "";
      return `<tr${fondo ? fondo : ""}>
    <td${fondo ? fondo : ""}>${escaparHTML(e.etiqueta)}</td>
    <td align="center"${fondo ? fondo : ""}>${e.raw}</td>
    <td align="center"${fondo ? fondo : ""}>${e.t ?? "—"}</td>
    <td align="center"${fondo ? fondo : ""}>${e.pct ?? "—"}</td>
    <td${fondo ? fondo : ""}><b>${escaparHTML(e.rango ?? "—")}</b></td>
  </tr>`;
    })
    .join("\n")}
</table>`;

  const diagnosticoHTML = `<p style="margin:0 0 6px;">${escaparHTML(parrafoDiagnostico(escalas))}</p>`;

  const interpretacionHTML = escalas
    .map((e) => {
      const texto = textoInterpretacion(e.escala, e.rango);
      return `<p style="margin:10px 0 2px;"><b>${escaparHTML(e.etiqueta)}: ${e.raw}/${e.escala === "ST" ? 240 : 40} – T ${e.t ?? "—"}, percentil ${e.pct ?? "—"} – ${escaparHTML(e.rango ?? "—")}.</b></p>
<p style="margin:0 0 6px;">${escaparHTML(texto)}</p>`;
    })
    .join("\n");

  const sensoriales = escalas.filter((e) => SENSORIALES.includes(e.escala));
  const graficoHTML = `
<table cellspacing="0" cellpadding="2" style="width:100%;font-size:10pt;">
  ${sensoriales
    .map((e) => {
      const pct = Math.round((e.raw / 40) * 100);
      return `<tr>
    <td style="width:180px;text-align:right;padding-right:6px;">${escaparHTML(e.etiqueta)}</td>
    <td>
      <table cellspacing="0" cellpadding="0" style="width:100%;">
        <tr>
          <td width="${pct}%" style="background:#e06666;">&nbsp;</td>
          <td width="${100 - pct}%">&nbsp;</td>
        </tr>
      </table>
    </td>
    <td style="width:40px;padding-left:6px;">${e.raw}</td>
  </tr>`;
    })
    .join("\n")}
</table>`;

  const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${escaparHTML(instrumento)}</title>
</head>
<body style="font-family: Arial, sans-serif; font-size:11pt; color:#111;">
  <h1 style="text-align:center; margin-bottom:2px;">PERFIL SENSORIAL 2 - INFORME DE RESULTADOS</h1>
  <p style="text-align:center; margin:0 0 12px;"><b>${escaparHTML(instrumento)}</b></p>

  ${encabezadoHTML}

  <p style="margin:12px 0;">A continuación, se presentan los hallazgos y resultados obtenidos a partir del instrumento aplicado, estructurados según las dimensiones evaluadas. Los puntajes brutos se convierten a puntaje T y percentil según las tablas normativas del SPM-2 para el formulario correspondiente.</p>

  ${tablaHTML}

  <h2 style="font-size:13pt;color:#312e81;margin:18px 0 6px;">Diagnóstico</h2>
  ${diagnosticoHTML}

  <h2 style="font-size:13pt;color:#312e81;margin:18px 0 6px;">Interpretación de resultados</h2>
  ${interpretacionHTML}

  <h2 style="font-size:13pt;color:#312e81;margin:18px 0 6px;">Gráfico de resultados sección sensorial</h2>
  ${graficoHTML}

  <p style="margin:30px 0 0;text-align:center;">____________________________<br/>Firma Profesional</p>

  <p style="margin:18px 0 0;font-size:9pt;color:#666;"><b>Nota:</b> Los resultados del SPM-2 no deben interpretarse de manera aislada ni constituyen por sí mismos un diagnóstico. Su finalidad es aportar información sobre el desempeño y las características de procesamiento sensorial observadas en el contexto evaluado.</p>
</body>
</html>`;

  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `${config.nombreArchivo}.doc`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
