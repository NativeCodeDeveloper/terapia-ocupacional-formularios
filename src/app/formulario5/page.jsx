"use client";

import CuestionarioSPM2 from "@/components/CuestionarioSPM2";
import { descargarInformePDFEvaluadorAdulto } from "@/lib/informe-evaluador-adulto";

const SECCIONES = [
  {
    titulo: "VISIÓN",
    preguntas: [
      "Se fastidia con la luz brillante.",
      "Se distrae con cosas que están a la vista cerca de él/ella, como objetos en la pared o gente moviéndose alrededor.",
      "Tiene dificultad para entender diagramas.",
      "Tiene dificultad para seguir a objetos que se mueven con la vista.",
      "Tiene dificultad para entender relatos que estén en forma visual como las revistas de historietas o las novelas gráficas.",
      "Se fastidia cuando el alumbrado que generalmente hay en un ambiente familiar cambia.",
      "Pierde su lugar cuando mueve la vista de un sitio a otro, por ejemplo leyendo desde una línea de texto hasta la siguiente.",
      "Se abruma o se distrae en las tiendas por todas las cosas que se ven en las vitrinas.",
      "No nota los letreros de las calles o las señales de tráfico cuando está en un sitio nuevo.",
      "Se angustia o se pone incómodo/a al mirar a objetos que se mueven rápidamente o a imágenes que parpadean.",
    ],
  },
  {
    titulo: "OÍDO",
    preguntas: [
      "Se fastidia tanto con los sonidos fuertes, como el de una aspiradora, que tiene que irse del sitio o hacer callar el sonido de algún modo.",
      "Nota o se fastidia con los sonidos que los demás no notan.",
      "Se distrae fácilmente con ruidos sutiles en el ambiente como el ruido del aire acondicionado o del refrigerador.",
      "Necesita estar en un lugar muy silencioso para poder hacer cualquiera de sus tareas.",
      "Tiene dificultad para determinar de dónde provienen los sonidos o las voces.",
      "Oye cosas que otras personas no oyen.",
      "Se interesa en sonidos a los que la mayoría de la gente no les prestan atención.",
      "Evita los lugares donde hay música o ruido fuerte.",
      "Tiene dificultad para enfocarse en una película cuando hay sonidos como gente abriendo envases de comida cerca de él/ella.",
      "Se fastidia con los sonidos agudos como los de silbatos o los aparatos para hacer bulla en las fiestas.",
    ],
  },
  {
    titulo: "TACTO",
    preguntas: [
      "Se disgusta cuando la gente está muy cerca de él/ella.",
      "Reacciona a pequeños cortes o golpes quejándose de intenso dolor.",
      "Reacciona fuertemente a toques leves o inesperados.",
      "No se da cuenta cuando la ropa se le ha enrollado en el cuerpo.",
      "Tiene dificultad para encontrar cosas en un bolsillo, una bolsa, o una mochila sin mirar.",
      "No se da cuenta cuando alguien le da un golpecito para llamarle la atención.",
      "Usa ropas gruesas o de varias capas cuando el clima está caluroso.",
      "Frota objetos repetidamente con las manos o las puntas de los dedos.",
      "Disfruta de la sensación de frazadas pesadas o capas de ropa.",
      "Se disgusta con la sensación de ciertas ropas.",
    ],
  },
  {
    titulo: "GUSTO Y OLFATO",
    preguntas: [
      "Se fastidia con olores que no les molestan a los demás.",
      "Evita probar comidas nuevas.",
      "No gusta comer en restaurantes porque los olores y sabores son diferentes.",
      "Evita las comidas que tengan un sabor o un olor fuerte.",
      "Nota fragancias u olores que otros no notan.",
      "Evita estar con grupos de gente en espacios cerrados, como en los ascensores o en habitaciones atestadas, a causa del olor.",
      "Se fastidia con el sabor de ciertas comidas.",
      "Tiene arcadas a causa de los olores de la comida.",
      "Huele los objetos nuevos o las cosas nuevas antes de usarlos.",
      "Se fastidia con el olor de ciertas comidas.",
    ],
  },
  {
    titulo: "CONCIENCIA CORPORAL",
    preguntas: [
      "Usa demasiada fuerza para ciertas cosas, por ejemplo tira las puertas o presiona el teclado muy fuerte.",
      "Tiende a derramar o derribar las cosas que lleva en un azafate (bandeja).",
      "Maneja los recipientes tan bruscamente o tan fuerte que se abollan, se rompen, o se derraman.",
      "Vuelca las cosas por accidente.",
      "Empuja, pega, o abraza tan fuerte que los demás se quejan.",
      "Tira la pelota con demasiada o con muy poca fuerza para embocarla.",
      "Agarra las cosas de un modo tan suelto que se le caen de la mano.",
      "Camina haciendo ruido, pisando fuerte o arrastrando los pies.",
      "Abre las puertas con tanta fuerza que la puerta golpea la pared o golpea a los demás.",
      "Rompe las cosas al presionarlas, jalarlas, o empujarlas demasiado fuerte.",
    ],
  },
  {
    titulo: "EQUILIBRIO Y MOVIMIENTO",
    preguntas: [
      "Evita caminar sobre superficies desiguales que requieran equilibrio como la tierra o el pasto.",
      "No se sujeta cuando se está cayendo.",
      "Evita sentarse en asientos que no tienen respaldo.",
      "Pierde el equilibrio cuando se agacha.",
      "Se desploma, se inclina, o necesita algo en que apoyarse cuando está sentado/a.",
      "Usa las paredes o los muebles para mantener el equilibrio cuando camina.",
      "Se disgusta al entrar o desplazarse dentro de una habitación oscura o malumbrada.",
      "Se disgusta al echar su cabeza hacia atrás, como cuando mira algo que esté encima de él/ella o cuando se enjuaga el cabello.",
      "Se disgusta al subir en ascensores o en escaleras mecánicas debido al movimiento.",
      "Se siente incómodo/a en escaleras o escaleras de mano.",
    ],
  },
  {
    titulo: "PLANIFICACIÓN E IDEAS",
    preguntas: [
      "Tiene problemas imitando acciones que se le demuestran como un nuevo paso de baile o el uso de una herramienta nueva.",
      "Tiene problemas siguiendo las instrucciones de un diagrama para armar algo.",
      "Necesita más práctica que los demás para adquirir una habilidad nueva.",
      "Prefiere repetir actividades una y otra vez de la misma forma en vez de cambiar algo en la actividad o cambiar a una nueva actividad.",
      "Tiene dificultad para planear como cargar varias cosas al mismo tiempo.",
      "Tiene problemas para generar ideas durante juegos como charadas.",
      "Tiene problemas para completar los pasos de las rutinas familiares en el orden correcto.",
      "Tiene problemas para generar ideas para nuevas actividades.",
      "Tiene dificultad para calcular una ruta hacia un lugar nuevo.",
      "Toma más tiempo que los demás en completar las tareas necesarias.",
    ],
  },
  {
    titulo: "PARTICIPACIÓN SOCIAL",
    preguntas: [
      "Se lleva bien con los demás.",
      "Busca actividades en la comunidad o en el vecindario.",
      "Tiene dificultad en hacer contacto visual con la gente cuando les habla.",
      "Trabaja bien como parte de un equipo.",
      "Muestra atención hacia los demás.",
      "Disfruta estar con amigos.",
      "Hace la parte que le corresponde de las tareas.",
      "Disfruta participando en reuniones familiares.",
      "Se une a las actividades de otros sin alterar lo que está transcurriendo.",
      "Parece ignorar a la gente.",
    ],
  },
];

const DATOS = [
  { id: "dato-nombreUsuario", campo: "nombreUsuario", etiqueta: "Nombre del Usuario/a", tipo: "text", requerido: true },
  { id: "dato-edad", campo: "edad", etiqueta: "Edad", tipo: "number", requerido: true },
  { id: "dato-nombreResponde", campo: "nombreResponde", etiqueta: "Nombre de quién responde", tipo: "text", requerido: true },
  { id: "dato-relacion", campo: "relacion", etiqueta: "Relación de quién responde con el usuario/a", tipo: "text", requerido: true },
  { id: "dato-profesional", campo: "profesional", etiqueta: "Nombre del/la Profesional", tipo: "text", requerido: true },
];

export default function FormularioSPM2AdultoEvaluador() {
  return (
    <CuestionarioSPM2
      marca="SPM-2"
      rango="Adulto (Evaluador) 21 - 87"
      instrumento="SPM-2 · Adulto (Evaluador) 21 - 87"
      nombreArchivo="Informe-SPM-2-Adulto-Evaluador-21-87"
      norma="adultoEvaluador"
      secciones={SECCIONES}
      datos={DATOS}
      intro={"Por favor conteste estas preguntas en base a la conducta típica del individuo durante el mes pasado. Seleccione solo la respuesta que mejor describa la frecuencia con la cual esta conducta ocurre, usando la siguiente escala de evaluación."}
      notaAngustia={"Algunas preguntas inquieren acerca de que si este individuo se “angustia” en ciertas situaciones. Angustia puede incluir expresiones verbales (gimiendo, llorando, gritando) o expresiones sin uso de palabras (apartándose, haciendo gestos, descartando alguna cosa, escapándose, haciendo gestos de dolor, azotando)."}
      descargarPDF={descargarInformePDFEvaluadorAdulto}
      conWord={false}
      confirmacion={"Gracias. El formulario SPM-2 se completó correctamente."}
    />
  );
}
