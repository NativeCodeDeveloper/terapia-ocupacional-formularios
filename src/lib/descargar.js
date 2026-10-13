import { jsPDF } from "jspdf";

function escaparHTML(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function construirFilas({ secciones, respuestas, opciones }) {
  let numero = 0;
  const filas = [];
  for (const seccion of secciones) {
    filas.push({ tipo: "seccion", texto: seccion.titulo });
    for (const texto of seccion.preguntas) {
      numero += 1;
      const opcion = opciones.find((o) => o.valor === respuestas[numero]);
      filas.push({
        tipo: "pregunta",
        numero,
        texto,
        respuesta: opcion ? opcion.etiqueta : "—",
      });
    }
  }
  return filas;
}

function fechaRegistro() {
  return new Date().toLocaleString("es", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function totalPosible({ secciones }) {
  return secciones.reduce((n, s) => n + s.preguntas.length, 0) * 4;
}

export function descargarPDF(config) {
  const { titulo, subtitulo, datos, secciones, respuestas, opciones, resultado } = config;
  const filas = construirFilas({ secciones, respuestas, opciones });

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margen = 48;
  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();
  const anchoUtil = anchoPagina - margen * 2;
  let y = margen;

  function escribir(texto, { tamano = 11, negrita = false, centrado = false, gris = false, espacio = 6 } = {}) {
    doc.setFont("helvetica", negrita ? "bold" : "normal");
    doc.setFontSize(tamano);
    doc.setTextColor(gris ? 110 : 25);
    for (const linea of doc.splitTextToSize(texto, anchoUtil)) {
      if (y > altoPagina - margen) {
        doc.addPage();
        y = margen;
      }
      doc.text(linea, centrado ? anchoPagina / 2 : margen, y, {
        align: centrado ? "center" : "left",
      });
      y += tamano * 1.35;
    }
    y += espacio;
  }

  escribir(titulo, { tamano: 18, negrita: true, centrado: true, espacio: 2 });
  escribir(subtitulo, { tamano: 12, centrado: true, espacio: 4 });
  escribir(`Fecha de registro: ${fechaRegistro()}`, {
    tamano: 10,
    gris: true,
    centrado: true,
    espacio: 16,
  });

  escribir("Datos", { tamano: 13, negrita: true, espacio: 4 });
  for (const d of datos) {
    escribir(`${d.etiqueta}: ${d.valor ? d.valor : "—"}`, { espacio: 2 });
  }
  y += 10;

  escribir("Resumen de frecuencia", { tamano: 13, negrita: true, espacio: 4 });
  escribir(
    opciones.map((o) => `${o.etiqueta}: ${resultado.conteo[o.valor]}`).join("   ·   "),
    { espacio: 2 }
  );
  escribir(`Puntaje total: ${resultado.puntajeTotal} de ${totalPosible({ secciones })}`, {
    negrita: true,
    espacio: 14,
  });

  for (const fila of filas) {
    if (fila.tipo === "seccion") {
      escribir(fila.texto, { tamano: 13, negrita: true, espacio: 4 });
    } else {
      escribir(`${fila.numero}. ${fila.texto}`, { espacio: 1 });
      escribir(`Respuesta: ${fila.respuesta}`, { negrita: true, espacio: 8 });
    }
  }

  doc.save(`${config.nombreArchivo}.pdf`);
}

export function descargarWord(config) {
  const { titulo, subtitulo, datos, secciones, respuestas, opciones, resultado } = config;
  const filas = construirFilas({ secciones, respuestas, opciones });

  const datosHTML = datos
    .map((d) => `<p style="margin:2px 0;"><b>${escaparHTML(d.etiqueta)}:</b> ${escaparHTML(d.valor || "—")}</p>`)
    .join("\n");

  const conteoHTML = opciones
    .map((o) => `<b>${o.etiqueta}:</b> ${resultado.conteo[o.valor]}`)
    .join(" &nbsp;·&nbsp; ");

  const filasHTML = filas
    .map((f) =>
      f.tipo === "seccion"
        ? `<h2 style="font-size:14pt;color:#312e81;margin:18px 0 6px;">${escaparHTML(f.texto)}</h2>`
        : `<p style="margin:0 0 2px;"><b>${f.numero}. ${escaparHTML(f.texto)}</b></p>
           <p style="margin:0 0 10px;color:#444;">Respuesta: <b>${escaparHTML(f.respuesta)}</b></p>`
    )
    .join("\n");

  const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${escaparHTML(titulo)}</title>
</head>
<body style="font-family: Arial, sans-serif; font-size:11pt; color:#111;">
  <h1 style="text-align:center; margin-bottom:2px;">${escaparHTML(titulo)}</h1>
  <p style="text-align:center; margin:0;">${escaparHTML(subtitulo)}</p>
  <p style="text-align:center; color:#666; font-size:10pt; margin-top:4px;">Fecha de registro: ${escaparHTML(fechaRegistro())}</p>

  <h2 style="font-size:14pt;color:#312e81;margin:18px 0 6px;">Datos</h2>
  ${datosHTML}

  <h2 style="font-size:14pt;color:#312e81;margin:18px 0 6px;">Resumen de frecuencia</h2>
  <p style="margin:0 0 4px;">${conteoHTML}</p>
  <p style="margin:0;"><b>Puntaje total:</b> ${resultado.puntajeTotal} de ${totalPosible({ secciones })}</p>

  <hr style="margin:18px 0;" />
  ${filasHTML}
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
