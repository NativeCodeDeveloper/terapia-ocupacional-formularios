"use client";

import CuestionarioSPM2 from "@/components/CuestionarioSPM2";
import { descargarInformePDFEscolarNinos } from "@/lib/informe-escolar-ninos";

const SECCIONES = [
  {
    titulo: "VISIÓN",
    preguntas: [
      "Se distrae con objetos o gente que están visibles.",
      "Mira alrededor del salón o a sus compañeros mientras el/la maestro/a está hablando.",
      "Mira fijamente a la gente o a los objetos.",
      "Gusta mirar a objetos que giran o que se mueven.",
      "Pierde su lugar al leer o copiar textos.",
      "Tiene dificultad para seguir a objetos que se mueven con la vista.",
      "Tiene problemas para encontrar un objeto en medio de otros.",
      "Se tropieza con las cosas o con la gente como si no estuvieran ahí.",
      "Tiene dificultad para reconocer como se parecen o como difieren los objetos en base a sus colores, formas, o tamaños.",
      "Mira a objetos con el rabillo del ojo.",
    ],
  },
  {
    titulo: "OÍDO",
    preguntas: [
      "Se angustia cuando hay sonidos fuertes o inesperados, como el de un afilador de lápices o un anuncio por el altoparlante.",
      "Se angustia cuando los demás aplauden o cantan.",
      "Tiene dificultad para seguir instrucciones verbales.",
      "Hace demasiado ruido durante periodos de transición.",
      "Tararea, canta, o hace ruidos extraños durante la clase.",
      "Confunde palabras que suenan más o menos igual como cuando y cuanto.",
      "Se distrae o se fastidia con ruidos en el ambiente que otros ignoran como los de ventiladores o los de relojes haciendo tictac.",
      "No responde cuando llaman su nombre.",
      "Tiene problemas para prestar atención cuando hay ruidos en el salón de clase.",
      "Parece estar intensamente interesado/a en sonidos que otros no notan.",
    ],
  },
  {
    titulo: "TACTO",
    preguntas: [
      "Se angustia con la sensación de ciertas texturas.",
      "Cuando otros lo/la tocan por accidente, los ataca o se aparta.",
      "No reacciona cuando lo/la tocan.",
      "Da codazos, da un golpecito, o toca a sus compañeros durante la clase o cuando están en fila.",
      "No se limpia la saliva o la comida de la cara.",
      "Rehúsa comidas con mezclas de texturas como el yogurt con fruta.",
      "Tiene dificultad para encontrar cosas en un bolsillo, una bolsa, o una mochila sin mirar.",
      "Disfruta de sensaciones que a otros les causarían dolor como el tirarse contra las paredes.",
      "Disfruta metiendo su cuerpo en espacios pequeños.",
      "Tiene dificultad para manipular objetos pequeños en su mano.",
    ],
  },
  {
    titulo: "GUSTO Y OLFATO",
    preguntas: [
      "Se angustia con sabores de comidas que a otros niños no les molestan.",
      "No nota olores fuertes o raros como el olor de la pintura o de los plumones.",
      "Huele los objetos nuevos o las cosas nuevas antes de usarlos.",
      "Olfatea o huele a la gente.",
      "Se angustia debido a aromas del jabón, del perfume o de las lociones para la piel.",
      "Hace arcadas o vomita a causa de ciertos olores.",
      "Evita el baño debido a los olores.",
      "Rehúsa probar comidas o refrigerios nuevos.",
      "Insiste en comer solo ciertas comidas o ciertas marcas de alimentos.",
      "Evita las comidas que tengan un sabor o un olor fuerte.",
    ],
  },
  {
    titulo: "CONCIENCIA DEL CUERPO",
    preguntas: [
      "Muerde los juguetes, la ropa, u otros objetos repetidamente.",
      "Mueve los muebles de la clase de una manera brusca o con mucha fuerza.",
      "Pisa con fuerza o planta sus pies al caminar o al subir las escaleras.",
      "Salta de sitios en alto impactando sus pies con mucha fuerza.",
      "Usa demasiada fuerza para ciertas cosas, por ejemplo tira las puertas o presiona el teclado muy fuerte.",
      "Juega con sus compañeros/as de una manera demasiado brusca.",
      "Escribe y colorea con demasiada o muy poca fuerza.",
      "Derrama o vuelca las cosas.",
      "Rompe las cosas al presionarlas, jalarlas, o empujarlas demasiado fuerte.",
      "Pone demasiada comida en su boca.",
    ],
  },
  {
    titulo: "EQUILIBRIO Y MOVIMIENTO",
    preguntas: [
      "Engancha sus pies por la parte de abajo de la silla cuando está sentado/a.",
      "Se mece, se balancea, o se retuerce al estar sentado/a.",
      "Evita caminar sobre superficies desiguales que requieran equilibrio como la tierra o el pasto.",
      "Tiene que apoyarse en algo cuando se sienta en el suelo.",
      "Se desploma hacia adelante, o se echa hacia atrás, o se sujeta la cabeza con las manos cuando está sentado/a.",
      "Muestra poca coordinación en el uso de los dos lados de su cuerpo como en actividades que requieren las dos manos, por ejemplo, cortar con tijeras o agarrar una pelota.",
      "No se sujeta cuando se está cayendo.",
      "No mantiene bien el equilibrio.",
      "Se tropieza, se cae, o pierde el equilibrio al correr o hacer deportes.",
      "Busca oportunidades para estar de cabeza.",
    ],
  },
  {
    titulo: "PLANIFICACIÓN E IDEAS",
    preguntas: [
      "No hace las tareas diarias de forma consistente.",
      "No soluciona los problemas de una manera eficaz.",
      "No desempeña la secuencia lógica de acciones necesarias en su rutina diaria como al guardar sus artículos escolares.",
      "No termina las tareas que requieren varios pasos.",
      "Tiene dificultad imitando movimientos, sonidos, o expresiones correctamente.",
      "Tiene dificultad copiando un modelo completo correctamente para crear uno idéntico.",
      "Tiene problemas manteniendo un cuaderno o el espacio donde trabaja organizados.",
      "Necesita más práctica que los demás para adquirir una habilidad nueva.",
      "Toma más tiempo que los demás en completar las tareas necesarias.",
      "Tiene dificultad en generar ideas de que hacer o que construir como cuando está jugando con bloques o con materiales para el arte.",
    ],
  },
  {
    titulo: "PARTICIPACIÓN SOCIAL",
    preguntas: [
      "Trabaja bien en grupo.",
      "Demuestra atención hacia otros estudiantes.",
      "Maneja la frustración sin arrebatos o conducta agresiva.",
      "Se une a los juegos y actividades de sus compañeros de buena gana.",
      "Se une al juego con otros sin alterar lo que está transcurriendo.",
      "Conversa con otros sin pararse o sentarse demasiado cerca de ellos.",
      "Mantiene contacto visual apropiado al conversar.",
      "Pasa de una actividad a otra con facilidad.",
      "Comparte los materiales de la clase cuando se lo piden.",
      "Demuestra respeto y cortesía hacia los maestros y empleados.",
    ],
  },
];

const DATOS = [
  { id: "dato-nombreEstudiante", campo: "nombreEstudiante", etiqueta: "Nombre del/de la Estudiante", tipo: "text", requerido: true },
  { id: "dato-sexo", campo: "sexo", etiqueta: "Sexo", tipo: "text", requerido: true },
  { id: "dato-fechaNacimiento", campo: "fechaNacimiento", etiqueta: "Fecha de Nacimiento", tipo: "date", requerido: true },
  { id: "dato-edad", campo: "edad", etiqueta: "Edad", tipo: "number", requerido: true },
  { id: "dato-nombreResponde", campo: "nombreResponde", etiqueta: "Nombre del respondiente", tipo: "text", requerido: true },
  { id: "dato-relacion", campo: "relacion", etiqueta: "Relación del respondiente con el/la estudiante", tipo: "text", requerido: true },
  { id: "dato-escuela", campo: "escuela", etiqueta: "Escuela/Agencia", tipo: "text", requerido: true },
  { id: "dato-grado", campo: "grado", etiqueta: "Grado Escolar", tipo: "text", requerido: true },
  { id: "dato-profesional", campo: "profesional", etiqueta: "Nombre del/la Profesional", tipo: "text", requerido: true },
];

export default function FormularioSPM2EscolarNinos() {
  return (
    <CuestionarioSPM2
      marca="SPM-2 ESCOLAR"
      rango="Niños 5 - 12 años"
      instrumento="SPM-2 ESCOLAR · Niños 5 - 12 años"
      nombreArchivo="Informe-SPM-2-ESCOLAR-Ninos-5-12-anios"
      norma="childEscolar"
      secciones={SECCIONES}
      datos={DATOS}
      intro={"Por favor conteste estas preguntas en base a la conducta típica del/de la estudiante durante el mes pasado. Seleccione solo la respuesta que mejor describa la frecuencia con la cual esta conducta ocurre, usando la siguiente escala de evaluación."}
      notaAngustia={"Algunas preguntas inquieren acerca de que si este/esta estudiante se “angustia” en ciertas situaciones. Angustia puede incluir expresiones verbales (gimiendo, llorando, gritando) o expresiones sin uso de palabras (apartándose, haciendo gestos, descartando alguna cosa, escapándose, haciendo gestos de dolor, azotando)."}
      descargarPDF={descargarInformePDFEscolarNinos}
      conWord={false}
      confirmacion={"Gracias. El formulario SPM-2 ESCOLAR se completó correctamente."}
    />
  );
}
