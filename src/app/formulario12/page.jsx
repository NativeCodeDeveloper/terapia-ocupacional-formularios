"use client";

import CuestionarioPerfilSensorial from "@/components/CuestionarioPerfilSensorial";
import {
  calcularPuntuacionBreve,
  CUADRANTES,
  descargarInformePDFBreve,
} from "@/lib/informe-breve";

/* ============================================================
   PERFIL SENSORIAL 2 BREVE · 3:0 A 14:11 AÑOS
   Cuestionario breve para los padres o el cuidador (adaptación
   española de Pearson, 2016). Ítems y cuadrantes transcritos
   del formulario oficial en español. Cuadrante: BU Búsqueda/
   Buscador, EV Evitación/Evitativo, SE Sensibilidad/Sensitivo,
   RE Registro/Espectador (todos los ítems tienen cuadrante;
   el ítem 26 es EV según las tablas de cuadrantes de la pauta,
   aunque el escaneo muestra la insignia RE por un error de
   imprenta). Escala con No aplicable = 0 y clasificación de
   los 4 cuadrantes y las 2 secciones en la tabla de corte
   única 3:0-14:11 (Tabla 4.12 del manual).
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
    etiqueta: "CASI NUNCA O NUNCA",
    descripcion: "Responde de esta manera casi nunca o nunca (en el 10% o menos de los casos).",
    puntaje: 1,
  },
  {
    valor: "noAplicable",
    etiqueta: "NO APLICABLE",
    descripcion:
      "No puede contestar porque no se ha podido observar el comportamiento en el niño o no le es aplicable. Puntúa 0.",
    puntaje: 0,
  },
];

const SECCIONES = [
  {
    titulo: "Procesamiento Sensorial",
    preguntas: [
      { texto: "Le cuesta terminar las tareas cuando está puesta la música o la televisión.", cuadrante: "SE" },
      { texto: "Se distrae cuando hay mucho ruido a su alrededor.", cuadrante: "SE" },
      { texto: "No me hace caso o parece ignorarme.", cuadrante: "SE" },
      { texto: "Se muestra angustiado cuando lo arreglan (p. ej., pelea o llora cuando le cortan el pelo, le lavan la cara, le cortan las uñas).", cuadrante: "SE" },
      { texto: "Se pone nervioso cuando está de pie cerca de otras personas (p. ej., hacer cola).", cuadrante: "SE" },
      { texto: "Toca tanto a las personas o a las cosas que llega a molestar a los demás.", cuadrante: "BU" },
      { texto: "Se mueve tanto que afecta a sus actividades diarias (p. ej., no puede estar sentado sin moverse, quedarse quieto).", cuadrante: "BU" },
      { texto: "Se balancea mientras está sentado en la silla, en el suelo o de pie.", cuadrante: "BU" },
      { texto: "Pierde el equilibrio inesperadamente cuando camina por una superficie irregular.", cuadrante: "RE" },
      { texto: "Choca con las cosas, sin darse cuenta de los objetos o personas que hay en su camino.", cuadrante: "RE" },
      { texto: "Muestra una clara preferencia por ciertos sabores.", cuadrante: "BU" },
      { texto: "Se mueve con rigidez.", cuadrante: "RE" },
      { texto: "Se cansa fácilmente, en especial cuando está de pie o mantiene el cuerpo en una misma posición.", cuadrante: "RE" },
      { texto: "Se está echándose sobre los muebles o las personas.", cuadrante: "BU" },
    ],
  },
  {
    titulo: "Respuesta Conductual",
    preguntas: [
      { texto: "Parece propenso a tener accidentes.", cuadrante: "RE" },
      { texto: "Puede ser terco y poco dispuesto a colaborar.", cuadrante: "EV" },
      { texto: "Coge berrinches.", cuadrante: "EV" },
      { texto: "Se muestra reacio a tener contacto visual conmigo o con otras personas.", cuadrante: "EV" },
      { texto: "Requiere refuerzo positivo para volver a enfrentarse a los retos.", cuadrante: "EV" },
      { texto: "Tiene fuertes arrebatos emocionales cuando no puede terminar una tarea.", cuadrante: "EV" },
      { texto: "Le cuesta interpretar el lenguaje corporal o las expresiones faciales.", cuadrante: "SE" },
      { texto: "Se frustra fácilmente.", cuadrante: "EV" },
      { texto: "Tiene miedos que afectan a sus actividades diarias.", cuadrante: "EV" },
      { texto: "Se angustia cuando cambian los planes, las rutinas o las expectativas.", cuadrante: "EV" },
      { texto: "Necesita más protección en la vida que otros niños de su edad (p. ej., es indefenso física o emocionalmente).", cuadrante: "SE" },
      { texto: "Interactúa o participa menos en los grupos que otros niños de su edad.", cuadrante: "EV" },
      { texto: "Pierde el contacto visual conmigo cuando interactúo con él en el día a día.", cuadrante: "RE" },
      { texto: "Le cuesta prestar atención.", cuadrante: "SE" },
      { texto: "Aparta la mirada de sus tareas para observar lo que sucede a su alrededor.", cuadrante: "SE" },
      { texto: "Se muestra indiferente en ambientes con mucha actividad (p. ej., ajeno a todo lo que ocurre).", cuadrante: "RE" },
      { texto: "Observa a todas las personas que se mueven por la habitación.", cuadrante: "BU" },
      { texto: "Pasa de hacer una cosa a hacer otra, tanto que afecta a sus actividades.", cuadrante: "BU" },
      { texto: "Se pierde fácilmente.", cuadrante: "SE" },
      { texto: "Lo pasa mal cuando ha de buscar algo en un entorno complejo (p. ej., zapatos en una habitación desordenada, un lápiz en un cajón lleno de trastos).", cuadrante: "RE" },
    ],
  },
];

const DATOS = [
  { id: "dato-nombre", campo: "nombre", etiqueta: "Nombre del niño/a", tipo: "text", requerido: true },
  { id: "dato-apellidos", campo: "apellidos", etiqueta: "Apellidos", tipo: "text", requerido: false },
  { id: "dato-sexo", campo: "sexo", etiqueta: "Sexo", tipo: "text", requerido: true },
  { id: "dato-fechaNacimiento", campo: "fechaNacimiento", etiqueta: "Fecha de Nacimiento", tipo: "date", requerido: true },
  { id: "dato-edadAnos", campo: "edadAnos", etiqueta: "Edad (en años)", tipo: "number", requerido: true },
  { id: "dato-respondiente", campo: "respondiente", etiqueta: "Nombre de quien cumplimenta el cuestionario", tipo: "text", requerido: true },
  { id: "dato-relacion", campo: "relacion", etiqueta: "Relación con el niño/a", tipo: "text", requerido: true },
  { id: "dato-escuela", campo: "escuela", etiqueta: "Nombre de la escuela o centro", tipo: "text", requerido: false },
  { id: "dato-curso", campo: "curso", etiqueta: "Curso escolar", tipo: "text", requerido: false },
  { id: "dato-examinador", campo: "examinador", etiqueta: "Nombre del/la Examinador(a)", tipo: "text", requerido: true },
  { id: "dato-profesion", campo: "profesion", etiqueta: "Profesión del/la Examinador(a)", tipo: "text", requerido: false },
  { id: "dato-hermanos", campo: "hermanos", etiqueta: "Posición respecto a sus hermanos", tipo: "text", requerido: false },
];

export default function FormularioBreveSensoryProfile2() {
  return (
    <CuestionarioPerfilSensorial
      marca="PERFIL SENSORIAL 2 BREVE"
      rango="Niños 3:0 - 14:11 años"
      instrumento="Perfil Sensorial 2 Breve · Niños 3:0 - 14:11 años"
      nombreArchivo="Informe-Perfil-Sensorial-2-Breve-3-14-anos"
      secciones={SECCIONES}
      datos={DATOS}
      opciones={OPCIONES}
      autor="PERFIL SENSORIAL 2 BREVE · Winnie Dunn, PhD, OTR, FAOTA"
      fraseOpciones="Cuando se le presenta la oportunidad, el niño…"
      calcular={calcularPuntuacionBreve}
      cuadrantes={CUADRANTES}
      campoEdad="edadAnos"
      unidadEdad="años"
      intro={"Las páginas siguientes contienen afirmaciones sobre posibles comportamientos de los niños. Por favor, lea cada frase y seleccione la opción que describe mejor la frecuencia con que el niño muestra estos comportamientos. Marque la opción correspondiente a cada afirmación."}
      notaEscala={null}
      edadMin={3}
      edadMax={14}
      descargarPDF={descargarInformePDFBreve}
      confirmacion={"Gracias. El cuestionario del Perfil Sensorial 2 Breve se completó correctamente."}
    />
  );
}
