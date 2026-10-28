"use client";

import CuestionarioSPM2 from "@/components/CuestionarioSPM2";
import { descargarInformePDFEscolarPreescolar } from "@/lib/informe-escolar-preescolar";

const SECCIONES = [
  {
    titulo: "VISIÓN",
    preguntas: [
      "Se distrae con objetos o gente que están visibles.",
      "Tiene dificultad para encontrar cosas o personas con la mirada en una habitación o en el campo de recreo.",
      "Tiene problemas para encontrar un objeto en medio de otros.",
      "Mira alrededor del salón o a sus compañeros mientras el/la maestro/a está hablando.",
      "Tiene dificultad para reconocer como se parecen o como difieren los objetos en base a sus colores, formas, o tamaños.",
      "Se tropieza con las cosas o con la gente como si no estuvieran ahí.",
      "Mira fijamente a la gente o a los objetos.",
      "Mira fijamente a las luces o a los objetos que giran o brillan.",
      "Sacude objetos o los dedos cerca de los ojos.",
      "Mira a objetos con el rabillo del ojo.",
    ],
  },
  {
    titulo: "OÍDO",
    preguntas: [
      "Se angustia cuando hay sonidos fuertes o inesperados como simulacros de incendio o bloques que se derrumban.",
      "Se angustia cuando los demás aplauden o cantan.",
      "Tiene dificultad para determinar de donde provienen los sonidos o las voces.",
      "Tararea, canta, o grita durante la clase.",
      "Gusta hacer ciertos sonidos repetidamente como tararear o jalar la cadena de la taza del baño.",
      "Se distrae o se fastidia con ruidos en el ambiente que otros ignoran como los de ventiladores o los de relojes haciendo tictac.",
      "Tiene problemas para prestar atención cuando hay ruidos en el salón de clase.",
      "Tiene dificultad para seguir instrucciones verbales.",
      "Parece estar intensamente interesado/a en sonidos que otros no notan.",
      "No responde cuando llaman su nombre.",
    ],
  },
  {
    titulo: "TACTO",
    preguntas: [
      "Cuando otros lo/la tocan por accidente, los ataca o se aparta.",
      "No se limpia la saliva o la comida de la cara.",
      "Se angustia con la sensación de ciertas texturas.",
      "Evita tocar o jugar con cosas que ensucien como la pintura o la goma de pegar.",
      "Frota objetos repetidamente con las manos o las puntas de los dedos.",
      "Tiene dificultad para manipular objetos pequeños en su mano.",
      "Da codazos, da un golpecito, o toca a sus compañeros durante la clase o cuando están en fila.",
      "Disfruta metiendo su cuerpo en espacios pequeños.",
      "Choca o se arremete contra sus compañeros o contra superficies duras como las paredes a propósito.",
      "Rehúsa comidas con mezclas de texturas como el yogurt con fruta.",
    ],
  },
  {
    titulo: "GUSTO Y OLFATO",
    preguntas: [
      "Prueba o come cosas que no son comibles como goma de pegar o pintura.",
      "Rehúsa probar comidas o refrigerios nuevos.",
      "Se angustia con sabores de comidas que a otros niños no les molestan.",
      "Insiste en comer solo ciertas comidas o ciertas marcas de alimentos.",
      "No distingue sabores ni expresa preferencias entre ellos.",
      "Prefiere comidas que tengan sabores fuertes.",
      "Olfatea o huele a la gente.",
      "Huele los objetos nuevos o las cosas nuevas antes de usarlos.",
      "Se angustia debido a aromas del jabón, del perfume o de las lociones para la piel.",
      "Hace arcadas o vomita a causa de ciertos olores.",
    ],
  },
  {
    titulo: "CONCIENCIA DEL CUERPO",
    preguntas: [
      "Mueve los muebles de la clase de una manera brusca o con mucha fuerza.",
      "Rompe barras de pegamento, lápices, crayolas o papel accidentalmente al usar demasiada fuerza.",
      "Salta de sitios en alto impactando sus pies con mucha fuerza.",
      "Tira las puertas al cerrarlas o las empuja con fuerza excesiva al abrirlas.",
      "Rompe juguetes al manejarlos con demasiada fuerza.",
      "Maneja los envases de comidas o de bebidas de una manera demasiado brusca.",
      "Derrumba los proyectos que otros niños están construyendo.",
      "Juega con sus compañeros/as de una manera demasiado brusca.",
      "Pone demasiada comida en su boca.",
      "Colorea con demasiada o muy poca fuerza.",
    ],
  },
  {
    titulo: "EQUILIBRIO Y MOVIMIENTO",
    preguntas: [
      "Gira o da vueltas excesivamente en los equipos del campo de recreo.",
      "Se desploma hacia adelante, se echa hacia atrás, o se sujeta la cabeza con las manos mientras está sentado/a.",
      "Le tiene miedo a ciertos movimientos como el de columpiarse o deslizarse en el tobogán.",
      "Se columpia excesivamente excluyendo las otras actividades.",
      "Se desorienta o se asusta cuando se inclina para recoger materiales que están en el suelo.",
      "No se sujeta cuando se está cayendo.",
      "Muestra poca coordinación en el uso de los dos lados de su cuerpo como hay que hacer para saltar y caer sobre los dos pies al mismo tiempo.",
      "Tiene dificultad moviendo su cuerpo al ritmo como aplaudiendo o marchando.",
      "Se mece, se balancea, o se retuerce al estar sentado/a.",
      "No mantiene bien el equilibrio.",
    ],
  },
  {
    titulo: "PLANIFICACIÓN E IDEAS",
    preguntas: [
      "Tiene problemas en generar nuevas ideas durante el juego.",
      "Repite actividades familiares una y otra vez en vez de probar actividades nuevas.",
      "Tiene dificultad imitando movimientos, sonidos, o expresiones correctamente.",
      "Tiene dificultad para copiar lo que hace un adulto u otro niño al construir con bloques.",
      "Tiene dificultad para planear como cargar varias cosas al mismo tiempo.",
      "Tiene dificultad con tareas que requieren coordinación de las dos manos como para abrir un envase.",
      "No termina las tareas que requieren varios pasos.",
      "No desempeña la secuencia lógica de acciones necesarias en su rutina diaria como al guardar sus artículos escolares.",
      "Tiene dificultad en generar ideas de que hacer o que construir como cuando está jugando con bloques o con materiales para el arte.",
      "Tiene dificultad copiando un modelo completo correctamente para crear uno idéntico.",
    ],
  },
  {
    titulo: "PARTICIPACIÓN SOCIAL",
    preguntas: [
      "Participa de manera apropiada en \"circle time.\"",
      "Pasa de una actividad a una nueva sin problema.",
      "Se une al juego con otros sin alterar lo que está transcurriendo.",
      "Sigue las reglas y rutinas de la clase.",
      "Comparte juguetes y materiales de la clase cuando se lo piden.",
      "Colabora con otros en una tarea común como haciendo la limpieza.",
      "Interactúa con sus compañeros en juegos \"de mentira.\"",
      "Resuelve conflictos con sus compañeros sin la intervención del/de la maestro/a.",
      "Mantiene contacto visual apropiado al conversar.",
      "Es flexible cuando su rutina cambia.",
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

export default function FormularioSPM2EscolarPreescolar() {
  return (
    <CuestionarioSPM2
      marca="SPM-2 ESCOLAR"
      rango="Preescolar 2 - 5 años"
      instrumento="SPM-2 ESCOLAR · Preescolar 2 - 5 años"
      nombreArchivo="Informe-SPM-2-ESCOLAR-Preescolar-2-5-anios"
      norma="preescolarEscolar"
      secciones={SECCIONES}
      datos={DATOS}
      intro={"Por favor conteste estas preguntas en base a la conducta típica de su niño/a durante el mes pasado. Seleccione solo la respuesta que mejor describa la frecuencia con la cual esta conducta ocurre, usando la siguiente escala de evaluación."}
      notaAngustia={"Algunas preguntas inquieren acerca de que si este/a niño/a se “angustia” en ciertas situaciones. Angustia puede incluir expresiones verbales (gimiendo, llorando, gritando) o expresiones sin uso de palabras (apartándose, haciendo gestos, descartando alguna cosa, escapándose, haciendo gestos de dolor, azotando)."}
      edadMin={2}
      edadMax={5}
      descargarPDF={descargarInformePDFEscolarPreescolar}
      conWord={true}
      confirmacion={"Gracias. El formulario SPM-2 ESCOLAR se completó correctamente."}
    />
  );
}
