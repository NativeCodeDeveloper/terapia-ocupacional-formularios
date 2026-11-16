import { jsPDF } from "jspdf";

/* ============================================================
   PERFIL SENSORIAL ADOLESCENTES Y ADULTOS
   Puntuación e informe PDF del auto cuestionario (Catana
   Brown, PhD, OTR, FAOTA y Winnie Dunn, PhD, OTR, FAOTA —
   Adolescent/Adult Sensory Profile; traducción al español de
   Alpha Ocupacional autorizada por Catana Brown, 2017).
   Escala: Casi nunca = 1 · Raramente = 2 · A veces = 3 ·
   Frecuentemente = 4 · Casi siempre = 5 (sin No aplicable).
   - Los 60 ítems pertenecen a un cuadrante de 15 ítems (/75):
     RE Bajo Registro, BU Búsqueda Sensorial, SE Sensibilidad
     Sensorial y EV Evitación Sensorial (hoja de puntaje).
   - Las 6 secciones (Gusto/Olfato, Movimiento, Visual, Tacto,
     Nivel de Actividad y Auditivo) agrupan ítems pero no se
     clasifican.
   - La tabla de corte depende del grupo de edad (gráficos de
     resumen de la pauta): 11-17, 18-64 y 65 años o más. El
     mínimo posible por cuadrante es 15, donde arrancan todas
     las bandas. La pauta rotula el tercer gráfico «68 años o
     más», pero su lista de casillas de edad dice «65 años o
     más»: se usa 65+.
   ============================================================ */

const GRANATE = [127, 62, 55];
const GRANATE_OSCURO = [94, 44, 40];
const CREMA = [247, 240, 238];
const GRIS = 110;

const TINTES_RANGO = {
  "Mucho menos que la mayoría de las personas": [226, 238, 220],
  "Menos que la mayoría de las personas": [238, 245, 230],
  "Similar a la mayoría de las personas": [234, 240, 226],
  "Más que la mayoría de las personas": [253, 243, 216],
  "Mucho más que la mayoría de las personas": [251, 228, 228],
};

export const CUADRANTES = [
  { codigo: "RE", nombre: "Bajo Registro" },
  { codigo: "BU", nombre: "Búsqueda Sensorial" },
  { codigo: "SE", nombre: "Sensibilidad Sensorial" },
  { codigo: "EV", nombre: "Evitación Sensorial" },
];

const NOMBRES_BANDA = [
  "Mucho menos que la mayoría de las personas",
  "Menos que la mayoría de las personas",
  "Similar a la mayoría de las personas",
  "Más que la mayoría de las personas",
  "Mucho más que la mayoría de las personas",
];

/* Texto interpretativo de cada banda; recibe el sujeto con su
   verbo del cuadrante (p. ej. "la conducta de bajo registro se
   observa"). */
const BANDAS = [
  {
    texto: (dominio) =>
      `${capitalizar(dominio)} con mucha menor frecuencia que en la mayoría de las personas de la misma edad. Estas respuestas aportan menos información sensorial de la habitual; conviene explorar en qué actividades del día la persona aprovecha menos los estímulos y cómo enriquecer sus oportunidades de participación.`,
  },
  {
    texto: (dominio) =>
      `${capitalizar(dominio)} con menor frecuencia que en la mayoría de las personas de la misma edad. Vale la pena observar en qué situaciones cotidianas se ven limitadas estas respuestas y favorecer más oportunidades de participación.`,
  },
  {
    texto: (dominio) =>
      `${capitalizar(dominio)} con una frecuencia similar a la de la mayoría de las personas de la misma edad, dentro del rango esperado y funcional para las actividades diarias.`,
  },
  {
    texto: (dominio) =>
      `${capitalizar(dominio)} con mayor frecuencia que en la mayoría de las personas de la misma edad. Conviene identificar las situaciones en que estas conductas interfieren con la participación y las actividades diarias, y acordar estrategias de manejo.`,
  },
  {
    texto: (dominio) =>
      `${capitalizar(dominio)} con mucha mayor frecuencia que en la mayoría de las personas de la misma edad. Se sugiere explorar cómo estas conductas afectan las actividades cotidianas y, si la persona lo percibe como dificultoso, derivar a evaluación especializada.`,
  },
];

function cortes(rangos) {
  return rangos.map(([min, max], i) => ({ nombre: NOMBRES_BANDA[i], min, max }));
}

/* Gráficos de resumen del cuadrante por grupo de edad (pauta).
   Cada fila: nombre, código, dominio y las cinco bandas. */
const TABLA_11_17 = [
  {
    nombre: "Bajo Registro",
    codigo: "RE",
    maximo: 75,
    dominio: "la conducta de bajo registro se observa",
    cortes: cortes([
      [15, 18],
      [19, 26],
      [27, 40],
      [41, 51],
      [52, 75],
    ]),
  },
  {
    nombre: "Búsqueda Sensorial",
    codigo: "BU",
    maximo: 75,
    dominio: "la conducta de búsqueda sensorial se observa",
    cortes: cortes([
      [15, 27],
      [28, 41],
      [42, 58],
      [59, 65],
      [66, 75],
    ]),
  },
  {
    nombre: "Sensibilidad Sensorial",
    codigo: "SE",
    maximo: 75,
    dominio: "la conducta de sensibilidad sensorial se observa",
    cortes: cortes([
      [15, 19],
      [20, 25],
      [26, 40],
      [41, 48],
      [49, 75],
    ]),
  },
  {
    nombre: "Evitación Sensorial",
    codigo: "EV",
    maximo: 75,
    dominio: "la conducta de evitación sensorial se observa",
    cortes: cortes([
      [15, 18],
      [19, 25],
      [26, 40],
      [41, 48],
      [49, 75],
    ]),
  },
];

const TABLA_18_64 = [
  {
    nombre: "Bajo Registro",
    codigo: "RE",
    maximo: 75,
    dominio: "la conducta de bajo registro se observa",
    cortes: cortes([
      [15, 18],
      [19, 23],
      [24, 35],
      [36, 44],
      [45, 75],
    ]),
  },
  {
    nombre: "Búsqueda Sensorial",
    codigo: "BU",
    maximo: 75,
    dominio: "la conducta de búsqueda sensorial se observa",
    cortes: cortes([
      [15, 35],
      [36, 42],
      [43, 56],
      [57, 62],
      [63, 75],
    ]),
  },
  {
    nombre: "Sensibilidad Sensorial",
    codigo: "SE",
    maximo: 75,
    dominio: "la conducta de sensibilidad sensorial se observa",
    cortes: cortes([
      [15, 18],
      [19, 25],
      [26, 41],
      [42, 48],
      [49, 75],
    ]),
  },
  {
    nombre: "Evitación Sensorial",
    codigo: "EV",
    maximo: 75,
    dominio: "la conducta de evitación sensorial se observa",
    cortes: cortes([
      [15, 19],
      [20, 26],
      [27, 41],
      [42, 49],
      [50, 75],
    ]),
  },
];

const TABLA_65 = [
  {
    nombre: "Bajo Registro",
    codigo: "RE",
    maximo: 75,
    dominio: "la conducta de bajo registro se observa",
    cortes: cortes([
      [15, 19],
      [20, 26],
      [27, 40],
      [41, 51],
      [52, 75],
    ]),
  },
  {
    nombre: "Búsqueda Sensorial",
    codigo: "BU",
    maximo: 75,
    dominio: "la conducta de búsqueda sensorial se observa",
    cortes: cortes([
      [15, 28],
      [29, 39],
      [40, 52],
      [53, 63],
      [64, 75],
    ]),
  },
  {
    nombre: "Sensibilidad Sensorial",
    codigo: "SE",
    maximo: 75,
    dominio: "la conducta de sensibilidad sensorial se observa",
    cortes: cortes([
      [15, 18],
      [19, 25],
      [26, 41],
      [42, 48],
      [49, 75],
    ]),
  },
  {
    nombre: "Evitación Sensorial",
    codigo: "EV",
    maximo: 75,
    dominio: "la conducta de evitación sensorial se observa",
    cortes: cortes([
      [15, 18],
      [19, 25],
      [26, 42],
      [43, 49],
      [50, 75],
    ]),
  },
];

export const GRUPOS_EDAD = [
  { id: "11-17", etiqueta: "11 a 17 años", min: 11, max: 17, tabla: TABLA_11_17 },
  { id: "18-64", etiqueta: "18 a 64 años", min: 18, max: 64, tabla: TABLA_18_64 },
  { id: "65", etiqueta: "65 años o más", min: 65, max: null, tabla: TABLA_65 },
];

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function grupoEdadPara(edad) {
  const n = Number(edad);
  if (!Number.isInteger(n) || n < 11) return null;
  return GRUPOS_EDAD.find((g) => n >= g.min && (g.max == null || n <= g.max)) ?? null;
}

export function clasificarFila(fila, bruto) {
  return (
    fila.cortes.find((corte) => bruto >= corte.min && bruto <= corte.max) ?? null
  );
}

// Número del primer ítem de cada sección (numeración acumulada 1-60).
export function iniciosDeSeccionAdultos(secciones) {
  const inicios = [];
  let contador = 0;
  for (const seccion of secciones) {
    inicios.push(contador + 1);
    contador += seccion.preguntas.length;
  }
  return inicios;
}

export function calcularPuntuacionAdultos({ secciones = [], respuestas = {}, opciones = [], valores = {} }) {
  const puntajePorValor = Object.fromEntries(opciones.map((o) => [o.valor, o.puntaje]));
  const letraPorValor = Object.fromEntries(opciones.map((o) => [o.valor, o.etiqueta]));
  const inicios = iniciosDeSeccionAdultos(secciones);
  const grupo = grupoEdadPara(valores?.edadAnos);

  let total = 0;
  const seccionesResultado = secciones.map((seccion, si) => {
    const cuadrantes = Object.fromEntries(CUADRANTES.map((c) => [c.codigo, 0]));
    let raw = 0;
    const detalle = seccion.preguntas.map((pregunta, pi) => {
      const valor = respuestas[inicios[si] + pi];
      const puntaje = puntajePorValor[valor] ?? 0;
      if (pregunta.cuadrante) cuadrantes[pregunta.cuadrante] += puntaje;
      raw += puntaje;
      return { ...pregunta, valor, puntaje, letra: letraPorValor[valor] ?? "—" };
    });
    total += raw;
    return {
      titulo: seccion.titulo,
      raw,
      maximo: seccion.preguntas.length * 5,
      noAplicables: 0,
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

  // Los cuatro cuadrantes se clasifican con la tabla del grupo de
  // edad; sin edad válida se muestran los brutos sin clasificar.
  const tabla = grupo ? grupo.tabla : TABLA_18_64;
  const filasClasificacion = tabla.map((fila) => {
    const bruto = totalesCuadrante[fila.codigo];
    const items = seccionesResultado.reduce(
      (n, s) => n + s.detalle.filter((d) => d.cuadrante === fila.codigo).length,
      0
    );
    return {
      nombre: fila.nombre,
      grupo: "CUADRANTES",
      items,
      bruto,
      maximo: fila.maximo,
      clasificacion: grupo ? clasificarFila(fila, bruto) : null,
    };
  });

  return {
    secciones: seccionesResultado,
    total,
    totalMaximo: seccionesResultado.reduce((n, s) => n + s.maximo, 0),
    totalNoAplicables: 0,
    totalesCuadrante,
    dominantes,
    grupoEdad: grupo,
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
  "Casi nunca: cuando se presenta la oportunidad, usted casi nunca responde de esa manera (aproximadamente el 5% o menos del tiempo).",
  "Raramente: cuando se presenta la oportunidad, usted raramente responde de esa manera (aproximadamente el 25% del tiempo).",
  "A veces: cuando se presenta la oportunidad, usted a veces responde de esa manera (aproximadamente el 50% del tiempo).",
  "Frecuentemente: cuando se presenta la oportunidad, usted frecuentemente responde de esa manera (aproximadamente el 75% del tiempo).",
  "Casi siempre: cuando se presenta la oportunidad, usted casi siempre responde de esa manera (aproximadamente el 95% o más del tiempo).",
];

export function descargarInformePDFAdultos(config) {
  const { nombreArchivo, datos = [], secciones = [], respuestas = {}, opciones = [], intro } = config;
  const valorDato = (etiqueta) =>
    datos.find((d) => d.etiqueta.toLowerCase() === etiqueta.toLowerCase())?.valor?.trim() ?? "";
  const resultado = calcularPuntuacionAdultos({
    secciones,
    respuestas,
    opciones,
    valores: { edadAnos: valorDato("Edad (en años)") },
  });

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
  doc.setFillColor(...GRANATE);
  doc.rect(margen, y, anchoUtil, 4, "F");
  y += 24;
  escribir("PERFIL SENSORIAL ADOLESCENTES Y ADULTOS · AUTO CUESTIONARIO", { tamano: 10.5, negrita: true, centrado: true, gris: true, espacio: 4 });
  escribir("Informe de resultados", { tamano: 17, negrita: true, centrado: true, espacio: 2 });
  escribir("Catana Brown, PhD, OTR, FAOTA · Winnie Dunn, PhD, OTR, FAOTA", { tamano: 12, centrado: true, espacio: 6 });
  escribir("Traducción al español de Alpha Ocupacional autorizada por Catana Brown · Instrumento de autoinforme", { tamano: 7.5, centrado: true, gris: true, espacio: 14 });

  /* ---- Franja de datos de identificación ---- */
  const celdasId = datos.map((celda) => ({
    etiqueta: celda.etiqueta,
    valor: celda.etiqueta.toLowerCase().startsWith("edad") ? conAnios(celda.valor) : celda.valor,
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
      doc.setFillColor(253, 250, 250);
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

  /* ---- 2. Resumen de cuadrantes ---- */
  escribir("Resumen de cuadrantes", { tamano: 13, negrita: true, espacio: 6 });
  escribir(
    resultado.grupoEdad
      ? `Cada cuadrante suma los puntajes de sus 15 ítems (Casi nunca = 1 … Casi siempre = 5) sobre un máximo de 75. La clasificación usa el gráfico de resumen del grupo ${resultado.grupoEdad.etiqueta}.`
      : "Cada cuadrante suma los puntajes de sus 15 ítems (Casi nunca = 1 … Casi siempre = 5) sobre un máximo de 75. Indique la edad del informante para aplicar el gráfico de resumen correspondiente (11-17, 18-64 o 65 años o más).",
    { espacio: 10 }
  );

  const colResumen = [anchoUtil * 0.32, anchoUtil * 0.1, anchoUtil * 0.13, anchoUtil * 0.13, anchoUtil * 0.32];
  const xResumen = [margen];
  for (const w of colResumen) xResumen.push(xResumen[xResumen.length - 1] + w);
  const encabezadosResumen = ["CUADRANTE", "ÍTEMS", "P. BRUTO", "MÁXIMO", "CLASIFICACIÓN"];

  const dibujarEncabezadoResumen = (tablaY) => {
    doc.setFillColor(...GRANATE_OSCURO);
    doc.rect(margen, tablaY, anchoUtil, 20, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(255);
    doc.text("RESUMEN DE CUADRANTES", anchoPagina / 2, tablaY + 14, { align: "center" });
    doc.setFillColor(...GRANATE);
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

  const filasResumen = resultado.filasClasificacion.map((fila) => ({ fila }));

  const altoBloqueResumen = 38 + filasResumen.length * 20;
  asegurar(altoBloqueResumen + 10);
  const resumenY = y;
  dibujarEncabezadoResumen(resumenY);
  let filaY = resumenY + 38;
  for (const fila of filasResumen) {
    const f = fila.fila;
    fila.celdas = [
      { texto: f.nombre, alinear: "izquierda" },
      { texto: String(f.items), alinear: "centro" },
      { texto: String(f.bruto), alinear: "centro" },
      { texto: String(f.maximo), alinear: "centro" },
      { texto: f.clasificacion ? f.clasificacion.nombre : "—", tinte: f.clasificacion ? TINTES_RANGO[f.clasificacion.nombre] : null },
    ];
    const celdaClas = fila.celdas[4];
    if (celdaClas.tinte) {
      doc.setFillColor(...celdaClas.tinte);
      doc.rect(xResumen[4], filaY, colResumen[4], 20, "F");
    }
    fila.celdas.forEach((celda, ci) => {
      if (ci === 4) {
        // Los nombres de banda son largos: se parten en dos líneas si hace falta.
        const lineasClas = doc.splitTextToSize(celda.texto, colResumen[4] - 10);
        doc.setFont("helvetica", "bold");
        if (lineasClas.length === 1) {
          doc.setFontSize(10);
          doc.text(lineasClas[0], xResumen[4] + colResumen[4] / 2, filaY + 13.5, { align: "center" });
        } else {
          doc.setFontSize(8.5);
          lineasClas.slice(0, 2).forEach((linea, li) =>
            doc.text(linea, xResumen[4] + colResumen[4] / 2, filaY + 9 + li * 10, { align: "center" })
          );
        }
        return;
      }
      doc.setFont("helvetica", ci === 2 ? "bold" : "normal");
      doc.setFontSize(10);
      doc.setTextColor(25);
      const centro = celda.alinear === "centro";
      const cx = centro ? xResumen[ci] + colResumen[ci] / 2 : xResumen[ci] + 6;
      doc.text(celda.texto, cx, filaY + 13.5, { align: centro ? "center" : "left" });
    });
    filaY += 20;
    doc.setDrawColor(120);
    doc.setLineWidth(0.5);
    doc.line(margen, filaY, margen + anchoUtil, filaY);
  }
  doc.rect(margen, resumenY, anchoUtil, filaY - resumenY);
  for (const x of xResumen.slice(1, -1)) doc.line(x, resumenY + 38, x, filaY);
  y = filaY + 14;

  const nombresDominantes = resultado.dominantes.map((c) => c.nombre).join(" y ");
  escribir(
    `Cuadrante predominante: ${nombresDominantes}.`,
    { negrita: true, espacio: 12 }
  );

  /* ---- 3. Sistema de clasificación del grupo de edad ---- */
  if (resultado.grupoEdad) {
    escribir(
      `Sistema de clasificación · grupo ${resultado.grupoEdad.etiqueta}`,
      { tamano: 13, negrita: true, espacio: 4 }
    );
    escribir(
      "Las puntuaciones con una desviación típica o más por encima o por debajo de la media se incluyen en «Más» o «Menos que la mayoría de las personas», y con dos o más, en «Mucho más» o «Mucho menos que la mayoría de las personas». El mínimo posible por cuadrante es 15, donde comienza la primera banda. La celda destacada de cada fila corresponde a la clasificación obtenida.",
      { espacio: 10 }
    );

    const colClas = [anchoUtil * 0.22, ...Array(5).fill(anchoUtil * 0.156)];
    const xClas = [margen];
    for (const w of colClas) xClas.push(xClas[xClas.length - 1] + w);
    const encabezadosClas = ["CUADRANTE", ...NOMBRES_BANDA];

    const dibujarTablaClasificacion = () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      const lineasEncabezado = encabezadosClas.map((h, i) => doc.splitTextToSize(h, colClas[i] - 8));
      const altoEncClas = 12 + Math.max(...lineasEncabezado.map((l) => l.length)) * 8 + 6;
      const altoFilaClas = 18;
      const altoBloque = altoEncClas + TABLA_18_64.length * altoFilaClas;
      const tablaY = y;
      doc.setFillColor(...GRANATE);
      doc.rect(margen, tablaY, anchoUtil, altoEncClas, "F");
      doc.setTextColor(255);
      lineasEncabezado.forEach((lineas, i) => {
        const centro = i > 0;
        const cx = centro ? xClas[i] + colClas[i] / 2 : xClas[i] + 6;
        lineas.forEach((linea, li) =>
          doc.text(linea, cx, tablaY + 11 + li * 8, { align: centro ? "center" : "left" })
        );
      });

      resultado.grupoEdad.tabla.forEach((filaTabla, fi) => {
        const filaYT = tablaY + altoEncClas + fi * altoFilaClas;
        const filaResultado = resultado.filasClasificacion.find((f) => f.nombre === filaTabla.nombre);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(25);
        doc.text(filaTabla.nombre, xClas[0] + 6, filaYT + 12.5);
        filaTabla.cortes.forEach((corte, ci) => {
          const activo = filaResultado?.clasificacion?.nombre === corte.nombre;
          if (activo) {
            doc.setFillColor(...(TINTES_RANGO[corte.nombre] ?? CREMA));
            doc.rect(xClas[ci + 1], filaYT, colClas[ci + 1], altoFilaClas, "F");
          }
          doc.setFont("helvetica", activo ? "bold" : "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(activo ? 25 : 130);
          doc.text(`${corte.min}–${corte.max}`, xClas[ci + 1] + colClas[ci + 1] / 2, filaYT + 12.5, { align: "center" });
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
    asegurar(18 + 4 * 18 + 30 + 60);
    dibujarTablaClasificacion();
  }

  /* ---- 4. Interpretación por cuadrante ---- */
  escribir("Interpretación por cuadrante", { tamano: 13, negrita: true, espacio: 4 });
  for (const fila of resultado.filasClasificacion) {
    if (!fila.clasificacion) continue;
    const indiceBanda = NOMBRES_BANDA.indexOf(fila.clasificacion.nombre);
    asegurar(40);
    escribir(
      `${fila.nombre}: ${fila.bruto} de ${fila.maximo} puntos — ${fila.clasificacion.nombre} (${fila.clasificacion.min}–${fila.clasificacion.max}).`,
      { negrita: true, espacio: 2 }
    );
    const dominio = TABLA_18_64.find((f) => f.nombre === fila.nombre)?.dominio ?? "la conducta se observa";
    escribir(BANDAS[indiceBanda] ? BANDAS[indiceBanda].texto(dominio) : "", { espacio: 8 });
  }
  y += 4;

  /* ---- 5. Cuadrantes por sección ---- */
  asegurar(150);
  escribir("Cuadrantes por sección", { tamano: 13, negrita: true, espacio: 4 });
  escribir(
    "Cada ítem pertenece a un cuadrante del manual: RE Bajo Registro (responde más lentamente o pasa por alto los estímulos), BU Búsqueda Sensorial (busca y disfruta los estímulos), SE Sensibilidad Sensorial (detecta y responde con rapidez a los estímulos) y EV Evitación Sensorial (reacciona retirándose de los estímulos). Las seis secciones agrupan los ítems por sistema sensorial y nivel de actividad; su suma es referencial y no se clasifica.",
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
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const lineasFila = filas.map((fila) =>
      fila.esTotal ? ["TOTAL"] : doc.splitTextToSize(fila.celdas[0], colCuad[0] - 12)
    );
    const alturas = filas.map((_fila, fi) => Math.max(20, lineasFila[fi].length * 11.5 + 9));
    const altoBloque = altoEnc + alturas.reduce((a, b) => a + b, 0);
    const tablaY = y;
    doc.setFillColor(...GRANATE);
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
  y += 6;

  /* ---- 6. Detalle de respuestas por sección ---- */
  asegurar(60);
  escribir("Detalle de respuestas por sección", { tamano: 13, negrita: true, espacio: 4 });
  escribir(
    `Respuestas registradas para los ${resultado.secciones.reduce((n, s) => n + s.detalle.length, 0)} ítems del auto cuestionario, agrupados por sección.`,
    { espacio: 10 }
  );

  const colDetalle = [30, anchoUtil - 30 - 132, 132];
  const xDetalle = [margen, margen + colDetalle[0], margen + colDetalle[0] + colDetalle[1]];
  const lineasDe = (texto, ancho, { tamano = 9.5, negrita = false } = {}) => {
    doc.setFont("helvetica", negrita ? "bold" : "normal");
    doc.setFontSize(tamano);
    return doc.splitTextToSize(texto, ancho - 12);
  };
  const iniciosDetalle = iniciosDeSeccionAdultos(secciones);

  resultado.secciones.forEach((seccion, si) => {
    const banda = 20;
    asegurar(banda + 18 + 40);
    doc.setFillColor(...GRANATE_OSCURO);
    doc.rect(margen, y, anchoUtil, banda, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255);
    doc.text(seccion.titulo, anchoPagina / 2, y + 14, { align: "center" });
    y += banda;

    doc.setFillColor(...GRANATE);
    doc.rect(margen, y, anchoUtil, 16, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255);
    doc.text("N.º", xDetalle[0] + 6, y + 11.5);
    doc.text("ÍTEM", xDetalle[1] + 6, y + 11.5);
    doc.text("RESPUESTA", xDetalle[2] + 6, y + 11.5);
    y += 16;

    seccion.detalle.forEach((item, pi) => {
      const respuesta = `${item.letra} (${item.puntaje})`;
      const lineasItem = lineasDe(item.texto, colDetalle[1]);
      const lineasResp = lineasDe(respuesta, colDetalle[2], { negrita: true });
      const altoFila = Math.max(2, lineasItem.length, lineasResp.length) * 11.5 + 7;

      if (y + altoFila > limite()) {
        nuevaPagina();
        doc.setFillColor(...GRANATE);
        doc.rect(margen, y, anchoUtil, 16, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(255);
        doc.text(`${seccion.titulo} (continúa)`, margen + 6, y + 11.5);
        y += 16;
      }

      if (pi % 2 === 1) {
        doc.setFillColor(251, 247, 246);
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
      doc.text(String(iniciosDetalle[si] + pi), xDetalle[0] + 6, y + 13);

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
    doc.text(`Suma de la sección (referencial)`, xDetalle[1] + 6, y + 13);
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
    "Los resultados del Perfil Sensorial Adolescentes y Adultos se interpretan junto con la observación clínica y la información de otras fuentes; no constituyen por sí mismos un diagnóstico. La clasificación de cada cuadrante depende del grupo de edad del informante (11-17, 18-64 o 65 años o más): el mínimo posible por cuadrante es 15 y las bandas comienzan en ese valor. Las sumas de las secciones son referenciales: la pauta clasifica únicamente los cuatro cuadrantes.",
    { espacio: 10 }
  );
  escribir(
    "Adolescent/Adult Sensory Profile, Copyright © 2002 NCS Pearson, Inc. Traducción al español realizada por Lic. TO Mariel Pellegrini (Alpha Ocupacional, junio 2017), con fines didácticos y autorizada por Catana Brown, Ph.D., OTR, FAOTA.",
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
  const nombre = valorDato("Nombre");
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(margen, altoPagina - 40, anchoPagina - margen, altoPagina - 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(130);
    const pie = `Perfil Sensorial Adolescentes y Adultos${nombre ? ` · ${nombre}` : ""}`;
    doc.text(doc.splitTextToSize(pie, anchoUtil - 90)[0], margen, altoPagina - 28);
    doc.text(`Página ${i} de ${totalPaginas}`, anchoPagina - margen, altoPagina - 28, { align: "right" });
    doc.text("Generado por teraocupame", anchoPagina / 2, altoPagina - 16, { align: "center" });
  }

  doc.save(`${nombreArchivo}.pdf`);
}
