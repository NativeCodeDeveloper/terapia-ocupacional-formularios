"use client";

import CuestionarioSPM2 from "@/components/CuestionarioSPM2";
import { descargarInformePDFHogarAdolescente } from "@/lib/informe-hogar-adolescente";

const SECCIONES = [
  {
    titulo: "VISIÓN",
    preguntas: [
      "Se fastidia con la luz brillante.",
      "Se tropieza con las cosas o con la gente como si no estuvieran ahí.",
      "Se distrae con cosas que están a la vista cerca de él/ella, como objetos en la pared o gente moviéndose alrededor.",
      "Tiene problemas para encontrar objetos en un estante.",
      "Tiene dificultad para seguir a objetos que se mueven con la vista.",
      "Mira fijamente a la gente o a los objetos.",
      "Se fastidia cuando el alumbrado que generalmente hay en un ambiente familiar cambia.",
      "Mira fijamente a algo que los demás no notan.",
      "Se abruma o se distrae en las tiendas por todas las cosas que se ven en las vitrinas.",
      "Se angustia o se pone incómodo(a) al mirar a objetos que se mueven rápidamente o a imágenes que parpadean.",
    ],
  },
  {
    titulo: "OÍDO",
    preguntas: [
      "Se fastidia tanto con los sonidos fuertes, como el de una aspiradora, que tiene que irse del sitio o hacer callar el sonido de algún modo.",
      "No nota los sonidos que otros notan.",
      "Nota o se fastidia con los sonidos que los demás no notan.",
      "Se distrae fácilmente con ruidos sutiles en el ambiente como el ruido del aire acondicionado o del refrigerador.",
      "Tiene dificultad para determinar de dónde provienen los sonidos o las voces.",
      "Tiene dificultad para enfocarse en una película cuando hay sonidos como gente abriendo envases de comida cerca de él/ella.",
      "No responde cuando llaman su nombre.",
      "Se fastidia con los sonidos agudos como los de silbatos o los de aparatos para hacer bulla en las fiestas.",
      "Se interesa en sonidos a los que la mayoría de la gente no les prestan atención.",
      "Oye cosas que otras personas no oyen.",
    ],
  },
  {
    titulo: "TACTO",
    preguntas: [
      "No se limpia la saliva o la comida de la cara.",
      "Reacciona a pequeños cortes o golpes quejándose de intenso dolor.",
      "Disfruta teniendo cosas como lapiceros o ropa en la boca.",
      "Trata de tocar superficies frías.",
      "Lame cosas que no son comibles.",
      "Reacciona fuertemente a toques leves o inesperados.",
      "Tiene dificultad para encontrar cosas en un bolsillo, una bolsa, o una mochila sin mirar.",
      "Se disgusta al cortarse las uñas de las manos o de los pies.",
      "Tiene o hace arcadas cuando se cepilla los dientes o cuando recibe atención dental.",
      "No se da cuenta cuando la ropa se le ha enrollado en el cuerpo.",
    ],
  },
  {
    titulo: "GUSTO Y OLFATO",
    preguntas: [
      "Se fastidia con olores que no les molestan a los demás.",
      "Evita probar comidas nuevas.",
      "Tiene arcadas a causa de los olores de la comida.",
      "No le gusta comer en restaurantes porque los olores y sabores son diferentes.",
      "Evita las comidas que tengan un sabor u olor fuerte.",
      "Evita ciertos olores como los del perfume o las velas.",
      "Se fastidia con el sabor de ciertas comidas.",
      "Se fastidia con el olor de ciertas comidas.",
      "Nota fragancias u olores que otros no notan.",
      "Evita estar con grupos de gente en espacios cerrados como en los ascensores o en habitaciones atestadas a causa del olor.",
    ],
  },
  {
    titulo: "CONCIENCIA CORPORAL",
    preguntas: [
      "Usa demasiada fuerza para ciertas cosas, por ejemplo tira las puertas o presiona el teclado muy fuerte.",
      "Tiende a derramar o derribar las cosas que lleva en un azafate.",
      "Muerde cosas como lápices o ropa repetidamente.",
      "Maneja los recipientes tan bruscamente o tan fuerte que se abollan, se rompen, o se derraman.",
      "Agarra las cosas de un modo tan suelto que se le caen de la mano.",
      "Empuja, pega, o abraza tan fuerte que los demás se quejan.",
      "Rompe las cosas al presionarlas, jalarlas, o empujarlas demasiado fuerte.",
      "Vuelca las cosas por accidente.",
      "Tiene dificultad para soplar con suficiente fuerza como para inflar un globo.",
      "No controla los cubiertos bien.",
    ],
  },
  {
    titulo: "EQUILIBRIO Y MOVIMIENTO",
    preguntas: [
      "Se disgusta al echar su cabeza hacia atrás, como cuando mira algo que esté encima de él/ella o cuando se enjuaga el cabello.",
      "Se disgusta al subir en ascensores o en escaleras mecánicas debido al movimiento.",
      "Evita caminar sobre superficies desiguales que requieran equilibrio como la tierra o el pasto.",
      "Se tropieza, se cae, o pierde el equilibrio al correr o hacer deportes.",
      "Se siente incómodo/a en escaleras o escaleras de mano.",
      "Tiene que apoyarse en algo cuando se sienta en el suelo.",
      "No se sujeta cuando se está cayendo.",
      "Pierde el equilibrio cuando se agacha.",
      "Tiene dificultad para mirar algo mientras su cabeza está en movimiento como al correr para agarrar una pelota.",
      "Evita sentarse en asientos que no tienen respaldo.",
    ],
  },
  {
    titulo: "PLANIFICACIÓN E IDEAS",
    preguntas: [
      "Tiene problemas imitando acciones que se le demuestran como un nuevo paso de baile o el uso de una herramienta nueva.",
      "Tiene problemas siguiendo las instrucciones de como armar algo como un estante o un carro en miniatura.",
      "Necesita más práctica que los demás para adquirir una habilidad nueva.",
      "Tiene problemas con tareas que requieren coordinación de las dos manos como abrir un envase o empacar un regalo.",
      "Tiene dificultad para seguir los pasos de una tarea nueva como los de una receta o de un manual de reparaciones.",
      "Tiene problemas para generar ideas para nuevas actividades o juegos.",
      "Prefiere repetir actividades una y otra vez de la misma forma en vez de cambiar algo en la actividad o cambiar a una nueva actividad.",
      "Toma más tiempo que los demás en completar las tareas necesarias en el hogar.",
      "Tiene dificultad para planear como cargar varias cosas al mismo tiempo.",
      "Tiene problemas para completar en el orden correcto los pasos de las rutinas familiares, como al vestirse o al preparar el desayuno.",
    ],
  },
  {
    titulo: "PARTICIPACIÓN SOCIAL",
    preguntas: [
      "Se lleva bien con sus amigos, con facilidad, sin hacer dramas o discutir.",
      "Se lleva bien con los adultos que no son parte de la familia.",
      "Participa en actividades sociales fuera de la escuela.",
      "Tiene dificultad en hacer contacto visual con la gente cuando les habla.",
      "Se para o se sienta demasiado cerca de la gente.",
      "Busca actividades extracurriculares como los deportes organizados o clubes de intereses especializados.",
      "Elige estar con amigos cuando sea posible.",
      "No anda suficientemente limpio/a o bien arreglado/a, hasta tal punto que sus amigos y su familia se quejan.",
      "Parece ignorar a la gente.",
      "Habla demasiado suavemente o con voz demasiado alta.",
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

export default function FormularioSPM2HogarAdolescente() {
  return (
    <CuestionarioSPM2
      marca="SPM-2 HOGAR"
      rango="Adolescente 12 - 21"
      instrumento="SPM-2 HOGAR · Adolescente 12 - 21"
      nombreArchivo="Informe-SPM-2-HOGAR-Adolescente-12-21"
      norma="adolescenteHogar"
      secciones={SECCIONES}
      datos={DATOS}
      intro={"Por favor conteste estas preguntas en base a la conducta típica del usuario durante el mes pasado. Seleccione solo la respuesta que mejor describa la frecuencia con la cual esta conducta ocurre, usando la siguiente escala de evaluación."}
      notaAngustia={"Algunas preguntas inquieren acerca de que si se “angustia” en ciertas situaciones. Angustia puede incluir expresiones verbales (gimiendo, llorando, gritando) o expresiones sin uso de palabras (apartándose, haciendo gestos, descartando alguna cosa, escapándose, haciendo gestos de dolor, azotando)."}
      descargarPDF={descargarInformePDFHogarAdolescente}
      conWord={false}
      confirmacion={"Gracias. El formulario SPM-2 HOGAR se completó correctamente."}
    />
  );
}
