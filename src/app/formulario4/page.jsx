"use client";

import CuestionarioSPM2 from "@/components/CuestionarioSPM2";
import { descargarInformePDFAutoReporteAdolescente } from "@/lib/informe-autoreporte-adolescente";

/* ============================================================
   SPM-2 · AUTOINFORME ADOLESCENTE 12-21 (Self-Report Form)
   Ítems transcritos del formulario oficial WPS en español
   "Adolescent AutoScore Form · Self-Report Form · Ages 12-21
   years · SPANISH" (W-707G). 80 ítems: la Participación Social
   (71-80) invierte 71-74 y 77 según su Scoring Worksheet.
   ============================================================ */

const SECCIONES = [
  {
    titulo: "VISIÓN",
    preguntas: [
      "Yo me abrumo o me distraigo en las tiendas por todas las cosas que se ven en las vitrinas.",
      "La luz brillante me fastidia.",
      "Yo me tropiezo con las cosas o con la gente porque no me doy cuenta de que están a mi paso.",
      "Las luces que parpadean me fastidian.",
      "Yo me distraigo por cosas que veo cerca de mí como objetos en la pared o gente moviéndose alrededor.",
      "Yo tengo problemas para encontrar objetos en un estante.",
      "Yo tengo problemas para percibir los letreros de las calles o las señales de tránsito cuando estoy en un lugar nuevo.",
      "Yo pierdo mi lugar cuando muevo la vista de un sitio a otro, por ejemplo copiando lo de la pizarra al escritorio o leyendo de una línea de texto a la siguiente.",
      "Yo tengo dificultad para juzgar la velocidad de autos que se acercan.",
      "Yo tengo dificultad para entender información en forma visual como los diagramas y los mapas.",
    ],
  },
  {
    titulo: "OÍDO",
    preguntas: [
      "Los sonidos fuertes, como el de una aspiradora o de una máquina de cortar el césped, me molestan tanto que quiero irme del sitio o taparme los oídos.",
      "Me gusta hacer ciertos sonidos repetidamente como tararear, cantar, o gritar.",
      "Yo evito los lugares donde hay música o ruido fuerte.",
      "Yo tengo dificultad para determinar de donde provienen los sonidos o las voces.",
      "Yo tengo dificultad para enfocarme en una película cuando hay ruidos cerca como el de gente abriendo los envases de comida.",
      "Los sonidos agudos, como los de silbatos o aparatos para hacer bulla en las fiestas, me molestan.",
      "Yo noto sonidos que los demás no notan.",
      "La gente me dice que yo no les oigo cuando llaman mi nombre.",
      "Yo me distraigo fácilmente con ruidos sutiles en el ambiente como el ruido del aire acondicionado o del refrigerador.",
      "Los sonidos fuertes o inesperados me hacen sobresaltar fácilmente.",
    ],
  },
  {
    titulo: "TACTO",
    preguntas: [
      "Las comidas que tienen ciertas texturas me disgustan.",
      "Yo tengo dificultad para encontrar cosas en un bolsillo, una bolsa, o una mochila sin mirar.",
      "La sensación de ciertas ropas me disgusta.",
      "Otros tienen que decirme cuando yo necesito limpiarme algo de la cara porque yo no me doy cuenta de eso.",
      "No me gusta lo que siento al cortarme las uñas de las manos o de los pies.",
      "Las sensaciones que tengo al cepillarme los dientes me hacen tener arcadas.",
      "La comida tiene que estar exactamente a la temperatura correcta para que yo me la coma.",
      "Yo tengo dificultad para sentir cuando mi ropa, como por ejemplo mi camisa, se ha enrollado en mi cuerpo.",
      "Yo toso porque tengo problemas para sentir la comida o los líquidos deslizarse por mi garganta.",
      "Yo tengo dificultad dándome cuenta que algo está demasiado caliente y me quemo por accidente.",
    ],
  },
  {
    titulo: "GUSTO Y OLFATO",
    preguntas: [
      "No me gusta probar comidas nuevas.",
      "Los sabores de ciertas comidas me disgustan.",
      "Cuando me encuentro con algo nuevo, me gusta olerlo.",
      "Yo noto fragancias u olores que otros no notan.",
      "Yo evito estar con grupos de gente en sitios encerrados, como en los ascensores o en habitaciones atestadas, debido al olor.",
      "No me gusta comer en restaurantes debido a los diferentes olores y sabores.",
      "Yo evito las comidas que tengan un sabor o un olor fuerte.",
      "Pensar en los olores de comida que no me gusta me hace tener arcadas.",
      "Los olores de ciertas comidas me molestan o me disgustan.",
      "Me fastidian olores que a los demás no les molestan.",
    ],
  },
  {
    titulo: "CONCIENCIA DEL CUERPO",
    preguntas: [
      "Yo tiendo a usar demasiada presión para la tarea que estoy haciendo, por ejemplo rompo las puntas de los lápices al escribir.",
      "Yo muerdo cosas como los lápices o la ropa repetidamente.",
      "Yo tiro la pelota con demasiada o con muy poca fuerza para embocarla.",
      "Yo tiendo a derramar o derribar las cosas que llevo en un azafate.",
      "Yo manejo los recipientes tan bruscamente o tan fuerte que se abollan, se rompen, o derraman.",
      "Yo agarro las cosas de un modo tan suelto que se me caen de la mano.",
      "Los demás se quejan de que yo empujo, pateo, abrazo, o pego demasiado fuerte.",
      "Yo rompo las cosas al presionarlas, jalarlas, o empujarlas demasiado fuerte.",
      "Me gusta chocar contra las cosas.",
      "Yo vuelco las cosas por accidente.",
    ],
  },
  {
    titulo: "EQUILIBRIO Y MOVIMIENTO",
    preguntas: [
      "No me gustan las actividades que me hagan echar la cabeza hacia atrás como para mirar algo que esté encima o para enjuagarme el cabello.",
      "Yo evito caminar sobre superficies desiguales que requieran equilibrio como la tierra o el pasto.",
      "Yo me tropiezo, me caigo, o pierdo el equilibrio al correr o hacer deportes.",
      "Yo tengo dificultad manteniendo el equilibrio al montar bicicleta o patinar.",
      "Yo me siento incómodo/a en escaleras o en escaleras de mano.",
      "Cuando pierdo el equilibrio, tengo problemas para sujetarme a tiempo para no caer.",
      "Yo pierdo el equilibrio o me caigo de mi silla al sentarme en un escritorio o una mesa.",
      "Yo me mareo cuando tuerzo mi cabeza de un lado a otro como al mirar en los dos sentidos antes de cruzar la calle.",
      "Yo tengo dificultad para mirar algo mientras mi cabeza está en movimiento como por ejemplo al correr para agarrar una pelota.",
      "Yo me pongo incómodo/a cuando tengo que sentarme en un asiento sin respaldo.",
    ],
  },
  {
    titulo: "PLANIFICACIÓN E IDEAS",
    preguntas: [
      "Yo necesito más práctica que los demás para adquirir una habilidad nueva.",
      "Yo tengo dificultad para que mis dos manos funcionen en conjunto cuando tengo que hacer tareas tales como abrir un envase o empacar un regalo.",
      "Yo tengo dificultad para seguir los pasos de una tarea nueva, como los de una receta o de un manual de reparaciones.",
      "Yo tengo problemas para generar ideas para nuevas actividades o juegos.",
      "Yo prefiero repetir actividades una y otra vez de la misma forma en vez de cambiar algo.",
      "Cuando participo en deportes me es difícil patear o agarrar la pelota exactamente en el momento preciso.",
      "Yo tengo dificultad para planear como cargar varias cosas al mismo tiempo.",
      "Yo tengo problemas completando en el orden correcto los pasos de las rutinas familiares, como vestirme o preparar el desayuno.",
      "Me es difícil mantener un cuaderno, o una mochila organizados.",
      "Yo necesito decir los pasos de una tarea dentro de mí mismo/a mientras la estoy haciendo.",
    ],
  },
  {
    titulo: "PARTICIPACIÓN SOCIAL",
    preguntas: [
      "Yo me llevo bien con mis compañeros de clase fácilmente sin hacer dramas o discutir.",
      "Yo me llevo bien con los adultos que son parte de mi vida.",
      "Yo disfruto estando con mis amigos.",
      "Yo disfruto participando en reuniones familiares como en las de días feriados o en las fiestas.",
      "Me es difícil hacer contacto visual con la gente cuando les hablo.",
      "La gente me dice que yo me paro o me siento demasiado cerca ellos.",
      "Yo me uno a actividades con otros sin perturbar la actividad que está en progreso.",
      "Yo me quedo atascado/a en un solo tema cuando hablo con otros.",
      "Los demás me dicen que yo parezco estar ignorando a la gente, cuando en realidad yo ni siquiera me había dado cuenta de que estaban allí.",
      "La gente me dice que yo hablo demasiado suavemente o con voz demasiado alta.",
    ],
  },
];

const DATOS = [
  { id: "dato-nombre", campo: "nombre", etiqueta: "Nombre", tipo: "text", requerido: true },
  { id: "dato-sexo", campo: "sexo", etiqueta: "Sexo", tipo: "text", requerido: true },
  { id: "dato-fechaNacimiento", campo: "fechaNacimiento", etiqueta: "Fecha de Nacimiento", tipo: "date", requerido: true },
  { id: "dato-edad", campo: "edad", etiqueta: "Edad", tipo: "number", requerido: true },
  { id: "dato-escuela", campo: "escuela", etiqueta: "Escuela/Agencia", tipo: "text", requerido: true },
  { id: "dato-grado", campo: "grado", etiqueta: "Grado Escolar", tipo: "text", requerido: true },
  { id: "dato-profesional", campo: "profesional", etiqueta: "Nombre del/la Profesional", tipo: "text", requerido: true },
];

export default function FormularioSPM2AutoinformeAdolescente() {
  return (
    <CuestionarioSPM2
      marca="SPM-2 AUTOINFORME"
      rango="Adolescente 12 - 21"
      instrumento="SPM-2 AUTOINFORME · Adolescente 12 - 21"
      nombreArchivo="Informe-SPM-2-AUTOINFORME-Adolescente-12-21"
      norma="adolescenteAuto"
      secciones={SECCIONES}
      datos={DATOS}
      intro={"Por favor contesta estas preguntas en base a tu conducta típica durante el mes pasado. Selecciona solo la respuesta que mejor describa la frecuencia con la cual esta conducta ocurre, usando la siguiente escala de evaluación."}
      notaAngustia={null}
      descargarPDF={descargarInformePDFAutoReporteAdolescente}
      conWord={true}
      confirmacion={"Gracias. El formulario SPM-2 AUTOINFORME se completó correctamente."}
    />
  );
}
