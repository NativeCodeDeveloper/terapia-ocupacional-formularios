import { jsPDF } from "jspdf";
import {
  calcularPuntuacion,
  maximosDeEscala,
  parrafoDiagnostico,
  textoInterpretacion,
  sumaDeSeccion,
} from "./informe.js";

/* ============================================================
   BASE COMÚN DE LOS INFORMES SPM-2 · FORMULARIO HOGAR (PDF)
   Genera el informe a partir de los datos registrados en el
   formulario sin recalcular nada fuera de calcularPuntuacion.
   La estructura reproduce el documento oficial de referencia
   de cada versión (WPS AutoScore, español):
     1. Encabezado del instrumento y datos de identificación.
     2. Hoja de resumen de puntuación (Score Summary Sheet):
        puntaje bruto -> puntaje T y percentil con la tabla
        normativa según la edad.
     3. Perfil gráfico de puntaje T con las bandas oficiales.
     4. Interpretación de resultados.
     5. Detalle de las respuestas por dimensión.
     6. Escala de respuesta, nota y firma.
   Los textos propios de cada versión llegan en `version`:
     - tituloInforme: título del informe (bajo el encabezado SPM-2).
     - intro: párrafo de introducción del informe.
     - lineaEdad: subtítulo bajo el título del informe.
     - autores: línea de autores del formulario oficial.
     - celdasId: celdas de identificación (etiqueta impresa, clave
       del dato del formulario y fracción del ancho).
     - datoNombre: clave del dato con el nombre para el pie.
     - notaAngustia: nota sobre el término "angustia" que va tras
       la escala de respuesta (null si el formulario oficial no la
       incluye).
     - etiquetasTablaNorma: etiqueta de cada tabla normativa
       aplicable, por clave de norma.
     - etiquetaTablaNormaPorDefecto: etiqueta si la clave no
       está en el mapa.
     - codigoFormulario: código WPS (W-709E, W-708E, ...).
     - copyright: línea de copyright del formulario oficial.
     - pie: línea completa del pie de página.
   ============================================================ */

const VERDE = [139, 178, 90]; // Encabezados de tabla (mismo verde del proyecto)
const VERDE_OSCURO = [92, 122, 58];
const CREMA = [234, 240, 226]; // Fila del Total Sensorial (ST)
const GRIS = 110;

const TINTES_RANGO = {
  Típico: [238, 245, 230],
  "Dificultades moderadas": [253, 243, 216],
  "Dificultades severas": [251, 228, 228],
};

const COLORES_BARRA = {
  Típico: [139, 178, 90],
  "Dificultades moderadas": [242, 181, 68],
  "Dificultades severas": [224, 102, 102],
};

const INSTRUCCIONES_ESCALA = [
  "Nunca: La conducta nunca o casi nunca ocurre.",
  "Ocasionalmente: La conducta ocurre a veces.",
  "Frecuentemente: La conducta ocurre a menudo.",
  "Siempre: La conducta ocurre siempre o casi siempre.",
];

function fechaCorta() {
  return new Date().toLocaleDateString("es", { dateStyle: "long" });
}

/* Número del primer ítem de cada sección. La Participación Social
   del AutoReporte de 12-21 años tiene 9 ítems, así que la numeración
   se acumula con el largo real de cada sección y no de 10 en 10. */
function iniciosDeSeccion(secciones) {
  const inicios = [];
  let contador = 0;
  for (const seccion of secciones) {
    inicios.push(contador + 1);
    contador += seccion.preguntas.length;
  }
  return inicios;
}

function conAnios(valor) {
  if (/^\d+$/.test(valor)) return `${valor} ${valor === "1" ? "año" : "años"}`;
  return valor;
}

export function construirInformeHogar(config, version) {
  const { datos = [], secciones = [], respuestas = {}, opciones = [] } = config;
  const { escalas, tablaNorma } = calcularPuntuacion(config);
  const maximos = maximosDeEscala(secciones);
  const inicios = iniciosDeSeccion(secciones);
  const totalPreguntas = secciones.reduce((n, s) => n + s.preguntas.length, 0);

  const OPCION_POR_VALOR = Object.fromEntries(opciones.map((o) => [o.valor, o]));
  const valorDato = (etiqueta) =>
    datos.find((d) => d.etiqueta.toLowerCase() === etiqueta.toLowerCase())?.valor?.trim() ?? "";

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();
  const margen = 48;
  const margenInferior = 68; // deja lugar al pie de página
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

  /* ---- 1. Encabezado del instrumento (portada de la hoja oficial) ---- */

  doc.setFillColor(...VERDE);
  doc.rect(margen, y, anchoUtil, 4, "F");
  y += 24;

  escribir("SPM-2 · SENSORY PROCESSING MEASURE, SECOND EDITION", { tamano: 10.5, negrita: true, centrado: true, gris: true, espacio: 4 });
  escribir(version.tituloInforme, { tamano: 17, negrita: true, centrado: true, espacio: 2 });
  escribir(version.lineaEdad, { tamano: 12, centrado: true, espacio: 6 });
  escribir(version.autores, { tamano: 7.5, centrado: true, gris: true, espacio: 14 });

  /* ---- Franja de datos de identificación ---- */

  const celdasId = version.celdasId.map((celda) => ({
    etiqueta: celda.etiqueta,
    valor: celda.dato === "Edad" ? conAnios(valorDato(celda.dato)) : valorDato(celda.dato),
    fraccion: celda.fraccion,
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

  escribir(version.intro, { espacio: 8 });
  escribir(
    "A continuación se presenta la hoja de resumen de puntuación con el puntaje bruto de cada dimensión, su conversión a puntaje T y percentil según la tabla normativa correspondiente a la edad, y el rango de interpretación oficial.",
    { espacio: 12 }
  );

  /* ---- 2. Hoja de resumen de puntuación ---- */

  const colAnchos = [anchoUtil * 0.27, anchoUtil * 0.13, anchoUtil * 0.13, anchoUtil * 0.13, anchoUtil * 0.34];
  const xCols = [margen];
  for (const w of colAnchos) xCols.push(xCols[xCols.length - 1] + w);
  const encabezadosTabla = ["ESCALA", "P. BRUTO", "PUNTAJE T", "PERCENTIL", "RANGO DE INTERPRETACIÓN"];

  const lineasDe = (texto, ancho, { tamano = 10, negrita = false } = {}) => {
    doc.setFont("helvetica", negrita ? "bold" : "normal");
    doc.setFontSize(tamano);
    return doc.splitTextToSize(texto, ancho - 12);
  };

  const tituloTablaNorma =
    version.etiquetasTablaNorma[tablaNorma] ?? version.etiquetaTablaNormaPorDefecto;

  function dibujarEncabezadoResumen(tablaY) {
    doc.setFillColor(...VERDE_OSCURO);
    doc.rect(margen, tablaY, anchoUtil, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(255);
    doc.text("HOJA DE RESUMEN DE PUNTUACIÓN · SCORE SUMMARY SHEET", anchoPagina / 2, tablaY + 15, { align: "center" });

    doc.setFillColor(...CREMA);
    doc.rect(margen, tablaY + 22, anchoUtil, 18, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(25);
    doc.text(`Tabla normativa aplicada: ${tituloTablaNorma} (formulario ${version.codigoFormulario}, español)`, anchoPagina / 2, tablaY + 34, { align: "center" });

    doc.setFillColor(...VERDE);
    doc.rect(margen, tablaY + 40, anchoUtil, 18, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255);
    encabezadosTabla.forEach((h, i) => {
      const centro = i >= 1 && i <= 3;
      const cx = centro ? xCols[i] + colAnchos[i] / 2 : xCols[i] + 6;
      doc.text(h, cx, tablaY + 52, { align: centro ? "center" : "left" });
    });
    doc.setDrawColor(120);
    doc.setLineWidth(0.6);
    doc.rect(margen, tablaY, anchoUtil, 58);
  }

  const interlineadoFila = 12;
  const celdasDe = (e) => [
    { texto: e.etiqueta, alinear: "izquierda" },
    { texto: String(e.raw), alinear: "centro" },
    { texto: e.t != null ? String(e.t) : "—", alinear: "centro" },
    { texto: e.pct != null ? String(e.pct) : "—", alinear: "centro" },
    { texto: e.rango ?? "—", alinear: "izquierda" },
  ];

  function dibujarTablaResumen() {
    const lineasFilas = escalas.map((e) =>
      celdasDe(e).map((c, i) => lineasDe(c.texto, colAnchos[i], { negrita: i === 4 || e.escala === "ST" }))
    );
    const altosFilas = escalas.map((_, i) => Math.max(1, ...lineasFilas[i].map((l) => l.length)) * interlineadoFila + 9);
    const altoBloque = 58 + altosFilas.reduce((a, b) => a + b, 0);
    asegurar(altoBloque + 10);

    const tablaY = y;
    dibujarEncabezadoResumen(tablaY);

    let filaY = tablaY + 58;
    escalas.forEach((e, i) => {
      const alto = altosFilas[i];
      const esST = e.escala === "ST";
      if (esST) {
        doc.setFillColor(...CREMA);
        doc.rect(margen, filaY, anchoUtil, alto, "F");
      }
      const tinte = TINTES_RANGO[e.rango];
      if (tinte) {
        doc.setFillColor(...tinte);
        doc.rect(xCols[4], filaY, colAnchos[4], alto, "F");
      }
      celdasDe(e).forEach((c, ci) => {
        doc.setFont("helvetica", esST || ci === 4 ? "bold" : "normal");
        doc.setFontSize(10);
        doc.setTextColor(25);
        const bloque = lineasFilas[i][ci].length * interlineadoFila;
        let ty = filaY + (alto - bloque) / 2 + 9;
        for (const linea of lineasFilas[i][ci]) {
          const centro = c.alinear === "centro";
          const cx = centro ? xCols[ci] + colAnchos[ci] / 2 : xCols[ci] + 6;
          doc.text(linea, cx, ty, { align: centro ? "center" : "left" });
          ty += interlineadoFila;
        }
      });
      filaY += alto;
    });

    doc.setDrawColor(120);
    doc.setLineWidth(0.6);
    doc.rect(margen, tablaY, anchoUtil, filaY - tablaY);
    doc.line(margen, tablaY + 58, margen + anchoUtil, tablaY + 58);
    let bordeY = tablaY + 58;
    for (const alto of altosFilas) {
      bordeY += alto;
      doc.line(margen, bordeY, margen + anchoUtil, bordeY);
    }
    for (const x of xCols.slice(1, -1)) doc.line(x, tablaY + 58, x, filaY);

    y = filaY + 10;
    escribir(
      version.notaPuntuacion ??
        "P. bruto: suma de los puntajes de los 10 ítems de la dimensión (N = 1, O = 2, F = 3, S = 4; rango 10-40). Los ítems 71-80 de Participación Social redactados en positivo se puntúan invertidos (N = 4, O = 3, F = 2, S = 1). ST (Total Sensorial): suma de las dimensiones Visión, Oído, Tacto, Gusto y Olfato, Conciencia Corporal y Equilibrio y Movimiento (rango 60-240).",
      { tamano: 8, gris: true, espacio: 2 }
    );
    escribir(
      `Conversión a puntaje T y percentil según la hoja de resumen de puntuación oficial (${version.codigoFormulario}) correspondiente a la edad.`,
      { tamano: 8, gris: true, espacio: 10 }
    );
  }

  dibujarTablaResumen();

  /* ---- 3. Criterios de interpretación y perfil gráfico ---- */

  escribir("Criterios de interpretación", { tamano: 13, negrita: true, espacio: 4 });
  escribir(
    "Bandas de interpretación del puntaje T, según la hoja de resumen de puntuación oficial: T 40-59 Típico · T 60-69 Dificultades moderadas · T 70 o más Dificultades severas.",
    { espacio: 10 }
  );

  const altoGrafico = escalas.length * 27 + 30;
  asegurar(altoGrafico + 40);
  escribir("Perfil de puntaje T por dimensión", { tamano: 13, negrita: true, espacio: 8 });

  const etiquetaW = anchoUtil * 0.32;
  const valorW = 42;
  const barraX = margen + etiquetaW;
  const barraMaxW = anchoUtil - etiquetaW - valorW;
  const T_MIN = 40;
  const T_MAX = 80;
  const barraAlto = 14;
  const pasoFila = 27;
  const xDe = (t) => barraX + ((t - T_MIN) / (T_MAX - T_MIN)) * barraMaxW;
  const franjas = [
    { desde: 70, hasta: 80, tinte: TINTES_RANGO["Dificultades severas"] },
    { desde: 60, hasta: 70, tinte: TINTES_RANGO["Dificultades moderadas"] },
    { desde: 40, hasta: 60, tinte: TINTES_RANGO["Típico"] },
  ];
  const altoFranjas = escalas.length * pasoFila - 13;

  for (const franja of franjas) {
    doc.setFillColor(...franja.tinte);
    doc.rect(xDe(franja.desde), y, xDe(franja.hasta) - xDe(franja.desde), altoFranjas, "F");
  }
  doc.setDrawColor(150);
  doc.setLineWidth(0.5);
  for (const t of [40, 60, 70, 80]) doc.line(xDe(t), y, xDe(t), y + altoFranjas);

  escalas.forEach((e, i) => {
    const filaY = y + i * pasoFila;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(25);
    doc.text(e.etiqueta, barraX - 6, filaY + barraAlto - 3, { align: "right" });
    if (e.t != null) {
      doc.setFillColor(...(COLORES_BARRA[e.rango] ?? [150, 150, 150]));
      doc.rect(xDe(T_MIN), filaY, Math.max(1, xDe(e.t) - xDe(T_MIN)), barraAlto, "F");
      doc.setFont("helvetica", "bold");
      doc.text(`T ${e.t}`, xDe(e.t) + 5, filaY + barraAlto - 3);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(GRIS);
      doc.text("s/d", xDe(T_MIN) + 5, filaY + barraAlto - 3);
    }
  });

  y += altoFranjas + 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(GRIS);
  for (const t of [40, 50, 60, 70, 80]) {
    doc.text(String(t), xDe(t), y + 10, { align: "center" });
  }
  doc.text("Puntaje T", barraX + barraMaxW / 2, y + 22, { align: "center" });
  y += 34;
  escribir(
    "s/d: puntaje bruto sin equivalencia en la tabla normativa aplicada. El puntaje bruto se conserva en la hoja de resumen.",
    { tamano: 8, gris: true, espacio: 12 }
  );

  /* ---- 4. Interpretación de resultados ---- */

  escribir("Interpretación de resultados", { tamano: 13, negrita: true, espacio: 6 });
  escribir(parrafoDiagnostico(escalas), { espacio: 12 });
  for (const e of escalas) {
    const texto = textoInterpretacion(e.escala, e.rango);
    if (!texto) continue;
    asegurar(40);
    escribir(
      `${e.etiqueta}: puntaje bruto ${e.raw}/${maximos[e.escala] ?? 40} — T ${e.t ?? "—"}, percentil ${e.pct ?? "—"} — ${e.rango ?? "—"}.`,
      { negrita: true, espacio: 2 }
    );
    escribir(texto, { espacio: 10 });
  }

  /* ---- 5. Detalle de respuestas por dimensión ---- */

  asegurar(60);
  escribir("Detalle de respuestas por dimensión", { tamano: 13, negrita: true, espacio: 4 });
  escribir(
    `Respuestas registradas para las ${totalPreguntas} preguntas del formulario, agrupadas por dimensión. Letras de la escala: N = Nunca · O = Ocasionalmente · F = Frecuentemente · S = Siempre.`,
    { espacio: 10 }
  );

  const colDetalle = [30, anchoUtil - 30 - 132, 132];
  const xDetalle = [margen, margen + colDetalle[0], margen + colDetalle[0] + colDetalle[1], margen + anchoUtil];
  const escalasDetalle = escalas.filter((e) => e.escala !== "ST");

  function encabezadoDetalleContinuacion(seccion) {
    doc.setFillColor(...VERDE);
    doc.rect(margen, y, anchoUtil, 18, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255);
    doc.text(`${seccion.titulo} (continúa) · N.º | ÍTEM | RESPUESTA`, margen + 6, y + 12.5);
    y += 18;
  }

  secciones.forEach((seccion, si) => {
    const escala = escalasDetalle[si];
    const banda = 20;
    asegurar(banda + 18 + 40);
    doc.setFillColor(...VERDE_OSCURO);
    doc.rect(margen, y, anchoUtil, banda, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255);
    doc.text(`${seccion.titulo} — ítems ${inicios[si]} a ${inicios[si] + seccion.preguntas.length - 1}`, anchoPagina / 2, y + 14, { align: "center" });
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

    seccion.preguntas.forEach((texto, pi) => {
      const numero = inicios[si] + pi;
      const opcion = OPCION_POR_VALOR[respuestas[numero]];
      const letra = opcion ? opcion.etiqueta.charAt(0) : "—";
      const respuesta = opcion ? `${letra} · ${opcion.etiqueta}` : "—";

      const lineasItem = lineasDe(texto, colDetalle[1], { tamano: 9.5 });
      const lineasResp = lineasDe(respuesta, colDetalle[2], { tamano: 9.5, negrita: true });
      const altoFila = Math.max(2, lineasItem.length, lineasResp.length) * 11.5 + 7;

      if (y + altoFila > limite()) {
        nuevaPagina();
        encabezadoDetalleContinuacion(seccion);
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
      doc.text(String(numero), xDetalle[0] + 6, y + 13);

      y += altoFila;
      doc.setDrawColor(200);
      doc.setLineWidth(0.5);
      doc.line(margen, y, margen + anchoUtil, y);
    });

    const altoSubtotal = 19;
    if (y + altoSubtotal > limite()) {
      nuevaPagina();
      encabezadoDetalleContinuacion(seccion);
    }
    const suma = sumaDeSeccion(respuestas, si, config.norma, seccion.preguntas.length);
    doc.setFillColor(...CREMA);
    doc.rect(margen, y, anchoUtil, altoSubtotal, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(25);
    doc.text(`Suma de la dimensión — ${escala.etiqueta}`, xDetalle[1] + 6, y + 13);
    doc.text(`${suma} de ${seccion.preguntas.length * 4}`, xDetalle[2] + 6, y + 13);
    y += altoSubtotal + 16;
  });

  /* ---- 6. Escala de respuesta, nota y firma ---- */

  asegurar(120);
  escribir("Escala de respuesta del formulario", { tamano: 13, negrita: true, espacio: 4 });
  for (const linea of INSTRUCCIONES_ESCALA) {
    escribir(linea, { espacio: 2 });
  }
  if (version.notaAngustia) {
    escribir(version.notaAngustia, { tamano: 9, gris: true, espacio: 14 });
  } else {
    y += 8;
  }

  escribir("Nota", { tamano: 13, negrita: true, espacio: 4 });
  escribir(
    "Los puntajes T del SPM-2 se interpretan junto con el análisis de las respuestas a los ítems, la observación clínica y la información de otras fuentes; no constituyen por sí mismos un diagnóstico.",
    { espacio: 10 }
  );
  escribir(version.copyright, { tamano: 8, gris: true, espacio: 0 });

  asegurar(90);
  y += 26;
  const lineaFirma = 230;
  doc.setDrawColor(25);
  doc.setLineWidth(0.8);
  doc.line(anchoPagina / 2 - lineaFirma / 2, y, anchoPagina / 2 + lineaFirma / 2, y);
  y += 14;
  const profesional = valorDato("Nombre del/la Profesional");
  if (profesional) escribir(profesional, { centrado: true, negrita: true, espacio: 1 });
  escribir("Firma del/la profesional", { tamano: 9, gris: true, centrado: true, espacio: 0 });

  /* ---- Pie de página y numeración ---- */

  const nombre = valorDato(version.datoNombre);
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(margen, altoPagina - 40, anchoPagina - margen, altoPagina - 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(130);
    const pie = `${version.pie}${nombre ? ` · ${nombre}` : ""}`;
    doc.text(doc.splitTextToSize(pie, anchoUtil - 90)[0], margen, altoPagina - 28);
    doc.text(`Página ${i} de ${totalPaginas}`, anchoPagina - margen, altoPagina - 28, { align: "right" });
    doc.text("Generado por teraocupame", anchoPagina / 2, altoPagina - 16, { align: "center" });
  }

  return doc;
}
