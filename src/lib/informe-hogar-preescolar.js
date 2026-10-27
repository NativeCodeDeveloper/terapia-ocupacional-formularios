import { construirInformeHogar } from "./informe-hogar.js";

/* ============================================================
   INFORME SPM-2 HOGAR · NIÑOS/AS DE 2 A 5 AÑOS (Preescolar)
   Textos propios de esta versión del formulario HOGAR.
   La estructura y el diseño están en la base común
   (informe-hogar.js) y reproducen el documento oficial de
   referencia "Preschool AutoScore Form · Home Form · Ages 2-5
   years · SPANISH" (WPS, formulario W-709E). La tabla
   normativa se elige según la edad: 2 a 4 años o 5 años.
   ============================================================ */

const VERSION = {
  rangoEdad: "2 a 5 años",
  lineaEdad: "Preescolar — Niños y niñas de 2 a 5 años · Español",
  autores:
    "H. Kuhaneck, PhD, OTR/L, FAOTA · L. D. Parham, PhD, OTR/L, FAOTA · C. L. Ecker, MA, OTR/L · T. J. Glennon, EdD, OTR/L, FAOTA · D. A. Henry, MS, OTR/L, FAOTA",
  etiquetasTablaNorma: {
    preescolar24: "Edades 2 a 4 años",
    preescolar5: "5 años",
  },
  etiquetaTablaNormaPorDefecto: "Edades 2 a 4 años",
  codigoFormulario: "W-709E",
  copyright:
    "SPM-2 (Sensory Processing Measure, Second Edition). Copyright © 2021 Western Psychological Services. Formulario W-709E · Preschool Home Form (español). Traducción al español: Susana Urbina, PhD.",
  pie: "Preescolar (2 a 5 años)",
};

export function construirInformePDFHogarPreescolar(config) {
  return construirInformeHogar(config, VERSION);
}

export function descargarInformePDFHogarPreescolar(config) {
  construirInformePDFHogarPreescolar(config).save(`${config.nombreArchivo}.pdf`);
}
