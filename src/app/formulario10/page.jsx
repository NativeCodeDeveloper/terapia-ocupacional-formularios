"use client";

import CuestionarioInfante from "@/components/CuestionarioInfante";
import { descargarInformePDFInfante } from "@/lib/informe-infantil";

/* ============================================================
   INFANT SENSORY PROFILE 2 · NACIMIENTO A 6 MESES
   Cuestionario para padres o tutores (Winnie Dunn, Pearson).
   Ítems y cuadrantes transcritos del formulario oficial en
   español (producto 0158700082). Cuadrante: BU Buscador (SK),
   EV Evitativo (AV), SE Sensitivo (SN), RE Registro (RG) y
   null cuando el formulario no asigna cuadrante.
   ============================================================ */

const SECCIONES = [
  {
    titulo: "Procesamiento General",
    preguntas: [
      { texto: "Se queda quieto(a) y calmado(a) en un ambiente activo comparado(a) con otros bebés.", cuadrante: "RE" },
      { texto: "No se da cuenta de la gente que entra y sale de la habitación.", cuadrante: "RE" },
      { texto: "Necesita de la misma rutina para quedarse contento(a) y calmado(a).", cuadrante: "SE" },
      { texto: "Actúa en una forma que interfiere con los programas y planes de la familia.", cuadrante: null },
      { texto: "Necesita ayuda para poderse dormir.", cuadrante: "SE" },
      { texto: "Es irritable en comparación con otros bebés.", cuadrante: "SE" },
      { texto: "Duerme más que otros bebés.", cuadrante: null },
      { texto: "Solo me pone atención cuando lo(a) toco (a pesar de que puede oír bien).", cuadrante: "RE" },
    ],
  },
  {
    titulo: "Procesamiento Auditivo",
    preguntas: [
      { texto: "Disfruta de hacer sonidos con la boca (por ejemplo, hacer ruidos con los labios, murmullo o zumbido con la boca, tararear).", cuadrante: "BU" },
      { texto: "Me ignora cuando estoy hablando.", cuadrante: null },
      { texto: "Se altera con sonidos comunes, cuando son repentinos.", cuadrante: null },
      { texto: "Se pone más animado(a) e involucrado(a) en ambientes con música, voces o juguetes que suenan.", cuadrante: "BU" },
    ],
  },
  {
    titulo: "Procesamiento Visual",
    preguntas: [
      { texto: "Tiene muy poco contacto visual conmigo durante nuestras interacciones diarias.", cuadrante: "EV" },
      { texto: "Voltea al lado contrario de donde hay juguetes o caras.", cuadrante: "EV" },
      { texto: "Voltea hacia otro lado o se pone inquieto(a) en ambientes ruidosos o con juguetes ruidosos.", cuadrante: "EV" },
      { texto: "Parpadea mucho cuando las personas u objetos se le acercan a la cara.", cuadrante: "SE" },
    ],
  },
  {
    titulo: "Procesamiento Táctil",
    preguntas: [
      { texto: "Se disgusta cuando le cortan las uñas.", cuadrante: null },
      { texto: "Necesita estar envuelto(a) en cobijas o frazadas para relajarse.", cuadrante: "SE" },
      { texto: "Se sobresalta cuando siente diferencia en texturas (por ejemplo, pasto, alfombra, cobijas/frazadas).", cuadrante: "SE" },
    ],
  },
  {
    titulo: "Procesamiento de Movimiento",
    preguntas: [
      { texto: "Disfruta de las actividades rítmicas (por ejemplo, columpiarse, mecerse, paseos en automóvil).", cuadrante: "BU" },
      { texto: "Se resiste a tener la cabeza inclinada hacia atrás cuando lo(a) bañan.", cuadrante: "EV" },
      { texto: "Llora o se queja de movimientos cotidianos.", cuadrante: null },
      { texto: "Necesita de más soporte en la cabeza cuando lo(a) sostienen en comparación a otros bebés.", cuadrante: "RE" },
    ],
  },
  {
    titulo: "Procesamiento Sensorial Oral",
    preguntas: [
      { texto: "Tiene dificultad para cerrar la boca al tomar leche de pecho (mamar) o del biberón/mamila (por ejemplo, no se acopla bien al pecho o al biberón).", cuadrante: null },
      { texto: "Disfruta de hacer movimientos o sonidos con la boca.", cuadrante: "BU" },
    ],
  },
];

const DATOS = [
  { id: "dato-nombre", campo: "nombre", etiqueta: "Nombre del niño/a", tipo: "text", requerido: true },
  { id: "dato-sexo", campo: "sexo", etiqueta: "Sexo", tipo: "text", requerido: true },
  { id: "dato-fechaNacimiento", campo: "fechaNacimiento", etiqueta: "Fecha de Nacimiento", tipo: "date", requerido: true },
  { id: "dato-edadMeses", campo: "edadMeses", etiqueta: "Edad (en meses)", tipo: "number", requerido: true },
  { id: "dato-respondiente", campo: "respondiente", etiqueta: "Nombre de quien responde", tipo: "text", requerido: true },
  { id: "dato-relacion", campo: "relacion", etiqueta: "Relación con el niño/a", tipo: "text", requerido: true },
  { id: "dato-guarderia", campo: "guarderia", etiqueta: "Nombre de la guardería/sala cuna", tipo: "text", requerido: false },
  { id: "dato-examinador", campo: "examinador", etiqueta: "Nombre del/la Examinador(a)", tipo: "text", requerido: true },
  { id: "dato-profesion", campo: "profesion", etiqueta: "Profesión del/la Examinador(a)", tipo: "text", requerido: false },
  { id: "dato-prematuro", campo: "prematuro", etiqueta: "Nacimiento prematuro (semanas antes, si aplica)", tipo: "text", requerido: false },
];

export default function FormularioInfantSensoryProfile2() {
  return (
    <CuestionarioInfante
      marca="PERFIL SENSORIAL 2 INFANT"
      rango="Bebés 0 - 6 meses"
      instrumento="Perfil Sensorial 2 Infant · Bebés 0 - 6 meses"
      nombreArchivo="Informe-Perfil-Sensorial-2-Infant-0-6-meses"
      secciones={SECCIONES}
      datos={DATOS}
      intro={"Las páginas siguientes contienen enunciados que describen cómo se pueden comportar los bebés. Por favor lea cada frase y seleccione la opción que describe mejor qué tan seguido su bebé muestra estos comportamientos. Por favor marque una opción para cada enunciado."}
      notaEscala={null}
      edadMin={0}
      edadMax={6}
      descargarPDF={descargarInformePDFInfante}
      confirmacion={"Gracias. El cuestionario del Perfil Sensorial 2 Infant se completó correctamente."}
    />
  );
}
