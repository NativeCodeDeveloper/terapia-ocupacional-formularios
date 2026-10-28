"use client";

import CuestionarioSPM2 from "@/components/CuestionarioSPM2";
import { descargarInformePDFEscolarAdolescente } from "@/lib/informe-escolar-adolescente";

const SECCIONES = [
  {
    titulo: "VISIÓN",
    preguntas: [
      "Pestañea, entrecierra los ojos, o se queja del alumbrado interior o del sol brillante.",
      "Se tropieza con las cosas o con la gente como si no estuvieran ahí.",
      "Tiene problemas para encontrar objetos en un estante.",
      "Sacude objetos o los dedos cerca de los ojos.",
      "Tiene dificultad para seguir a objetos que se mueven con la vista.",
      "Mira fijamente a la gente o a los objetos.",
      "Tiene dificultad para entender relatos que estén en forma visual como las revistas de historietas o las novelas gráficas.",
      "Se angustia cuando bajan la iluminación para mostrar películas o para la asambleas.",
      "Se fastidia cuando el alumbrado que generalmente hay en un ambiente familiar cambia.",
      "Mira fijamente a algo que los demás no notan.",
    ],
  },
  {
    titulo: "OÍDO",
    preguntas: [
      "Se fastidia tanto con los sonidos fuertes, como el de un altoparlante, que tiene que irse del sitio o hacer callar el sonido de algún modo.",
      "No nota los sonidos que otros notan.",
      "Nota o se fastidia con los sonidos que los demás no notan.",
      "Se distrae fácilmente con ruidos sutiles en el ambiente como el ruido del aire acondicionado o de las luces fluorescentes.",
      "Evita los lugares donde hay música o ruido fuerte.",
      "No responde cuando llaman su nombre.",
      "Oye cosas que otras personas no oyen.",
      "Hace ciertos sonidos repetidamente, como tararear, cantar, o gritar.",
      "Se sobresalta fácilmente cuando hay sonidos fuertes o inesperados.",
      "Se interesa en sonidos a los que la mayoría de la gente no les prestan atención.",
    ],
  },
  {
    titulo: "TACTO",
    preguntas: [
      "No se limpia la saliva o la comida de la cara.",
      "No se da cuenta cuando alguien le da un golpecito para llamarle la atención.",
      "Reacciona a pequeños cortes o golpes quejándose de intenso dolor.",
      "Reacciona fuertemente a toques leves o inesperados.",
      "Usa ropas gruesas cuando el clima está caluroso.",
      "Lame cosas que no son comibles.",
      "Hace cosas que le producen dolor a la mayoría de la gente como pellizcarse, golpearse, o cortarse.",
      "Tiene dificultad para encontrar cosas en un bolsillo, una bolsa, o una mochila sin mirar.",
      "Frota objetos repetidamente con las manos o las puntas de los dedos.",
      "No se da cuenta cuando la ropa se le ha enrollado en el cuerpo.",
    ],
  },
  {
    titulo: "GUSTO Y OLFATO",
    preguntas: [
      "Se fastidia con olores que no les molestan a los demás.",
      "Evita probar comidas nuevas en eventos escolares.",
      "No le gusta comer en la cafetería o en el área para almuerzos debido a la variedad de olores.",
      "Prueba o come cosas que no son comibles como goma de pegar o pintura.",
      "Evita las comidas que tengan un sabor o un olor fuerte.",
      "Nota fragancias u olores que otros no notan.",
      "Evita estar con grupos de gente en espacios cerrados como en los ascensores o en habitaciones atestadas a causa del olor.",
      "No nota los olores fuertes o raros.",
      "Huele los objetos nuevos o las cosas nuevas antes de usarlos.",
      "Olfatea o huele a la gente.",
    ],
  },
  {
    titulo: "CONCIENCIA DEL CUERPO",
    preguntas: [
      "Usa demasiada fuerza para ciertas cosas, por ejemplo rompe las puntas de los lápices o presiona el teclado muy fuerte.",
      "Muerde cosas como lápices o ropa repetidamente.",
      "Tiende a derramar o derribar las cosas que lleva en un azafate.",
      "Maneja los recipientes tan bruscamente o tan fuerte que se abollan, se rompen, o se derraman.",
      "Abre las puertas con tanta fuerza que la puerta golpea la pared o golpea a los demás.",
      "Agarra las cosas de un modo tan suelto que se le caen de la mano.",
      "Camina haciendo ruido, pisando fuerte o arrastrando los pies.",
      "Empuja, patea, o golpea tan fuerte que sus compañeros se quejan.",
      "Tiene manos que le tiemblan cuando hace algo que requiere movimientos precisos y controlados.",
      "Presiona muy ligeramente al escribir, dibujar, o pintar.",
    ],
  },
  {
    titulo: "EQUILIBRIO Y MOVIMIENTO",
    preguntas: [
      "Evita caminar sobre superficies desiguales que requieran equilibrio como la tierra o el pasto.",
      "Se desploma, se inclina, o necesita algo en que apoyarse cuando está sentado/a.",
      "Se mece, se balancea, o juguetea con algo cuando está sentado/a en un escritorio o en una mesa.",
      "No se sujeta cuando se está cayendo.",
      "Tiene que apoyarse en algo cuando se sienta en el suelo.",
      "Pierde el equilibrio o se cae de la silla mientras está sentado/a.",
      "Pierde el equilibrio cuando se agacha.",
      "Usa las paredes o los muebles para mantener el equilibrio cuando camina.",
      "Sacude o mueve la cabeza de un lado a otro repetidamente.",
      "Evita sentarse en asientos que no tienen respaldo.",
    ],
  },
  {
    titulo: "PLANIFICACIÓN E IDEAS",
    preguntas: [
      "Tiene problemas imitando acciones que se le demuestran como un nuevo paso de baile o el uso de una herramienta nueva.",
      "Tiene problemas siguiendo las instrucciones de un diagrama para armar algo.",
      "Necesita más práctica que los demás para adquirir una habilidad nueva.",
      "Deja sus cosas atrás sin querer.",
      "Prefiere repetir actividades una y otra vez de la misma forma en vez de cambiar algo en la actividad o cambiar a una nueva actividad.",
      "Tiene problemas manteniendo un cuaderno o el espacio donde trabaja organizados.",
      "Tiene dificultad para guardar los materiales en sus lugares correctos.",
      "Tiene problemas para completar los pasos de las rutinas familiares en el orden correcto.",
      "Se confunde acerca de cómo seguir las instrucciones del/de la maestro/a cuando cambia la rutina de la clase.",
      "Tiene problemas para generar ideas para nuevas actividades o juegos.",
    ],
  },
  {
    titulo: "PARTICIPACIÓN SOCIAL",
    preguntas: [
      "Se lleva bien con sus compañeros de clase, con facilidad, sin hacer dramas o discutir.",
      "Demuestra respeto y cortesía hacia los maestros y empleados.",
      "Participa en actividades sociales en la escuela.",
      "Trabaja bien como parte de un equipo.",
      "Demuestra atención hacia los otros estudiantes.",
      "Hace un buen papel como líder al trabajar en grupo con sus compañeros.",
      "Busca actividades extracurriculares como los deportes organizados o clubes de intereses especializados.",
      "Disfruta estar con amigos.",
      "Se une a las actividades de otros sin alterar lo que está transcurriendo.",
      "Habla demasiado suavemente o con voz demasiado alta.",
    ],
  },
];

const DATOS = [
  { id: "dato-nombreEstudiante", campo: "nombreEstudiante", etiqueta: "Nombre del/de la Estudiante", tipo: "text", requerido: true },
  { id: "dato-edad", campo: "edad", etiqueta: "Edad", tipo: "number", requerido: true },
  { id: "dato-nombreResponde", campo: "nombreResponde", etiqueta: "Nombre de quién responde", tipo: "text", requerido: true },
  { id: "dato-relacion", campo: "relacion", etiqueta: "Relación con el/la estudiante", tipo: "text", requerido: true },
  { id: "dato-escuela", campo: "escuela", etiqueta: "Escuela/Agencia", tipo: "text", requerido: true },
  { id: "dato-grado", campo: "grado", etiqueta: "Grado Escolar", tipo: "text", requerido: true },
  { id: "dato-profesional", campo: "profesional", etiqueta: "Nombre del/la Profesional", tipo: "text", requerido: true },
];

export default function FormularioSPM2EscolarAdolescente() {
  return (
    <CuestionarioSPM2
      marca="SPM-2 ESCOLAR"
      rango="Adolescente 12 - 21"
      instrumento="SPM-2 ESCOLAR · Adolescente 12 - 21"
      nombreArchivo="Informe-SPM-2-ESCOLAR-Adolescente-12-21"
      norma="adolescenteEscolar"
      secciones={SECCIONES}
      datos={DATOS}
      intro={"Por favor conteste estas preguntas en base a la conducta típica del/de la estudiante durante el mes pasado. Seleccione solo la respuesta que mejor describa la frecuencia con la cual esta conducta ocurre, usando la siguiente escala de evaluación."}
      notaAngustia={"Algunas preguntas inquieren acerca de que si este/esta estudiante se “angustia” en ciertas situaciones. Angustia puede incluir expresiones verbales (gimiendo, llorando, gritando) o expresiones sin uso de palabras (apartándose, haciendo gestos, descartando alguna cosa, escapándose, haciendo gestos de dolor, azotando)."}
      descargarPDF={descargarInformePDFEscolarAdolescente}
      conWord={false}
      confirmacion={"Gracias. El formulario SPM-2 ESCOLAR se completó correctamente."}
    />
  );
}
