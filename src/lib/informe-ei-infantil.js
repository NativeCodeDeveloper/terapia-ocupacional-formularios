import {
  descargarInformePDFEvaluacionInicial,
  descargarInformeWordEvaluacionInicial,
  etiquetaOpcion,
  textoValor,
} from "./informe-evaluacion-inicial.js";

/* ============================================================
   EVALUACIÓN INICIAL · INFANTIL (PESTAÑA NIÑO)
   Ficha de entrevista inicial de terapia ocupacional de
   TeraOcupame, transcrita del impreso de 9 páginas. La pauta
   titula la segunda sección «HISTORAL MÉDICO» por un error
   ortográfico del original; aquí se usa «Historial médico».
   El esquema sigue el contrato del componente
   CuestionarioEvaluacionInicial y del motor
   informe-evaluacion-inicial: cada campo tipo «escala» genera
   además su observación `${id}Obs` (no se declara en el
   esquema) y cada sí/no del área cognitiva lleva el companion
   `${id}EnQue` («Observación») del impreso.
   ============================================================ */

/* ==== Opciones de las escalas del impreso ==== */
const OPCIONES_INDEPENDENCIA = [
  { valor: "independiente", etiqueta: "Independiente" },
  { valor: "ayudaModerada", etiqueta: "Ayuda moderada" },
  { valor: "asistencia", etiqueta: "Asistencia" },
  { valor: "dependiente", etiqueta: "Dependiente" },
];

const OPCIONES_DESCANSO = [
  { valor: "normal", etiqueta: "Normal" },
  { valor: "conFarmacos", etiqueta: "Con fármacos" },
  { valor: "insomnioConciliacion", etiqueta: "Insomnio de conciliación" },
  { valor: "insomnioMantencion", etiqueta: "Insomnio de mantención" },
];

const OPCIONES_ORIGEN = [
  { valor: "derivacion", etiqueta: "Derivación" },
  { valor: "espontanea", etiqueta: "Consulta espontánea" },
];

const OPCIONES_MASCOTAS = [
  { valor: "dentro", etiqueta: "Adentro" },
  { valor: "fuera", etiqueta: "Afuera" },
];

/* Funciones del área cognitiva del impreso, con su descripción
   como hint y el companion «Observación» cuando la respuesta es No. */
const FUNCIONES_COGNITIVAS = [
  {
    id: "atencionSelectiva",
    etiqueta: "Atención selectiva",
    hint: "Centrar la atención en un estímulo por 15 minutos.",
  },
  {
    id: "atencionSostenida",
    etiqueta: "Atención sostenida",
    hint: "Mantener la atención en una actividad o estímulo durante un largo periodo de tiempo.",
  },
  {
    id: "atencionDividida",
    etiqueta: "Atención dividida",
    hint: "Capacidad de atender a dos o más tareas al mismo tiempo.",
  },
  {
    id: "memoriaCortoPlazo",
    etiqueta: "Memoria corto plazo",
    hint: "Mantener información en la mente durante unos pocos segundos o minutos.",
  },
  {
    id: "memoriaLargoPlazo",
    etiqueta: "Memoria largo plazo",
    hint: "Almacenar recuerdos, pensamientos, sensaciones, que posteriormente se recuerdan de forma voluntaria o no.",
  },
  {
    id: "memoriaTrabajo",
    etiqueta: "Memoria de trabajo",
    hint: "Capacidad de retener y manejar información de una tarea.",
  },
];

/* Texto largo con descripción del impreso como hint. */
const textoConHint = (id, etiqueta, hint, filas = 3) => ({
  id,
  etiqueta,
  tipo: "textoLargo",
  hint,
  filas,
});

export const SECCIONES = [
  /* ==== 1. Datos personales ==== */
  {
    id: "datos-personales",
    titulo: "Datos personales",
    identificacion: true,
    campos: [
      { id: "nombre", etiqueta: "Nombre", tipo: "texto" },
      { id: "run", etiqueta: "RUN", tipo: "texto" },
      { id: "fechaNacimiento", etiqueta: "Fecha de nacimiento", tipo: "fecha" },
      { id: "edad", etiqueta: "Edad", tipo: "numero", autoDesde: "fechaNacimiento" },
      { id: "nombreTutor", etiqueta: "Nombre tutor/a", tipo: "texto" },
      { id: "direccion", etiqueta: "Dirección", tipo: "texto" },
      { id: "telefono", etiqueta: "Teléfono", tipo: "texto" },
      { id: "escolaridad", etiqueta: "Escolaridad", tipo: "texto" },
    ],
  },
  /* ==== 2. Historial médico («HISTORAL MÉDICO» en el impreso) ==== */
  {
    id: "historial-medico",
    titulo: "Historial médico",
    campos: [
      { id: "antecedentesMedicos", etiqueta: "Antecedentes médicos", tipo: "textoLargo" },
      { id: "antecedentesMedicosFamiliares", etiqueta: "Antecedentes médicos familiares", tipo: "textoLargo" },
      { id: "antecedentesQuirurgicos", etiqueta: "Antecedentes quirúrgicos", tipo: "textoLargo" },
      { id: "ingestaFarmacos", etiqueta: "Ingesta de fármacos", tipo: "textoLargo" },
      { id: "alergias", etiqueta: "Alergias", tipo: "textoLargo" },
    ],
  },
  /* ==== 3. Motivo de consulta ==== */
  {
    id: "motivo-consulta",
    titulo: "Motivo de consulta",
    campos: [
      { id: "origen", etiqueta: "Origen de la consulta", tipo: "radio", opciones: OPCIONES_ORIGEN },
      { id: "motivoConsulta", etiqueta: "Motivo de consulta", tipo: "textoLargo", filas: 4 },
      { id: "refiereQue", etiqueta: "Refiere que…", tipo: "textoLargo", filas: 4 },
      { id: "seObserva", etiqueta: "Se observa…", tipo: "textoLargo", filas: 4 },
      {
        id: "condicionesGenerales",
        etiqueta: "Condiciones generales",
        tipo: "radio",
        opciones: [
          { valor: "buenas", etiqueta: "Buenas condiciones generales" },
          { valor: "regulares", etiqueta: "Regulares condiciones generales" },
          { valor: "malas", etiqueta: "Malas condiciones generales" },
        ],
      },
      {
        id: "animo",
        etiqueta: "Ánimo",
        tipo: "radio",
        opciones: [
          { valor: "eutimico", etiqueta: "Eutímico" },
          { valor: "deprimido", etiqueta: "Deprimido" },
          { valor: "aplanamiento", etiqueta: "Aplanamiento afectivo" },
        ],
      },
      {
        id: "estadoAlerta",
        etiqueta: "Estado de alerta",
        tipo: "radio",
        opciones: [
          { valor: "bajo", etiqueta: "Bajo" },
          { valor: "normal", etiqueta: "Normal" },
          { valor: "alto", etiqueta: "Alto" },
        ],
      },
    ],
  },
  /* ==== 4. Antecedentes familiares ==== */
  {
    id: "antecedentes-familiares",
    titulo: "Antecedentes familiares",
    campos: [
      { id: "madre", etiqueta: "Madre", tipo: "texto" },
      { id: "ocupacionMadre", etiqueta: "Ocupación madre", tipo: "texto" },
      { id: "padre", etiqueta: "Padre", tipo: "texto" },
      { id: "ocupacionPadre", etiqueta: "Ocupación padre", tipo: "texto" },
      { id: "hermanos", etiqueta: "Hermanos/Hermanas", tipo: "texto" },
      { id: "nombresHermanos", etiqueta: "Nombres", tipo: "texto" },
      { id: "viveCon", etiqueta: "Vive con", tipo: "texto" },
      { id: "mascotas", etiqueta: "Mascotas", tipo: "texto" },
      { id: "mascotasUbicacion", etiqueta: "Mascotas", tipo: "radio", opciones: OPCIONES_MASCOTAS },
    ],
  },
  /* ==== 5. Independencia funcional (escalas con Obs) ==== */
  {
    id: "independencia-funcional",
    titulo: "Independencia funcional",
    descripcion:
      "Marque el nivel que corresponde a cada ámbito según la entrevista y la observación del terapeuta.",
    campos: [
      { id: "comer", etiqueta: "Comer", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "aseoPersonal", etiqueta: "Aseo personal", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "banarse", etiqueta: "Bañarse", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "vestirse", etiqueta: "Vestirse", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "usoBano", etiqueta: "Uso del baño", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      {
        id: "manejoVejigaIntestinos",
        etiqueta: "Manejo de vejiga/intestinos",
        tipo: "escala",
        opciones: OPCIONES_INDEPENDENCIA,
      },
      { id: "transferencias", etiqueta: "Transferencias", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "gatear", etiqueta: "Gatear", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "comprension", etiqueta: "Comprensión", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "solucionProblemas", etiqueta: "Solución de problemas", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "memoria", etiqueta: "Memoria", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "descansoSueno", etiqueta: "Descanso y sueño", tipo: "escala", opciones: OPCIONES_DESCANSO },
    ],
  },
  /* ==== 6. Hitos del desarrollo ==== */
  {
    id: "hitos-desarrollo",
    titulo: "Hitos del desarrollo",
    campos: [
      { id: "hitoSostenerCabeza", etiqueta: "Sostener la cabeza", tipo: "texto", hint: "Edad (meses o años)" },
      { id: "hitoGatear", etiqueta: "Gatear", tipo: "texto", hint: "Edad (meses o años)" },
      { id: "hitoCaminar", etiqueta: "Caminar", tipo: "texto", hint: "Edad (meses o años)" },
      { id: "hitoPrimerasPalabras", etiqueta: "Primeras palabras", tipo: "texto", hint: "Edad (meses o años)" },
      { id: "hitoComprension", etiqueta: "Comprensión", tipo: "texto", hint: "Edad (meses o años)" },
      { id: "hitoControlEsfinteres", etiqueta: "Control de esfínteres", tipo: "texto", hint: "Edad (meses o años)" },
      {
        id: "retrasoPsicomotor",
        etiqueta: "Según control de niño sano, hubo retraso del desarrollo psicomotor",
        tipo: "siNo",
      },
    ],
  },
  /* ==== 7. Área sensorial ==== */
  {
    id: "area-sensorial",
    titulo: "Área sensorial",
    campos: [
      { id: "vision", etiqueta: "Visión", tipo: "textoLargo" },
      { id: "oido", etiqueta: "Oído", tipo: "textoLargo" },
      { id: "tacto", etiqueta: "Tacto", tipo: "textoLargo" },
      { id: "gustoOlfato", etiqueta: "Gusto y olfato", tipo: "textoLargo" },
      { id: "concienciaCorporal", etiqueta: "Conciencia corporal", tipo: "textoLargo" },
      { id: "equilibrioMovimiento", etiqueta: "Equilibrio y movimiento", tipo: "textoLargo" },
      { id: "planificacionIdeas", etiqueta: "Planificación e ideas", tipo: "textoLargo" },
    ],
  },
  /* ==== 8. Área física ==== */
  {
    id: "area-fisica",
    titulo: "Área física",
    campos: [
      textoConHint("motricidadFina", "Motricidad fina", "Tomar objetos, apilar bloques, escribir…", 4),
      textoConHint(
        "motricidadGruesa",
        "Motricidad gruesa",
        "Falta del equilibrio, caídas, forma de caminar…",
        4
      ),
      textoConHint(
        "equilibrioMovimientoFisico",
        "Equilibrio y movimiento",
        "Caminar, saltar, desempeño en el juego…",
        4
      ),
    ],
  },
  /* ==== 9. Área cognitiva ==== */
  {
    id: "area-cognitiva",
    titulo: "Área cognitiva",
    descripcion:
      "Consulte al tutor/a si la función está presente. Si responde «No», registre en «Observación» la situación observada.",
    campos: FUNCIONES_COGNITIVAS.flatMap((funcion) => [
      {
        id: funcion.id,
        etiqueta: funcion.etiqueta,
        tipo: "siNo",
        hint: funcion.hint,
      },
      {
        id: `${funcion.id}EnQue`,
        etiqueta: "Observación",
        tipo: "textoLargo",
        filas: 2,
      },
    ]),
  },
  /* ==== 10. Lenguaje ==== */
  {
    id: "lenguaje",
    titulo: "Lenguaje",
    campos: [
      textoConHint("lenguajeComprension", "Comprensión", "Capacidad de entender instrucciones."),
      textoConHint("lenguajeExpresion", "Expresión", "Organizar pensamientos y expresarlos."),
      textoConHint(
        "lenguajeResolucionProblemas",
        "Resolución de problemas",
        "Capacidad para utilizar el lenguaje en la resolución de problemas o para planificar actividades.",
        4
      ),
    ],
  },
  /* ==== 11. Conducta ==== */
  {
    id: "conducta",
    titulo: "Conducta",
    campos: [
      textoConHint(
        "flexibilidadCognitiva",
        "Flexibilidad cognitiva",
        "Adaptarse a cambios de actividad, de rutina, o situaciones diarias."
      ),
      textoConHint("controlInhibitorio", "Control inhibitorio", "Control de impulsos y turnos."),
    ],
  },
  /* ==== 12. Interacción social ==== */
  {
    id: "interaccion-social",
    titulo: "Interacción social",
    campos: [
      {
        id: "interaccionPares",
        etiqueta: "¿Cómo interactúa su hijo con otros niños de su edad? ¿Busca activamente jugar con ellos?",
        tipo: "textoLargo",
        filas: 4,
      },
      {
        id: "interaccionAmigos",
        etiqueta: "¿Tiene amigos cercanos? ¿Con qué frecuencia se reúne con ellos?",
        tipo: "textoLargo",
        filas: 4,
      },
      {
        id: "interaccionConflictos",
        etiqueta: "¿Cómo maneja su hijo los conflictos con otros niños? ¿Se frustra fácilmente?",
        tipo: "textoLargo",
        filas: 4,
      },
      {
        id: "interaccionJuegosGrupales",
        etiqueta: "¿Participa en juegos grupales? ¿Cómo se adapta a las reglas y la dinámica del grupo?",
        tipo: "textoLargo",
        filas: 4,
      },
    ],
  },
  /* ==== 13. Expresión y reconocimiento de emociones ==== */
  {
    id: "expresion-emociones",
    titulo: "Expresión y reconocimiento de emociones",
    campos: [
      {
        id: "emocionesExpresion",
        etiqueta: "¿Cómo expresa su hijo sus emociones (alegría, tristeza, frustración, ira)?",
        tipo: "textoLargo",
        filas: 3,
      },
      {
        id: "emocionesReconocimiento",
        etiqueta: "¿Reconoce y nombra sus propias emociones y las de los demás?",
        tipo: "textoLargo",
        filas: 3,
      },
      {
        id: "emocionesDificiles",
        etiqueta: "¿Hay emociones específicas que le resulten más difíciles de manejar?",
        tipo: "textoLargo",
        filas: 3,
      },
      {
        id: "emocionesEstrategias",
        etiqueta: "¿Qué estrategias utiliza su hijo para calmarse cuando está molesto o ansioso?",
        tipo: "textoLargo",
        filas: 3,
      },
      {
        id: "emocionesRabietas",
        etiqueta: "¿Observan rabietas o crisis emocionales frecuentes?",
        tipo: "textoLargo",
        filas: 3,
      },
    ],
  },
  /* ==== 14. Juego ==== */
  {
    id: "juego",
    titulo: "Juego",
    campos: [
      textoConHint(
        "juegoPreferencias",
        "Preferencias y patrones",
        "¿Cuáles son los juguetes y actividades favoritas del niño? ¿Cómo pasa su tiempo libre y con quién prefiere jugar?",
        4
      ),
      textoConHint(
        "juegoHabilidades",
        "Habilidades de juego",
        "¿Cómo usa su imaginación y sigue reglas? ¿Cómo maneja la frustración y se adapta a cambios en los juegos?",
        4
      ),
      textoConHint(
        "juegoDesarrollo",
        "Juego y desarrollo",
        "¿Cómo ha cambiado su juego con el tiempo? ¿Qué habilidades desarrolla a través del juego y cómo influye en su comportamiento?",
        4
      ),
      textoConHint(
        "juegoConsideraciones",
        "Consideraciones adicionales",
        "¿Existen factores sensoriales o del entorno que influyen en su juego? ¿Cómo se puede adaptar el juego a su edad y nivel de desarrollo?",
        4
      ),
    ],
  },
  /* ==== 15. Habituación ==== */
  {
    id: "habitucion",
    titulo: "Habituación",
    campos: [
      { id: "habitos", etiqueta: "Hábitos", tipo: "textoLargo" },
      { id: "roles", etiqueta: "Roles", tipo: "textoLargo" },
      { id: "rutinaHabituacion", etiqueta: "Rutina", tipo: "textoLargo" },
    ],
  },
  /* ==== 16. Esparcimiento ==== */
  {
    id: "esparcimiento",
    titulo: "Esparcimiento",
    campos: [
      { id: "ocioTiempoLibre", etiqueta: "Ocio y tiempo libre", tipo: "textoLargo" },
      { id: "participacionSocial", etiqueta: "Participación social", tipo: "textoLargo" },
      { id: "rutinaEsparcimiento", etiqueta: "Rutina", tipo: "textoLargo" },
    ],
  },
  /* ==== 17. Volición ==== */
  {
    id: "volicion",
    titulo: "Volición",
    campos: [
      { id: "causalidadPersonal", etiqueta: "Causalidad personal", tipo: "textoLargo" },
      { id: "valoresVolicion", etiqueta: "Valores", tipo: "textoLargo" },
      { id: "intereses", etiqueta: "Intereses", tipo: "textoLargo" },
    ],
  },
  /* ==== 18. Plan de intervención ==== */
  {
    id: "plan-intervencion",
    titulo: "Plan de intervención",
    campos: [
      { id: "problemaOcupacional", etiqueta: "Problemática ocupacional", tipo: "textoLargo", filas: 4 },
      { id: "cortoObjetivo", etiqueta: "Objetivo general", tipo: "textoLargo", hint: "Corto plazo" },
      { id: "cortoEspecificos", etiqueta: "Objetivos específicos", tipo: "textoLargo", hint: "Corto plazo", filas: 4 },
      { id: "medianoObjetivo", etiqueta: "Objetivo general", tipo: "textoLargo", hint: "Mediano plazo" },
      {
        id: "medianoEspecificos",
        etiqueta: "Objetivos específicos",
        tipo: "textoLargo",
        hint: "Mediano plazo",
        filas: 4,
      },
      { id: "largoObjetivo", etiqueta: "Objetivo general", tipo: "textoLargo", hint: "Largo plazo" },
      { id: "largoEspecificos", etiqueta: "Objetivos específicos", tipo: "textoLargo", hint: "Largo plazo", filas: 4 },
    ],
  },
];

/* ============================================================
   HELPERS DE SÍNTESIS
   ============================================================ */

const CAMPOS_ESCALA = SECCIONES.flatMap((s) => s.campos).filter((c) => c.tipo === "escala");
const CAMPOS_INDEPENDENCIA = CAMPOS_ESCALA.filter((c) => c.id !== "descansoSueno");
const CAMPO_DESCANSO = CAMPOS_ESCALA.find((c) => c.id === "descansoSueno");
const SECCION_COGNITIVA = SECCIONES.find((s) => s.id === "area-cognitiva");
const FUNCIONES = SECCION_COGNITIVA.campos.filter((c) => c.tipo === "siNo");
const CAMPOS_HITOS = SECCIONES.find((s) => s.id === "hitos-desarrollo").campos.filter((c) => c.tipo === "texto");
const PLAZOS = [
  { prefijo: "corto", nombre: "Corto plazo" },
  { prefijo: "mediano", nombre: "Mediano plazo" },
  { prefijo: "largo", nombre: "Largo plazo" },
];
const NIVELES_APOYO = ["ayudaModerada", "asistencia", "dependiente"];

/* Une partes en prosa: «a, b y c». */
function unirConY(partes) {
  if (partes.length === 0) return "";
  if (partes.length === 1) return partes[0];
  return `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
}

/* Conteo de niveles elegidos en los 11 ámbitos de independencia
   funcional (el descanso y sueño se modela aparte). */
export function contarNivelesIndependencia(valores = {}) {
  const conteo = { independiente: 0, ayudaModerada: 0, asistencia: 0, dependiente: 0 };
  for (const campo of CAMPOS_INDEPENDENCIA) {
    const nivel = valores[campo.id];
    if (nivel in conteo) conteo[nivel] += 1;
  }
  return conteo;
}

/* Ámbitos de independencia funcional que requieren apoyo
   (ayuda moderada, asistencia o dependiente). */
export function ambitosConApoyo(valores = {}) {
  return CAMPOS_INDEPENDENCIA.filter((campo) => NIVELES_APOYO.includes(valores[campo.id])).map(
    (campo) => campo.etiqueta
  );
}

/* ============================================================
   SÍNTESIS AUTOMATIZADA
   ============================================================ */

export function sintetizar(valores = {}) {
  const bloques = [];

  /* ---- Motivo de consulta ---- */
  const partesMotivo = [];
  const origen = etiquetaOpcion(
    SECCIONES.find((s) => s.id === "motivo-consulta").campos.find((c) => c.id === "origen"),
    valores.origen
  );
  if (origen) partesMotivo.push(`Origen de la consulta: ${origen}.`);
  const motivo = (valores.motivoConsulta ?? "").trim();
  if (motivo) partesMotivo.push(`Motivo de consulta: ${motivo}`);
  const refiere = (valores.refiereQue ?? "").trim();
  if (refiere) partesMotivo.push(`Refiere que: ${refiere}`);

  const camposObservacion = SECCIONES.find((s) => s.id === "motivo-consulta").campos;
  const registroObservacion = [];
  const condiciones = etiquetaOpcion(
    camposObservacion.find((c) => c.id === "condicionesGenerales"),
    valores.condicionesGenerales
  );
  if (condiciones) registroObservacion.push(condiciones);
  const animo = etiquetaOpcion(camposObservacion.find((c) => c.id === "animo"), valores.animo);
  if (animo) registroObservacion.push(`ánimo ${animo.toLowerCase()}`);
  const alerta = etiquetaOpcion(camposObservacion.find((c) => c.id === "estadoAlerta"), valores.estadoAlerta);
  if (alerta) registroObservacion.push(`estado de alerta ${alerta.toLowerCase()}`);
  if (registroObservacion.length > 0) {
    partesMotivo.push(`En la observación se registran ${unirConY(registroObservacion)}.`);
  }

  bloques.push({
    tipo: "parrafo",
    titulo: "Motivo de consulta",
    texto: partesMotivo.length > 0 ? partesMotivo.join(" ") : "No se registra motivo de consulta en la entrevista.",
  });

  /* ---- Independencia funcional ---- */
  bloques.push({
    tipo: "tabla",
    titulo: "Independencia funcional",
    columnas: [
      { titulo: "Ámbito", fraccion: 0.6 },
      { titulo: "Nivel", fraccion: 0.4 },
    ],
    filas: CAMPOS_ESCALA.map((campo) => [campo.etiqueta, etiquetaOpcion(campo, valores[campo.id]) || "—"]),
  });

  const conteo = contarNivelesIndependencia(valores);
  const distribucion = OPCIONES_INDEPENDENCIA.filter((nivel) => conteo[nivel.valor] > 0).map(
    (nivel) => `${nivel.etiqueta}: ${conteo[nivel.valor]}`
  );
  if (distribucion.length > 0) {
    bloques.push({ tipo: "lista", titulo: "Distribución de niveles", items: distribucion });
  }

  const conApoyo = ambitosConApoyo(valores);
  if (conApoyo.length > 0) {
    bloques.push({
      tipo: "bandera",
      nivel: "alerta",
      texto: `Requiere apoyo en: ${conApoyo.join(", ")}.`,
    });
  }

  /* ---- Descanso y sueño (escala aparte) ---- */
  const descanso = etiquetaOpcion(CAMPO_DESCANSO, valores.descansoSueno);
  if (descanso && valores.descansoSueno !== "normal") {
    bloques.push({
      tipo: "bandera",
      nivel: "alerta",
      texto: `El descanso y sueño se registran como «${descanso}».`,
    });
  }

  /* ---- Hitos del desarrollo ---- */
  bloques.push({
    tipo: "tabla",
    titulo: "Hitos del desarrollo",
    columnas: [
      { titulo: "Hito", fraccion: 0.5 },
      { titulo: "Edad registrada", fraccion: 0.5 },
    ],
    filas: [
      ...CAMPOS_HITOS.map((campo) => [campo.etiqueta, textoValor(valores[campo.id])]),
      [
        "Retraso psicomotor (control de niño sano)",
        valores.retrasoPsicomotor === "si" ? "Sí" : valores.retrasoPsicomotor === "no" ? "No" : "—",
      ],
    ],
  });

  if (valores.retrasoPsicomotor === "si") {
    bloques.push({
      tipo: "bandera",
      nivel: "alerta",
      texto: "Según el control de niño sano hubo retraso del desarrollo psicomotor.",
    });
  }

  /* ---- Funciones cognitivas ---- */
  const itemsCognitivos = FUNCIONES.filter((campo) => valores[campo.id] === "si" || valores[campo.id] === "no").map(
    (campo) => {
      if (valores[campo.id] === "si") return `${campo.etiqueta}: Sí`;
      const observacion = (valores[`${campo.id}EnQue`] ?? "").trim();
      return observacion ? `${campo.etiqueta}: No — ${observacion}` : `${campo.etiqueta}: No`;
    }
  );
  if (itemsCognitivos.length > 0) {
    bloques.push({ tipo: "lista", titulo: "Funciones cognitivas consultadas", items: itemsCognitivos });
  }

  const conDificultad = FUNCIONES.filter((campo) => valores[campo.id] === "no");
  if (conDificultad.length > 0) {
    bloques.push({
      tipo: "bandera",
      nivel: "alerta",
      texto: `Dificultades referidas en: ${conDificultad.map((campo) => campo.etiqueta).join(", ")}.`,
    });
  }

  /* ---- Plan de intervención (en el orden del impreso) ---- */
  const filasPlan = [
    ["Problemática ocupacional", (valores.problemaOcupacional ?? "").trim() || "—"],
  ];
  for (const plazo of PLAZOS) {
    filasPlan.push([
      `${plazo.nombre} · Objetivo general`,
      (valores[`${plazo.prefijo}Objetivo`] ?? "").trim() || "—",
    ]);
    filasPlan.push([
      `${plazo.nombre} · Objetivos específicos`,
      (valores[`${plazo.prefijo}Especificos`] ?? "").trim() || "—",
    ]);
  }
  bloques.push({ tipo: "plan", titulo: "Plan de intervención", filas: filasPlan });

  return bloques;
}

/* ============================================================
   INFORME EN PDF
   ============================================================ */

/* Configuración común del informe (PDF y Word). */
function configInforme(valores) {
  return {
    nombreArchivo: "Informe-Evaluacion-Inicial-Infantil",
    instrumento: "Evaluación inicial · Infantil",
    titulo: "Informe de evaluación inicial",
    subtitulo: "Niño · Entrevista inicial de terapia ocupacional",
    autor: "TeraOcupame · Formulario NIÑO - ADOLESCENTE - ADULTO - PERSONA MAYOR",
    color: [74, 144, 217],
    colorOscuro: [43, 108, 176],
    colorFondo: [237, 228, 216],
    secciones: SECCIONES,
    valores,
    sintesis: sintetizar(valores),
    introduccion:
      "La ficha de evaluación inicial Infantil se completa en la primera atención junto al tutor/a: registra los datos " +
      "de identificación e historial médico declarados por el adulto responsable, el motivo de consulta según la " +
      "entrevista y las áreas sensorial, física, cognitiva y socioemocional según la observación del terapeuta. La " +
      "síntesis automatizada resume la independencia funcional, los hitos del desarrollo y el plan de intervención " +
      "propuesto.",
  };
}

export function descargarInformePDF(valores) {
  descargarInformePDFEvaluacionInicial(configInforme(valores));
}

export function descargarInformeWord(valores) {
  descargarInformeWordEvaluacionInicial(configInforme(valores));
}
