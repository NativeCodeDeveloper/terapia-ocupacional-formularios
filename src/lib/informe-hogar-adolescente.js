import { construirInformeHogar } from "./informe-hogar.js";

/* ============================================================
   INFORME SPM-2 HOGAR · ADOLESCENTES DE 12 A 21 AÑOS
   Textos propios de esta versión del formulario HOGAR.
   La estructura y el diseño están en la base común
   (informe-hogar.js) y reproducen el documento oficial de
   referencia "Adolescent AutoScore Form · Home Form · Ages
   12-21 years · SPANISH" (WPS, formulario W-707E). Usa una
   única tabla normativa para todo el rango de edad.
   ============================================================ */

const VERSION = {
  intro:
    "Este informe presenta los resultados de la aplicación del SPM-2, Formulario HOGAR para adolescentes de 12 a 21 años. El instrumento lo completa el padre, la madre o el cuidador sobre la conducta típica del individuo durante el último mes y consta de 80 preguntas agrupadas en ocho dimensiones: Visión, Oído, Tacto, Gusto y Olfato, Conciencia Corporal, Equilibrio y Movimiento, Planificación e Ideas y Participación Social. Las seis primeras dimensiones se suman en el Total Sensorial (ST).",
  lineaEdad: "Adolescente — 12 a 21 años · Español",
  autores:
    "D. A. Henry, MS, OTR/L, FAOTA · H. Kuhaneck, PhD, OTR/L, FAOTA · L. D. Parham, PhD, OTR/L, FAOTA · C. L. Ecker, MA, OTR/L · T. J. Glennon, EdD, OTR/L, FAOTA",
  celdasId: [
    { etiqueta: "NOMBRE DEL/DE LA USUARIO/A", dato: "Nombre del Usuario/a", fraccion: 0.58 },
    { etiqueta: "EDAD", dato: "Edad", fraccion: 0.42 },
    { etiqueta: "NOMBRE DE QUIÉN RESPONDE", dato: "Nombre de quién responde", fraccion: 0.5 },
    { etiqueta: "RELACIÓN CON EL/LA USUARIO/A", dato: "Relación de quién responde con el usuario/a", fraccion: 0.5 },
    { etiqueta: "NOMBRE DEL/LA PROFESIONAL", dato: "Nombre del/la Profesional", fraccion: 0.58 },
  ],
  datoNombre: "Nombre del Usuario/a",
  etiquetasTablaNorma: {
    adolescenteHogar: "12 a 21 años",
  },
  etiquetaTablaNormaPorDefecto: "12 a 21 años",
  codigoFormulario: "W-707E",
  copyright:
    "SPM-2 (Sensory Processing Measure, Second Edition). Copyright © 2021 Western Psychological Services. Formulario W-707E · Adolescent Home Form (español). Traducción al español: Susana Urbina, PhD.",
  pie: "Adolescente (12 a 21 años)",
};

export function construirInformePDFHogarAdolescente(config) {
  return construirInformeHogar(config, VERSION);
}

export function descargarInformePDFHogarAdolescente(config) {
  construirInformePDFHogarAdolescente(config).save(`${config.nombreArchivo}.pdf`);
}
