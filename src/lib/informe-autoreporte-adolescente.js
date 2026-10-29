import { construirInformeHogar } from "./informe-hogar.js";

/* ============================================================
   INFORME SPM-2 · ADOLESCENTES 12 A 21 AÑOS (AUTOREPORTE)
   Textos propios de esta versión. La estructura y el diseño
   están en la base común (informe-hogar.js) y reproducen el
   documento oficial de referencia "Adolescent AutoScore Form ·
   Self-Report Form · Ages 12-21 years · SPANISH" (WPS,
   formulario W-707G). Lo completa el propio adolescente sobre
   su conducta típica del último mes. Única tabla normativa para
   todo el rango de edad. La Participación Social (71-80)
   invierte los ítems 71-74 y 77, redactados en positivo,
   según la Scoring Worksheet oficial.
   ============================================================ */

const VERSION = {
  tituloInforme: "Informe de resultados · Formulario AUTOREPORTE (Self-Report)",
  intro:
    "Este informe presenta los resultados de la aplicación del SPM-2, Formulario AUTOREPORTE para adolescentes de 12 a 21 años (Self-Report Form). El instrumento lo completa el propio adolescente sobre su conducta típica durante el último mes y consta de 80 preguntas agrupadas en ocho dimensiones: Visión, Oído, Tacto, Gusto y Olfato, Conciencia del Cuerpo, Equilibrio y Movimiento, Planificación e Ideas y Participación Social. Las seis primeras dimensiones se suman en el Total Sensorial (ST).",
  lineaEdad: "Adolescente — 12 a 21 años · Español",
  autores:
    "D. A. Henry, MS, OT/R-L, FAOTA · H. Kuhaneck, PhD, OTR/R-L, FAOTA · L. D. Parham, PhD, OTR/R-L, FAOTA · C. L. Ecker, MA, OTR/R-L · T. J. Glennon, EdD, OTR/R-L, FAOTA",
  celdasId: [
    { etiqueta: "NOMBRE", dato: "Nombre", fraccion: 0.58 },
    { etiqueta: "SEXO", dato: "Sexo", fraccion: 0.42 },
    { etiqueta: "FECHA DE NACIMIENTO", dato: "Fecha de Nacimiento", fraccion: 0.58 },
    { etiqueta: "EDAD", dato: "Edad", fraccion: 0.42 },
    { etiqueta: "ESCUELA/AGENCIA", dato: "Escuela/Agencia", fraccion: 0.58 },
    { etiqueta: "GRADO ESCOLAR", dato: "Grado Escolar", fraccion: 0.42 },
    { etiqueta: "NOMBRE DEL/LA PROFESIONAL", dato: "Nombre del/la Profesional", fraccion: 0.58 },
  ],
  datoNombre: "Nombre",
  notaAngustia: null,
  notaPuntuacion:
    "P. bruto: suma de los puntajes de los 10 ítems de la dimensión (N = 1, O = 2, F = 3, S = 4; rango 10-40). Los ítems 71-74 y 77 de Participación Social, redactados en positivo, se puntúan invertidos (N = 4, O = 3, F = 2, S = 1). ST (Total Sensorial): suma de las dimensiones Visión, Oído, Tacto, Gusto y Olfato, Conciencia del Cuerpo y Equilibrio y Movimiento (rango 60-240).",
  etiquetasTablaNorma: {
    adolescenteAuto: "12 a 21 años",
  },
  etiquetaTablaNormaPorDefecto: "12 a 21 años",
  codigoFormulario: "W-707G",
  copyright:
    "SPM-2 (Sensory Processing Measure, Second Edition). Copyright © 2021 Western Psychological Services. Formulario W-707G · Adolescent Self-Report Form · Ages 12-21 years (español).",
  pie: "SPM-2 · Formulario AUTOREPORTE · Adolescente (12 a 21 años)",
};

export function construirInformePDFAutoReporteAdolescente(config) {
  return construirInformeHogar(config, VERSION);
}

export function descargarInformePDFAutoReporteAdolescente(config) {
  construirInformePDFAutoReporteAdolescente(config).save(`${config.nombreArchivo}.pdf`);
}
