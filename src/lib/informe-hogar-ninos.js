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
  rangoEdad: "5 a 12 años",
  lineaEdad: "Edad Escolar — Niños y niñas de 5 a 12 años · Español",
  autores:
    "C. L. Ecker, MA, OTR/L · T. J. Glennon, EdD, OTR/L, FAOTA · D. A. Henry, MS, OTR/L, FAOTA · H. Kuhaneck, PhD, OTR/L, FAOTA · L. D. Parham, PhD, OTR/L, FAOTA",
  etiquetasTablaNorma: {
    child: "Edades 5 a 12 años",
  },
  etiquetaTablaNormaPorDefecto: "Edades 5 a 12 años",
  codigoFormulario: "W-708E",
  copyright:
    "SPM-2 (Sensory Processing Measure, Second Edition). Copyright © 2021 Western Psychological Services. Formulario W-708E · Child Home Form (español). Traducción al español: Susana Urbina, PhD.",
  pie: "Niños (5 a 12 años)",
};

export function construirInformePDFHogarNinos(config) {
  return construirInformeHogar(config, VERSION);
}

export function descargarInformePDFHogarNinos(config) {
  construirInformePDFHogarNinos(config).save(`${config.nombreArchivo}.pdf`);
}
