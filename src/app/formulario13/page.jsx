"use client";

import CuestionarioPerfilSensorial from "@/components/CuestionarioPerfilSensorial";
import {
  calcularPuntuacionNino,
  CUADRANTES,
  descargarInformePDFNino,
} from "@/lib/informe-nino";

/* ============================================================
   PERFIL SENSORIAL 2 NIÑO · 3:0 A 14:11 AÑOS
   Cuestionario para los padres o el cuidador (adaptación
   española de Pearson, 2016). Ítems y cuadrantes transcritos
   del formulario oficial en español. Cuadrante: BU Búsqueda/
   Buscador, EV Evitación/Evitativo, SE Sensibilidad/Sensitivo,
   RE Registro/Espectador y null cuando el formulario no asigna
   cuadrante. Los ítems con soloCuadrante (15 en Visual y 86 en
   Atencional) llevan * en la pauta: suman únicamente en su
   cuadrante, no en la puntuación directa de su sección. Escala
   con No aplicable = 0 y clasificación de los 4 cuadrantes y
   las 9 secciones en la tabla de corte única 3:0-14:11.
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
    titulo: "Procesamiento Auditivo",
    preguntas: [
      { texto: "Reacciona intensamente a sonidos fuertes o inesperados (p. ej., sirena, ladridos de perro, secador de pelo).", cuadrante: "EV" },
      { texto: "Se tapa los oídos con las manos para protegerlos de los sonidos.", cuadrante: "EV" },
      { texto: "Le cuesta terminar las tareas cuando está puesta la música o la televisión.", cuadrante: "SE" },
      { texto: "Se distrae cuando hay mucho ruido a su alrededor.", cuadrante: "SE" },
      { texto: "Rinde poco cuando hay ruido ambiental (p. ej., ventilador, frigorífico).", cuadrante: "EV" },
      { texto: "No me hace caso o parece ignorarme.", cuadrante: "SE" },
      { texto: "Parece que no oye cuando lo llamo por su nombre (aunque oye bien).", cuadrante: "SE" },
      { texto: "Disfruta con los ruidos extraños o hace ruidos por diversión.", cuadrante: "RE" },
    ],
  },
  {
    titulo: "Procesamiento Visual",
    preguntas: [
      { texto: "Prefiere jugar o trabajar con poca luz.", cuadrante: "SE" },
      { texto: "Prefiere ropa de colores vivos o estampada.", cuadrante: null },
      { texto: "Disfruta observando los detalles de los objetos.", cuadrante: null },
      { texto: "Necesita ayuda para encontrar objetos que son evidentes para otras personas.", cuadrante: "RE" },
      { texto: "Le molestan las luces brillantes más que a otros niños de su edad.", cuadrante: "SE" },
      { texto: "Mira a las personas que se mueven por la habitación.", cuadrante: "BU" },
      { texto: "Le molestan las luces brillantes (p. ej., se esconde de la luz que entra por la ventana del coche).", cuadrante: "EV", soloCuadrante: true },
    ],
  },
  {
    titulo: "Procesamiento Táctil",
    preguntas: [
      { texto: "Se muestra angustiado cuando lo arreglan (p. ej., pelea o llora cuando le cortan el pelo, le lavan la cara, le cortan las uñas).", cuadrante: "SE" },
      { texto: "Se irrita por tener que llevar zapatos o calcetines.", cuadrante: null },
      { texto: "Reacciona impulsiva o agresivamente cuando alguien lo toca.", cuadrante: "EV" },
      { texto: "Se pone nervioso cuando está de pie cerca de otras personas (p. ej., hacer cola).", cuadrante: "SE" },
      { texto: "Se frota o rasca la parte del cuerpo que alguien le ha tocado.", cuadrante: "SE" },
      { texto: "Toca tanto a las personas o a las cosas que llega a molestar a los demás.", cuadrante: "BU" },
      { texto: "Muestra la necesidad de tocar juguetes, superficies o texturas (p. ej., quiere tocarlo todo).", cuadrante: "BU" },
      { texto: "Parece no darse cuenta del dolor.", cuadrante: "RE" },
      { texto: "Parece no darse cuenta de los cambios de temperatura.", cuadrante: "RE" },
      { texto: "Toca a las personas o a las cosas más que otros niños de su edad.", cuadrante: "BU" },
      { texto: "Parece no darse cuenta de que tiene las manos o la cara sucias.", cuadrante: "RE" },
    ],
  },
  {
    titulo: "Procesamiento de Movimiento",
    preguntas: [
      { texto: "Se mueve tanto que afecta a sus actividades diarias (p. ej., no puede estar sentado sin moverse, quedarse quieto).", cuadrante: "BU" },
      { texto: "Se balancea mientras está sentado en la silla, en el suelo o de pie.", cuadrante: "BU" },
      { texto: "Vacila al subir o bajar aceras o escaleras (p. ej., es cauteloso, se detiene antes de moverse).", cuadrante: null },
      { texto: "Se muestra entusiasmado mientras realiza tareas que implican movimiento.", cuadrante: "BU" },
      { texto: "Realiza movimientos o trepa de manera arriesgada y peligrosa.", cuadrante: "BU" },
      { texto: "Busca oportunidades para caerse sin tener en cuenta su seguridad (p. ej., se tira al suelo a propósito).", cuadrante: "BU" },
      { texto: "Pierde el equilibrio inesperadamente cuando camina por una superficie irregular.", cuadrante: "RE" },
      { texto: "Choca con las cosas, sin darse cuenta de los objetos o personas que hay en su camino.", cuadrante: "RE" },
    ],
  },
  {
    titulo: "Procesamiento Corporal",
    preguntas: [
      { texto: "Se mueve con rigidez.", cuadrante: "RE" },
      { texto: "Se cansa fácilmente, en especial cuando está de pie o mantiene el cuerpo en una misma posición.", cuadrante: "RE" },
      { texto: "Parece tener músculos débiles.", cuadrante: "RE" },
      { texto: "Se apoya para sostenerse (p. ej., sostiene la cabeza con las manos, se apoya en una pared).", cuadrante: "RE" },
      { texto: "Se agarra a cosas, paredes o barandillas más que otros niños de su edad.", cuadrante: "RE" },
      { texto: "Camina haciendo ruido, como si le pesaran los pies.", cuadrante: "RE" },
      { texto: "Se está echándose sobre los muebles o las personas.", cuadrante: "BU" },
      { texto: "Necesita mantas gruesas para dormir.", cuadrante: null },
    ],
  },
  {
    titulo: "Procesamiento Sensorial Oral",
    preguntas: [
      { texto: "Tiene arcadas fácilmente con determinadas texturas de los alimentos o al ponerse los cubiertos en la boca.", cuadrante: null },
      { texto: "Rechaza ciertos sabores u olores de alimentos que son habituales en la dieta infantil.", cuadrante: "SE" },
      { texto: "Solo toma comidas con ciertos sabores (p. ej., dulce, salado).", cuadrante: "SE" },
      { texto: "Se limita a determinadas texturas de los alimentos.", cuadrante: "SE" },
      { texto: "Es escrupuloso con la comida, en especial con las texturas de los alimentos.", cuadrante: "SE" },
      { texto: "Huele cosas que no son comida.", cuadrante: "BU" },
      { texto: "Muestra una clara preferencia por ciertos sabores.", cuadrante: "BU" },
      { texto: "Tiene antojos de ciertos alimentos, sabores u olores.", cuadrante: "BU" },
      { texto: "Se mete cosas en la boca (p. ej., lápiz, manos).", cuadrante: "BU" },
      { texto: "Se muerde más la lengua o los labios que otros niños de su edad.", cuadrante: "SE" },
    ],
  },
  {
    titulo: "Respuesta Conductual",
    preguntas: [
      { texto: "Parece propenso a tener accidentes.", cuadrante: "RE" },
      { texto: "Pinta, escribe o dibuja apresuradamente.", cuadrante: "RE" },
      { texto: "Corre riesgos excesivos (p. ej., trepa hasta lo alto de un árbol, salta desde un mueble alto) que comprometen su seguridad.", cuadrante: "BU" },
      { texto: "Parece más activo que otros niños de su edad.", cuadrante: "BU" },
      { texto: "Hace las cosas de una forma más complicada de lo necesario (p. ej., pierde el tiempo, se mueve lentamente).", cuadrante: "RE" },
      { texto: "Puede ser terco y poco dispuesto a colaborar.", cuadrante: "EV" },
      { texto: "Coge berrinches.", cuadrante: "EV" },
      { texto: "Parece que disfruta cuando se cae.", cuadrante: "BU" },
      { texto: "Se muestra reacio a tener contacto visual conmigo o con otras personas.", cuadrante: "EV" },
    ],
  },
  {
    titulo: "Respuesta Socioemocional",
    preguntas: [
      { texto: "Parece que tiene la autoestima baja (p. ej., dificultad para sentirse bien consigo mismo).", cuadrante: "RE" },
      { texto: "Requiere refuerzo positivo para volver a enfrentarse a los retos.", cuadrante: "EV" },
      { texto: "Es sensible a las críticas.", cuadrante: "EV" },
      { texto: "Tiene miedos explícitos y previsibles.", cuadrante: "EV" },
      { texto: "Manifiesta que se siente un fracasado.", cuadrante: "EV" },
      { texto: "Es muy serio.", cuadrante: "EV" },
      { texto: "Tiene fuertes arrebatos emocionales cuando no puede terminar una tarea.", cuadrante: "EV" },
      { texto: "Le cuesta interpretar el lenguaje corporal o las expresiones faciales.", cuadrante: "SE" },
      { texto: "Se frustra fácilmente.", cuadrante: "EV" },
      { texto: "Tiene miedos que afectan a sus actividades diarias.", cuadrante: "EV" },
      { texto: "Se angustia cuando cambian los planes, las rutinas o las expectativas.", cuadrante: "EV" },
      { texto: "Necesita más protección en la vida que otros niños de su edad (p. ej., es indefenso física o emocionalmente).", cuadrante: "SE" },
      { texto: "Interactúa o participa menos en los grupos que otros niños de su edad.", cuadrante: "EV" },
      { texto: "Tiene dificultades con las amistades (p. ej., hacer o conservar amigos).", cuadrante: "EV" },
    ],
  },
  {
    titulo: "Respuesta Atencional",
    preguntas: [
      { texto: "Pierde el contacto visual conmigo cuando interactúo con él en el día a día.", cuadrante: "RE" },
      { texto: "Le cuesta prestar atención.", cuadrante: "SE" },
      { texto: "Aparta la mirada de sus tareas para observar lo que sucede a su alrededor.", cuadrante: "SE" },
      { texto: "Se muestra indiferente en ambientes con mucha actividad (p. ej., ajeno a todo lo que ocurre).", cuadrante: "RE" },
      { texto: "Mira muy fijamente las cosas.", cuadrante: "RE" },
      { texto: "Mira muy fijamente a las personas.", cuadrante: "EV" },
      { texto: "Observa a todas las personas que se mueven por la habitación.", cuadrante: "BU" },
      { texto: "Pasa de hacer una cosa a hacer otra, tanto que afecta a sus actividades.", cuadrante: "BU" },
      { texto: "Se pierde fácilmente.", cuadrante: "SE" },
      { texto: "Lo pasa mal cuando ha de buscar algo en un entorno complejo (p. ej., zapatos en una habitación desordenada, un lápiz en un cajón lleno de trastos).", cuadrante: "RE" },
      { texto: "Parece no darse cuenta de que alguien entra en la habitación.", cuadrante: "RE", soloCuadrante: true },
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

export default function FormularioNinoSensoryProfile2() {
  return (
    <CuestionarioPerfilSensorial
      marca="PERFIL SENSORIAL 2 NIÑO"
      rango="Niños 3:0 - 14:11 años"
      instrumento="Perfil Sensorial 2 Niño · Niños 3:0 - 14:11 años"
      nombreArchivo="Informe-Perfil-Sensorial-2-Nino-3-14-anos"
      secciones={SECCIONES}
      datos={DATOS}
      opciones={OPCIONES}
      autor="PERFIL SENSORIAL 2 NIÑO · Winnie Dunn, PhD, OTR, FAOTA"
      fraseOpciones="Cuando se le presenta la oportunidad, el niño…"
      calcular={calcularPuntuacionNino}
      cuadrantes={CUADRANTES}
      campoEdad="edadAnos"
      unidadEdad="años"
      intro={"Las páginas siguientes contienen afirmaciones sobre posibles comportamientos de los niños. Por favor, lea cada frase y seleccione la opción que describe mejor la frecuencia con que el niño muestra estos comportamientos. Marque la opción correspondiente a cada afirmación."}
      notaEscala={null}
      edadMin={3}
      edadMax={14}
      descargarPDF={descargarInformePDFNino}
      confirmacion={"Gracias. El cuestionario del Perfil Sensorial 2 Niño se completó correctamente."}
    />
  );
}
