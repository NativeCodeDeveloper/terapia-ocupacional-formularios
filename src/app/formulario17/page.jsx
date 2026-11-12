"use client";

import CuestionarioEvaluacionInicial from "@/components/CuestionarioEvaluacionInicial";
import {
  SECCIONES,
  descargarInformePDF,
  descargarInformeWord,
} from "@/lib/informe-ei-adolescencia";

/* ============================================================
   EVALUACIÓN INICIAL · ADOLESCENCIA
   Ficha de la primera atención de terapia ocupacional para
   adolescentes (pestaña ADOLESCENTE del formulario impreso
   NIÑO - ADOLESCENTE - ADULTO - PERSONA MAYOR). Se completa
   junto al tutor/a o al propio adolescente según entrevista y
   observación: datos personales, historial médico, motivo de
   consulta, antecedentes familiares, independencia funcional
   (10 ámbitos + descanso y sueño, sin «Gatear»), hitos del
   desarrollo, áreas sensorial, física y cognitiva (funciones
   con «Observación»), lenguaje, conducta, interacción social,
   emociones, área académica (aquí reemplaza al área de juego
   del infantil), habituación, esparcimiento, volición y plan
   de intervención con objetivos por plazo. La síntesis y el
   informe PDF los aporta src/lib/informe-ei-adolescencia.js.
   ============================================================ */

export default function FormularioEvaluacionInicialAdolescencia() {
  return (
    <CuestionarioEvaluacionInicial
      marca="EVALUACIÓN INICIAL · ADOLESCENCIA"
      rango="Adolescente · entrevista al tutor/a"
      instrumento="Evaluación inicial de terapia ocupacional"
      intro={
        "Esta ficha se completa en la primera atención de terapia ocupacional junto al tutor/a o al propio adolescente. Responda cada sección según lo que refiere la entrevista y lo que observa el terapeuta: datos personales, historial médico, motivo de consulta, antecedentes familiares, independencia funcional, hitos del desarrollo, áreas sensorial, física y cognitiva, lenguaje, conducta, interacción social, emociones, área académica, habituación, esparcimiento, volición y plan de intervención. Los campos con * son obligatorios."
      }
      secciones={SECCIONES}
      descargarInformePDF={descargarInformePDF}
      descargarInformeWord={descargarInformeWord}
      confirmacion="Gracias. La evaluación inicial Adolescencia se registró correctamente."
    />
  );
}
