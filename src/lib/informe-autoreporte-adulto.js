import { construirInformeHogar } from "./informe-hogar.js";

/* ============================================================
   INFORME SPM-2 · ADULTOS DE 21 A 87 AÑOS (AUTOREPORTE)
   Textos propios de esta versión. La estructura y el diseño
   están en la base común (informe-hogar.js) y reproducen el
   documento oficial de referencia "Adult AutoScore Form ·
   Self-Report Form · Ages 21-87 years · SPANISH" (WPS,
   formulario W-706E). Usa una única tabla normativa para todo
   el rango de edad.
   ============================================================ */

const VERSION = {
  tituloInforme: "Informe de resultados · Formulario AUTOREPORTE (Self-Report)",
  intro:
    "Este informe presenta los resultados de la aplicación del SPM-2, Formulario AUTOREPORTE para adultos de 21 a 87 años. El instrumento lo completa la propia persona sobre su conducta típica durante el último mes y consta de 80 preguntas agrupadas en ocho dimensiones: Visión, Oído, Tacto, Gusto y Olfato, Conciencia Corporal, Equilibrio y Movimiento, Planificación e Ideas y Participación Social. Las seis primeras dimensiones se suman en el Total Sensorial (ST).",
  lineaEdad: "Adulto — 21 a 87 años · Español",
  autores:
    "L. D. Parham, PhD, OTR/L, FAOTA · C. L. Ecker, MA, OTR/L · T. J. Glennon, EdD, OTR/L, FAOTA · D. A. Henry, MS, OT/L, FAOTA · H. Kuhaneck, PhD, OTR/L, FAOTA",
  celdasId: [
    { etiqueta: "NOMBRE", dato: "Nombre", fraccion: 0.58 },
    { etiqueta: "EDAD", dato: "Edad", fraccion: 0.42 },
    { etiqueta: "FECHA DE NACIMIENTO", dato: "Fecha de Nacimiento", fraccion: 0.5 },
    { etiqueta: "COMENTARIOS", dato: "Comentarios", fraccion: 0.5 },
  ],
  datoNombre: "Nombre",
  notaAngustia: null,
  etiquetasTablaNorma: {
    adultoAuto: "21 a 87 años",
  },
  etiquetaTablaNormaPorDefecto: "21 a 87 años",
  codigoFormulario: "W-706E",
  copyright:
    "SPM-2 (Sensory Processing Measure, Second Edition). Copyright © 2021 Western Psychological Services. Formulario W-706E · Adult Self-Report Form (español). Traducción al español: Susana Urbina, PhD.",
  pie: "SPM-2 · Formulario AUTOREPORTE · Adulto (21 a 87 años)",
};

export function construirInformePDFAutoReporteAdulto(config) {
  return construirInformeHogar(config, VERSION);
}

export function descargarInformePDFAutoReporteAdulto(config) {
  construirInformePDFAutoReporteAdulto(config).save(`${config.nombreArchivo}.pdf`);
}
