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
   Decisiones de la revisión de auditoría (fuente: impreso +
   instrucciones del cliente):
   · Salud mental: el impreso repite «¿Piensa que es maravilloso
     estar vivo?» (16 casillas, 15 preguntas únicas) y el cliente
     pidió retirar del cuestionario activo «¿Ha tenido
     alucinaciones visuales o auditivas?» y «¿Presenta ideación,
     comunicación o acto suicida?». El cuestionario activo queda
     en 13 preguntas numeradas 1-13 en el orden de lectura del
     impreso. La pauta adicional de tamizaje (15 ítems) no está
     disponible en el proyecto: no se agregan ni se puntúan
     ítems para completar un total de 15 y no se aplican puntos
     de corte. Las dos preguntas retiradas solo pueden llegar
     con datos históricos; en ese caso sus respuestas siguen
     generando alerta clínica en el informe (no se borra
     información previa).
   · Síndromes geriátricos: cada ítem se presenta como Sí/No con
     su observación al lado y la pregunta original del impreso.
   · El informe reproduce el registro completo del impreso en su
     orden, con análisis narrativo de las independencias
     funcional básica e instrumental (construido solo con
     respuestas registradas), sin «Distribución de niveles» y
     cerrando con «Hallazgos relevantes y alertas clínicas» en
     hoja propia: los hallazgos son descriptivos y las alertas
     solo se activan con criterios definidos.
   En las escalas del impreso, «Alimentación» (básica) y «Cuidado
   de otros» (instrumental) usan «Asistencia» como segunda opción
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

const OPCIONES_SI_NO = [
  { valor: "si", etiqueta: "Sí" },
  { valor: "no", etiqueta: "No" },
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

/* Síndromes geriátricos del impreso: dominio + pregunta
   original. Cada ítem se completa como Sí/No con observación
   (escala del componente: la observación `${id}Obs` se genera
   fuera del esquema). */
const SINDROMES_GERIATRICOS = [
  {
    id: "movilidadCaidas",
    etiqueta: "Movilidad y caídas",
    hint: "¿Ha sufrido alguna caída en los últimos 12 meses?",
  },
  {
    id: "incontinencia",
    etiqueta: "Incontinencia",
    hint: "¿Tiene escapes involuntarios de orina?",
  },
  {
    id: "deterioroCognitivo",
    etiqueta: "Deterioro cognitivo",
    hint: "¿Ha notado cambios en su memoria en el último año?",
  },
  {
    id: "depresion",
    etiqueta: "Depresión",
    hint: "¿Se ha sentido triste o desanimado la mayor parte del tiempo en las últimas dos semanas?",
  },
  {
    id: "polifarmacia",
    etiqueta: "Polifarmacia",
    hint: "¿Toma cinco o más medicamentos recetados diariamente?",
  },
  {
    id: "fragilidad",
    etiqueta: "Fragilidad",
    hint: "¿Se siente débil o cansado con frecuencia?",
  },
  {
    id: "sensorial",
    etiqueta: "Sensorial",
    hint: "¿Tiene dificultades para oír o ver?",
  },
  {
    id: "socioeconomico",
    etiqueta: "Socioeconómico",
    hint: "¿Considera que sus ingresos cubren sus necesidades básicas?",
  },
];

/* Autoinforme de salud mental: 13 preguntas numeradas en el
   orden de lectura del impreso (columna izquierda y luego
   derecha), tras retirar la pregunta duplicada del impreso y
   las dos que el cliente pidió sacar del cuestionario activo. */
const PREGUNTAS_SALUD_MENTAL = [
  { id: "satisfaccionVida", etiqueta: "Se siente satisfecha de su vida" },
  { id: "abandonoActividades", etiqueta: "¿Ha abandonado actividades de su interés?" },
  { id: "maravillosoVivo", etiqueta: "¿Piensa que es maravilloso estar vivo?" },
  { id: "llenaEnergia", etiqueta: "¿Se siente llena de energía?" },
  { id: "muyPreocupado", etiqueta: "¿Ha estado muy preocupado por algo?" },
  { id: "dificultadConcentrarse", etiqueta: "¿Ha tenido dificultad para concentrarse?" },
  { id: "buenAnimo", etiqueta: "¿Tiene buen ánimo?" },
  { id: "prefiereCasa", etiqueta: "¿Prefiere quedarse en casa que salir?" },
  { id: "seSienteInutil", etiqueta: "¿Se siente «inútil» en este momento?" },
  { id: "mayoriaMejor", etiqueta: "¿Cree que la mayoría está mejor que usted?" },
  { id: "pocaEnergia", etiqueta: "¿Se ha quedado con poca energía?" },
  { id: "perdidoInteres", etiqueta: "¿Ha perdido el interés por las cosas?" },
  { id: "sinEsperanzas", etiqueta: "¿Se ha sentido sin esperanzas?" },
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
          { valor: "eutimico", etiqueta: "Ánimo eutímico" },
          { valor: "deprimido", etiqueta: "Ánimo deprimido" },
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
  /* ==== 4. Antecedentes familiares (las ocupaciones de
     hijas/os y pareja y la ubicación de las mascotas son
     opcionales a pedido del cliente) ==== */
  {
    id: "antecedentes-familiares",
    titulo: "Antecedentes familiares",
    campos: [
      { id: "hijasOs", etiqueta: "Hijas/os", tipo: "texto" },
      { id: "ocupacionHijasOs", etiqueta: "Ocupación hijas/os", tipo: "texto", requerido: false },
      { id: "pareja", etiqueta: "Pareja", tipo: "texto" },
      { id: "ocupacionPareja", etiqueta: "Ocupación pareja", tipo: "texto", requerido: false },
      { id: "viveCon", etiqueta: "Vive con", tipo: "texto" },
      { id: "nombres", etiqueta: "Nombres", tipo: "texto" },
      { id: "mascotas", etiqueta: "Mascotas", tipo: "texto" },
      { id: "mascotasUbicacion", etiqueta: "Ubicación de las mascotas", tipo: "radio", opciones: OPCIONES_MASCOTAS, requerido: false },
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
  /* ==== 8. Síndromes geriátricos (sección propia de Persona
     Mayor): Sí/No con la pregunta del impreso y observación al
     lado ==== */
  {
    id: "sindromes-geriatricos",
    titulo: "Síndromes geriátricos",
    descripcion:
      "Sección propia de la ficha Persona mayor: marque Sí o No según la pregunta del impreso y registre la observación al lado.",
    campos: SINDROMES_GERIATRICOS.map((sindrome) => ({
      id: sindrome.id,
      etiqueta: sindrome.etiqueta,
      tipo: "escala",
      hint: sindrome.hint,
      opciones: OPCIONES_SI_NO,
      mensajeError: "Seleccione Sí o No para continuar.",
    })),
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
  /* ==== 10. Salud mental: autoinforme de 13 preguntas
     numeradas (el impreso repite «¿Piensa que es maravilloso
     estar vivo?» y el cliente retiró del cuestionario activo
     alucinaciones e ideación/acto suicida) ==== */
  {
    id: "salud-mental",
    titulo: "Salud mental",
    descripcion:
      "Autoinforme: consulte cada pregunta numerada con la propia persona mayor y registre su respuesta.",
    campos: PREGUNTAS_SALUD_MENTAL.map((pregunta, indice) => ({
      id: pregunta.id,
      numero: indice + 1,
      etiqueta: pregunta.etiqueta,
      tipo: "siNo",
    })),
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
/* 21 ámbitos de independencia (11 básicos + 10 instrumentales);
   el descanso y sueño y los síndromes Sí/No son escalas pero no
   son de independencia. */
const CAMPOS_INDEPENDENCIA = [...CAMPOS_BASICA, ...CAMPOS_INSTRUMENTAL].filter(
  (c) => c.id !== "descansoSueno"
);
const CAMPO_DESCANSO = CAMPOS_ESCALA.find((c) => c.id === "descansoSueno");
const SECCION_MOTIVO = SECCIONES.find((s) => s.id === "motivo-consulta");
const CAMPO_ORIGEN = SECCION_MOTIVO.campos.find((c) => c.id === "origen");
const CAMPOS_OBSERVACION = ["condicionesGenerales", "animo", "orientacion"].map((id) =>
  SECCION_MOTIVO.campos.find((c) => c.id === id)
);
const SECCIONES_REGISTRO = ["historial-medico", "antecedentes-familiares", "area-fisica", "lenguaje", "participacion-social", "entorno-adaptaciones", "habitucion", "esparcimiento", "volicion", "otras-consideraciones"].map((id) =>
  SECCIONES.find((s) => s.id === id)
);
const SINDROMES = SECCIONES.find((s) => s.id === "sindromes-geriatricos").campos;
const SECCION_OTRAS = SECCIONES.find((s) => s.id === "otras-consideraciones");
const SI_NO_OTRAS = SECCION_OTRAS.campos.filter((c) => c.tipo === "siNo");
const ESCALA_BUENA_MALA = ["vision", "audicion"].map((id) => SECCION_OTRAS.campos.find((c) => c.id === id));
const CAMPOS_SALUD_MENTAL = SECCIONES.find((s) => s.id === "salud-mental").campos.filter(
  (c) => c.tipo === "siNo"
);
const CAMPOS_COGNITIVOS = SECCIONES.find((s) => s.id === "area-cognitiva").campos.filter(
  (c) => c.tipo === "siNo"
);
const PLAZOS = [
  { prefijo: "corto", nombre: "Corto plazo" },
  { prefijo: "mediano", nombre: "Mediano plazo" },
  { prefijo: "largo", nombre: "Largo plazo" },
];
const NIVELES_APOYO = ["supervision", "asistencia", "ayudaModerada", "dependiente"];

/* Respuesta que constituye indicador de riesgo referido en el
   autoinforme de salud mental. Se usa solo como referencia
   descriptiva: no hay puntos de corte ni interpretación
   diagnóstica (la pauta de tamizaje validada no está
   disponible). */
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

/* «Sí», «No» o «Sin respuesta» para los ítems de respuesta
   cerrada del registro: las preguntas sin contestar se
   declaran como sin respuesta, nunca como afirmativas. */
function respuestaCerrada(valor) {
  if (valor === "si") return "Sí";
  if (valor === "no") return "No";
  return "Sin respuesta";
}

/* «a», «a y b», «a, b y c». */
function unirLista(palabras) {
  if (palabras.length === 1) return palabras[0];
  return `${palabras.slice(0, -1).join(", ")} y ${palabras[palabras.length - 1]}`;
}

/* Valor legible de un campo del registro según su tipo. */
function valorRegistro(campo, valores) {
  const valor = valores[campo.id];
  if (campo.tipo === "siNo") return respuestaCerrada(valor);
  if (campo.tipo === "radio") return etiquetaOpcion(campo, valor) || "Sin respuesta";
  return textoValor(valor);
}

/* Lista vertical «Etiqueta: valor» para una sección del
   impreso, con todos sus campos (los vacíos se declaran como
   sin respuesta o «—», no se omiten). */
function bloquesRegistro(seccion, valores) {
  return {
    tipo: "lista",
    titulo: seccion.titulo,
    items: seccion.campos.map((campo) => `${campo.etiqueta}: ${valorRegistro(campo, valores)}`),
  };
}

/* Observación de una escala (o «—» si quedó vacía). */
function obsEscala(id, valores) {
  return (valores[`${id}Obs`] ?? "").trim() || "—";
}

/* Análisis narrativo de una sección de independencia
   funcional, construido exclusivamente con los niveles
   efectivamente registrados. */
function narrativaIndependencia(campos, valores, { conDescanso = false } = {}) {
  const grupos = [
    {
      nivel: "independiente",
      conApoyo: false,
      oracion: (lista, primero) =>
        `${primero ? "La persona evaluada " : ""}presenta independencia en ${lista}.`,
    },
    {
      nivel: "supervision",
      conApoyo: true,
      oracion: (lista) => `Requiere supervisión en ${lista}.`,
    },
    {
      nivel: "asistencia",
      conApoyo: true,
      oracion: (lista) => `Requiere asistencia en ${lista}.`,
    },
    {
      nivel: "ayudaModerada",
      conApoyo: true,
      oracion: (lista) => `Requiere ayuda moderada en ${lista}.`,
    },
    {
      nivel: "dependiente",
      conApoyo: true,
      oracion: (lista) => `Presenta dependencia en ${lista}.`,
    },
  ];
  const camposNivel = campos.filter((c) => c.id !== "descansoSueno");
  const oraciones = [];
  let conApoyo = false;
  for (const grupo of grupos) {
    const ambitos = camposNivel
      .filter((campo) => valores[campo.id] === grupo.nivel)
      .map((campo) => campo.etiqueta);
    if (ambitos.length === 0) continue;
    if (grupo.conApoyo) conApoyo = true;
    oraciones.push(grupo.oracion(unirLista(ambitos), oraciones.length === 0));
  }
  if (oraciones.length === 0) {
    oraciones.push("No se registran niveles de independencia para esta sección.");
  } else if (conApoyo) {
    oraciones.push("Estos resultados evidencian necesidades específicas de apoyo en las actividades de la vida diaria.");
  }
  if (conDescanso && valores.descansoSueno != null && valores.descansoSueno !== "") {
    const nivel = etiquetaOpcion(CAMPO_DESCANSO, valores.descansoSueno);
    if (nivel) oraciones.push(`El descanso y sueño se registra como «${nivel}».`);
  }
  return oraciones.join(" ");
}

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
   (supervisión, asistencia, ayuda moderada o dependiente). Una
   actividad independiente jamás se clasifica como apoyo. */
export function ambitosConApoyo(valores = {}) {
  return CAMPOS_INDEPENDENCIA.filter((campo) => NIVELES_APOYO.includes(valores[campo.id])).map(
    (campo) => campo.etiqueta
  );
}

/* Etiquetas de los indicadores de riesgo referido de salud
   mental efectivamente presentes según las respuestas. */
export function etiquetasIndicadoresRiesgoSaludMental(valores = {}) {
  return CAMPOS_SALUD_MENTAL.filter((campo) => {
    const riesgo = INDICADORES_RIESGO_SALUD_MENTAL[campo.id];
    return riesgo !== undefined && valores[campo.id] === riesgo;
  }).map((campo) => campo.etiqueta);
}

export function contarIndicadoresRiesgoSaludMental(valores = {}) {
  return etiquetasIndicadoresRiesgoSaludMental(valores).length;
}

/* Síndromes geriátricos con respuesta Sí/No registrada. */
export function contarSindromesGeriatricos(valores = {}) {
  return SINDROMES.filter((campo) => valores[campo.id] === "si" || valores[campo.id] === "no").length;
}

/* Bandera de hallazgo relevante: información descriptiva
   registrada en la evaluación. No constituye alerta clínica ni
   diagnóstico. */
function hallazgo(texto) {
  return { tipo: "bandera", nivel: "hallazgo", categoria: "hallazgo", texto };
}

/* ============================================================
   SÍNTESIS AUTOMATIZADA
   El informe reproduce el registro completo del impreso en su
   orden y cierra con hallazgos y alertas separados.
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
  ).filter((registro) => registro);
  if (registroObservacion.length > 0) {
    partesMotivo.push(`En la observación se registran: ${registroObservacion.join(" · ")}.`);
  }

  bloques.push({
    tipo: "parrafo",
    titulo: "Motivo de consulta",
    texto: partesMotivo.length > 0 ? partesMotivo.join(" ") : "No se registra motivo de consulta en la entrevista.",
  });

  /* ---- Historial médico y antecedentes familiares (registro
     completo, uno por línea) ---- */
  bloques.push(bloquesRegistro(SECCIONES_REGISTRO[0], valores));
  bloques.push(bloquesRegistro(SECCIONES_REGISTRO[1], valores));

  /* ---- Independencia funcional básica: análisis narrativo y
     resultado por actividad con la observación registrada ---- */
  bloques.push({
    tipo: "parrafo",
    titulo: "Independencia funcional básica (análisis narrativo)",
    texto: narrativaIndependencia(CAMPOS_BASICA, valores, { conDescanso: true }),
  });
  bloques.push({
    tipo: "tabla",
    titulo: "Independencia funcional básica (resultado por actividad)",
    columnas: [
      { titulo: "Actividad", fraccion: 0.3 },
      { titulo: "Nivel", fraccion: 0.3 },
      { titulo: "Observación", fraccion: 0.4 },
    ],
    filas: CAMPOS_BASICA.map((campo) => [
      campo.etiqueta,
      etiquetaOpcion(campo, valores[campo.id]) || "Sin respuesta",
      obsEscala(campo.id, valores),
    ]),
  });

  /* ---- Independencia funcional instrumental ---- */
  bloques.push({
    tipo: "parrafo",
    titulo: "Independencia funcional instrumental (análisis narrativo)",
    texto: narrativaIndependencia(CAMPOS_INSTRUMENTAL, valores),
  });
  bloques.push({
    tipo: "tabla",
    titulo: "Independencia funcional instrumental (resultado por actividad)",
    columnas: [
      { titulo: "Actividad", fraccion: 0.3 },
      { titulo: "Nivel", fraccion: 0.3 },
      { titulo: "Observación", fraccion: 0.4 },
    ],
    filas: CAMPOS_INSTRUMENTAL.map((campo) => [
      campo.etiqueta,
      etiquetaOpcion(campo, valores[campo.id]) || "Sin respuesta",
      obsEscala(campo.id, valores),
    ]),
  });

  /* ---- Área física ---- */
  bloques.push(bloquesRegistro(SECCIONES_REGISTRO[2], valores));

  /* ---- Síndromes geriátricos: dominio, pregunta original,
     respuesta y observación ---- */
  bloques.push({
    tipo: "tabla",
    titulo: "Síndromes geriátricos",
    columnas: [
      { titulo: "Dominio", fraccion: 0.2 },
      { titulo: "Pregunta", fraccion: 0.37 },
      { titulo: "Respuesta", fraccion: 0.13 },
      { titulo: "Observación", fraccion: 0.3 },
    ],
    filas: SINDROMES.map((campo) => [
      campo.etiqueta,
      campo.hint,
      respuestaCerrada(valores[campo.id]),
      obsEscala(campo.id, valores),
    ]),
  });

  /* ---- Otras consideraciones (registro completo) ---- */
  bloques.push(bloquesRegistro(SECCION_OTRAS, valores));

  /* ---- Salud mental: numeración, respuesta individual y
     respuestas completadas vs. faltantes ---- */
  const respondidasSM = CAMPOS_SALUD_MENTAL.filter(
    (campo) => valores[campo.id] === "si" || valores[campo.id] === "no"
  );
  const faltantesSM = CAMPOS_SALUD_MENTAL.filter(
    (campo) => valores[campo.id] !== "si" && valores[campo.id] !== "no"
  ).map((campo) => `ítem ${campo.numero} (${campo.etiqueta})`);
  const textoSM =
    `Se respondieron ${respondidasSM.length} de ${CAMPOS_SALUD_MENTAL.length} ítems del autoinforme de salud mental.` +
    (faltantesSM.length > 0 ? ` Sin respuesta: ${unirLista(faltantesSM)}.` : "");
  bloques.push({ tipo: "parrafo", titulo: "Salud mental (autoinforme numerado)", texto: textoSM });
  bloques.push({
    tipo: "tabla",
    titulo: "Salud mental (respuesta por ítem)",
    columnas: [
      { titulo: "N.º", fraccion: 0.08 },
      { titulo: "Ítem", fraccion: 0.7 },
      { titulo: "Respuesta", fraccion: 0.22 },
    ],
    filas: CAMPOS_SALUD_MENTAL.map((campo) => [
      String(campo.numero),
      campo.etiqueta,
      respuestaCerrada(valores[campo.id]),
    ]),
  });

  /* ---- Área cognitiva: generalidades y funciones con su
     respuesta y observación ---- */
  const itemsCognitivos = [`Generalidades: ${textoValor(valores.generalidades)}`];
  for (const campo of CAMPOS_COGNITIVOS) {
    if (valores[campo.id] === "si") {
      itemsCognitivos.push(`${campo.etiqueta}: Sí`);
    } else if (valores[campo.id] === "no") {
      const enQue = (valores[`${campo.id}EnQue`] ?? "").trim();
      itemsCognitivos.push(enQue ? `${campo.etiqueta}: No — ${enQue}` : `${campo.etiqueta}: No`);
    } else {
      itemsCognitivos.push(`${campo.etiqueta}: Sin respuesta`);
    }
  }
  bloques.push({ tipo: "lista", titulo: "Área cognitiva", items: itemsCognitivos });

  /* ---- Lenguaje, participación social, entorno, habituación,
     esparcimiento y volición (registro completo) ---- */
  for (const seccion of SECCIONES_REGISTRO.slice(3)) {
    bloques.push(bloquesRegistro(seccion, valores));
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

  /* ============================================================
     HALLAZGOS RELEVANTES (descriptivos, desde lo registrado)
     ============================================================ */

  const ambitosApoyo = ambitosConApoyo(valores);
  if (ambitosApoyo.length > 0) {
    bloques.push(
      hallazgo(
        `Requiere apoyo (supervisión, asistencia, ayuda moderada o dependencia) en ${ambitosApoyo.length} de los ${CAMPOS_INDEPENDENCIA.length} ámbitos de independencia funcional evaluados.`
      )
    );
  }

  const descanso = etiquetaOpcion(CAMPO_DESCANSO, valores.descansoSueno);
  if (descanso && valores.descansoSueno !== "normal") {
    bloques.push(hallazgo(`El descanso y sueño se registra como «${descanso}».`));
  }

  const sindromesPositivos = SINDROMES.filter((campo) => valores[campo.id] === "si").map(
    (campo) => campo.etiqueta
  );
  if (sindromesPositivos.length > 0) {
    /* Antecedentes referidos, no diagnósticos. */
    bloques.push(
      hallazgo(
        `Antecedentes referidos en síndromes geriátricos: ${unirLista(sindromesPositivos)}.`
      )
    );
  }

  const positivosOtras = [];
  for (const campo of SI_NO_OTRAS) {
    if (valores[campo.id] === "si") positivosOtras.push(`${campo.etiqueta} (Sí)`);
  }
  for (const campo of ESCALA_BUENA_MALA) {
    if (valores[campo.id] === "mala") positivosOtras.push(`${campo.etiqueta} (Mala)`);
  }
  if (positivosOtras.length > 0) {
    bloques.push(
      hallazgo(`Hallazgos registrados en otras consideraciones: ${unirLista(positivosOtras)}.`)
    );
  }

  const etiquetasRiesgoSM = [];
  for (const campo of CAMPOS_SALUD_MENTAL) {
    const riesgo = INDICADORES_RIESGO_SALUD_MENTAL[campo.id];
    if (riesgo !== undefined && valores[campo.id] === riesgo) {
      etiquetasRiesgoSM.push(`ítem ${campo.numero}`);
    }
  }
  if (etiquetasRiesgoSM.length > 0) {
    bloques.push(
      hallazgo(
        `En el autoinforme de salud mental se registran ${etiquetasRiesgoSM.length} respuestas en la dirección de riesgo referido (${unirLista(etiquetasRiesgoSM)}). Referencia descriptiva: no se aplican puntos de corte ni interpretación diagnóstica.`
      )
    );
  }

  const dificultadesCognitivas = CAMPOS_COGNITIVOS.filter(
    (campo) => valores[campo.id] === "no"
  ).map((campo) => campo.etiqueta);
  if (dificultadesCognitivas.length > 0) {
    bloques.push(
      hallazgo(
        `Se registran dificultades referidas en funciones cognitivas: ${unirLista(dificultadesCognitivas)}.`
      )
    );
  }

  /* ============================================================
     ALERTAS CLÍNICAS (solo con criterio definido)
     Las preguntas de alucinaciones e ideación, comunicación o
     acto suicida salieron del cuestionario activo; sus
     respuestas solo pueden provenir de evaluaciones históricas
     y en ese caso la información se conserva en el informe.
     ============================================================ */

  if (valores.ideacionSuicida === "si") {
    bloques.push({
      tipo: "bandera",
      nivel: "critico",
      categoria: "alerta",
      texto:
        "Se registra ideación/comunicación/acto suicida: activar protocolo de crisis y derivación inmediata.",
    });
  }

  if (valores.alucinaciones === "si") {
    bloques.push({
      tipo: "bandera",
      nivel: "alerta",
      categoria: "alerta",
      texto:
        "Se registran alucinaciones visuales o auditivas: derivar a evaluación médica y registrar contexto y frecuencia.",
    });
  }

  return bloques;
}

/* ============================================================
   INFORME EN PDF Y WORD
   ============================================================ */

/* Configuración común del informe (PDF y Word). El informe
   inicia con el título del instrumento, sin párrafo
   introductorio, y cierra con la hoja de hallazgos y alertas. */
function configInforme(valores) {
  return {
    nombreArchivo: "Informe-Evaluacion-Inicial-Persona-Mayor",
    instrumento: "",
    titulo: "EVALUACIÓN INICIAL – PERSONA MAYOR",
    subtitulo: "",
    autor: "TeraOcupame · Formulario NIÑO - ADOLESCENTE - ADULTO - PERSONA MAYOR",
    color: [139, 125, 224],
    colorOscuro: [99, 74, 191],
    colorFondo: [237, 228, 216],
    secciones: SECCIONES,
    valores,
    sintesis: sintetizar(valores),
    tituloSintesis: "Resultados de la evaluación",
    seccionHallazgos: true,
  };
}

export { configInforme };

export function descargarInformePDF(valores) {
  descargarInformePDFEvaluacionInicial(configInforme(valores));
}

export function descargarInformeWord(valores) {
  descargarInformeWordEvaluacionInicial(configInforme(valores));
}
