import { jsPDF } from "jspdf";

/* ============================================================
   EVALUACIÓN INICIAL DE TERAPIA OCUPACIONAL · MOTOR COMÚN
   Motor de informe PDF compartido por las cuatro fichas de
   Evaluación Inicial (Infantil, Adolescencia, Adulto y Persona
   Mayor). A diferencia del SPM-2 y del Perfil Sensorial 2, no
   hay puntaje T ni tabla de corte: el informe se construye
   con el registro completo de la entrevista más la síntesis
   automatizada (bloques bandera / párrafo / lista / tabla)
   que cada ficha genera en su propio módulo informe-ei-*.js.
   ============================================================ */

const GRIS = 110;

const TINTES_BANDERA = {
  critico: { fondo: [254, 226, 226], franja: [220, 38, 38], etiqueta: "REQUIERE ATENCIÓN INMEDIATA" },
  alerta: { fondo: [254, 243, 199], franja: [217, 119, 6], etiqueta: "ALERTA" },
  ok: { fondo: [220, 252, 231], franja: [22, 163, 74], etiqueta: "SIN ALERTAS" },
  info: { fondo: [224, 231, 255], franja: [79, 70, 229], etiqueta: "INFORMACIÓN" },
};

/* Etiqueta elegida de un campo radio/siNo/escala (o el valor tal
   cual si no se encuentra entre las opciones). */
export function etiquetaOpcion(campo, valor) {
  if (!campo || valor == null || valor === "") return "";
  return campo.opciones?.find((o) => o.valor === valor)?.etiqueta ?? valor;
}

export function textoValor(valor) {
  const texto = (valor ?? "").toString().trim();
  return texto || "—";
}

/* Edad en años cumplidos a partir de una fecha ISO (aaaa-mm-dd).
   Devuelve null si la fecha es inválida o futura. */
export function calcularEdad(fecha) {
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return null;
  const nacimiento = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return null;
  const hoy = new Date();
  if (nacimiento > hoy) return null;
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad -= 1;
  return edad;
}

function fechaCorta() {
  return new Date().toLocaleDateString("es", { dateStyle: "long" });
}

/* Fecha ISO en formato largo en español (4 de mayo de 2020). */
export function fechaLarga(fecha) {
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return "";
  const fechaParseada = new Date(`${fecha}T00:00:00`);
  return Number.isNaN(fechaParseada.getTime())
    ? ""
    : fechaParseada.toLocaleDateString("es", { dateStyle: "long" });
}

/* ============================================================
   INFORME EN PDF
   ============================================================ */

export function descargarInformePDFEvaluacionInicial(config) {
  const {
    nombreArchivo,
    instrumento,
    titulo,
    subtitulo = "",
    autor = "",
    notaPie = "",
    color = [99, 102, 241],
    colorOscuro,
    colorFondo = [244, 244, 245],
    secciones = [],
    valores = {},
    sintesis = [],
    introduccion = "",
  } = config;
  const oscuro = colorOscuro ?? color;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();
  const margen = 48;
  const margenInferior = 60;
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
  const escribir = (
    texto,
    { tamano = 10.5, negrita = false, centrado = false, gris = false, tinte = null, espacio = 6, interlineado = 1.4 } = {}
  ) => {
    doc.setFont("helvetica", negrita ? "bold" : "normal");
    doc.setFontSize(tamano);
    doc.setTextColor(...(tinte ?? (gris ? [GRIS, GRIS, GRIS] : [25, 25, 25])));
    for (const linea of doc.splitTextToSize(texto, anchoUtil)) {
      asegurar(tamano * interlineado + 2);
      doc.text(linea, centrado ? anchoPagina / 2 : margen, y, { align: centrado ? "center" : "left" });
      y += tamano * interlineado;
    }
    y += espacio;
  };

  /* ---- Encabezado ---- */
  doc.setFillColor(...color);
  doc.rect(margen, y, anchoUtil, 4, "F");
  y += 24;
  escribir(instrumento.toUpperCase(), { tamano: 10.5, negrita: true, centrado: true, gris: true, espacio: 4 });
  escribir(titulo, { tamano: 17, negrita: true, centrado: true, espacio: subtitulo ? 2 : 6 });
  if (subtitulo) escribir(subtitulo, { tamano: 12, centrado: true, espacio: 6 });
  if (autor) escribir(autor, { tamano: 7.5, centrado: true, gris: true, espacio: 14 });

  /* ---- Datos de identificación ---- */
  const idCampos = secciones.find((s) => s.identificacion)?.campos ?? [];
  const celdasId = idCampos.map((c) => ({
    etiqueta: c.etiqueta.toUpperCase(),
    valor: textoValor(valores[c.id]),
    fraccion: c.fraccion ?? 0.5,
  }));
  celdasId.push({ etiqueta: "FECHA DE APLICACIÓN", valor: fechaCorta(), fraccion: 0.42 });

  const altoCeldaId = 34;
  for (let i = 0; i < celdasId.length; i += 2) {
    const par = celdasId.slice(i, i + 2);
    asegurar(altoCeldaId + 6);
    let x = margen;
    for (const celda of par) {
      const anchoCelda = anchoUtil * (celda.fraccion ?? 0.5);
      doc.setDrawColor(150);
      doc.setLineWidth(0.6);
      doc.setFillColor(...colorFondo);
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

  if (introduccion) escribir(introduccion, { espacio: 8 });

  /* ---- Bloques de síntesis automatizada ---- */
  const dibujarBandera = (bloque) => {
    const tinte = TINTES_BANDERA[bloque.nivel] ?? TINTES_BANDERA.info;
    const lineas = doc.splitTextToSize(bloque.texto, anchoUtil - 30);
    const alto = lineas.length * 13 + 20;
    asegurar(alto + 8);
    doc.setFillColor(...tinte.fondo);
    doc.rect(margen, y, anchoUtil, alto, "F");
    doc.setFillColor(...tinte.franja);
    doc.rect(margen, y, 4, alto, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...tinte.franja);
    doc.text(tinte.etiqueta, margen + 15, y + 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(25);
    lineas.forEach((linea, li) => doc.text(linea, margen + 15, y + 27 + li * 13));
    y += alto + 8;
  };

  const dibujarTabla = (bloque) => {
    const fracciones = bloque.columnas.map((c) => c.fraccion ?? 1 / bloque.columnas.length);
    const anchos = fracciones.map((f) => anchoUtil * f);
    const xs = anchos.reduce((acc, w) => [...acc, acc[acc.length - 1] + w], [margen]).slice(0, -1);
    const altoEncabezado = 18;
    const altoFila = (fila) =>
      Math.max(
        ...fila.map((celda, ci) => doc.splitTextToSize(textoValor(celda), anchos[ci] - 12).length * 12 + 10)
      );

    const dibujarEncabezado = () => {
      doc.setFillColor(...oscuro);
      doc.rect(margen, y, anchoUtil, altoEncabezado, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255);
      bloque.columnas.forEach((c, ci) =>
        doc.text(c.titulo, xs[ci] + 6, y + 12.5)
      );
      y += altoEncabezado;
    };

    asegurar(altoEncabezado + 40);
    if (bloque.titulo) {
      escribir(bloque.titulo, { tamano: 10.5, negrita: true, espacio: 3 });
      asegurar(altoEncabezado + 24);
    }
    dibujarEncabezado();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(25);
    for (const fila of bloque.filas) {
      const alto = altoFila(fila);
      asegurar(alto);
      doc.setDrawColor(180);
      doc.setLineWidth(0.5);
      fila.forEach((celda, ci) => {
        doc.rect(xs[ci], y, anchos[ci], alto);
        const lineas = doc.splitTextToSize(textoValor(celda), anchos[ci] - 12);
        lineas.forEach((linea, li) => doc.text(linea, xs[ci] + 6, y + 14 + li * 12));
      });
      y += alto;
    }
    y += 10;
  };

  const dibujarBloques = (bloques) => {
    for (const bloque of bloques) {
      if (bloque.tipo === "bandera") dibujarBandera(bloque);
      else if (bloque.tipo === "tabla") dibujarTabla(bloque);
      else if (bloque.tipo === "lista") {
        asegurar(50);
        escribir(bloque.titulo, { tamano: 10.5, negrita: true, espacio: 3 });
        for (const item of bloque.items) {
          escribir(`• ${item}`, { espacio: 2 });
        }
        y += 6;
      } else {
        asegurar(50);
        if (bloque.titulo) escribir(bloque.titulo, { tamano: 10.5, negrita: true, espacio: 2 });
        escribir(bloque.texto, { espacio: 8 });
      }
    }
  };

  if (sintesis.length > 0) {
    asegurar(80);
    escribir("Síntesis automatizada de la evaluación", { tamano: 13, negrita: true, espacio: 8 });
    dibujarBloques(sintesis);
  }

  /* ---- Registro completo por sección ---- */
  const dibujarCampo = (campo) => {
    const valor = valores[campo.id];
    if (campo.tipo === "radio" || campo.tipo === "siNo") {
      const elegida = etiquetaOpcion(campo, valor) || "—";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(GRIS);
      asegurar(26);
      doc.text(campo.etiqueta.toUpperCase(), margen, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(25);
      doc.text(elegida, margen + 14, y + 14);
      y += 28;
      return;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(GRIS);
    asegurar(24);
    doc.text(campo.etiqueta.toUpperCase(), margen, y);
    y += 11;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(25);
    for (const linea of doc.splitTextToSize(textoValor(valor), anchoUtil)) {
      asegurar(15);
      doc.text(linea, margen, y);
      y += 14;
    }
    y += 8;
  };

  const dibujarTablaEscalas = (campos) => {
    const anchos = [anchoUtil * 0.3, anchoUtil * 0.24, anchoUtil * 0.46];
    const xs = [margen, margen + anchos[0], margen + anchos[0] + anchos[1]];
    const columnas = ["ÁMBITO", "NIVEL", "OBSERVACIÓN"];
    const altoEncabezado = 16;
    const dibujarEncabezado = () => {
      doc.setFillColor(...oscuro);
      doc.rect(margen, y, anchoUtil, altoEncabezado, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255);
      columnas.forEach((c, ci) => doc.text(c, xs[ci] + 6, y + 11.5));
      y += altoEncabezado;
    };
    asegurar(altoEncabezado + 30);
    dibujarEncabezado();
    for (const campo of campos) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(25);
      const nivel = etiquetaOpcion(campo, valores[campo.id]) || "—";
      const obs = textoValor(valores[`${campo.id}Obs`]);
      const celdas = [campo.etiqueta, nivel, obs];
      const alto =
        Math.max(...celdas.map((celda, ci) => doc.splitTextToSize(celda, anchos[ci] - 12).length)) * 12 + 10;
      asegurar(alto);
      doc.setDrawColor(180);
      doc.setLineWidth(0.5);
      celdas.forEach((celda, ci) => {
        doc.rect(xs[ci], y, anchos[ci], alto);
        for (const [li, linea] of doc.splitTextToSize(celda, anchos[ci] - 12).entries()) {
          doc.text(linea, xs[ci] + 6, y + 14 + li * 12);
        }
      });
      y += alto;
    }
    y += 10;
  };

  asegurar(70);
  escribir("Registro completo de la evaluación", { tamano: 13, negrita: true, espacio: 10 });
  for (const seccion of secciones) {
    const escalas = seccion.campos.filter((c) => c.tipo === "escala");
    const otros = seccion.campos.filter((c) => c.tipo !== "escala");
    const altoEncabezado = escalas.length > 0 ? escalas.length * 22 + 40 : 40;
    asegurar(altoEncabezado);
    doc.setFillColor(...color);
    doc.rect(margen, y, anchoUtil, 3, "F");
    y += 12;
    escribir(seccion.titulo.toUpperCase(), { tamano: 11.5, negrita: true, tinte: oscuro, espacio: 8 });
    if (escalas.length > 0) dibujarTablaEscalas(escalas);
    for (const campo of otros) dibujarCampo(campo);
    y += 10;
  }

  if (notaPie) {
    asegurar(40);
    escribir(notaPie, { tamano: 8, gris: true });
  }

  doc.save(`${nombreArchivo}.pdf`);
}

/* ============================================================
   INFORME EN WORD
   Mismo contenido que el PDF (identificación, síntesis
   automatizada y registro completo) en HTML para Word.
   ============================================================ */

function escaparHTML(texto) {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const rgbCSS = (color) => `rgb(${color[0]},${color[1]},${color[2]})`;

function bloquesWordHTML(bloques, oscuro) {
  return bloques
    .map((bloque) => {
      if (bloque.tipo === "bandera") {
        const tinte = TINTES_BANDERA[bloque.nivel] ?? TINTES_BANDERA.info;
        return `<p style="border-left:6px solid ${rgbCSS(tinte.franja)};background:${rgbCSS(tinte.fondo)};padding:8px 12px;margin:8px 0;"><b>${escaparHTML(tinte.etiqueta)}.</b> ${escaparHTML(bloque.texto)}</p>`;
      }
      if (bloque.tipo === "tabla") {
        return `<p style="margin:10px 0 2px;"><b>${escaparHTML(bloque.titulo ?? "")}</b></p>
<table cellspacing="0" cellpadding="5" style="border-collapse:collapse;width:100%;font-size:10pt;table-layout:fixed;">
  <tr>${bloque.columnas
    .map(
      (c) =>
        `<th align="left" style="border:1px solid #666;background:${rgbCSS(oscuro)};color:#fff;">${escaparHTML(c.titulo)}</th>`
    )
    .join("")}</tr>
  ${bloque.filas
    .map(
      (fila) =>
        `<tr>${fila
          .map((celda) => `<td style="border:1px solid #999;">${escaparHTML(textoValor(celda))}</td>`)
          .join("")}</tr>`
    )
    .join("\n")}
</table>`;
      }
      if (bloque.tipo === "lista") {
        return `<p style="margin:10px 0 2px;"><b>${escaparHTML(bloque.titulo)}</b></p>
<ul style="margin:0 0 8px 18px;padding:0;">${bloque.items.map((item) => `<li>${escaparHTML(item)}</li>`).join("")}</ul>`;
      }
      const titulo = bloque.titulo ? `<b>${escaparHTML(bloque.titulo)}.</b> ` : "";
      return `<p style="margin:8px 0;">${titulo}${escaparHTML(bloque.texto)}</p>`;
    })
    .join("\n");
}

function seccionWordHTML(seccion, valores, oscuro) {
  const escalas = seccion.campos.filter((c) => c.tipo === "escala");
  const otros = seccion.campos.filter((c) => c.tipo !== "escala");

  const escalasHTML = escalas.length
    ? `<table cellspacing="0" cellpadding="5" style="border-collapse:collapse;width:100%;font-size:10pt;table-layout:fixed;">
  <colgroup><col style="width:30%" /><col style="width:24%" /><col style="width:46%" /></colgroup>
  <tr>
    <th align="left" style="border:1px solid #666;background:${rgbCSS(oscuro)};color:#fff;">ÁMBITO</th>
    <th align="left" style="border:1px solid #666;background:${rgbCSS(oscuro)};color:#fff;">NIVEL</th>
    <th align="left" style="border:1px solid #666;background:${rgbCSS(oscuro)};color:#fff;">OBSERVACIÓN</th>
  </tr>
  ${escalas
    .map((campo) => {
      const nivel = etiquetaOpcion(campo, valores[campo.id]) || "—";
      const obs = textoValor(valores[`${campo.id}Obs`]);
      return `<tr><td style="border:1px solid #999;">${escaparHTML(campo.etiqueta)}</td><td style="border:1px solid #999;">${escaparHTML(nivel)}</td><td style="border:1px solid #999;">${escaparHTML(obs)}</td></tr>`;
    })
    .join("\n")}
</table>`
    : "";

  const otrosHTML = otros
    .map((campo) => {
      const valor =
        campo.tipo === "radio" || campo.tipo === "siNo"
          ? etiquetaOpcion(campo, valores[campo.id]) || "—"
          : textoValor(valores[campo.id]);
      return `<p style="margin:6px 0;"><b style="font-size:8.5pt;color:#666;text-transform:uppercase;">${escaparHTML(campo.etiqueta)}</b><br/>${escaparHTML(valor).replaceAll("\n", "<br/>")}</p>`;
    })
    .join("\n");

  return `<h2 style="font-size:12pt;color:${rgbCSS(oscuro)};border-bottom:2px solid ${rgbCSS(oscuro)};margin:16px 0 6px;">${escaparHTML(seccion.titulo)}</h2>
${escalasHTML}
${otrosHTML}`;
}

export function construirInformeWordHTML(config) {
  const {
    instrumento,
    titulo,
    subtitulo = "",
    autor = "",
    notaPie = "",
    color = [99, 102, 241],
    colorOscuro,
    secciones = [],
    valores = {},
    sintesis = [],
    introduccion = "",
  } = config;
  const oscuro = colorOscuro ?? color;

  const idCampos = secciones.find((s) => s.identificacion)?.campos ?? [];
  const identificacionHTML = idCampos
    .map((campo) => `<p style="margin:2px 0;"><b>${escaparHTML(campo.etiqueta)}:</b> ${escaparHTML(textoValor(valores[campo.id]))}</p>`)
    .join("\n");
  const fechaHTML = `<p style="margin:2px 0;"><b>FECHA DE APLICACIÓN:</b> ${escaparHTML(fechaCorta())}</p>`;

  const sintesisHTML = sintesis.length
    ? `<h2 style="font-size:13pt;color:${rgbCSS(oscuro)};margin:18px 0 6px;">Síntesis automatizada de la evaluación</h2>
${bloquesWordHTML(sintesis, oscuro)}`
    : "";

  const registroHTML = secciones
    .map((seccion) => seccionWordHTML(seccion, valores, oscuro))
    .join("\n");

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8" /><title>${escaparHTML(titulo)}</title></head>
<body style="font-family: Arial, sans-serif; font-size:11pt; color:#111;">
  <p style="text-align:center;margin:0;"><b>${escaparHTML(instrumento.toUpperCase())}</b></p>
  <h1 style="text-align:center;font-size:16pt;margin:4px 0 2px;">${escaparHTML(titulo)}</h1>
  ${subtitulo ? `<p style="text-align:center;margin:0;">${escaparHTML(subtitulo)}</p>` : ""}
  ${autor ? `<p style="text-align:center;margin:0 0 12px;font-size:8.5pt;color:#666;">${escaparHTML(autor)}</p>` : ""}
  ${introduccion ? `<p style="margin:12px 0;">${escaparHTML(introduccion)}</p>` : ""}
  ${identificacionHTML}
  ${fechaHTML}
  ${sintesisHTML}
  <h2 style="font-size:13pt;color:${rgbCSS(oscuro)};margin:18px 0 6px;">Registro completo de la evaluación</h2>
  ${registroHTML}
  ${notaPie ? `<p style="margin:18px 0 0;font-size:9pt;color:#666;">${escaparHTML(notaPie)}</p>` : ""}
  <p style="margin:30px 0 0;text-align:center;">____________________________<br/>Firma Profesional</p>
</body>
</html>`;
}

export function descargarInformeWordEvaluacionInicial(config) {
  const html = construirInformeWordHTML(config);
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
