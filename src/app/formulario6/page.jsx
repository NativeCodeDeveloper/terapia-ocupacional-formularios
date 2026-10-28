"use client";

import CuestionarioSPM2 from "@/components/CuestionarioSPM2";
import { descargarInformePDFAutoReporteAdulto } from "@/lib/informe-autoreporte-adulto";

const SECCIONES = [
  {
    titulo: "VISIÓN",
    preguntas: [
      "La luz del sol o luces brillantes me fastidian.",
      "Yo tengo problemas para encontrar objetos en un estante.",
      "Las luces que parpadean me fastidian.",
      "Yo tengo problemas para seguir a objetos que se mueven con la vista.",
      "Yo me tropiezo con las cosas o con la gente porque no me doy cuenta de que están a mi paso.",
      "Yo tengo problemas para percibir los letreros de las calles o las señales de tránsito cuando estoy en un lugar nuevo.",
      "Yo tengo dificultad para juzgar la velocidad de autos que se acercan.",
      "Yo tengo dificultad para encontrar lo que busco en un mapa o en la guía de un centro comercial.",
      "Yo me distraigo por objetos que se mueven y que puedo ver con el rabillo del ojo.",
      "Yo pierdo mi lugar cuando muevo la vista de un sitio a otro, por ejemplo leyendo de una línea de texto a la siguiente.",
    ],
  },
  {
    titulo: "OÍDO",
    preguntas: [
      "Me fastidian los sonidos fuertes como el de una aspiradora.",
      "Yo necesito estar en un sitio muy silencioso para poder trabajar o dormir.",
      "Yo me distraigo fácilmente con ruidos sutiles en el ambiente como el ruido del aire acondicionado o del refrigerador.",
      "Los sonidos fuertes o inesperados me hacen sobresaltar fácilmente.",
      "Yo noto sonidos que los demás no notan.",
      "Yo tengo dificultad para determinar de dónde provienen los sonidos o las voces.",
      "Los sonidos agudos, como los de silbatos o aparatos para hacer bulla en las fiestas, me molestan.",
      "Yo evito los lugares donde hay música o ruido fuerte.",
      "Yo tengo dificultad para enfocarme en una película cuando hay ruidos cerca como el de gente abriendo los envases de comida.",
      "Yo tengo dificultad para oír a la gente cuando me están hablando en un sitio bullicioso como un restaurante.",
    ],
  },
  {
    titulo: "TACTO",
    preguntas: [
      "Yo tengo dificultad para encontrar cosas en un bolsillo, una bolsa, o una mochila sin mirar.",
      "No me gusta que la gente me toque o que esté demasiado cerca de mí.",
      "La sensación de ciertas ropas me disgusta.",
      "Me disgusta tener cosas pegajosas o sucias en mis manos.",
      "Otros tienen que decirme cuando yo necesito limpiarme algo de la cara porque yo no me doy cuenta de eso.",
      "La comida tiene que estar exactamente a la temperatura correcta para que yo me la coma.",
      "Yo evito ciertas comidas debido a sus texturas.",
      "Yo hago caer las cosas porque no las siento deslizarse de entre mis dedos.",
      "Yo tengo problemas con cierres que no puedo ver como para abotonar mi cuello sin un espejo.",
      "Me es difícil sentir cuando la ropa se me ha enrollado en el cuerpo.",
    ],
  },
  {
    titulo: "GUSTO Y OLFATO",
    preguntas: [
      "Yo evito probar comidas nuevas.",
      "Yo noto fragancias u olores que otros no notan.",
      "No me gusta comer en restaurantes debido a los diferentes olores y sabores.",
      "Me fastidian olores que a los demás no les molestan.",
      "Yo evito estar con grupos de gente en sitios encerrados, como en los ascensores o en habitaciones atestadas, debido al olor.",
      "Cuando me encuentro con algo nuevo, me gusta olerlo.",
      "Los sabores de ciertas comidas me disgustan.",
      "Yo detecto sabores amargos o ácidos aunque sean muy leves.",
      "Me gusta olfatear u oler a la gente.",
      "Yo insisto en comer la misma marca de un cierto alimento debido al sabor.",
    ],
  },
  {
    titulo: "CONCIENCIA CORPORAL",
    preguntas: [
      "Yo tiro la pelota con demasiada o con muy poca fuerza para embocarla.",
      "Yo tiendo a derramar o derribar las cosas que llevo en un azafate (bandeja).",
      "Yo manejo los recipientes tan bruscamente o tan fuerte que se abollan, se rompen, o derraman.",
      "Yo agarro las cosas de un modo tan suelto que se me caen de la mano.",
      "Yo rompo las cosas al presionarlas, jalarlas, o empujarlas demasiado fuerte.",
      "Yo vuelco las cosas por accidente.",
      "Yo tiendo a usar demasiada presión para la tarea que estoy haciendo, por ejemplo rompo las puntas de los lápices al escribir.",
      "Me gusta chocar contra las cosas.",
      "Los demás se quejan de que yo empujo, abrazo, o pego demasiado fuerte.",
      "Yo tiro las puertas al cerrarlas o las empujo al abrirlas con demasiada fuerza.",
    ],
  },
  {
    titulo: "EQUILIBRIO Y MOVIMIENTO",
    preguntas: [
      "No me gustan las actividades que me hagan echar la cabeza hacia atrás como para mirar algo que esté encima o para enjuagarme el cabello.",
      "No me gusta subir en ascensores o en escaleras mecánicas porque el movimiento me pone incómoda/o.",
      "Yo evito caminar sobre superficies desiguales que requieran equilibrio como la tierra o el pasto.",
      "Yo me tropiezo o pierdo el equilibrio.",
      "Yo me siento incómoda/o en escaleras o escaleras de mano.",
      "Cuando me siento en el suelo tengo que apoyarme en algo.",
      "Yo me mareo cuando tuerzo mi cabeza de un lado a otro como al mirar en los dos sentidos antes de cruzar la calle.",
      "Yo me pongo incómoda/o cuando tengo que sentarme en un asiento sin respaldo.",
      "Yo me mezo o me doy vueltas en la silla cuando estoy sentada/o en un escritorio o en una mesa.",
      "Yo me desplomo o sujeto mi cabeza en alto con las manos cuando estoy sentada/o en un escritorio.",
    ],
  },
  {
    titulo: "PLANIFICACIÓN E IDEAS",
    preguntas: [
      "Yo necesito más práctica que los demás para adquirir una habilidad nueva.",
      "Yo tengo dificultad para planear como cargar varias cosas al mismo tiempo.",
      "Me es difícil mantener las cosas organizadas.",
      "Yo necesito decir los pasos de una tarea dentro de mí misma/o mientras la estoy haciendo.",
      "Yo tengo dificultad para completar las tareas que requieren muchos pasos que tienen que ser hechos en el orden correcto.",
      "Yo tengo dificultad para seguir los pasos de una tarea nueva, como los de una receta o los de un manual de reparaciones.",
      "Yo tengo problemas en generar ideas para nuevas actividades.",
      "Yo tengo problemas siguiendo un diagrama para construir algo como por ejemplo para armar muebles.",
      "Yo tengo dificultad usando mi imaginación para crear nuevos juegos o actividades cuando juego con niños.",
      "Yo tengo dificultad para generar ideas durante juegos como charadas.",
    ],
  },
  {
    titulo: "PARTICIPACIÓN SOCIAL",
    preguntas: [
      "Yo me llevo bien con los demás.",
      "Yo disfruto estando con mis amigos.",
      "Yo evito actividades sociales con gente que no conozco.",
      "Yo disfruto participando en reuniones familiares.",
      "Yo me uno a actividades con otros sin perturbar la actividad que está en progreso.",
      "Me es difícil hacer contacto visual con la gente cuando les hablo.",
      "Yo me quedo atascada/o en un solo tema cuando hablo con otros.",
      "Los demás me dicen que yo parezco estar ignorando a la gente, cuando en realidad yo ni siquiera me había dado cuenta de que estaban allí.",
      "La gente me dice que yo hablo demasiado suavemente o con voz demasiado alta.",
      "Me gusta trabajar como parte de un equipo.",
    ],
  },
];

const DATOS = [
  { id: "dato-nombre", campo: "nombre", etiqueta: "Nombre", tipo: "text", requerido: true },
  { id: "dato-edad", campo: "edad", etiqueta: "Edad", tipo: "number", requerido: true },
  { id: "dato-fechaNacimiento", campo: "fechaNacimiento", etiqueta: "Fecha de Nacimiento", tipo: "date", requerido: true },
  { id: "dato-comentarios", campo: "comentarios", etiqueta: "Comentarios", tipo: "textarea", requerido: true },
  { id: "dato-profesional", campo: "profesional", etiqueta: "Nombre del/la Profesional", tipo: "text", requerido: true },
];

export default function FormularioSPM2AdultoAutoinforme() {
  return (
    <CuestionarioSPM2
      marca="SPM-2"
      rango="Adulto (Autoinforme) 21 - 87"
      instrumento="SPM-2 · Adulto (Autoinforme) 21 - 87"
      nombreArchivo="Informe-SPM-2-Adulto-Autoinforme-21-87"
      norma="adultoAuto"
      secciones={SECCIONES}
      datos={DATOS}
      intro={"Por favor contesta estas preguntas en base a tu conducta típica durante el mes pasado. Selecciona solo la respuesta que mejor describa la frecuencia con la cual esta conducta ocurre, usando la siguiente escala de evaluación."}
      notaAngustia={null}
      descargarPDF={descargarInformePDFAutoReporteAdulto}
      conWord={false}
      confirmacion={"Gracias. El formulario SPM-2 se completó correctamente."}
    />
  );
}
