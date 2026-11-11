"use client";

import CuestionarioEvaluacionInicial from "@/components/CuestionarioEvaluacionInicial";
import {
  SECCIONES,
  descargarInformePDF,
  descargarInformeWord,
} from "@/lib/informe-ei-adulto";

/* ============================================================
   EVALUACIÓN INICIAL DE TERAPIA OCUPACIONAL · ADULTO
   Ficha digital de la primera atención adulta (pestaña ADULTO
   del formulario NIÑO - ADOLESCENTE - ADULTO - PERSONA MAYOR de
   TeraOcupame). El esquema de secciones, la síntesis
   automatizada y la descarga del informe viven en
   src/lib/informe-ei-adulto.js, transcritos de la pauta
   impresa: datos personales, historial médico, motivo de
   consulta, antecedentes familiares, independencia funcional
   básica e instrumental, área física, otras consideraciones,
   salud mental, área cognitiva, lenguaje, participación social,
   habituación, esparcimiento, volición y plan de intervención.
   Se responde junto a la propia persona y con la observación
   del terapeuta durante la entrevista.
   ============================================================ */

export default function FormularioEvaluacionInicialAdulto() {
  return (
    <CuestionarioEvaluacionInicial
      marca="EVALUACIÓN INICIAL · ADULTO"
      rango="Adulto · entrevista y autoinforme"
      instrumento="Evaluación inicial de terapia ocupacional"
      intro={
        "Ficha de evaluación inicial (primera atención) de terapia ocupacional para personas adultas. " +
        "Se completa junto a la propia persona: cada pregunta se responde con sus palabras y con lo que el " +
        "terapeuta observa durante la entrevista. Complete las secciones en orden y revise la síntesis " +
        "automatizada antes de descargar el informe PDF."
      }
      secciones={SECCIONES}
      descargarInformePDF={descargarInformePDF}
      descargarInformeWord={descargarInformeWord}
      confirmacion="Gracias. La evaluación inicial Adulto se registró correctamente."
    />
  );
}
