import {
  descargarInformePDFEvaluacionInicial,
  descargarInformeWordEvaluacionInicial,
  etiquetaOpcion,
  textoValor,
} from "./informe-evaluacion-inicial.js";

/* ============================================================
   EVALUACIÓN INICIAL · PERSONA MAYOR (PESTAÑA PERSONA MAYOR)
   Ficha de entrevista inicial de terapia ocupacional de
   TeraOcupame, transcrita del impreso de 10 páginas. La pauta
   titula la segunda sección «HISTORAL MÉDICO» por un error
   ortográfico del original; aquí se usa «Historial médico».
   La pregunta «¿Piensa que es maravilloso estar vivo?» está
   repetida en Salud mental del impreso; se incluye una sola
   vez. El impreso tiene dos secciones propias de esta ficha:
   «Síndromes geriátricos» y «Entorno y adaptaciones». En las
   escalas del impreso, «Alimentación» (básica) y «Cuidado de
   otros» (instrumental) usan «Asistencia» como segunda opción
   y el resto usa «Supervisión»: se transcribe tal cual.
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
  { valor: "supervision", etiqueta: "Supervisión" },
  { valor: "ayudaModerada", etiqueta: "Ayuda moderada" },
  { valor: "dependiente", etiqueta: "Dependiente" },
];

/* Variante del impreso con «Asistencia» en lugar de
   «Supervisión» (Alimentación en básica y Cuidado de otros en
   instrumental). */
const OPCIONES_INDEPENDENCIA_ASISTENCIA = [
  { valor: "independiente", etiqueta: "Independiente" },
  { valor: "asistencia", etiqueta: "Asistencia" },
  { valor: "ayudaModerada", etiqueta: "Ayuda moderada" },
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
   como hint y el companion «Observación» del impreso. */
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
      { id: "estadoCivil", etiqueta: "Estado civil", tipo: "texto" },
      { id: "direccion", etiqueta: "Dirección", tipo: "texto" },
      { id: "telefono", etiqueta: "Teléfono", tipo: "texto" },
      { id: "ocupacion", etiqueta: "Ocupación", tipo: "texto" },
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
      { id: "farmacos", etiqueta: "Fármacos", tipo: "textoLargo" },
      { id: "alergias", etiqueta: "Alergias", tipo: "textoLargo" },
      { id: "habitoTabaco", etiqueta: "Hábitos · Tabaco", tipo: "siNo" },
      { id: "habitoAlcohol", etiqueta: "Hábitos · Alcohol", tipo: "siNo" },
      { id: "habitoDrogas", etiqueta: "Hábitos · Drogas", tipo: "siNo" },
      { id: "situacionDiscapacidad", etiqueta: "Situación de discapacidad", tipo: "siNo" },
      { id: "credencialDiscapacidad", etiqueta: "Credencial de discapacidad", tipo: "siNo" },
      { id: "ayudasTecnicasHistorial", etiqueta: "Ayudas técnicas", tipo: "texto", placeholder: "Bastón, andador, silla de ruedas, audífonos…" },
    ],
  },
  /* ==== 3. Motivo de consulta ==== */
  {
    id: "motivo-consulta",
    titulo: "Motivo de consulta",
    campos: [
      { id: "origen", etiqueta: "Origen de la consulta", tipo: "radio", opciones: OPCIONES_ORIGEN },
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
        id: "orientacion",
        etiqueta: "Orientación",
        tipo: "radio",
        opciones: [
          { valor: "orientadoTemporoespacial", etiqueta: "Orientado temporoespacial" },
          { valor: "orientadoParcial", etiqueta: "Orientado temporal o espacial" },
          { valor: "desorientado", etiqueta: "Desorientado temporoespacial" },
        ],
      },
    ],
  },
  /* ==== 4. Antecedentes familiares ==== */
  {
    id: "antecedentes-familiares",
    titulo: "Antecedentes familiares",
    campos: [
      { id: "hijasOs", etiqueta: "Hijas/os", tipo: "texto" },
      { id: "ocupacionHijasOs", etiqueta: "Ocupación hijas/os", tipo: "texto" },
      { id: "pareja", etiqueta: "Pareja", tipo: "texto" },
      { id: "ocupacionPareja", etiqueta: "Ocupación pareja", tipo: "texto" },
      { id: "viveCon", etiqueta: "Vive con", tipo: "texto" },
      { id: "nombres", etiqueta: "Nombres", tipo: "texto" },
      { id: "mascotas", etiqueta: "Mascotas", tipo: "texto" },
      { id: "mascotasUbicacion", etiqueta: "Mascotas", tipo: "radio", opciones: OPCIONES_MASCOTAS },
    ],
  },
  /* ==== 5. Independencia funcional básica (escalas con Obs) ==== */
  {
    id: "independencia-basica",
    titulo: "Independencia funcional básica",
    descripcion:
      "Marque el nivel que corresponde a cada ámbito según la entrevista y la observación del terapeuta.",
    campos: [
      { id: "alimentacion", etiqueta: "Alimentación", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA_ASISTENCIA },
      { id: "higieneMenor", etiqueta: "Higiene menor", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "higieneMayor", etiqueta: "Higiene mayor", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "vestuario", etiqueta: "Vestuario", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "aseoPerineal", etiqueta: "Aseo perineal", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      {
        id: "manejoVesicalIntestinal",
        etiqueta: "Manejo vesical/intestinal",
        tipo: "escala",
        opciones: OPCIONES_INDEPENDENCIA,
      },
      {
        id: "transferenciasCamaSilla",
        etiqueta: "Transferencias cama/silla",
        tipo: "escala",
        opciones: OPCIONES_INDEPENDENCIA,
      },
      { id: "transferenciasBano", etiqueta: "Transferencias al baño", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "transferenciasDucha", etiqueta: "Transferencias a ducha", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "marcha", etiqueta: "Marcha con o sin silla de ruedas", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "subirEscaleras", etiqueta: "Subir escaleras", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "descansoSueno", etiqueta: "Descanso y sueño", tipo: "escala", opciones: OPCIONES_DESCANSO },
    ],
  },
  /* ==== 6. Independencia funcional instrumental (escalas con Obs) ==== */
  {
    id: "independencia-instrumental",
    titulo: "Independencia funcional instrumental",
    descripcion:
      "Marque el nivel que corresponde a cada ámbito según la entrevista y la observación del terapeuta.",
    campos: [
      { id: "cuidadoDeOtros", etiqueta: "Cuidado de otros", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA_ASISTENCIA },
      {
        id: "gestionComunicacion",
        etiqueta: "Gestión de la comunicación",
        tipo: "escala",
        opciones: OPCIONES_INDEPENDENCIA,
      },
      {
        id: "movilidadComunidad",
        etiqueta: "Movilidad en la comunidad",
        tipo: "escala",
        opciones: OPCIONES_INDEPENDENCIA,
      },
      { id: "mantencionSalud", etiqueta: "Mantención de la salud", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "manejoHogar", etiqueta: "Manejo del hogar", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      {
        id: "manejoVesicalIntestinalInstrumental",
        etiqueta: "Manejo vesical/intestinal",
        tipo: "escala",
        opciones: OPCIONES_INDEPENDENCIA,
      },
      { id: "preparacionComida", etiqueta: "Preparación de comida", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "limpiezaHogar", etiqueta: "Limpieza del hogar", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "seguridadEmergencia", etiqueta: "Seguridad y emergencia", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
      { id: "compras", etiqueta: "Compras", tipo: "escala", opciones: OPCIONES_INDEPENDENCIA },
    ],
  },
  /* ==== 7. Área física ==== */
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
        "Ha tenido caídas por falta del equilibrio…",
        4
      ),
      { id: "ayudasTecnicasFisicas", etiqueta: "Ayudas técnicas", tipo: "textoLargo", filas: 2 },
      { id: "fuerza", etiqueta: "Fuerza", tipo: "textoLargo", filas: 2 },
      { id: "rangoArticular", etiqueta: "Rango articular", tipo: "textoLargo", filas: 2 },
      { id: "palpacion", etiqueta: "A la palpación", tipo: "textoLargo", filas: 2 },
      { id: "coloracionPiel", etiqueta: "Coloración de la piel", tipo: "textoLargo", filas: 2 },
      { id: "sensibilidad", etiqueta: "Sensibilidad", tipo: "textoLargo", filas: 2 },
      { id: "cambiosTemperatura", etiqueta: "Cambios de temperatura", tipo: "textoLargo", filas: 2 },
      textoConHint("eva", "EVA", "Escala visual análoga del dolor", 2),
    ],
  },
  /* ==== 8. Síndromes geriátricos (sección propia de Persona Mayor) ==== */
  {
    id: "sindromes-geriatricos",
    titulo: "Síndromes geriátricos",
    descripcion:
      "Sección propia de la ficha Persona mayor: consulte cada pregunta y registre la respuesta u observación.",
    campos: [
      textoConHint("movilidadCaidas", "Movilidad y caídas", "¿Ha sufrido alguna caída en los últimos 12 meses?"),
      textoConHint("incontinencia", "Incontinencia", "¿Tiene escapes involuntarios de orina?"),
      textoConHint("deterioroCognitivo", "Deterioro cognitivo", "¿Ha notado cambios en su memoria en el último año?"),
      textoConHint(
        "depresion",
        "Depresión",
        "¿Se ha sentido triste o desanimado la mayor parte del tiempo en las últimas dos semanas?"
      ),
      textoConHint("polifarmacia", "Polifarmacia", "¿Toma cinco o más medicamentos recetados diariamente?"),
      textoConHint("fragilidad", "Fragilidad", "¿Se siente débil o cansado con frecuencia?"),
      textoConHint("sensorial", "Sensorial", "¿Tiene dificultades para oír o ver?"),
      textoConHint("socioeconomico", "Socioeconómico", "¿Considera que sus ingresos cubren sus necesidades básicas?"),
    ],
  },
  /* ==== 9. Otras consideraciones ==== */
  {
    id: "otras-consideraciones",
    titulo: "Otras consideraciones",
    campos: [
      { id: "mareos", etiqueta: "Mareos", tipo: "siNo" },
      { id: "temblor", etiqueta: "Temblor", tipo: "siNo" },
      { id: "alteracionEquilibrio", etiqueta: "Alteración del equilibrio", tipo: "siNo" },
      { id: "dolorCadera", etiqueta: "Dolor de cadera", tipo: "siNo" },
      { id: "dolorHombro", etiqueta: "Dolor de hombro", tipo: "siNo" },
      { id: "dolorRodilla", etiqueta: "Dolor de rodilla", tipo: "siNo" },
      {
        id: "vision",
        etiqueta: "Visión",
        tipo: "radio",
        opciones: [
          { valor: "buena", etiqueta: "Buena" },
          { valor: "mala", etiqueta: "Mala" },
        ],
      },
      {
        id: "audicion",
        etiqueta: "Audición",
        tipo: "radio",
        opciones: [
          { valor: "buena", etiqueta: "Buena" },
          { valor: "mala", etiqueta: "Mala" },
        ],
      },
    ],
  },
  /* ==== 10. Salud mental (autoinforme; la pregunta «¿Piensa que
     es maravilloso estar vivo?» del impreso se incluye una vez) ==== */
  {
    id: "salud-mental",
    titulo: "Salud mental",
    descripcion: "Consulte con la propia persona mayor y registre cada respuesta del autoinforme.",
    campos: [
      { id: "satisfaccionVida", etiqueta: "Se siente satisfecha de su vida", tipo: "siNo" },
      { id: "buenAnimo", etiqueta: "¿Tiene buen ánimo?", tipo: "siNo" },
      { id: "abandonoActividades", etiqueta: "¿Ha abandonado actividades de su interés?", tipo: "siNo" },
      { id: "prefiereCasa", etiqueta: "¿Prefiere quedarse en casa que salir?", tipo: "siNo" },
      { id: "maravillosoVivo", etiqueta: "¿Piensa que es maravilloso estar vivo?", tipo: "siNo" },
      { id: "seSienteInutil", etiqueta: "¿Se siente «inútil» en este momento?", tipo: "siNo" },
      { id: "llenaEnergia", etiqueta: "¿Se siente llena de energía?", tipo: "siNo" },
      { id: "mayoriaMejor", etiqueta: "¿Cree que la mayoría está mejor que usted?", tipo: "siNo" },
      { id: "alucinaciones", etiqueta: "¿Ha tenido alucinaciones visuales o auditivas?", tipo: "siNo" },
      { id: "ideacionSuicida", etiqueta: "¿Presenta ideación, comunicación o acto suicida?", tipo: "siNo" },
      { id: "pocaEnergia", etiqueta: "¿Se ha quedado con poca energía?", tipo: "siNo" },
      { id: "muyPreocupado", etiqueta: "¿Ha estado muy preocupado por algo?", tipo: "siNo" },
      { id: "perdidoInteres", etiqueta: "¿Ha perdido el interés por las cosas?", tipo: "siNo" },
      { id: "dificultadConcentrarse", etiqueta: "¿Ha tenido dificultad para concentrarse?", tipo: "siNo" },
      { id: "sinEsperanzas", etiqueta: "¿Se ha sentido sin esperanzas?", tipo: "siNo" },
    ],
  },
  /* ==== 11. Área cognitiva ==== */
  {
    id: "area-cognitiva",
    titulo: "Área cognitiva",
    descripcion:
      "Consulte si la función está presente. Si responde «No», registre en «Observación» la situación observada.",
    campos: [
      textoConHint("generalidades", "Generalidades", "¿Ha tenido olvidos frecuentes?", 4),
      ...FUNCIONES_COGNITIVAS.flatMap((funcion) => [
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
    ],
  },
  /* ==== 12. Lenguaje ==== */
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
  /* ==== 13. Participación social ==== */
  {
    id: "participacion-social",
    titulo: "Participación social",
    campos: [
      {
        id: "interaccionPares",
        etiqueta: "¿Cómo interactúa con sus pares? ¿Tiene iniciativa de realizar cosas nuevas?",
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
        etiqueta: "¿Cómo maneja los conflictos con sus pares? ¿Se frustra fácilmente?",
        tipo: "textoLargo",
        filas: 4,
      },
      {
        id: "interaccionActividadesGrupales",
        etiqueta: "¿Participa en actividades grupales o familiares?",
        tipo: "textoLargo",
        filas: 4,
      },
    ],
  },
  /* ==== 14. Entorno y adaptaciones (sección propia de Persona Mayor) ==== */
  {
    id: "entorno-adaptaciones",
    titulo: "Entorno y adaptaciones",
    descripcion:
      "Sección propia de la ficha Persona mayor: registre las barreras del entorno y las adaptaciones disponibles o requeridas.",
    campos: [
      textoConHint(
        "barrerasEntorno",
        "Barreras en el entorno",
        "¿Existen barreras en hogar o entorno que dificulten su desplazamiento o otras actividades?",
        4
      ),
      textoConHint("adaptacionesDisponibles", "Adaptaciones disponibles", "¿Hay adaptaciones que le ayuden en su entorno?", 4),
      textoConHint(
        "adaptacionRequerida",
        "Adaptación requerida",
        "¿Requiere alguna adaptación para realizar sus actividades de la vida diaria?",
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
const CAMPOS_BASICA = SECCIONES.find((s) => s.id === "independencia-basica").campos;
const CAMPOS_INSTRUMENTAL = SECCIONES.find((s) => s.id === "independencia-instrumental").campos;
const CAMPOS_INDEPENDENCIA = CAMPOS_ESCALA.filter((c) => c.id !== "descansoSueno");
const CAMPO_DESCANSO = CAMPOS_ESCALA.find((c) => c.id === "descansoSueno");
const SECCION_MOTIVO = SECCIONES.find((s) => s.id === "motivo-consulta");
const CAMPO_ORIGEN = SECCION_MOTIVO.campos.find((c) => c.id === "origen");
const CAMPOS_OBSERVACION = ["condicionesGenerales", "animo", "orientacion"].map((id) =>
  SECCION_MOTIVO.campos.find((c) => c.id === id)
);
const SECCION_SINDROMES = SECCIONES.find((s) => s.id === "sindromes-geriatricos");
const SECCION_OTRAS = SECCIONES.find((s) => s.id === "otras-consideraciones");
const SI_NO_OTRAS = SECCION_OTRAS.campos.filter((c) => c.tipo === "siNo");
const SECCION_SALUD_MENTAL = SECCIONES.find((s) => s.id === "salud-mental");
const CAMPOS_SALUD_MENTAL = SECCION_SALUD_MENTAL.campos.filter((c) => c.tipo === "siNo");
const CAMPOS_COGNITIVOS = SECCIONES.find((s) => s.id === "area-cognitiva").campos.filter(
  (c) => c.tipo === "siNo"
);
const CAMPOS_ENTORNO = SECCIONES.find((s) => s.id === "entorno-adaptaciones").campos;
const PLAZOS = [
  { prefijo: "corto", nombre: "Corto plazo" },
  { prefijo: "mediano", nombre: "Mediano plazo" },
  { prefijo: "largo", nombre: "Largo plazo" },
];
const NIVELES_APOYO = ["supervision", "asistencia", "ayudaModerada", "dependiente"];

/* Etiquetas y orden de los niveles para la distribución
   combinada de básica + instrumental (los valores del impreso). */
const NIVEL_ETIQUETA = {
  independiente: "Independiente",
  supervision: "Supervisión",
  asistencia: "Asistencia",
  ayudaModerada: "Ayuda moderada",
  dependiente: "Dependiente",
};
const ORDEN_NIVELES = ["independiente", "supervision", "asistencia", "ayudaModerada", "dependiente"];

/* Respuesta que constituye indicador de riesgo en el
   autoinforme de salud mental. Alucinaciones e ideación,
   comunicación o acto suicida se modelan como banderas
   propias, fuera de este conteo. */
export const INDICADORES_RIESGO_SALUD_MENTAL = {
  satisfaccionVida: "no",
  buenAnimo: "no",
  abandonoActividades: "si",
  prefiereCasa: "si",
  maravillosoVivo: "no",
  seSienteInutil: "si",
  llenaEnergia: "no",
  mayoriaMejor: "si",
  pocaEnergia: "si",
  muyPreocupado: "si",
  perdidoInteres: "si",
  dificultadConcentrarse: "si",
  sinEsperanzas: "si",
};

/* Conteo de niveles elegidos en los 21 ámbitos de independencia
   funcional (11 básicos + 10 instrumentales; el descanso y
   sueño se modela aparte). */
export function contarNivelesIndependencia(valores = {}) {
  const conteo = { independiente: 0, supervision: 0, asistencia: 0, ayudaModerada: 0, dependiente: 0 };
  for (const campo of CAMPOS_INDEPENDENCIA) {
    const nivel = valores[campo.id];
    if (nivel in conteo) conteo[nivel] += 1;
  }
  return conteo;
}

/* Ámbitos de independencia funcional que requieren apoyo
   (supervisión, asistencia, ayuda moderada o dependiente). */
export function ambitosConApoyo(valores = {}) {
  return CAMPOS_INDEPENDENCIA.filter((campo) => NIVELES_APOYO.includes(valores[campo.id])).map(
    (campo) => campo.etiqueta
  );
}

/* Etiquetas de los indicadores de riesgo de salud mental
   efectivamente presentes según las respuestas. Los campos sin
   regla (alucinaciones e ideación suicida) quedan fuera. */
export function etiquetasIndicadoresRiesgoSaludMental(valores = {}) {
  return CAMPOS_SALUD_MENTAL.filter((campo) => {
    const riesgo = INDICADORES_RIESGO_SALUD_MENTAL[campo.id];
    return riesgo !== undefined && valores[campo.id] === riesgo;
  }).map((campo) => campo.etiqueta);
}

export function contarIndicadoresRiesgoSaludMental(valores = {}) {
  return etiquetasIndicadoresRiesgoSaludMental(valores).length;
}

/* Síndromes geriátricos con texto registrado (respuesta
   positiva u observación). */
export function contarSindromesGeriatricos(valores = {}) {
  return SECCION_SINDROMES.campos.filter((campo) => (valores[campo.id] ?? "").trim() !== "").length;
}

/* ============================================================
   SÍNTESIS AUTOMATIZADA
   ============================================================ */

export function sintetizar(valores = {}) {
  const bloques = [];

  /* ---- Motivo de consulta ---- */
  const partesMotivo = [];
  const origen = etiquetaOpcion(CAMPO_ORIGEN, valores.origen);
  if (origen) partesMotivo.push(`Origen de la consulta: ${origen}.`);
  const refiere = (valores.refiereQue ?? "").trim();
  if (refiere) partesMotivo.push(`Refiere que: ${refiere}`);
  const observa = (valores.seObserva ?? "").trim();
  if (observa) partesMotivo.push(`Se observa: ${observa}`);

  const registroObservacion = CAMPOS_OBSERVACION.map((campo) =>
    etiquetaOpcion(campo, valores[campo.id])
  );
  if (registroObservacion.some((registro) => registro)) {
    partesMotivo.push(
      `En la observación se registran ${registroObservacion[0] || "—"}, ánimo ${
        registroObservacion[1] ? registroObservacion[1].toLowerCase() : "—"
      } y orientación ${registroObservacion[2] ? registroObservacion[2].toLowerCase() : "—"}.`
    );
  }

  bloques.push({
    tipo: "parrafo",
    titulo: "Motivo de consulta",
    texto: partesMotivo.length > 0 ? partesMotivo.join(" ") : "No se registra motivo de consulta en la entrevista.",
  });

  /* ---- Independencia funcional básica e instrumental ---- */
  bloques.push({
    tipo: "tabla",
    titulo: "Independencia funcional básica",
    columnas: [
      { titulo: "Ámbito", fraccion: 0.6 },
      { titulo: "Nivel", fraccion: 0.4 },
    ],
    filas: CAMPOS_BASICA.map((campo) => [campo.etiqueta, etiquetaOpcion(campo, valores[campo.id]) || "—"]),
  });
  bloques.push({
    tipo: "tabla",
    titulo: "Independencia funcional instrumental",
    columnas: [
      { titulo: "Ámbito", fraccion: 0.6 },
      { titulo: "Nivel", fraccion: 0.4 },
    ],
    filas: CAMPOS_INSTRUMENTAL.map((campo) => [campo.etiqueta, etiquetaOpcion(campo, valores[campo.id]) || "—"]),
  });

  const conteo = contarNivelesIndependencia(valores);
  const distribucion = ORDEN_NIVELES.filter((nivel) => conteo[nivel] > 0).map(
    (nivel) => `${NIVEL_ETIQUETA[nivel]}: ${conteo[nivel]}`
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

  /* ---- Síndromes geriátricos ---- */
  bloques.push({
    tipo: "tabla",
    titulo: "Síndromes geriátricos",
    columnas: [
      { titulo: "Síndrome", fraccion: 0.4 },
      { titulo: "Respuesta registrada", fraccion: 0.6 },
    ],
    filas: SECCION_SINDROMES.campos.map((campo) => [campo.etiqueta, textoValor(valores[campo.id])]),
  });



  /* ---- Otras consideraciones ---- */
  const itemsOtras = [];
  for (const campo of SECCION_OTRAS.campos) {
    const valor = valores[campo.id];
    if (valor !== "si" && valor !== "no" && valor !== "buena" && valor !== "mala") continue;
    itemsOtras.push(`${campo.etiqueta}: ${etiquetaOpcion(campo, valor)}`);
  }
  if (itemsOtras.length > 0) {
    bloques.push({ tipo: "lista", titulo: "Otras consideraciones registradas", items: itemsOtras });
  }

  const positivos = SI_NO_OTRAS.filter((campo) => valores[campo.id] === "si");
  if (positivos.length >= 2) {
    bloques.push({
      tipo: "bandera",
      nivel: "alerta",
      texto: `Se registran ${positivos.length} hallazgos positivos en otras consideraciones: ${positivos
        .map((campo) => campo.etiqueta)
        .join(", ")}.`,
    });
  }

  /* ---- Salud mental ---- */
  if (valores.ideacionSuicida === "si") {
    bloques.push({
      tipo: "bandera",
      nivel: "critico",
      texto:
        "Se registra ideación/comunicación/acto suicida: activar protocolo de crisis y derivación inmediata.",
    });
  }

  if (valores.alucinaciones === "si") {
    bloques.push({
      tipo: "bandera",
      nivel: "alerta",
      texto: "Se registran alucinaciones visuales o auditivas: derivar a evaluación médica y registrar contexto y frecuencia.",
    });
  }

  /* Tamizaje integrado de salud mental: se describe el estado
     de la pauta sin levantar alerta automática (pauta
     integrada, no obligatoria de aplicar); la revisión
     clínica decide. */
  const consultadosSM = SECCION_SALUD_MENTAL.campos.filter(
    (campo) => campo.tipo === "siNo" && (valores[campo.id] === "si" || valores[campo.id] === "no")
  );
  if (consultadosSM.length > 0) {
    const etiquetasRiesgo = etiquetasIndicadoresRiesgoSaludMental(valores);
    bloques.push({
      tipo: "parrafo",
      titulo: "Salud mental (tamizaje integrado)",
      texto:
        `Se aplicaron ${consultadosSM.length} de ${SECCION_SALUD_MENTAL.campos.filter((c) => c.tipo === "siNo").length} ítems de la pauta integrada de salud mental.` +
        (etiquetasRiesgo.length > 0 ? ` Respuestas de referencia: ${etiquetasRiesgo.join(", ")}.` : ""),
    });
  }

  /* ---- Área cognitiva ---- */
  const itemsCognitivos = CAMPOS_COGNITIVOS.filter(
    (campo) => valores[campo.id] === "si" || valores[campo.id] === "no"
  ).map((campo) => {
    if (valores[campo.id] === "si") return `${campo.etiqueta}: Sí`;
    const enQue = (valores[`${campo.id}EnQue`] ?? "").trim();
    return enQue ? `${campo.etiqueta}: No — ${enQue}` : `${campo.etiqueta}: No`;
  });
  if (itemsCognitivos.length > 0) {
    bloques.push({ tipo: "lista", titulo: "Funciones cognitivas consultadas", items: itemsCognitivos });
  }

  const conDificultad = CAMPOS_COGNITIVOS.filter((campo) => valores[campo.id] === "no");
  if (conDificultad.length > 0) {
    bloques.push({
      tipo: "bandera",
      nivel: "alerta",
      texto: `Dificultades referidas en: ${conDificultad.map((campo) => campo.etiqueta).join(", ")}.`,
    });
  }

  /* ---- Entorno y adaptaciones ---- */
  const lineasEntorno = [];
  for (const campo of CAMPOS_ENTORNO) {
    const texto = (valores[campo.id] ?? "").trim();
    if (texto) lineasEntorno.push(`${campo.etiqueta}: ${texto}`);
  }
  if (lineasEntorno.length > 0) {
    bloques.push({ tipo: "parrafo", titulo: "Entorno y adaptaciones", texto: lineasEntorno.join(" ") });
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
    nombreArchivo: "Informe-Evaluacion-Inicial-Persona-Mayor",
    instrumento: "Evaluación inicial · Persona mayor",
    titulo: "Informe de evaluación inicial",
    subtitulo: "Persona mayor · Entrevista inicial de terapia ocupacional",
    autor: "TeraOcupame · Formulario NIÑO - ADOLESCENTE - ADULTO - PERSONA MAYOR",
    color: [139, 125, 224],
    colorOscuro: [99, 74, 191],
    colorFondo: [237, 228, 216],
    secciones: SECCIONES,
    valores,
    sintesis: sintetizar(valores),
    introduccion:
      "La ficha de evaluación inicial Persona mayor se completa en la primera atención con la propia persona, su " +
      "cuidador y según la observación del terapeuta ocupacional: registra los datos de identificación y el " +
      "historial médico declarados, el motivo de consulta, la independencia funcional básica e instrumental, los " +
      "síndromes geriátricos, la salud mental, las áreas física y cognitiva, y el entorno y sus adaptaciones. La " +
      "síntesis automatizada resume los hallazgos y el plan de intervención propuesto.",
  };
}

export function descargarInformePDF(valores) {
  descargarInformePDFEvaluacionInicial(configInforme(valores));
}

export function descargarInformeWord(valores) {
  descargarInformeWordEvaluacionInicial(configInforme(valores));
}
