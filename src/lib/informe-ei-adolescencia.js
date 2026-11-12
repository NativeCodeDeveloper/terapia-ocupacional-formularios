import {
  descargarInformePDFEvaluacionInicial,
  descargarInformeWordEvaluacionInicial,
  etiquetaOpcion,
  textoValor,
} from "./informe-evaluacion-inicial.js";

/* ============================================================
   EVALUACIÓN INICIAL · ADOLESCENCIA
   Ficha digital de la primera atención de terapia ocupacional
   para adolescentes (pestaña ADOLESCENTE del formulario NIÑO -
   ADOLESCENTE - ADULTO - PERSONA MAYOR). Transcripción del
   impreso «EI ADOLESCENCIA»: datos personales, historial
   médico, motivo de consulta, antecedentes familiares,
   independencia funcional (esta versión NO evalúa «Gatear»,
   que solo aparece en hitos del desarrollo), hitos del
   desarrollo, áreas sensorial, física y cognitiva (cada
   función con su «Observación»), lenguaje, conducta, interacción
   social, expresión y reconocimiento de emociones, área
   académica (aquí reemplaza al área de juego del infantil),
   habituación, esparcimiento, volición y plan de intervención.
   `sintetizar` construye los bloques del resumen automatizado
   y `descargarInformePDF` genera el PDF con el motor común
   informe-evaluacion-inicial.js.
   ============================================================ */

/* ==== Opciones de las escalas ==== */

const NIVELES_INDEPENDENCIA = [
  { valor: "independiente", etiqueta: "Independiente" },
  { valor: "ayudaModerada", etiqueta: "Ayuda moderada" },
  { valor: "asistencia", etiqueta: "Asistencia" },
  { valor: "dependiente", etiqueta: "Dependiente" },
];

const NIVELES_DESCANSO = [
  { valor: "normal", etiqueta: "Normal" },
  { valor: "conFarmacos", etiqueta: "Con fármacos" },
  { valor: "insomnioConciliacion", etiqueta: "Insomnio de conciliación" },
  { valor: "insomnioMantencion", etiqueta: "Insomnio de mantención" },
];

/* Fila de independencia funcional: escala de 4 niveles con
   observación (el campo `${id}Obs` lo genera el componente). */
const escalaIndependencia = (id, etiqueta) => ({
  id,
  etiqueta,
  tipo: "escala",
  opciones: NIVELES_INDEPENDENCIA,
});

/* Funciones cognitivas del impreso: cada una es un sí/no con
   descripción (hint) y su companion «Observación». */
const FUNCIONES_COGNITIVAS_BASE = [
  {
    id: "atencionSelectiva",
    etiqueta: "Atención selectiva",
    hint: "Centrar la atención en un estímulo por 15 minutos",
  },
  {
    id: "atencionSostenida",
    etiqueta: "Atención sostenida",
    hint: "Mantener la atención en una actividad o estímulo durante un largo periodo de tiempo",
  },
  {
    id: "atencionDividida",
    etiqueta: "Atención dividida",
    hint: "Capacidad de atender a dos o más tareas al mismo tiempo",
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
    hint: "Capacidad de retener y manejar información de una tarea",
  },
];

const camposFuncionCognitiva = ({ id, etiqueta, hint }) => [
  { id, etiqueta, tipo: "siNo", hint },
  { id: `${id}EnQue`, etiqueta: "Observación", tipo: "textoLargo" },
];

/* ==== Esquema completo de la ficha ==== */

export const SECCIONES = [
  {
    id: "datos-personales",
    titulo: "Datos personales",
    identificacion: true,
    campos: [
      { id: "nombre", etiqueta: "Nombre", tipo: "texto" },
      { id: "run", etiqueta: "RUN", tipo: "texto", placeholder: "12.345.678-9" },
      { id: "fechaNacimiento", etiqueta: "Fecha de nacimiento", tipo: "fecha" },
      { id: "edad", etiqueta: "Edad", tipo: "numero", autoDesde: "fechaNacimiento", placeholder: "Años" },
      { id: "nombreTutor", etiqueta: "Nombre tutor/a", tipo: "texto" },
      { id: "direccion", etiqueta: "Dirección", tipo: "texto" },
      { id: "telefono", etiqueta: "Teléfono", tipo: "texto", placeholder: "+56 9 1234 5678" },
      { id: "escolaridad", etiqueta: "Escolaridad", tipo: "texto", placeholder: "Curso o nivel escolar" },
    ],
  },
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
  {
    id: "motivo-consulta",
    titulo: "Motivo de consulta",
    campos: [
      {
        id: "origenConsulta",
        etiqueta: "Origen de la consulta",
        tipo: "radio",
        opciones: [
          { valor: "derivacion", etiqueta: "Derivación" },
          { valor: "espontanea", etiqueta: "Consulta espontánea" },
        ],
      },
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
          { valor: "aplanamientoAfectivo", etiqueta: "Aplanamiento afectivo" },
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
  {
    id: "antecedentes-familiares",
    titulo: "Antecedentes familiares",
    campos: [
      { id: "madre", etiqueta: "Madre", tipo: "texto" },
      { id: "ocupacionMadre", etiqueta: "Ocupación madre", tipo: "texto" },
      { id: "padre", etiqueta: "Padre", tipo: "texto" },
      { id: "ocupacionPadre", etiqueta: "Ocupación padre", tipo: "texto" },
      { id: "hermanos", etiqueta: "Hermanos/Hermanas", tipo: "texto", placeholder: "Cantidad" },
      { id: "nombresHermanos", etiqueta: "Nombres", tipo: "texto" },
      { id: "viveCon", etiqueta: "Vive con", tipo: "texto" },
      { id: "mascotas", etiqueta: "Mascotas", tipo: "texto", placeholder: "Cuáles y cuántas" },
      {
        id: "mascotasUbicacion",
        etiqueta: "Ubicación de las mascotas",
        tipo: "radio",
        opciones: [
          { valor: "dentro", etiqueta: "Adentro" },
          { valor: "fuera", etiqueta: "Afuera" },
        ],
      },
    ],
  },
  {
    id: "independencia-funcional",
    titulo: "Independencia funcional",
    descripcion: "Marque el nivel de asistencia que requiere el adolescente en cada ámbito y registre observaciones cuando corresponda.",
    campos: [
      escalaIndependencia("comer", "Comer"),
      escalaIndependencia("aseoPersonal", "Aseo personal"),
      escalaIndependencia("banarse", "Bañarse"),
      escalaIndependencia("vestirse", "Vestirse"),
      escalaIndependencia("usoBano", "Uso del baño"),
      escalaIndependencia("manejoVejigaIntestinos", "Manejo de vejiga/intestinos"),
      escalaIndependencia("transferencias", "Transferencias"),
      escalaIndependencia("comprension", "Comprensión"),
      escalaIndependencia("solucionProblemas", "Solución de problemas"),
      escalaIndependencia("memoria", "Memoria"),
      {
        id: "descansoSueno",
        etiqueta: "Descanso y sueño",
        tipo: "escala",
        opciones: NIVELES_DESCANSO,
      },
    ],
  },
  {
    id: "hitos-desarrollo",
    titulo: "Hitos del desarrollo",
    campos: [
      { id: "hitoSostenerCabeza", etiqueta: "Sostener la cabeza", tipo: "texto", hint: "Edad de adquisición" },
      { id: "gatear", etiqueta: "Gatear", tipo: "texto", hint: "Edad de adquisición" },
      { id: "caminar", etiqueta: "Caminar", tipo: "texto", hint: "Edad de adquisición" },
      { id: "primerasPalabras", etiqueta: "Primeras palabras", tipo: "texto", hint: "Edad de adquisición" },
      { id: "hitoComprension", etiqueta: "Comprensión", tipo: "texto", hint: "Edad de adquisición" },
      { id: "controlEsfinteres", etiqueta: "Control de esfínteres", tipo: "texto", hint: "Edad de adquisición" },
      { id: "retrasoPsicomotor", etiqueta: "Según control de niño sano, hubo retraso del desarrollo psicomotor", tipo: "siNo" },
    ],
  },
  {
    id: "area-sensorial",
    titulo: "Área sensorial",
    campos: [
      { id: "vision", etiqueta: "Visión", tipo: "textoLargo" },
      { id: "oido", etiqueta: "Oído", tipo: "textoLargo" },
      { id: "tacto", etiqueta: "Tacto", tipo: "textoLargo" },
      { id: "gustoOlfato", etiqueta: "Gusto y olfato", tipo: "textoLargo" },
      { id: "concienciaCorporal", etiqueta: "Conciencia corporal", tipo: "textoLargo" },
      { id: "sensorEquilibrioMovimiento", etiqueta: "Equilibrio y movimiento", tipo: "textoLargo" },
      { id: "planificacionIdeas", etiqueta: "Planificación e ideas", tipo: "textoLargo" },
    ],
  },
  {
    id: "area-fisica",
    titulo: "Área física",
    campos: [
      { id: "motricidadFina", etiqueta: "Motricidad fina", tipo: "textoLargo", hint: "Tomar objetos, apilar bloques, escribir…" },
      { id: "motricidadGruesa", etiqueta: "Motricidad gruesa", tipo: "textoLargo", hint: "Falta del equilibrio, caídas, forma de caminar…" },
      { id: "equilibrioMovimiento", etiqueta: "Equilibrio y movimiento", tipo: "textoLargo", hint: "Caminar, saltar, desempeño en el juego…" },
    ],
  },
  {
    id: "area-cognitiva",
    titulo: "Área cognitiva",
    descripcion: "Para cada función marque si está presente y, si responde que no, precise en qué se ve afectada.",
    campos: FUNCIONES_COGNITIVAS_BASE.flatMap(camposFuncionCognitiva),
  },
  {
    id: "lenguaje",
    titulo: "Lenguaje",
    campos: [
      { id: "lenguajeComprension", etiqueta: "Comprensión", tipo: "textoLargo", hint: "Capacidad de entender instrucciones" },
      { id: "expresion", etiqueta: "Expresión", tipo: "textoLargo", hint: "Organizar pensamientos y expresarlos" },
      {
        id: "lenguajeResolucionProblemas",
        etiqueta: "Resolución de problemas",
        tipo: "textoLargo",
        hint: "Capacidad para utilizar el lenguaje en la resolución de problemas o para planificar actividades",
      },
    ],
  },
  {
    id: "conducta",
    titulo: "Conducta",
    campos: [
      { id: "flexibilidadCognitiva", etiqueta: "Flexibilidad cognitiva", tipo: "textoLargo", hint: "Adaptarse a cambios de actividad, de rutina, o situaciones diarias" },
      { id: "controlInhibitorio", etiqueta: "Control inhibitorio", tipo: "textoLargo", hint: "Control de impulsos y turnos" },
    ],
  },
  {
    id: "interaccion-social",
    titulo: "Interacción social",
    campos: [
      {
        id: "interaccionPares",
        etiqueta: "¿Cómo interactúa el adolescente con sus pares? ¿Busca activamente jugar con ellos?",
        tipo: "textoLargo",
        filas: 4,
      },
      {
        id: "amigosCercanos",
        etiqueta: "¿Tiene amigos cercanos? ¿Con qué frecuencia se reúne con ellos?",
        tipo: "textoLargo",
        filas: 4,
      },
      {
        id: "manejoConflictos",
        etiqueta: "¿Cómo maneja el adolescente con los conflictos con sus pares? ¿Se frustra fácilmente?",
        tipo: "textoLargo",
        filas: 4,
      },
      {
        id: "juegosGrupales",
        etiqueta: "¿Participa en juegos grupales? ¿Cómo se adapta a las reglas y la dinámica del grupo?",
        tipo: "textoLargo",
        filas: 4,
      },
    ],
  },
  {
    id: "expresion-emociones",
    titulo: "Expresión y reconocimiento de emociones",
    campos: [
      {
        id: "emocionesExpresa",
        etiqueta: "¿Cómo expresa sus emociones (alegría, tristeza, frustración, ira)?",
        tipo: "textoLargo",
        filas: 4,
      },
      {
        id: "emocionesReconoce",
        etiqueta: "¿Reconoce y nombra sus propias emociones y las de los demás?",
        tipo: "textoLargo",
        filas: 4,
      },
      {
        id: "emocionesDificiles",
        etiqueta: "¿Hay emociones específicas que le resulten más difíciles de manejar?",
        tipo: "textoLargo",
        filas: 4,
      },
      {
        id: "estrategiasCalma",
        etiqueta: "¿Qué estrategias utiliza su hijo para calmarse cuando está molesto o ansioso?",
        tipo: "textoLargo",
        filas: 4,
      },
      {
        id: "rabietasCrisis",
        etiqueta: "¿Observan rabietas o crisis emocionales frecuentes?",
        tipo: "textoLargo",
        filas: 4,
      },
    ],
  },
  {
    id: "area-academica",
    titulo: "Área académica",
    campos: [
      {
        id: "rendimiento",
        etiqueta: "Rendimiento",
        tipo: "textoLargo",
        filas: 4,
        hint: "¿Cuál es el estado actual del rendimiento académico del adolescente, considerando sus calificaciones y participación en clase?",
      },
      {
        id: "habilidadesEspecificas",
        etiqueta: "Habilidades específicas",
        tipo: "textoLargo",
        filas: 4,
        hint: "¿Se pueden identificar fortalezas o debilidades en la capacidad del adolescente para la comprensión lectora y la producción de textos escritos? ¿Existen áreas específicas de las matemáticas en las que el adolescente muestra dificultades?",
      },
      {
        id: "observacionAcademica",
        etiqueta: "Observación",
        tipo: "textoLargo",
        filas: 4,
        hint: "¿El adolescente muestra disposición para iniciar y completar las tareas escolares?",
      },
      {
        id: "apoyosAprendizaje",
        etiqueta: "Apoyos al aprendizaje",
        tipo: "textoLargo",
        filas: 4,
        hint: "¿Es parte de un programa de integración escolar?",
      },
    ],
  },
  {
    id: "habituacion",
    titulo: "Habituación",
    campos: [
      { id: "habitos", etiqueta: "Hábitos", tipo: "textoLargo" },
      { id: "roles", etiqueta: "Roles", tipo: "textoLargo" },
      { id: "rutina", etiqueta: "Rutina", tipo: "textoLargo" },
    ],
  },
  {
    id: "esparcimiento",
    titulo: "Esparcimiento",
    campos: [
      { id: "ocioTiempoLibre", etiqueta: "Ocio y tiempo libre", tipo: "textoLargo" },
      { id: "participacionSocial", etiqueta: "Participación social", tipo: "textoLargo" },
      { id: "rutinaEsparcimiento", etiqueta: "Rutina", tipo: "textoLargo" },
    ],
  },
  {
    id: "volicion",
    titulo: "Volición",
    campos: [
      { id: "causalidadPersonal", etiqueta: "Causalidad personal", tipo: "textoLargo" },
      { id: "valores", etiqueta: "Valores", tipo: "textoLargo" },
      { id: "intereses", etiqueta: "Intereses", tipo: "textoLargo" },
    ],
  },
  {
    id: "plan-intervencion",
    titulo: "Plan de intervención",
    campos: [
      { id: "problemaOcupacional", etiqueta: "Problemática ocupacional", tipo: "textoLargo", filas: 4 },
      { id: "cortoObjetivo", etiqueta: "Objetivo general", tipo: "textoLargo", hint: "Corto plazo" },
      { id: "cortoEspecificos", etiqueta: "Objetivos específicos", tipo: "textoLargo", filas: 4, hint: "Corto plazo" },
      { id: "medianoObjetivo", etiqueta: "Objetivo general", tipo: "textoLargo", hint: "Mediano plazo" },
      { id: "medianoEspecificos", etiqueta: "Objetivos específicos", tipo: "textoLargo", filas: 4, hint: "Mediano plazo" },
      { id: "largoObjetivo", etiqueta: "Objetivo general", tipo: "textoLargo", hint: "Largo plazo" },
      { id: "largoEspecificos", etiqueta: "Objetivos específicos", tipo: "textoLargo", filas: 4, hint: "Largo plazo" },
    ],
  },
];

/* ==== Índices derivados del esquema (fuente única de verdad) ==== */

const seccionPorId = (id) => SECCIONES.find((s) => s.id === id);

const campoPorId = (id) => {
  for (const seccion of SECCIONES) {
    const campo = seccion.campos.find((c) => c.id === id);
    if (campo) return campo;
  }
  return null;
};

/* Los 10 ámbitos de independencia funcional (sin «Descanso y
   sueño», que tiene su propia escala y bandera). */
const ESCALAS_INDEPENDENCIA = seccionPorId("independencia-funcional")
  .campos.filter((c) => c.tipo === "escala" && c.id !== "descansoSueno");

const CAMPO_DESCANSO = campoPorId("descansoSueno");
const CAMPO_ORIGEN = campoPorId("origenConsulta");
const CAMPO_CONDICIONES = campoPorId("condicionesGenerales");
const CAMPO_ANIMO = campoPorId("animo");
const CAMPO_ALERTA = campoPorId("estadoAlerta");

/* Hitos del desarrollo con edad registrada (los campos texto
   de la sección; el sí/no de retraso va aparte). */
const HITOS = seccionPorId("hitos-desarrollo").campos.filter((c) => c.tipo === "texto");

/* Funciones cognitivas consultadas (id y etiqueta). */
export const FUNCIONES_COGNITIVAS = FUNCIONES_COGNITIVAS_BASE.map(({ id, etiqueta }) => ({ id, etiqueta }));

/* Cuenta cuántos ámbitos de independencia funcional quedaron
   en cada nivel (solo los 10 ámbitos; «Descanso y sueño» no
   participa en esta distribución). */
export function contarNivelesIndependencia(valores = {}) {
  const conteo = { independiente: 0, ayudaModerada: 0, asistencia: 0, dependiente: 0 };
  for (const campo of ESCALAS_INDEPENDENCIA) {
    const valor = valores[campo.id];
    if (valor in conteo) conteo[valor] += 1;
  }
  return conteo;
}

/* ==== Síntesis automatizada ==== */

const limpiar = (valor) => (valor ?? "").toString().trim();

/* Cierra una parte del párrafo con punto si no termina en
   puntuación de fin de oración. */
const cerrar = (texto) => (/[.!?…]$/.test(texto) ? texto : `${texto}.`);

const unirNatural = (partes) => {
  if (partes.length === 0) return "";
  if (partes.length === 1) return partes[0];
  return `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
};

function bloqueMotivoConsulta(valores) {
  const origen = etiquetaOpcion(CAMPO_ORIGEN, valores.origenConsulta);
  const motivo = limpiar(valores.motivoConsulta);
  const refiere = limpiar(valores.refiereQue);
  const partes = [];
  if (origen) partes.push(`Origen de la consulta: ${origen}.`);
  if (motivo) partes.push(cerrar(`Motivo: ${motivo}`));
  if (refiere) partes.push(cerrar(`Refiere que: ${refiere}`));
  const observacion = fraseObservacion(valores);
  if (observacion) partes.push(observacion);
  const texto = partes.length > 0 ? partes.join(" ") : "No se registra motivo de consulta en la entrevista.";
  return { tipo: "parrafo", titulo: "Motivo de consulta", texto };
}

function fraseObservacion(valores) {
  const condiciones = etiquetaOpcion(CAMPO_CONDICIONES, valores.condicionesGenerales);
  const animo = etiquetaOpcion(CAMPO_ANIMO, valores.animo);
  const alerta = etiquetaOpcion(CAMPO_ALERTA, valores.estadoAlerta);
  const partes = [];
  if (condiciones) partes.push(condiciones);
  if (animo) partes.push(`ánimo ${animo.toLowerCase()}`);
  if (alerta) partes.push(`estado de alerta ${alerta.toLowerCase()}`);
  if (partes.length === 0) return "";
  return `En la observación se registran ${unirNatural(partes)}.`;
}

function bloqueTablaIndependencia(valores) {
  const escalas = [...ESCALAS_INDEPENDENCIA, CAMPO_DESCANSO];
  return {
    tipo: "tabla",
    titulo: "Independencia funcional",
    columnas: [{ titulo: "Ámbito" }, { titulo: "Nivel" }],
    filas: escalas.map((campo) => [campo.etiqueta, etiquetaOpcion(campo, valores[campo.id]) || "—"]),
  };
}

function bloqueBanderaIndependencia(valores) {
  const conApoyo = ESCALAS_INDEPENDENCIA.filter((campo) =>
    ["ayudaModerada", "asistencia", "dependiente"].includes(valores[campo.id])
  ).map((campo) => campo.etiqueta);
  if (conApoyo.length === 0) return null;
  return {
    tipo: "bandera",
    nivel: "alerta",
    texto: `Requiere apoyo en ${conApoyo.length} de los ${ESCALAS_INDEPENDENCIA.length} ámbitos evaluados.`,
  };
}

function bloqueBanderaDescanso(valores) {
  const nivel = valores[CAMPO_DESCANSO.id];
  if (!nivel || nivel === "normal") return null;
  return {
    tipo: "bandera",
    nivel: "alerta",
    texto: `Descanso y sueño alterado: ${etiquetaOpcion(CAMPO_DESCANSO, nivel)}.`,
  };
}

function bloqueTablaHitos(valores) {
  return {
    tipo: "tabla",
    titulo: "Hitos del desarrollo",
    columnas: [{ titulo: "Hito" }, { titulo: "Edad registrada" }],
    filas: [
      ...HITOS.map((campo) => [campo.etiqueta, textoValor(valores[campo.id])]),
      [
        "Retraso psicomotor (control de niño sano)",
        valores.retrasoPsicomotor === "si" ? "Sí" : valores.retrasoPsicomotor === "no" ? "No" : "—",
      ],
    ],
  };
}

function bloqueBanderaHitos(valores) {
  if (valores.retrasoPsicomotor === "si") {
    return {
      tipo: "bandera",
      nivel: "alerta",
      texto: "Según el control de niño sano se registró retraso del desarrollo psicomotor.",
    };
  }
  return null;
}

function bloqueListaCognitiva(valores) {
  const items = [];
  for (const { id, etiqueta } of FUNCIONES_COGNITIVAS) {
    const respuesta = valores[id];
    if (respuesta === "si") {
      items.push(`${etiqueta}: Sí`);
    } else if (respuesta === "no") {
      const detalle = limpiar(valores[`${id}EnQue`]);
      items.push(detalle ? `${etiqueta}: No — ${detalle}` : `${etiqueta}: No`);
    }
  }
  if (items.length === 0) return null;
  return { tipo: "lista", titulo: "Funciones cognitivas consultadas", items };
}

function bloqueAreaAcademica(valores) {
  const rendimiento = limpiar(valores.rendimiento);
  const apoyos = limpiar(valores.apoyosAprendizaje);
  const partes = [];
  if (rendimiento) partes.push(cerrar(`Rendimiento académico: ${rendimiento}`));
  if (apoyos) partes.push(cerrar(`Apoyos al aprendizaje: ${apoyos}`));
  if (partes.length === 0) return null;
  return { tipo: "parrafo", titulo: "Área académica", texto: partes.join(" ") };
}

/* Plan de intervención en el orden del impreso: filas
   [etiqueta, valor] para la tabla de dos columnas. */
function bloquePlanIntervencion(valores) {
  const filas = [["Problemática ocupacional", limpiar(valores.problemaOcupacional) || "—"]];
  const plazos = [
    ["Corto plazo", "corto"],
    ["Mediano plazo", "mediano"],
    ["Largo plazo", "largo"],
  ];
  for (const [nombre, prefijo] of plazos) {
    filas.push([`${nombre} · Objetivo general`, limpiar(valores[`${prefijo}Objetivo`]) || "—"]);
    filas.push([`${nombre} · Objetivos específicos`, limpiar(valores[`${prefijo}Especificos`]) || "—"]);
  }
  return { tipo: "plan", titulo: "Plan de intervención", filas };
}

export function sintetizar(valores = {}) {
  const bloques = [];
  bloques.push(bloqueMotivoConsulta(valores));
  bloques.push(bloqueTablaIndependencia(valores));
  const banderaIndependencia = bloqueBanderaIndependencia(valores);
  if (banderaIndependencia) bloques.push(banderaIndependencia);
  const banderaDescanso = bloqueBanderaDescanso(valores);
  if (banderaDescanso) bloques.push(banderaDescanso);
  bloques.push(bloqueTablaHitos(valores));
  const banderaHitos = bloqueBanderaHitos(valores);
  if (banderaHitos) bloques.push(banderaHitos);
  const listaCognitiva = bloqueListaCognitiva(valores);
  if (listaCognitiva) bloques.push(listaCognitiva);
  const bloqueAcademico = bloqueAreaAcademica(valores);
  if (bloqueAcademico) bloques.push(bloqueAcademico);
  bloques.push(bloquePlanIntervencion(valores));
  return bloques;
}

/* ==== Informe en PDF ==== */

/* Configuración común del informe (PDF y Word). */
function configInforme(valores) {
  return {
    nombreArchivo: "Informe-Evaluacion-Inicial-Adolescencia",
    instrumento: "Evaluación inicial · Adolescencia",
    titulo: "Informe de evaluación inicial",
    subtitulo: "Adolescente · Entrevista inicial de terapia ocupacional",
    autor: "TeraOcupame · Formulario NIÑO - ADOLESCENTE - ADULTO - PERSONA MAYOR",
    color: [124, 179, 66],
    colorOscuro: [86, 140, 45],
    colorFondo: [239, 234, 227],
    secciones: SECCIONES,
    valores,
    sintesis: sintetizar(valores),
  };
}

export function descargarInformePDF(valores) {
  descargarInformePDFEvaluacionInicial(configInforme(valores));
}

export function descargarInformeWord(valores) {
  descargarInformeWordEvaluacionInicial(configInforme(valores));
}
