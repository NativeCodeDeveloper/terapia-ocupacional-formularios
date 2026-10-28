"use client";

import CuestionarioSPM2 from "@/components/CuestionarioSPM2";
import { descargarInformePDF } from "@/lib/informe";

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
      "Pierdo el lugar cuando muevo la vista de un sitio a otro, por ejemplo copiando de la pizarra al escritorio o leyendo de una línea de texto a la siguiente.",
      "Yo tengo dificultad para juzgar la velocidad de autos que se acercan.",
      "Yo tengo dificultad para entender información en forma visual como los diagramas y los mapas.",
    ],
  },
  {
    titulo: "OÍDO",
    preguntas: [
      "Los sonidos fuertes, como el de una aspiradora o de una máquina de cortar el césped (pasto), me molestan tanto que quiero irme del sitio o taparme los oídos.",
      "Me gusta hacer ciertos sonidos repetidamente como tararear, cantar o gritar.",
      "Yo evito los lugares donde hay música o ruido fuerte.",
      "Yo tengo dificultad para determinar de dónde provienen los sonidos a los oídos.",
      "Yo tengo dificultad para enfocarme en una película cuando hay ruidos cerca como el de la gente abriendo los envases de comida.",
      "Los sonidos agudos, como el de silbatos o aparatos para hacer bulla en las fiestas, me molestan.",
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
      "Yo tengo dificultad para encontrar cosas en un bolsillo, una bolsa o una mochila sin mirar.",
      "La sensación de ciertas ropas me disgusta.",
      "La gente tiene que decirme cuando yo necesito limpiarme algo de la cara porque yo no me doy cuenta de eso.",
      "No me gusta lo que siento al cortarme las uñas de las manos o de los pies.",
      "Las sensaciones que tengo al cepillarme los dientes me hacen tener arcadas.",
      "Me gusta que la comida esté exactamente a la temperatura correcta para que yo la coma.",
      "Yo tengo dificultad para sentir cuando mi ropa, como por ejemplo mi camisa, se ha enrollado en mi cuerpo.",
      "Yo tengo problemas para sentir la comida o los líquidos deslizarse por mi garganta.",
      "Yo siento dificultad dándome cuenta que algo está demasiado caliente y me quemo por accidente.",
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
      "Yo evito las comidas que tengan un sabor u olor fuerte.",
      "Pensar en olores de comida que no me gusta me hace tener arcadas.",
      "Los olores de ciertas comidas me molestan o me disgustan.",
      "Me fastidian los olores que a los demás no les molestan.",
    ],
  },
  {
    titulo: "CONCIENCIA CORPORAL",
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
      "Yo tengo dificultad manteniendo el equilibrio al montar bicicleta o patineta.",
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
      "Yo tengo problemas completando en el orden correcto los pasos de las rutinas familiares, como vestirme o prepararme para salir.",
      "Me es difícil mantener un cuaderno, o una mochila organizados.",
      "Yo prefiero dejar los pasos de una tarea dentro de mi mismo/a mientras las estoy haciendo.",
    ],
  },
  {
    titulo: "PARTICIPACIÓN SOCIAL",
    preguntas: [
      "Yo me llevo bien con mis compañeros de clase fácilmente sin hacer dramas o discutir.",
      "Yo me llevo bien con los adultos que son parte de mi vida.",
      "Yo disfruto estando con mis amigos.",
      "Yo disfruto participando en reuniones familiares como en los días feriados o en las fiestas.",
      "Me es difícil hacer contacto visual con la gente cuando les hablo.",
      "Yo entiendo un juego que no paro y me siento demasiado cerca de ellos.",
      "Yo me mantengo alejado de otros sin perturbar la actividad que está en progreso.",
      "Yo puedo entender la situación a/en un salón cuando hablo con otros.",
      "Los demás dicen que yo parezco estar ignorando a la gente, cuando en realidad yo ni siquiera me había dado cuenta que estaban allí.",
      "La gente me dice que yo hablo demasiado suavemente o con voz demasiado alta.",
    ],
  },
];

const DATOS = [
  { id: "dato-nombreUsuario", campo: "nombreUsuario", etiqueta: "Nombre del Usuario/a", tipo: "text", requerido: true },
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
      intro={"Por favor conteste estas preguntas en base a la conducta típica durante el mes pasado. Seleccione solo la respuesta que mejor describa la frecuencia con la cual esta conducta ocurre, usando la siguiente escala de evaluación."}
      notaAngustia={"Algunas preguntas inquieren acerca de que si se “angustia” en ciertas situaciones. Angustia puede incluir expresiones verbales (gimiendo, llorando, gritando) o expresiones sin uso de palabras (apartándose, haciendo gestos, descartando alguna cosa, escapándose, haciendo gestos de dolor, azotando)."}
      descargarPDF={descargarInformePDF}
      conWord={true}
      confirmacion={"Gracias. El formulario SPM-2 AUTOINFORME se completó correctamente."}
    />
  );
}
