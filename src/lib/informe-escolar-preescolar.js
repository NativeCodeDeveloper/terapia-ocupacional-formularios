import { construirInformeHogar } from "./informe-hogar.js";

/* ============================================================
   INFORME SPM-2 ESCOLAR · PREESCOLAR 2 A 5 AÑOS (School Form)
   Textos propios de esta versión del formulario ESCOLAR.
   La estructura y el diseño están en la base común
   (informe-hogar.js) y reproducen el documento oficial de
   referencia "Preschool AutoScore Form · School Form · Ages 2-5
   years · SPANISH" (WPS, formulario W-709F). Lo responde el
   educador o educadora de preescolar/guardería. La tabla
   normativa se elige según la edad: 2 a 4 años o 5 años.
   ============================================================ */

const VERSION = {
  tituloInforme: "Informe de resultados · Formulario ESCOLAR (School Form)",
  intro:
    "Este informe presenta los resultados de la aplicación del SPM-2, Formulario ESCOLAR para niños y niñas de 2 a 5 años (School Form). El instrumento lo completa el educador o la educadora del preescolar o la guardería sobre la conducta típica del niño o la niña durante el último mes y consta de 80 preguntas agrupadas en ocho dimensiones: Visión, Oído, Tacto, Gusto y Olfato, Conciencia del Cuerpo, Equilibrio y Movimiento, Planificación e Ideas y Participación Social. Las seis primeras dimensiones se suman en el Total Sensorial (ST).",
  lineaEdad: "Preescolar School Form — Niños y niñas de 2 a 5 años · Español",
  autores:
    "H. Kuhaneck, PhD, OTR/L, FAOTA · L. D. Parham, PhD, OTR/L, FAOTA · C. L. Ecker, MA, OTR/L · T. J. Glennon, EdD, OTR/L, FAOTA · D. A. Henry, MS, OTR/L, FAOTA",
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
    preescolarEscolar24: "Edades 2 a 4 años",
    preescolarEscolar5: "5 años",
  },
  etiquetaTablaNormaPorDefecto: "Edades 2 a 4 años",
  codigoFormulario: "W-709F",
  copyright:
    "SPM-2 (Sensory Processing Measure, Second Edition). Copyright © 2021 Western Psychological Services. Formulario W-709F · Preschool School Form (español). Traducción al español: Susana Urbina, PhD.",
  pie: "SPM-2 · Formulario ESCOLAR · Preescolar (2 a 5 años)",
};

export function construirInformePDFEscolarPreescolar(config) {
  return construirInformeHogar(config, VERSION);
}

export function descargarInformePDFEscolarPreescolar(config) {
  construirInformePDFEscolarPreescolar(config).save(`${config.nombreArchivo}.pdf`);
}
