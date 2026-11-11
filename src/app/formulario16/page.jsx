"use client";

import CuestionarioEvaluacionInicial from "@/components/CuestionarioEvaluacionInicial";
import {
  SECCIONES,
  descargarInformePDF,
  descargarInformeWord,
} from "@/lib/informe-ei-infantil";

/* ============================================================
   EVALUACIÓN INICIAL · INFANTIL (PESTAÑA NIÑO)
   Ficha digital de la entrevista inicial de terapia ocupacional
   de TeraOcupame (impreso de 9 páginas). 18 secciones: datos
   personales, historial médico, motivo de consulta con la
   observación del terapeuta (condiciones generales, ánimo y
   estado de alerta), antecedentes familiares, independencia
   funcional en 11 ámbitos más descanso y sueño (escalas con
   observación), hitos del desarrollo, áreas sensorial, física
   y cognitiva (sí/no con companion «¿En qué?»), lenguaje,
   conducta, interacción social, emociones, juego, habituación,
   esparcimiento, volición y plan de intervención por plazo.
   La síntesis y los informes PDF y Word viven en
   src/lib/informe-ei-infantil.js.
   ============================================================ */

export default function FormularioEvaluacionInicialInfantil() {
  return (
    <CuestionarioEvaluacionInicial
      marca="EVALUACIÓN INICIAL · INFANTIL"
      rango="Niño · entrevista al tutor/a"
      instrumento="Evaluación inicial de terapia ocupacional"
      intro="Esta ficha se completa en la primera atención junto al tutor/a del niño. Responda cada sección según la entrevista al adulto responsable y la observación del terapeuta: registre los datos de identificación e historial médico, marque el nivel de independencia de cada ámbito y describa el desarrollo, el juego y la participación del niño. Los campos marcados con * son obligatorios; los de texto largo pueden quedar vacíos si no aplican."
      secciones={SECCIONES}
      descargarInformePDF={descargarInformePDF}
      descargarInformeWord={descargarInformeWord}
      confirmacion="Gracias. La evaluación inicial Infantil se registró correctamente."
    />
  );
}
