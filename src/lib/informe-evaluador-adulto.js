import { construirInformeHogar } from "./informe-hogar.js";

/* ============================================================
   INFORME SPM-2 · ADULTOS DE 21 A 87 AÑOS (EVALUADOR)
   Textos propios de esta versión. La estructura y el diseño
   están en la base común (informe-hogar.js) y reproducen el
   documento oficial de referencia "Adult AutoScore Form ·
   Rater Report Form · Ages 21-87 years · SPANISH" (WPS,
   formulario W-706F). Usa una única tabla normativa para todo
   el rango de edad.
   ============================================================ */

const VERSION = {
  tituloInforme: "Informe de resultados · Formulario EVALUADOR (Rater Report)",
  intro:
    "Este informe presenta los resultados de la aplicación del SPM-2, Formulario EVALUADOR para adultos de 21 a 87 años. El instrumento lo completa un tercero que conozca bien al individuo, sobre su conducta típica durante el último mes y consta de 80 preguntas agrupadas en ocho dimensiones: Visión, Oído, Tacto, Gusto y Olfato, Conciencia Corporal, Equilibrio y Movimiento, Planificación e Ideas y Participación Social. Las seis primeras dimensiones se suman en el Total Sensorial (ST).",
  lineaEdad: "Adulto — 21 a 87 años · Español",
  autores:
    "L. D. Parham, PhD, OTR/L, FAOTA · C. L. Ecker, MA, OTR/L · T. J. Glennon, EdD, OTR/L, FAOTA · D. A. Henry, MS, OT/L, FAOTA · H. Kuhaneck, PhD, OTR/L, FAOTA",
  celdasId: [
    { etiqueta: "NOMBRE DEL/DE LA USUARIO/A", dato: "Nombre del Usuario/a", fraccion: 0.58 },
    { etiqueta: "EDAD", dato: "Edad", fraccion: 0.42 },
    { etiqueta: "NOMBRE DE QUIÉN RESPONDE", dato: "Nombre de quién responde", fraccion: 0.5 },
    { etiqueta: "RELACIÓN CON EL/LA USUARIO/A", dato: "Relación de quién responde con el usuario/a", fraccion: 0.5 },
    { etiqueta: "NOMBRE DEL/LA PROFESIONAL", dato: "Nombre del/la Profesional", fraccion: 0.58 },
  ],
  datoNombre: "Nombre del Usuario/a",
  notaAngustia:
    "Algunas preguntas inquieren acerca de que si este individuo se “angustia” en ciertas situaciones. Angustia puede incluir expresiones verbales (gimiendo, llorando, gritando) o expresiones sin uso de palabras (apartándose, haciendo gestos, descartando alguna cosa, escapándose, haciendo gestos de dolor, azotando).",
  etiquetasTablaNorma: {
    adultoEvaluador: "21 a 87 años",
  },
  etiquetaTablaNormaPorDefecto: "21 a 87 años",
  codigoFormulario: "W-706F",
  copyright:
    "SPM-2 (Sensory Processing Measure, Second Edition). Copyright © 2021 Western Psychological Services. Formulario W-706F · Adult Rater Report Form (español). Traducción al español: Susana Urbina, PhD.",
  pie: "SPM-2 · Formulario EVALUADOR · Adulto (21 a 87 años)",
};

export function construirInformePDFEvaluadorAdulto(config) {
  return construirInformeHogar(config, VERSION);
}

export function descargarInformePDFEvaluadorAdulto(config) {
  construirInformePDFEvaluadorAdulto(config).save(`${config.nombreArchivo}.pdf`);
}
