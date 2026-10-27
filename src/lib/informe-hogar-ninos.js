import { construirInformeHogar } from "./informe-hogar.js";

/* ============================================================
   INFORME SPM-2 HOGAR · NIÑOS/AS DE 5 A 12 AÑOS
   Textos propios de esta versión del formulario HOGAR.
   La estructura y el diseño están en la base común
   (informe-hogar.js) y reproducen el documento oficial de
   referencia "Child AutoScore Form · Home Form · Ages 5-12
   years · SPANISH" (WPS, formulario W-708E). A diferencia del
   preescolar, usa una única tabla normativa para todo el
   rango de edad (5 a 12 años).
   ============================================================ */

const VERSION = {
  tituloInforme: "Informe de resultados · Formulario HOGAR (Home Form)",
  intro:
    "Este informe presenta los resultados de la aplicación del SPM-2, Formulario HOGAR para niños y niñas de 5 a 12 años. El instrumento lo completa el padre, la madre o el cuidador sobre la conducta típica del niño o la niña durante el último mes y consta de 80 preguntas agrupadas en ocho dimensiones: Visión, Oído, Tacto, Gusto y Olfato, Conciencia Corporal, Equilibrio y Movimiento, Planificación e Ideas y Participación Social. Las seis primeras dimensiones se suman en el Total Sensorial (ST).",
  lineaEdad: "Edad Escolar — Niños y niñas de 5 a 12 años · Español",
  autores:
    "C. L. Ecker, MA, OTR/L · T. J. Glennon, EdD, OTR/L, FAOTA · D. A. Henry, MS, OTR/L, FAOTA · H. Kuhaneck, PhD, OTR/L, FAOTA · L. D. Parham, PhD, OTR/L, FAOTA",
  celdasId: [
    { etiqueta: "NOMBRE DEL/DE LA NIÑO/A", dato: "Nombre del Niño o Niña", fraccion: 0.58 },
    { etiqueta: "EDAD", dato: "Edad", fraccion: 0.42 },
    { etiqueta: "NOMBRE DE QUIÉN RESPONDE", dato: "Nombre de quién responde", fraccion: 0.5 },
    { etiqueta: "RELACIÓN CON EL NIÑO O NIÑA", dato: "Relación con el niño o niña", fraccion: 0.5 },
    { etiqueta: "NOMBRE DEL/LA PROFESIONAL", dato: "Nombre del/la Profesional", fraccion: 0.58 },
  ],
  datoNombre: "Nombre del Niño o Niña",
  notaAngustia:
    "Algunas preguntas inquieren acerca de que si este/a niño/a se “angustia” en ciertas situaciones. Angustia puede incluir expresiones verbales (gimiendo, llorando, gritando) o expresiones sin uso de palabras (apartándose, haciendo gestos, descartando alguna cosa, escapándose, haciendo gestos de dolor, azotando).",
  etiquetasTablaNorma: {
    child: "Edades 5 a 12 años",
  },
  etiquetaTablaNormaPorDefecto: "Edades 5 a 12 años",
  codigoFormulario: "W-708E",
  copyright:
    "SPM-2 (Sensory Processing Measure, Second Edition). Copyright © 2021 Western Psychological Services. Formulario W-708E · Child Home Form (español). Traducción al español: Susana Urbina, PhD.",
  pie: "SPM-2 · Formulario HOGAR · Niños (5 a 12 años)",
};

export function construirInformePDFHogarNinos(config) {
  return construirInformeHogar(config, VERSION);
}

export function descargarInformePDFHogarNinos(config) {
  construirInformePDFHogarNinos(config).save(`${config.nombreArchivo}.pdf`);
}
