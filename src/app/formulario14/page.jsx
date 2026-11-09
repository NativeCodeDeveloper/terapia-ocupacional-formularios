"use client";

import CuestionarioPerfilSensorial from "@/components/CuestionarioPerfilSensorial";
import {
  calcularPuntuacionAdultos,
  CUADRANTES,
  descargarInformePDFAdultos,
} from "@/lib/informe-adultos";

/* ============================================================
   PERFIL SENSORIAL ADOLESCENTES Y ADULTOS · AUTOINFORME
   Auto cuestionario (Catana Brown y Winnie Dunn; traducción de
   Alpha Ocupacional autorizada por Catana Brown, 2017). 60
   ítems en 6 secciones; todos con cuadrante (RE Bajo Registro,
   BU Búsqueda Sensorial, SE Sensibilidad Sensorial, EV
   Evitación Sensorial — hoja de puntaje). Escala de frecuencia
   de 5 opciones sin No aplicable; la pauta indica marcar una X
   sobre el ítem sin experiencia, aquí se responde con la opción
   que más se aproxime. La clasificación de los cuadrantes usa
   el gráfico normativo según el grupo de edad (11-17, 18-64 o
   65 años o más); las secciones son referenciales.
   ============================================================ */

const OPCIONES = [
  {
    valor: "casiNunca",
    etiqueta: "CASI NUNCA",
    descripcion: "Responde de esa manera casi nunca (aproximadamente el 5% o menos del tiempo).",
    puntaje: 1,
  },
  {
    valor: "raramente",
    etiqueta: "RARAMENTE",
    descripcion: "Responde de esa manera raramente (aproximadamente el 25% del tiempo).",
    puntaje: 2,
  },
  {
    valor: "aVeces",
    etiqueta: "A VECES",
    descripcion: "Responde de esa manera a veces (aproximadamente el 50% del tiempo).",
    puntaje: 3,
  },
  {
    valor: "frecuentemente",
    etiqueta: "FRECUENTEMENTE",
    descripcion: "Responde de esa manera frecuentemente (aproximadamente el 75% del tiempo).",
    puntaje: 4,
  },
  {
    valor: "casiSiempre",
    etiqueta: "CASI SIEMPRE",
    descripcion: "Responde de esa manera casi siempre (aproximadamente el 95% o más del tiempo).",
    puntaje: 5,
  },
];

const SECCIONES = [
  {
    titulo: "Procesamiento Gusto/Olfato",
    preguntas: [
      { texto: "Salgo o me corro a otro lugar cuando huelo olores en una tienda (por ejemplo, productos de baño, velas o perfumes).", cuadrante: "EV" },
      { texto: "Añado condimentos/especias a mi comida.", cuadrante: "BU" },
      { texto: "No huelo cosas que otras personas dicen que huelen.", cuadrante: "RE" },
      { texto: "Disfruto estar cerca de las personas que usan perfumes o lociones.", cuadrante: "BU" },
      { texto: "Solo como alimentos conocidos/familiares.", cuadrante: "EV" },
      { texto: "Muchos alimentos no tienen sabor para mí (en otras palabras, no tienen mucho gusto o son insulsos).", cuadrante: "RE" },
      { texto: "No me gustan los sabores fuertes a menta o dulces (por ejemplo, picantes/canela o caramelos ácidos).", cuadrante: "SE" },
      { texto: "Voy a oler flores frescas cuando las veo.", cuadrante: "BU" },
    ],
  },
  {
    titulo: "Procesamiento Movimiento",
    preguntas: [
      { texto: "Tengo miedo a las alturas.", cuadrante: "SE" },
      { texto: "Disfruto como me siento cuando me muevo (por ejemplo, bailando, corriendo).", cuadrante: "BU" },
      { texto: "Evito los ascensores y/o las escaleras mecánicas porque no me gusta el movimiento.", cuadrante: "EV" },
      { texto: "Tropiezo o me choco con las cosas.", cuadrante: "RE" },
      { texto: "No me gusta el movimiento del andar en auto.", cuadrante: "SE" },
      { texto: "Elijo participar en actividades físicas.", cuadrante: "BU" },
      { texto: "No me siento seguro cuando camino por escaleras (por ejemplo, me tropiezo, pierdo el equilibrio y/o necesito tomarme del pasamanos).", cuadrante: "RE" },
      { texto: "Me mareo fácilmente (por ejemplo, después de inclinarme, levantarme rápido).", cuadrante: "SE" },
    ],
  },
  {
    titulo: "Procesamiento Visual",
    preguntas: [
      { texto: "Me gusta ir a lugares donde tienen luces brillantes y son coloridos.", cuadrante: "BU" },
      { texto: "Mantengo las cortinas bajas durante el día cuando estoy en casa.", cuadrante: "EV" },
      { texto: "Me gusta vestirme con ropa colorida.", cuadrante: "BU" },
      { texto: "Me siento frustrado(a) cuando trato de encontrar algo en un cajón lleno de cosas o en un salón desordenado.", cuadrante: "SE" },
      { texto: "No encuentro la calle, el edificio o señales de un salón cuando voy a lugares nuevos.", cuadrante: "RE" },
      { texto: "Me molestan las imágenes visuales que se mueven rápido o son inestables en el cine o la TV.", cuadrante: "SE" },
      { texto: "No me doy cuenta cuando la gente entra en un lugar/sala.", cuadrante: "RE" },
      { texto: "Elijo hacer las compras en tiendas/almacenes pequeños porque me siento abrumado(a) en tiendas grandes.", cuadrante: "EV" },
      { texto: "Me molesta cuando veo mucha gente alrededor mío (por ejemplo, en un shopping lleno, desfile, carnaval).", cuadrante: "SE" },
      { texto: "Limito las distracciones cuando trabajo (por ejemplo, cierro la puerta, o apago la TV).", cuadrante: "EV" },
    ],
  },
  {
    titulo: "Procesamiento Tacto",
    preguntas: [
      { texto: "Me desagrada rozarme la espalda.", cuadrante: "SE" },
      { texto: "Me gusta como se siente al cortarme el cabello.", cuadrante: "BU" },
      { texto: "Evito o uso guantes durante las actividades que pueden ensuciarme las manos.", cuadrante: "EV" },
      { texto: "Toco a otros cuando estoy hablando (por ejemplo, pongo mi mano en su hombro o le sostengo su mano).", cuadrante: "BU" },
      { texto: "Me molesta la sensación de mi boca cuando me despierto a la mañana.", cuadrante: "SE" },
      { texto: "Me gusta ir descalzo(a).", cuadrante: "BU" },
      { texto: "Estoy incómodo(a) usando ciertos tejidos (por ejemplo, lana, seda, corderoy/pana, etiquetas en la ropa).", cuadrante: "SE" },
      { texto: "No me agradan ciertas texturas de comidas (por ejemplo, piel del durazno, jugo de manzana, queso cottage, manteca de maní gruesa).", cuadrante: "SE" },
      { texto: "Me alejo cuando otros se ponen muy cerca mío.", cuadrante: "EV" },
      { texto: "No noto cuando mis manos o cara están sucias.", cuadrante: "RE" },
      { texto: "Tengo rasguños o moretones, pero no recuerdo cómo me los hice.", cuadrante: "RE" },
      { texto: "Evito hacer filas o pararme cerca de otras personas porque no me gusta estar muy cerca de otros.", cuadrante: "EV" },
      { texto: "No noto cuando alguien toca mi brazo o mi espalda.", cuadrante: "RE" },
    ],
  },
  {
    titulo: "Nivel de Actividad",
    preguntas: [
      { texto: "Trabajo en dos o más tareas al mismo tiempo.", cuadrante: "BU" },
      { texto: "Me toma más tiempo que a otras personas despertarme en las mañanas.", cuadrante: "RE" },
      { texto: "Hago cosas por impulso o en el momento (en otras palabras, hago cosas sin tener un plan en mente).", cuadrante: "BU" },
      { texto: "Encuentro tiempo para alejarme de mi ajetreada vida y pasar tiempo solo.", cuadrante: "EV" },
      { texto: "Parezco más lento que otros cuando intento hacer una actividad o una tarea.", cuadrante: "RE" },
      { texto: "No comprendo los chistes tan rápido como otros.", cuadrante: "RE" },
      { texto: "Me mantengo alejado(a) de las muchedumbres.", cuadrante: "EV" },
      { texto: "Encuentro actividades para realizar en frente de otros (p. ej., música, deportes, actuación, hablar en público y responder preguntas en clase).", cuadrante: "BU" },
      { texto: "Me resulta difícil concentrarme durante todo el tiempo cuando estoy sentado en una clase o una reunión grande.", cuadrante: "SE" },
      { texto: "Evito situaciones donde pueden suceder cosas inesperadas (p. ej., ir a lugares no conocidos o estar rodeado(a) de gente que no conozco).", cuadrante: "EV" },
    ],
  },
  {
    titulo: "Procesamiento Auditivo",
    preguntas: [
      { texto: "Tarareo, silbo, canto o hago ruidos.", cuadrante: "BU" },
      { texto: "Me sorprendo fácilmente con ruidos inesperados o fuertes (p. ej., aspiradora, ladridos de perros, llamadas telefónicas).", cuadrante: "SE" },
      { texto: "Tengo problemas para seguir lo que la gente está diciendo cuando hablan rápido o son temas poco conocidos para mí.", cuadrante: "RE" },
      { texto: "Salgo de espacios donde otros están mirando TV, o les pido que bajen el volumen.", cuadrante: "EV" },
      { texto: "Me distraigo si hay mucho ruido alrededor mío.", cuadrante: "SE" },
      { texto: "No me doy cuenta cuando llaman por mi nombre.", cuadrante: "RE" },
      { texto: "Uso estrategias para tapar el sonido (p. ej., cierro la puerta, tapo mis oídos, uso tapones para oídos).", cuadrante: "EV" },
      { texto: "Me mantengo alejado(a) de lugares ruidosos.", cuadrante: "EV" },
      { texto: "Me gusta ir a eventos con mucha música.", cuadrante: "BU" },
      { texto: "Tengo que pedir a las personas que repitan las cosas.", cuadrante: "RE" },
      { texto: "Encuentro difícil trabajar con ruido de fondo (p. ej., ventilador, radio).", cuadrante: "SE" },
    ],
  },
];

const DATOS = [
  { id: "dato-nombre", campo: "nombre", etiqueta: "Nombre", tipo: "text", requerido: true },
  { id: "dato-edadAnos", campo: "edadAnos", etiqueta: "Edad (en años)", tipo: "number", requerido: true },
  { id: "dato-fechaNacimiento", campo: "fechaNacimiento", etiqueta: "Fecha de nacimiento", tipo: "date", requerido: false },
  { id: "dato-genero", campo: "genero", etiqueta: "Género", tipo: "text", requerido: false },
  { id: "dato-examinador", campo: "examinador", etiqueta: "Nombre del/la Examinador(a)", tipo: "text", requerido: false },
  { id: "dato-insatisfaccion", campo: "insatisfaccion", etiqueta: "¿Hay aspectos de su vida diaria que no lo satisfacen? Sí es sí, explíquelos", tipo: "text", requerido: false },
];

export default function FormularioAdultosPerfilSensorial() {
  return (
    <CuestionarioPerfilSensorial
      marca="PERFIL SENSORIAL ADOLESCENTES Y ADULTOS"
      rango="Autoinforme · 11 años en adelante"
      instrumento="Perfil Sensorial Adolescentes y Adultos · Autoinforme"
      nombreArchivo="Informe-Perfil-Sensorial-Adolescentes-y-Adultos"
      secciones={SECCIONES}
      datos={DATOS}
      opciones={OPCIONES}
      autor="PERFIL SENSORIAL ADOLESCENTES Y ADULTOS · Catana Brown y Winnie Dunn"
      fraseOpciones="Cuando se presenta la oportunidad, usted…"
      calcular={calcularPuntuacionAdultos}
      cuadrantes={CUADRANTES}
      campoEdad="edadAnos"
      unidadEdad="años"
      intro={"Por favor marque la opción que mejor describa la frecuencia con la cual usted realiza los siguientes comportamientos. Responda todos los enunciados; si no tiene experiencia en un comportamiento en particular, conteste con la opción que más se aproxime a lo que haría."}
      notaEscala={null}
      edadMin={11}
      edadMax={99}
      descargarPDF={descargarInformePDFAdultos}
      confirmacion={"Gracias. El auto cuestionario del Perfil Sensorial Adolescentes y Adultos se completó correctamente."}
    />
  );
}
