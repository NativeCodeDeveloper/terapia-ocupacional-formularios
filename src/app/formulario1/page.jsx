"use client";

import CuestionarioSPM2 from "@/components/CuestionarioSPM2";
import { descargarInformePDFHogarPreescolar } from "@/lib/informe-hogar-preescolar";

const SECCIONES = [
  {
    titulo: "VISIÓN",
    preguntas: [
      "Entrecierra los ojos o se los cubre, o se queja de las luces que brillan mucho o de la luz del sol.",
      "Tiene problemas para encontrar un objeto en medio de otros.",
      "Mira fijamente a las luces o a los objetos que giran o brillan.",
      "Mira fijamente a la gente o a los objetos.",
      "Se tropieza con las cosas o con la gente como si no estuvieran ahí.",
      "Prende y apaga la luz repetidamente.",
      "Mira a objetos con el rabillo del ojo.",
      "Se distrae con objetos o gente que están visibles.",
      "Se fastidia en ambientes que tengan mucho que ver, como las habitaciones o tiendas llenas de cosas.",
      "Se distrae mirando a las cosas cuando está caminando.",
    ],
  },
  {
    titulo: "OÍDO",
    preguntas: [
      "Se fastidia con los sonidos caseros comunes como el de una aspiradora.",
      "Responde a los ruidos fuertes escapándose, llorando, o poniéndose las manos sobre los oídos.",
      "Se distrae o se fastidia con ruidos en el ambiente que otros ignoran como una máquina de cortar el césped o el ruido del aire acondicionado.",
      "Gusta hacer ciertos sonidos repetidamente como tararear o jalar la cadena de la taza del baño.",
      "Se angustia cuando hay sonidos agudos como silbatos o aparatos para hacer bulla en las fiestas.",
      "Se angustia en sitios ruidosos como fiestas o habitaciones llenas de gente.",
      "Se sobresalta fácilmente cuando hay sonidos fuertes e inesperados.",
      "No responde cuando llaman su nombre.",
      "Tiene dificultad para seguir instrucciones verbales.",
      "Tiene dificultad para determinar de dónde provienen los sonidos o las voces.",
    ],
  },
  {
    titulo: "TACTO",
    preguntas: [
      "Se aparta cuando lo/la tocan levemente o inesperadamente.",
      "Se pone angustiado/a cuando alguien lo lava, le limpia, o le toca la cara.",
      "Se angustia cuando le cortan o le escobillan el cabello.",
      "Parece no darse cuenta de la necesidad de usar el baño.",
      "Disfruta de sensaciones que a otros les causarían dolor como tirarse contra las paredes.",
      "Frota objetos repetidamente con las manos o las puntas de los dedos.",
      "Hace arcadas o vomita en reacción a comidas de ciertas texturas.",
      "No se limpia la saliva o la comida de la cara.",
      "Gusta estar tendido/a bajo cosas pesadas como frazadas, almohadas, o cojines de sillón.",
      "Rehúsa comidas con mezclas de texturas como el yogurt con fruta.",
    ],
  },
  {
    titulo: "GUSTO Y OLFATO",
    preguntas: [
      "Rehúsa probar comidas o refrigerios nuevos.",
      "No distingue sabores ni expresa preferencias entre ellos.",
      "Insiste en comer solo ciertas comidas o ciertas marcas de alimentos.",
      "Se angustia debido a sabores de comidas que a otros niños no les molestan.",
      "Huele los objetos nuevos o las cosas nuevas antes de usarlos.",
      "Nota fragancias u olores que otros no notan.",
      "Olfatea o huele a la gente.",
      "Hace arcadas o vomita a causa de ciertos olores.",
      "Busca ciertos olores o fragancias.",
      "Evita baños públicos debido a los olores.",
    ],
  },
  {
    titulo: "CONCIENCIA CORPORAL",
    preguntas: [
      "Busca actividades que consisten en empujar, jalar, o arrastrar.",
      "Tira las puertas al cerrarlas o las empuja con fuerza excesiva al abrirlas.",
      "Salta de sitios en alto impactando sus pies con mucha fuerza.",
      "Acaricia a los animales con demasiada fuerza.",
      "Juega con sus compañeros/as de una manera demasiado brusca.",
      "Muerde los juguetes, la ropa, u otros objetos repetidamente.",
      "Tira la pelota con mucha o con muy poca fuerza.",
      "Pone demasiada comida en su boca.",
      "Derrama o vuelca cosas en la mesa.",
      "Rompe juguetes al manejarlos con demasiada fuerza.",
    ],
  },
  {
    titulo: "EQUILIBRIO Y MOVIMIENTO",
    preguntas: [
      "Le tiene miedo a ciertos movimientos como el de columpiarse o deslizarse en el tobogán.",
      "Evita caminar sobre superficies desiguales que requieran equilibrio como la tierra o el pasto.",
      "Se cae de la silla cuando cambia de posición.",
      "No se sujeta cuando se está cayendo.",
      "Gira o da vueltas excesivamente en los equipos del campo de recreo.",
      "Muestra poca coordinación en el uso de los dos lados de su cuerpo como hay que hacer para saltar y caer sobre los dos pies al mismo tiempo.",
      "Se mece, se balancea, o se retuerce al estar sentado/a.",
      "Bajar las escaleras o bajar de los cerros le da miedo.",
      "Se desploma hacia adelante, se echa hacia atrás, o se sujeta la cabeza con las manos mientras está sentado/a.",
      "No mantiene bien el equilibrio.",
    ],
  },
  {
    titulo: "PLANIFICACIÓN E IDEAS",
    preguntas: [
      "Tiene dificultad para planear como cargar varias cosas al mismo tiempo.",
      "Se confunde cuando está tratando de guardar sus pertenencias o materiales en su lugar correcto.",
      "No termina las tareas que requieren varios pasos.",
      "Tiene dificultad imitando movimientos, sonidos, o expresiones correctamente.",
      "Tiene dificultad para copiar lo que hace un adulto u otro niño al construir con bloques.",
      "Tiene problemas en generar nuevas ideas durante el juego.",
      "Repite actividades familiares una y otra vez en vez de probar actividades nuevas.",
      "No calcula el tiempo bien al patear o agarrar una pelota.",
      "Tiene dificultad copiando un modelo completo correctamente para crear uno idéntico.",
      "Tiene dificultad con tareas que requieren coordinación de las dos manos como para abrir un envase.",
    ],
  },
  {
    titulo: "PARTICIPACIÓN SOCIAL",
    preguntas: [
      "Colabora con sus amigos cuando juega con ellos.",
      "Comparte las cosas cuando se lo piden.",
      "Espera su turno.",
      "Se une al juego con otros sin alterar lo que está transcurriendo.",
      "Participa de manera apropiada en reuniones y salidas con la familia.",
      "Coopera con miembros de la familia mientras hacen recados.",
      "Mantiene contacto visual apropiado al conversar.",
      "Entabla nuevas actividades sin problema.",
      "Es flexible cuando su rutina cambia.",
      "Colabora con otros en una tarea común como haciendo la limpieza.",
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

export default function FormularioSPM2Hogar() {
  return (
    <CuestionarioSPM2
      marca="SPM-2 HOGAR"
      rango="Niños 2 - 5 años"
      instrumento="SPM-2 HOGAR · Niños 2 - 5 años"
      nombreArchivo="Informe-SPM-2-HOGAR-Ninos-2-5-anios"
      norma="preescolar"
      secciones={SECCIONES}
      datos={DATOS}
      intro={"Por favor conteste estas preguntas en base a la conducta típica de su niño/a durante el mes pasado. Seleccione solo la respuesta que mejor describa la frecuencia con la cual esta conducta ocurre, usando la siguiente escala de evaluación."}
      notaAngustia={"Algunas preguntas inquieren acerca de que si este/a niño/a se “angustia” en ciertas situaciones. Angustia puede incluir expresiones verbales (gimiendo, llorando, gritando) o expresiones sin uso de palabras (apartándose, haciendo gestos, descartando alguna cosa, escapándose, haciendo gestos de dolor, azotando)."}
      edadMin={2}
      edadMax={5}
      descargarPDF={descargarInformePDFHogarPreescolar}
      conWord={true}
      confirmacion={"Gracias. El formulario SPM-2 HOGAR se completó correctamente."}
    />
  );
}
