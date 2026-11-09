"use client";

import CuestionarioPerfilSensorial from "@/components/CuestionarioPerfilSensorial";
import {
  calcularPuntuacionToddler,
  CUADRANTES,
  descargarInformePDFToddler,
} from "@/lib/informe-toddler";

/* ============================================================
   TODDLER SENSORY PROFILE 2 · 7 A 35 MESES
   Cuestionario para padres o tutores (Winnie Dunn, Pearson).
   Ítems y cuadrantes transcritos del formulario oficial en
   español (7 a 35 meses). Cuadrante: BU Búsqueda/Buscador,
   EV Evitación/Evitativo, SE Sensibilidad/Sensitivo, RE
   Registro/Espectador y null cuando el formulario no asigna
   cuadrante. La escala tiene cinco opciones (sin No aplicable)
   y cada cuadrante y sección se clasifica en la tabla de corte.
   ============================================================ */

const OPCIONES = [
  {
    valor: "casiSiempre",
    etiqueta: "CASI SIEMPRE O SIEMPRE",
    descripcion: "Responde de esta manera casi siempre o siempre (en el 90% o más de los casos).",
    puntaje: 5,
  },
  {
    valor: "frecuentemente",
    etiqueta: "FRECUENTEMENTE",
    descripcion: "Responde de esta manera frecuentemente (en el 75% de los casos).",
    puntaje: 4,
  },
  {
    valor: "laMitad",
    etiqueta: "LA MITAD DE LAS VECES",
    descripcion: "Responde de esta manera la mitad de las veces (en el 50% de los casos).",
    puntaje: 3,
  },
  {
    valor: "ocasionalmente",
    etiqueta: "OCASIONALMENTE",
    descripcion: "Responde de esta manera ocasionalmente (en el 25% de los casos).",
    puntaje: 2,
  },
  {
    valor: "casiNunca",
    etiqueta: "CASI NUNCA",
    descripcion: "Responde de esta manera casi nunca (en el 10% o menos de los casos).",
    puntaje: 1,
  },
];

const SECCIONES = [
  {
    titulo: "Procesamiento General",
    preguntas: [
      { texto: "Necesita una rutina para quedarse contento(a) o calmado(a).", cuadrante: "SE" },
      { texto: "Actúa en una forma que interfiere con los programas y planes de la familia.", cuadrante: "SE" },
      { texto: "Se resiste a jugar con otros niños(as).", cuadrante: "EV" },
      { texto: "Toma más tiempo que otros niños(as) de su misma edad para responder a preguntas o acciones.", cuadrante: null },
      { texto: "Se retira de situaciones.", cuadrante: null },
      { texto: "Tiene un patrón de sueño impredecible.", cuadrante: null },
      { texto: "Tiene un patrón impredecible para comer.", cuadrante: null },
      { texto: "Se despierta fácilmente.", cuadrante: null },
      { texto: "Tiene muy poco contacto visual conmigo durante nuestras interacciones diarias.", cuadrante: "RE" },
      { texto: "Se pone ansioso(a) ante situaciones nuevas.", cuadrante: "EV" },
    ],
  },
  {
    titulo: "Procesamiento Auditivo",
    preguntas: [
      { texto: "Solo me pone atención cuando le hablo en voz alta.", cuadrante: "RE" },
      { texto: "Solo me pone atención cuando lo(a) toco (a pesar de que puede oír bien).", cuadrante: "RE" },
      { texto: "Se sobresalta con el ruido más fácilmente que otros niños(as) de su edad (por ejemplo, perros ladrando, niños(as) gritando).", cuadrante: "SE" },
      { texto: "Se distrae en ambientes ruidosos.", cuadrante: "RE" },
      { texto: "Ignora los sonidos, incluyendo mi voz.", cuadrante: "RE" },
      { texto: "Se disgusta o trata de escapar de los ambientes ruidosos.", cuadrante: "SE" },
      { texto: "Toma mucho tiempo para responder cuando le llaman por su nombre.", cuadrante: null },
    ],
  },
  {
    titulo: "Procesamiento Visual",
    preguntas: [
      { texto: "Disfruta viendo objetos que se mueven o giran (por ejemplo, abanicos de techo, juguetes con ruedas).", cuadrante: "BU" },
      { texto: "Disfruta viendo objetos brillantes.", cuadrante: "BU" },
      { texto: "Tiene atracción por las pantallas de televisión o computador con gráficas brillantes de colores y con movimientos rápidos.", cuadrante: "BU" },
      { texto: "Se sobresalta con la luz brillante o impredecible (por ejemplo, al salir del interior al exterior).", cuadrante: null },
      { texto: "Le molestan las luces brillantes (por ejemplo, se esconde de la luz del sol que entra por la ventana del automóvil).", cuadrante: null },
      { texto: "Le molestan las luces brillantes más que a otros niños(as) de su misma edad.", cuadrante: "RE" },
      { texto: "Empuja los juguetes de colores brillantes alejándolos de él(ella).", cuadrante: "RE" },
      { texto: "Falla en responder a sí mismo(a) en el espejo.", cuadrante: "RE" },
    ],
  },
  {
    titulo: "Procesamiento Táctil",
    preguntas: [
      { texto: "Se disgusta cuando le cortan las uñas.", cuadrante: "SE" },
      { texto: "Se resiste a que lo(a) abracen.", cuadrante: "EV" },
      { texto: "Se disgusta cuando se mueve entre lugares con temperaturas muy diferentes (por ejemplo, más frío, más caliente).", cuadrante: "EV" },
      { texto: "Se aleja de superficies ásperas, frías o pegajosas para no hacer contacto con ellas (por ejemplo, alfombra, mesa).", cuadrante: "EV" },
      { texto: "Choca con las cosas, sin darse cuenta de los objetos o personas que están en su camino.", cuadrante: "RE" },
      { texto: "Se jalonea la ropa o se resiste a que lo(a) vistan.", cuadrante: "SE" },
      { texto: "Disfruta de salpicar agua durante el baño o cuando nada.", cuadrante: "BU" },
      { texto: "Se disgusta si su ropa, manos o cara están sucias.", cuadrante: "EV" },
      { texto: "Se pone ansioso(a) cuando camina o gatea en ciertas superficies (por ejemplo, pasto, arena, alfombra, mosaico).", cuadrante: "SE" },
      { texto: "Se aparta si lo(a) tocan inesperadamente.", cuadrante: "EV" },
    ],
  },
  {
    titulo: "Procesamiento de Movimiento",
    preguntas: [
      { texto: "Disfruta de las actividades físicas (por ejemplo, saltar, que lo(a) levanten en el aire).", cuadrante: "BU" },
      { texto: "Disfruta de las actividades rítmicas (por ejemplo, columpiarse, mecerse, paseos en automóvil).", cuadrante: "BU" },
      { texto: "Toma riesgos al trepar/escalar o hacer movimientos.", cuadrante: "BU" },
      { texto: "Se disgusta cuando lo(a) ponen de espalda (por ejemplo, para cambiarle los pañales).", cuadrante: "SE" },
      { texto: "Parece torpe o propenso(a) a los accidentes.", cuadrante: "RE" },
      { texto: "Se queja cuando lo(a) mueven (por ejemplo, hacerlo(a) caminar, cuando lo(a) pasan de una persona a otra).", cuadrante: "SE" },
    ],
  },
  {
    titulo: "Procesamiento Sensorial Oral",
    preguntas: [
      { texto: "Muestra un claro disgusto a toda clase de comida con la excepción de unos cuantos alimentos.", cuadrante: "EV" },
      { texto: "Babea.", cuadrante: null },
      { texto: "Prefiere una textura particular de comida (por ejemplo, suave, crujiente).", cuadrante: "SE" },
      { texto: "Toma líquidos para calmarse a sí mismo(a).", cuadrante: "RE" },
      { texto: "Tiene el reflejo de vómito con la comida o bebida.", cuadrante: "SE" },
      { texto: "Detiene la comida en los cachetes antes de tragar.", cuadrante: null },
      { texto: "Le cuesta trabajo acostumbrarse a la comida con pedazos sólidos.", cuadrante: "SE" },
    ],
  },
  {
    titulo: "Respuestas de Comportamiento asociadas con el procesamiento sensorial",
    preguntas: [
      { texto: "Hace berrinches.", cuadrante: "EV" },
      { texto: "Es muy apegado(a) a mí.", cuadrante: null },
      { texto: "Permanece calmado(a) solo cuando lo(a) sostienen.", cuadrante: null },
      { texto: "Es quejumbroso(a) o irritable.", cuadrante: "SE" },
      { texto: "Le molestan los ambientes nuevos.", cuadrante: "EV" },
      { texto: "Se pone tan disgustado(a) en ambientes nuevos que le cuesta trabajo calmarse.", cuadrante: "EV" },
    ],
  },
];

const DATOS = [
  { id: "dato-nombre", campo: "nombre", etiqueta: "Nombre del niño/a", tipo: "text", requerido: true },
  { id: "dato-apellidos", campo: "apellidos", etiqueta: "Apellidos", tipo: "text", requerido: false },
  { id: "dato-nombrePreferido", campo: "nombrePreferido", etiqueta: "Nombre preferido del niño/a (si es diferente)", tipo: "text", requerido: false },
  { id: "dato-sexo", campo: "sexo", etiqueta: "Sexo", tipo: "text", requerido: true },
  { id: "dato-fechaNacimiento", campo: "fechaNacimiento", etiqueta: "Fecha de Nacimiento", tipo: "date", requerido: true },
  { id: "dato-edadMeses", campo: "edadMeses", etiqueta: "Edad (en meses)", tipo: "number", requerido: true },
  { id: "dato-respondiente", campo: "respondiente", etiqueta: "Nombre de quien llenó la forma", tipo: "text", requerido: true },
  { id: "dato-relacion", campo: "relacion", etiqueta: "Relación con el niño/a", tipo: "text", requerido: true },
  { id: "dato-guarderia", campo: "guarderia", etiqueta: "Nombre de la guardería", tipo: "text", requerido: false },
  { id: "dato-examinador", campo: "examinador", etiqueta: "Nombre del/la Examinador(a)", tipo: "text", requerido: true },
  { id: "dato-profesion", campo: "profesion", etiqueta: "Profesión del/la Examinador(a)", tipo: "text", requerido: false },
  { id: "dato-prematuro", campo: "prematuro", etiqueta: "Nacimiento prematuro (semanas antes, si aplica)", tipo: "text", requerido: false },
];

export default function FormularioToddlerSensoryProfile2() {
  return (
    <CuestionarioPerfilSensorial
      marca="PERFIL SENSORIAL 2 TODDLER"
      rango="Niños 7 - 35 meses"
      instrumento="Perfil Sensorial 2 Toddler · Niños 7 - 35 meses"
      nombreArchivo="Informe-Perfil-Sensorial-2-Toddler-7-35-meses"
      secciones={SECCIONES}
      datos={DATOS}
      opciones={OPCIONES}
      autor="TODDLER SENSORY PROFILE 2 · Winnie Dunn, PhD, OTR, FAOTA"
      fraseOpciones="Cuando se le presenta la oportunidad, mi niño(a)…"
      calcular={calcularPuntuacionToddler}
      cuadrantes={CUADRANTES}
      intro={"Las páginas siguientes contienen enunciados que describen cómo se pueden comportar los niños. Por favor, lea cada frase y seleccione la opción que describe mejor qué tan seguido su niño(a) muestra estos comportamientos. Por favor marque una opción para cada enunciado."}
      notaEscala={null}
      edadMin={7}
      edadMax={35}
      descargarPDF={descargarInformePDFToddler}
      confirmacion={"Gracias. El cuestionario del Perfil Sensorial 2 Toddler se completó correctamente."}
    />
  );
}
