"use client";

import CuestionarioPerfilSensorial from "@/components/CuestionarioPerfilSensorial";
import {
  calcularPuntuacionEscolar,
  CUADRANTES,
  FACTORES,
  descargarInformePDFEscolar,
} from "@/lib/informe-escolar";

/* ============================================================
   PERFIL SENSORIAL 2 ESCOLAR · 3:0 A 14:11 AÑOS
   Cuestionario para el profesor (adaptación española de
   Pearson, 2016). Ítems, cuadrantes y factores escolares
   transcritos del formulario oficial en español. Cuadrante:
   BU Búsqueda/Buscador, EV Evitación/Evitativo,
   SE Sensibilidad/Sensitivo, RE Registro/Espectador; factor
   escolar F1 a F4. Los ítems con soloCuadrante (31 y 32 en
   Movimiento y 44 en Conductual) llevan * en la pauta: suman
   únicamente en su cuadrante y en su factor escolar, no en la
   puntuación directa de su sección. Escala con No aplicable
   = 0 y clasificación de los 4 cuadrantes, las 5 secciones y
   los 4 factores en la tabla de corte única 3:0-14:11 (en el
   Factor escolar 4 la banda «Mucho menos que los demás» no
   tiene puntuaciones disponibles).
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
      "No puede contestar porque no se ha podido observar el comportamiento en el alumno o no le es aplicable. Puntúa 0.",
    puntaje: 0,
  },
];

const SECCIONES = [
  {
    titulo: "Procesamiento Auditivo",
    preguntas: [
      { texto: "Se pierde intentando seguir las instrucciones orales más que otros alumnos de su edad.", cuadrante: "RE", factor: "F1" },
      { texto: "No me presta atención o parece ignorarme.", cuadrante: "RE", factor: "F1" },
      { texto: "Le cuesta terminar las tareas en ambientes ruidosos.", cuadrante: "RE", factor: "F3" },
      { texto: "Les dice a los demás que se callen.", cuadrante: "SE", factor: "F2" },
      { texto: "Se angustia en las actividades grupales, a la hora de comer o en otros actos colectivos.", cuadrante: "EV", factor: "F3" },
      { texto: "Reacciona intensamente a sonidos fuertes o inesperados (p. ej., alarma de incendio, libros que caen al suelo, portazos, avisos por megafonía, timbres).", cuadrante: "SE", factor: "F3" },
      { texto: "Tiene dificultad para participar en actividades de grupo cuando hay muchas personas hablando.", cuadrante: "SE", factor: "F3" },
    ],
  },
  {
    titulo: "Procesamiento Visual",
    preguntas: [
      { texto: "Se pierde intentando seguir las instrucciones escritas o las demostraciones más que otros alumnos de su edad.", cuadrante: "RE", factor: "F1" },
      { texto: "Le cuesta tener los materiales necesarios preparados para usarlos durante el día.", cuadrante: "RE", factor: "F1" },
      { texto: "Deja en blanco respuestas de una hoja llena de ejercicios a pesar de saberlas.", cuadrante: "RE", factor: "F1" },
      { texto: "Mira a las personas que se mueven por la habitación.", cuadrante: "BU", factor: "F2" },
      { texto: "Aparta la mirada de sus tareas para observar lo que sucede a su alrededor.", cuadrante: "SE", factor: "F2" },
      { texto: "Pierde el contacto visual conmigo cuando interactúo con él en el día a día.", cuadrante: "RE", factor: "F4" },
      { texto: "Le atraen las pantallas (TV, ordenador, móvil, etc.) con imágenes de colores vivos y en movimiento.", cuadrante: "BU", factor: "F2" },
    ],
  },
  {
    titulo: "Procesamiento Táctil",
    preguntas: [
      { texto: "Se acerca demasiado a las personas cuando hablan cara a cara.", cuadrante: "BU", factor: "F1" },
      { texto: "Parece no darse cuenta de que tiene las manos o la cara sucias.", cuadrante: "RE", factor: "F1" },
      { texto: "Toca tanto a las personas o las cosas que llega a molestar a los demás.", cuadrante: "BU", factor: "F1" },
      { texto: "Muestra la necesidad de tocar cosas, superficies o texturas (p. ej., quiere tocarlo todo).", cuadrante: "BU", factor: "F2" },
      { texto: "Quiere limpiarse las manos rápidamente cuando hace alguna tarea que ensucia.", cuadrante: "SE", factor: "F2" },
      { texto: "Se enfada con facilidad si se hace un poco de daño (p. ej., al golpearse con algo, hacerse un rasguño o cortarse).", cuadrante: "SE", factor: "F2" },
      { texto: "Usa sólo las puntas de los dedos al realizar tareas de manipulación.", cuadrante: "SE", factor: "F3" },
      { texto: "Se estremece o se aparta cuando alguien lo toca o se le acerca mucho.", cuadrante: "EV", factor: "F3" },
    ],
  },
  {
    titulo: "Procesamiento de Movimiento",
    preguntas: [
      { texto: "No sujeta adecuadamente los materiales cuando trabaja (p. ej., no sujeta la hoja de papel en la que escribe).", cuadrante: "RE", factor: "F4" },
      { texto: "Juega con las cosas o las toquetea (p. ej., lápices, libretas, carpetas).", cuadrante: "BU", factor: "F1" },
      { texto: "Está inquieto o molesta a los demás cuando está de pie en una fila o cerca de otras personas (p. ej., al ir en autobús, entrar en la escuela, estar sentado en reuniones escolares, actividades grupales, etc.).", cuadrante: "SE", factor: "F1" },
      { texto: "Se sienta incorrectamente en la silla (p. ej., repanchingado, curvado, medio tumbado).", cuadrante: "RE", factor: "F1" },
      { texto: "Choca con las cosas, sin darse cuenta de los objetos o personas que hay en su camino.", cuadrante: "RE", factor: "F1" },
      { texto: "No para quieto.", cuadrante: "BU", factor: "F1" },
      { texto: "Parece tener un sinfín de razones para dirigirse al profesor.", cuadrante: "BU", factor: "F2" },
      { texto: "Participa en las tareas o actividades físicamente activas con un ritmo más lento que otros alumnos de su edad.", cuadrante: "EV", factor: "F4" },
      { texto: "Está de pie o sentado a un lado del patio durante el recreo.*", cuadrante: "EV", factor: "F4", soloCuadrante: true },
      { texto: "Rechaza participar en los juegos de equipo (p. ej., fútbol, baloncesto).*", cuadrante: "EV", factor: "F4", soloCuadrante: true },
    ],
  },
  {
    titulo: "Respuesta Conductual",
    preguntas: [
      { texto: "Hace las cosas de una forma más complicada de lo necesario (p. ej., pierde el tiempo, se mueve lentamente).", cuadrante: "RE", factor: "F3" },
      { texto: "Parece cansado (p. ej., no tiene energía, está decaído).", cuadrante: "RE", factor: "F4" },
      { texto: "Podría decirse que reacciona de forma exagerada o dramática en comparación con otros alumnos de su edad.", cuadrante: "SE", factor: "F2" },
      { texto: "Carece de sentido del humor.", cuadrante: "EV", factor: "F4" },
      { texto: "Podría decirse que es inflexible en comparación con otros alumnos de su edad.", cuadrante: "EV", factor: "F4" },
      { texto: "Se angustia cuando cambian los planes, las rutinas o las expectativas.", cuadrante: "EV", factor: "F3" },
      { texto: "Puede ser terco y poco dispuesto a colaborar.", cuadrante: "SE", factor: "F3" },
      { texto: "Persevera en su conducta hasta el punto de afectar a la participación en actividades (p. ej., no es capaz de variar su velocidad o ritmo).", cuadrante: "EV", factor: "F3" },
      { texto: "Se retira cuando cambia el entorno o una rutina.", cuadrante: "EV", factor: "F3" },
      { texto: "Se frustra fácilmente.", cuadrante: "EV", factor: "F3" },
      { texto: "Interactúa o participa menos en los grupos que otros alumnos de su edad.", cuadrante: "EV", factor: "F4" },
      { texto: "Le molesta que no se cumplan las reglas.*", cuadrante: "SE", factor: "F2", soloCuadrante: true },
    ],
  },
];

const DATOS = [
  { id: "dato-nombre", campo: "nombre", etiqueta: "Nombre del alumno/a", tipo: "text", requerido: true },
  { id: "dato-apellidos", campo: "apellidos", etiqueta: "Apellidos", tipo: "text", requerido: false },
  { id: "dato-sexo", campo: "sexo", etiqueta: "Sexo", tipo: "text", requerido: true },
  { id: "dato-fechaNacimiento", campo: "fechaNacimiento", etiqueta: "Fecha de Nacimiento", tipo: "date", requerido: true },
  { id: "dato-edadAnos", campo: "edadAnos", etiqueta: "Edad (en años)", tipo: "number", requerido: true },
  { id: "dato-examinador", campo: "examinador", etiqueta: "Nombre del/la Examinador(a)", tipo: "text", requerido: true },
  { id: "dato-profesion", campo: "profesion", etiqueta: "Profesión del/la Examinador(a)", tipo: "text", requerido: false },
  { id: "dato-profesor", campo: "profesor", etiqueta: "Nombre del profesor/a que responde", tipo: "text", requerido: true },
  { id: "dato-escuela", campo: "escuela", etiqueta: "Nombre de la escuela", tipo: "text", requerido: false },
  { id: "dato-curso", campo: "curso", etiqueta: "Curso escolar", tipo: "text", requerido: false },
  { id: "dato-frecuencia", campo: "frecuenciaContacto", etiqueta: "Frecuencia de contacto con el alumno/a", tipo: "text", requerido: true },
  { id: "dato-anosContacto", campo: "anosContacto", etiqueta: "Años de contacto con el alumno/a", tipo: "text", requerido: false },
];

export default function FormularioEscolarSensoryProfile2() {
  return (
    <CuestionarioPerfilSensorial
      marca="PERFIL SENSORIAL 2 ESCOLAR"
      rango="Alumnos 3:0 - 14:11 años"
      instrumento="Perfil Sensorial 2 Escolar · Cuestionario para el profesor · Alumnos 3:0 - 14:11 años"
      nombreArchivo="Informe-Perfil-Sensorial-2-Escolar-3-14-anos"
      secciones={SECCIONES}
      datos={DATOS}
      opciones={OPCIONES}
      autor="PERFIL SENSORIAL 2 ESCOLAR · Cuestionario para el profesor · Winnie Dunn, PhD, OTR, FAOTA"
      fraseOpciones="Cuando se le presenta la oportunidad, el alumno…"
      calcular={calcularPuntuacionEscolar}
      cuadrantes={CUADRANTES}
      factores={FACTORES}
      campoEdad="edadAnos"
      unidadEdad="años"
      intro={"Las páginas siguientes contienen afirmaciones sobre posibles comportamientos de los alumnos. Por favor, lea cada frase y seleccione la opción que describe mejor la frecuencia en que el alumno muestra estos comportamientos. Marque con una X la opción correspondiente a cada afirmación."}
      notaEscala={null}
      edadMin={3}
      edadMax={14}
      descargarPDF={descargarInformePDFEscolar}
      confirmacion={"Gracias. El cuestionario del Perfil Sensorial 2 Escolar se completó correctamente."}
    />
  );
}
