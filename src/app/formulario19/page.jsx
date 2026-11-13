"use client";

import CuestionarioEvaluacionInicial from "@/components/CuestionarioEvaluacionInicial";
import {
  SECCIONES,
  descargarInformePDF,
  descargarInformeWord,
} from "@/lib/informe-ei-persona-mayor";

/* ============================================================
   EVALUACIÓN INICIAL · PERSONA MAYOR (PESTAÑA PERSONA MAYOR)
   Ficha digital de la entrevista inicial de terapia ocupacional
   de TeraOcupame (impreso de 10 páginas). 18 secciones: datos
   personales, historial médico, motivo de consulta con la
   observación del terapeuta (condiciones generales, ánimo y
   orientación), antecedentes familiares, independencia
   funcional básica (11 ámbitos más descanso y sueño) e
   instrumental (10 ámbitos) en escalas con observación, área
   física, síndromes geriátricos (Sí/No con observación) y
   entorno y adaptaciones (secciones propias de esta ficha),
   otras consideraciones, salud mental (escala de depresión
   geriátrica de Yesavage de 15 preguntas numeradas según la
   Ficha N.º 3d, con puntuación total y punto de corte), área
   cognitiva (sí/no con companion
   «Observación»), lenguaje, participación social, habituación,
   esparcimiento, volición y plan de intervención por plazo.
   La síntesis y los informes PDF y Word viven
   en src/lib/informe-ei-persona-mayor.js.
   ============================================================ */

export default function FormularioEvaluacionInicialPersonaMayor() {
  return (
    <CuestionarioEvaluacionInicial
      marca="EVALUACIÓN INICIAL · PERSONA MAYOR"
      rango="Persona mayor · entrevista y autoinforme"
      instrumento="Evaluación inicial de terapia ocupacional"
      intro="Esta ficha se completa en la primera atención junto a la propia persona mayor y/o su cuidador. Responda cada sección según la entrevista, el autoinforme y la observación del terapeuta: registre los datos de identificación e historial médico, marque el nivel de independencia de cada ámbito y describa los síndromes geriátricos, la salud mental, las áreas física y cognitiva, el entorno y el plan de intervención. Los campos marcados con * son obligatorios; los de texto largo pueden quedar vacíos si no aplican."
      secciones={SECCIONES}
      descargarInformePDF={descargarInformePDF}
      descargarInformeWord={descargarInformeWord}
      confirmacion="Gracias. La evaluación inicial Persona Mayor se registró correctamente."
    />
  );
}
