import { construirInformeHogar } from "./informe-hogar.js";

/* ============================================================
   INFORME SPM-2 ESCOLAR · ADOLESCENTES 12 A 21 AÑOS (School Form)
   Textos propios de esta versión del formulario ESCOLAR.
   La estructura y el diseño están en la base común
   (informe-hogar.js) y reproducen el documento oficial de
   referencia "Adolescent AutoScore Form · School Form · Ages
   12-21 years · SPANISH" (WPS, formulario W-707F). Lo responde
   un evaluador o docente sobre el/la estudiante. Única tabla
   normativa para todo el rango de edad.
   ============================================================ */

const VERSION = {
  tituloInforme: "Informe de resultados · Formulario ESCOLAR (School Form)",
  intro:
    "Este informe presenta los resultados de la aplicación del SPM-2, Formulario ESCOLAR para adolescentes de 12 a 21 años (School Form). El instrumento lo completa un evaluador o docente sobre la conducta típica del o la estudiante durante el último mes y consta de 80 preguntas agrupadas en ocho dimensiones: Visión, Oído, Tacto, Gusto y Olfato, Conciencia del Cuerpo, Equilibrio y Movimiento, Planificación e Ideas y Participación Social. Las seis primeras dimensiones se suman en el Total Sensorial (ST).",
  lineaEdad: "Adolescente School Form — 12 a 21 años · Español",
  autores:
    "H. Kuhaneck, PhD, OTR/L, FAOTA · L. D. Parham, PhD, OTR/L, FAOTA · C. L. Ecker, MA, OTR/L · T. J. Glennon, EdD, OTR/L, FAOTA · D. A. Henry, MS, OTR/L, FAOTA",
  celdasId: [
    { etiqueta: "NOMBRE DEL/DE LA ESTUDIANTE", dato: "Nombre del/de la Estudiante", fraccion: 0.58 },
    { etiqueta: "SEXO", dato: "Sexo", fraccion: 0.42 },
    { etiqueta: "FECHA DE NACIMIENTO", dato: "Fecha de Nacimiento", fraccion: 0.58 },
    { etiqueta: "EDAD", dato: "Edad", fraccion: 0.42 },
    { etiqueta: "NOMBRE DEL RESPONDIENTE", dato: "Nombre del respondiente", fraccion: 0.5 },
    { etiqueta: "RELACIÓN DEL RESPONDIENTE CON EL/LA ESTUDIANTE", dato: "Relación del respondiente con el/la estudiante", fraccion: 0.5 },
    { etiqueta: "ESCUELA/AGENCIA", dato: "Escuela/Agencia", fraccion: 0.5 },
    { etiqueta: "GRADO ESCOLAR", dato: "Grado Escolar", fraccion: 0.5 },
    { etiqueta: "NOMBRE DEL/LA PROFESIONAL", dato: "Nombre del/la Profesional", fraccion: 0.58 },
  ],
  datoNombre: "Nombre del/de la Estudiante",
  notaAngustia:
    "Algunas preguntas inquieren acerca de que si este/esta estudiante se “angustia” en ciertas situaciones. Angustia puede incluir expresiones verbales (gimiendo, llorando, gritando) o expresiones sin uso de palabras (apartándose, haciendo gestos, descartando alguna cosa, escapándose, haciendo gestos de dolor, azotando).",
  etiquetasTablaNorma: {
    adolescenteEscolar: "12 a 21 años",
  },
  etiquetaTablaNormaPorDefecto: "12 a 21 años",
  codigoFormulario: "W-707F",
  copyright:
    "SPM-2 (Sensory Processing Measure, Second Edition). Copyright © 2021 Western Psychological Services. Formulario W-707F · Adolescent School Form (español). Traducción al español: Susana Urbina, PhD.",
  pie: "SPM-2 · Formulario ESCOLAR · Adolescente (12 a 21 años)",
};

export function construirInformePDFEscolarAdolescente(config) {
  return construirInformeHogar(config, VERSION);
}

export function descargarInformePDFEscolarAdolescente(config) {
  construirInformePDFEscolarAdolescente(config).save(`${config.nombreArchivo}.pdf`);
}
