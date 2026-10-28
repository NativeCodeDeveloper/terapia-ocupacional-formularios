"use client";

import CuestionarioSPM2 from "@/components/CuestionarioSPM2";
import { descargarInformePDFHogarNinos } from "@/lib/informe-hogar-ninos";

const SECCIONES = [
  {
    titulo: "VISIÓN",
    preguntas: [
      "Se fastidia con la luz brillante.",
      "Tiene problemas para encontrar objetos en medio de otros.",
      "Se angustia en lugares donde el ambiente visual es poco común como en habitaciones de colores fuertes o habitaciones con poca luz.",
      "Tiene dificultad siguiendo a objetos que se mueven con la vista.",
      "Tiene dificultad para reconocer como se parecen o como difieren los objetos en base a sus colores, formas o tamaños.",
      "Se disgusta con ciertos tipos de iluminación como luces estroboscópicas (destellos muy rápidos), luces parpadeantes, o luces fluorescentes.",
      "Mira a objetos con el rabillo del ojo.",
      "Se abruma o se distrae en las tiendas por todas las cosas que se ven en las vitrinas.",
      "Se distrae con objetos o gente que están visibles.",
      "Busca áreas que estén oscuras.",
    ],
  },
  {
    titulo: "OÍDO",
    preguntas: [
      "Se fastidia con los sonidos caseros comunes como el de una aspiradora.",
      "Responde a los ruidos fuertes escapándose, llorando, o poniéndose las manos sobre los oídos.",
      "No nota los sonidos que otros notan.",
      "Parece estar intensamente interesado/a en sonidos que otros no notan.",
      "Se asusta con sonidos que a los demás no les molestan.",
      "Se distrae o se fastidia con ruidos en el ambiente que otros ignoran como una máquina de cortar el césped o el ruido del aire acondicionado.",
      "Le gusta hacer ciertos sonidos repetidamente como tararear o jalar la cadena de la taza del baño.",
      "Se angustia cuando hay sonidos agudos como silbatos o aparatos para hacer bulla en las fiestas.",
      "Se sobresalta fácilmente cuando hay ruidos fuertes o inesperados.",
      "Evita los lugares donde hay música o ruido fuerte.",
    ],
  },
  {
    titulo: "TACTO",
    preguntas: [
      "Se aparta cuando lo/la tocan levemente o inesperadamente.",
      "Se angustia con la sensación de la ropa nueva.",
      "Se angustia cuando le cortan las uñas de las manos o de los pies.",
      "Se fastidia cuando alguien le toca la cara.",
      "Evita tocar o jugar con cosas que ensucian como la pintura o la goma de pegar.",
      "Tiene una gran capacidad para tolerar el dolor y heridas pequeñas, demuestra nada o poca/o molestia.",
      "No le gusta cepillarse los dientes.",
      "Tiene dificultad para encontrar cosas en un bolsillo, una bolsa, o una mochila sin mirar.",
      "No se limpia la saliva o la comida de la cara.",
      "Se queja de que las comidas están “demasiado calientes” o “demasiado frías.”",
    ],
  },
  {
    titulo: "GUSTO Y OLFATO",
    preguntas: [
      "Hace arcadas o vomita a causa de ciertos olores.",
      "Se fastidia con olores que no les molestan a los demás.",
      "No nota los olores fuertes o raros.",
      "Huele los objetos nuevos o las cosas nuevas antes de usarlos.",
      "Nota fragancias u olores que otros no notan.",
      "Se fastidia con el sabor de ciertas comidas.",
      "Insiste en comer solo ciertas comidas o ciertas marcas de alimentos.",
      "Evita probar comidas nuevas.",
      "Evita baños públicos debido a los olores.",
      "No distingue sabores ni expresa preferencias entre ellos.",
    ],
  },
  {
    titulo: "CONCIENCIA DEL CUERPO",
    preguntas: [
      "Busca actividades que consisten en empujar, jalar, o arrastrar.",
      "Agarra objetos, como un lápiz o una cuchara, de una manera demasiado suelta o demasiado fuerte para poder usarlos fácilmente.",
      "Usa demasiada fuerza para ciertas cosas, por ejemplo tira las puertas o presiona el teclado muy fuerte.",
      "Salta mucho.",
      "Juega con sus compañeros/as de una manera demasiado brusca.",
      "Rompe las cosas al presionarlas, jalarlas, o empujarlas demasiado fuerte.",
      "Pone demasiada comida en su boca.",
      "Se golpea la cabeza a propósito contra algún objeto o contra la gente.",
      "Derrama o vuelca las cosas.",
      "Tira la pelota con mucha o con muy poca fuerza.",
    ],
  },
  {
    titulo: "EQUILIBRIO Y MOVIMIENTO",
    preguntas: [
      "Le tiene miedo a ciertos movimientos como el de columpiarse o deslizarse en el tobogán.",
      "No mantiene bien el equilibrio.",
      "Evita caminar sobre superficies desiguales que requieran equilibrio como la tierra o el pasto.",
      "Se cae de la silla cuando cambia de posición.",
      "No le gusta echar su cabeza hacia atrás como cuando mira algo que esté encima de él/ella o cuando se enjuaga el cabello.",
      "Muestra poca coordinación en el uso de los dos lados de su cuerpo como al cruzar un pie sobre los dos pies al mismo tiempo o para sacar algo de una esquina con una cuchara.",
      "Se apoya sobre las paredes, los muebles, o la gente para sostenerse al estar parado/a.",
      "Se mece, se balancea, o se retuerce al estar sentado/a.",
      "Busca oportunidades para estar de cabeza.",
      "Tiene dificultad en mirar algo mientras su cabeza está en movimiento como al correr para agarrar una pelota.",
    ],
  },
  {
    titulo: "PLANIFICACIÓN E IDEAS",
    preguntas: [
      "Tiene dificultad para planear como cargar varias cosas al mismo tiempo.",
      "Tiene dificultad para guardar sus pertenencias en sus lugares correctos.",
      "No desempeña la secuencia lógica de acciones necesarias en su rutina diaria como al vestirse o poner la mesa.",
      "No termina las tareas que requieren varios pasos.",
      "Tiene dificultad imitando movimientos, sonidos, o expresiones correctamente.",
      "Tiene dificultad para copiar un modelo al construir con bloques o con Legos.",
      "Tiene dificultad con tareas que requieren coordinación de las dos manos como para abrir un envase.",
      "Necesita más práctica que los demás para adquirir una habilidad nueva.",
      "Toma demasiado tiempo para completar tareas rutinarias.",
      "Tiene dificultad para generar ideas de que construir como cuando juega con bloques o con materiales de artesanía.",
    ],
  },
  {
    titulo: "PARTICIPACIÓN SOCIAL",
    preguntas: [
      "Colabora con sus amigos sin mucha discusión cuando juega con ellos.",
      "Interactúa de manera apropiada con padres y otros adultos.",
      "Comparte las cosas cuando se lo piden.",
      "Conversa con otros sin pararse o sentarse demasiado cerca de ellos.",
      "Mantiene contacto visual apropiado al conversar.",
      "Se une al juego con otros sin alterar lo que está transcurriendo.",
      "Interactúa y participa de manera apropiada en la conversación durante las comidas.",
      "Participa de manera apropiada en reuniones y salidas con la familia.",
      "Es flexible cuando su rutina cambia.",
      "Coopera con miembros de la familia mientras hacen recados.",
    ],
  },
];

const DATOS = [
  { id: "dato-nombreNino", campo: "nombreNino", etiqueta: "Nombre del Niño o Niña", tipo: "text" },
  { id: "dato-edad", campo: "edad", etiqueta: "Edad", tipo: "number" },
  { id: "dato-nombreResponde", campo: "nombreResponde", etiqueta: "Nombre de quién responde", tipo: "text" },
  { id: "dato-relacion", campo: "relacion", etiqueta: "Relación con el niño o niña", tipo: "text" },
  { id: "dato-profesional", campo: "profesional", etiqueta: "Nombre del/la Profesional", tipo: "text" },
];

export default function FormularioSPM2Hogar512() {
  return (
    <CuestionarioSPM2
      marca="SPM-2 HOGAR"
      rango="Niños 5 - 12 años"
      instrumento="SPM-2 HOGAR · Niños 5 - 12 años"
      nombreArchivo="Informe-SPM-2-HOGAR-Ninos-5-12-anios"
      norma="child"
      secciones={SECCIONES}
      datos={DATOS}
      intro={"Por favor conteste estas preguntas en base a la conducta típica de su niño/a durante el mes pasado. Seleccione solo la respuesta que mejor describa la frecuencia con la cual esta conducta ocurre, usando la siguiente escala de evaluación."}
      notaAngustia={"Algunas preguntas inquieren acerca de que si este/a niño/a se “angustia” en ciertas situaciones. Angustia puede incluir expresiones verbales (gimiendo, llorando, gritando) o expresiones sin uso de palabras (apartándose, haciendo gestos, descartando alguna cosa, escapándose, haciendo gestos de dolor, azotando)."}
      descargarPDF={descargarInformePDFHogarNinos}
      conWord={false}
      confirmacion={"Gracias. El formulario SPM-2 HOGAR se completó correctamente."}
    />
  );
}
