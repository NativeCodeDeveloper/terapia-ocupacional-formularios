import {
  descargarInformePDFEvaluacionInicial,
  descargarInformeWordEvaluacionInicial,
  etiquetaOpcion,
} from "./informe-evaluacion-inicial.js";

/* ============================================================
   EVALUACIÓN INICIAL DE TERAPIA OCUPACIONAL · ADULTO
   Ficha digital de la pauta impresa "EVALUACIÓN INICIAL -
   ADULTO" (TeraOcupame, pestaña ADULTO). Este módulo define el
   esquema completo de la entrevista (SECCIONES), la síntesis
   automatizada con sus banderas clínicas (sintetizar) y la
   descarga del informe PDF (descargarInformePDF) sobre el motor
   común de informe-evaluacion-inicial.js.
   Notas de la transcripción del impreso: el título de la
   sección médica dice «HISTORAL MÉDICO» y se normaliza a
   «Historial médico»; el ítem «¿Piensa que es maravilloso estar
   vivo?» aparece repetido en Salud mental y se incluye una sola
   vez; las escalas de Alimentación y Cuidado de otros usan
   «Asistencia» como segundo nivel tal como está impreso (el
   resto de las escalas usa «Supervisión»).
   ============================================================ */

/* Niveles de independencia funcional de la pauta. Dos ítems del
   impreso (Alimentación y Cuidado de otros) usan «Asistencia»
   en lugar de «Supervisión»; se transcriben tal cual. */
const OPCIONES_SUPERVISION = [
  { valor: "independiente", etiqueta: "Independiente" },
  { valor: "supervision", etiqueta: "Supervisión" },
  { valor: "ayudaModerada", etiqueta: "Ayuda moderada" },
  { valor: "dependiente", etiqueta: "Dependiente" },
];

const OPCIONES_ASISTENCIA = [
  { valor: "independiente", etiqueta: "Independiente" },
  { valor: "asistencia", etiqueta: "Asistencia" },
  { valor: "ayudaModerada", etiqueta: "Ayuda moderada" },
  { valor: "dependiente", etiqueta: "Dependiente" },
];

/* Niveles que indican apoyo (cualquiera que no sea independiente). */
const NIVELES_APOYO = new Set(["supervision", "asistencia", "ayudaModerada", "dependiente"]);
const ORDEN_NIVELES = ["Independiente", "Supervisión", "Asistencia", "Ayuda moderada", "Dependiente"];

/* Redacción en minúscula para la frase de observación del motivo
   de consulta («… se registran buenas condiciones generales,
   ánimo eutímico y orientación orientado temporoespacial.»). */
const TEXTO_CONDICIONES = {
  buenas: "buenas condiciones generales",
  regulares: "regulares condiciones generales",
  malas: "malas condiciones generales",
};
const TEXTO_ANIMO = {
  eutimico: "eutímico",
  deprimido: "deprimido",
  aplanamiento: "aplanamiento afectivo",
};
const TEXTO_ORIENTACION = {
  orientadoTemporoespacial: "orientado temporoespacial",
  orientadoParcial: "orientado temporal o espacial",
  desorientado: "desorientado temporoespacial",
};

/* Ítems de salud mental que marcan riesgo y la respuesta que lo
   indica (excluye alucinaciones e ideación suicida, que llevan
   banderas propias). */
const REGLAS_RIESGO_SALUD_MENTAL = {
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

export const SECCIONES = [
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
  {
    id: "historial-medico",
    titulo: "Historial médico",
    descripcion: "Antecedentes personales, familiares y hábitos declarados en la entrevista.",
    campos: [
      { id: "antecedentesMedicos", etiqueta: "Antecedentes médicos", tipo: "textoLargo" },
      { id: "antecedentesMedicosFamiliares", etiqueta: "Antecedentes médicos familiares", tipo: "textoLargo" },
      { id: "antecedentesQuirurgicos", etiqueta: "Antecedentes quirúrgicos", tipo: "textoLargo" },
      { id: "farmacos", etiqueta: "Fármacos", tipo: "textoLargo" },
      { id: "alergias", etiqueta: "Alergias", tipo: "textoLargo" },
      { id: "tabaco", etiqueta: "Tabaco", tipo: "siNo" },
      { id: "alcohol", etiqueta: "Alcohol", tipo: "siNo" },
      { id: "drogas", etiqueta: "Drogas", tipo: "siNo" },
      { id: "situacionDiscapacidad", etiqueta: "Situación de discapacidad", tipo: "siNo" },
      { id: "credencialDiscapacidad", etiqueta: "Credencial de discapacidad", tipo: "siNo" },
      { id: "ayudasTecnicas", etiqueta: "Ayudas técnicas", tipo: "texto" },
    ],
  },
  {
    id: "motivo-consulta",
    titulo: "Motivo de consulta",
    campos: [
      {
        id: "origen",
        etiqueta: "Origen de la consulta",
        tipo: "radio",
        opciones: [
          { valor: "derivacion", etiqueta: "Derivación" },
          { valor: "espontanea", etiqueta: "Consulta espontánea" },
        ],
      },
      { id: "refiere", etiqueta: "Refiere que…", tipo: "textoLargo", filas: 4 },
      { id: "observa", etiqueta: "Se observa…", tipo: "textoLargo", filas: 4 },
      {
        id: "condiciones",
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
      {
        id: "mascotasUbicacion",
        etiqueta: "Ubicación de las mascotas",
        tipo: "radio",
        opciones: [
          { valor: "adentro", etiqueta: "Adentro" },
          { valor: "afuera", etiqueta: "Afuera" },
        ],
      },
    ],
  },
  {
    id: "independencia-funcional-basica",
    titulo: "Independencia funcional básica",
    descripcion: "Marque el nivel de asistencia requerido en cada actividad básica diaria y registre sus observaciones.",
    campos: [
      { id: "alimentacion", etiqueta: "Alimentación", tipo: "escala", opciones: OPCIONES_ASISTENCIA },
      { id: "higieneMenor", etiqueta: "Higiene menor", tipo: "escala", opciones: OPCIONES_SUPERVISION },
      { id: "higieneMayor", etiqueta: "Higiene mayor", tipo: "escala", opciones: OPCIONES_SUPERVISION },
      { id: "vestuario", etiqueta: "Vestuario", tipo: "escala", opciones: OPCIONES_SUPERVISION },
      { id: "aseoPerineal", etiqueta: "Aseo perineal", tipo: "escala", opciones: OPCIONES_SUPERVISION },
      { id: "manejoVesicalIntestinal", etiqueta: "Manejo vesical/intestinal", tipo: "escala", opciones: OPCIONES_SUPERVISION },
      { id: "transferenciasCamaSilla", etiqueta: "Transferencias cama/silla", tipo: "escala", opciones: OPCIONES_SUPERVISION },
      { id: "transferenciasBano", etiqueta: "Transferencias al baño", tipo: "escala", opciones: OPCIONES_SUPERVISION },
      { id: "transferenciasDucha", etiqueta: "Transferencias a ducha", tipo: "escala", opciones: OPCIONES_SUPERVISION },
      { id: "marcha", etiqueta: "Marcha con o sin silla de ruedas", tipo: "escala", opciones: OPCIONES_SUPERVISION },
      { id: "subirEscaleras", etiqueta: "Subir escaleras", tipo: "escala", opciones: OPCIONES_SUPERVISION },
      {
        id: "descansoSueno",
        etiqueta: "Descanso y sueño",
        tipo: "escala",
        opciones: [
          { valor: "normal", etiqueta: "Normal" },
          { valor: "conFarmacos", etiqueta: "Con fármacos" },
          { valor: "insomnioConciliacion", etiqueta: "Insomnio de conciliación" },
          { valor: "insomnioMantencion", etiqueta: "Insomnio de mantención" },
        ],
      },
    ],
  },
  {
    id: "independencia-funcional-instrumental",
    titulo: "Independencia funcional instrumental",
    descripcion: "Marque el nivel de asistencia requerido en cada actividad instrumental diaria.",
    campos: [
      { id: "cuidadoOtros", etiqueta: "Cuidado de otros", tipo: "escala", opciones: OPCIONES_ASISTENCIA },
      { id: "gestionComunicacion", etiqueta: "Gestión de la comunicación", tipo: "escala", opciones: OPCIONES_SUPERVISION },
      { id: "movilidadComunidad", etiqueta: "Movilidad en la comunidad", tipo: "escala", opciones: OPCIONES_SUPERVISION },
      { id: "mantencionSalud", etiqueta: "Mantención de la salud", tipo: "escala", opciones: OPCIONES_SUPERVISION },
      { id: "manejoHogar", etiqueta: "Manejo del hogar", tipo: "escala", opciones: OPCIONES_SUPERVISION },
      { id: "manejoVesicalIntestinalInstrumental", etiqueta: "Manejo vesical/intestinal", tipo: "escala", opciones: OPCIONES_SUPERVISION },
      { id: "preparacionComida", etiqueta: "Preparación de comida", tipo: "escala", opciones: OPCIONES_SUPERVISION },
      { id: "limpiezaHogar", etiqueta: "Limpieza del hogar", tipo: "escala", opciones: OPCIONES_SUPERVISION },
      { id: "seguridadEmergencia", etiqueta: "Seguridad y emergencia", tipo: "escala", opciones: OPCIONES_SUPERVISION },
      { id: "compras", etiqueta: "Compras", tipo: "escala", opciones: OPCIONES_SUPERVISION },
    ],
  },
  {
    id: "area-fisica",
    titulo: "Área física",
    campos: [
      { id: "motricidadFina", etiqueta: "Motricidad fina", tipo: "textoLargo", hint: "Tomar objetos, apilar bloques, escribir…" },
      { id: "motricidadGruesa", etiqueta: "Motricidad gruesa", tipo: "textoLargo", hint: "Falta del equilibrio, caídas, forma de caminar…" },
      { id: "equilibrioMovimiento", etiqueta: "Equilibrio y movimiento", tipo: "textoLargo", hint: "Ha tenido caídas por falta del equilibrio…" },
      { id: "ayudasTecnicasFisicas", etiqueta: "Ayudas técnicas", tipo: "textoLargo" },
      { id: "fuerza", etiqueta: "Fuerza", tipo: "textoLargo" },
      { id: "rangoArticular", etiqueta: "Rango articular", tipo: "textoLargo" },
      { id: "palpacion", etiqueta: "A la palpación", tipo: "textoLargo" },
      { id: "coloracionPiel", etiqueta: "Coloración de la piel", tipo: "textoLargo" },
      { id: "sensibilidad", etiqueta: "Sensibilidad", tipo: "textoLargo" },
      { id: "cambiosTemperatura", etiqueta: "Cambios de temperatura", tipo: "textoLargo" },
      { id: "eva", etiqueta: "EVA", tipo: "textoLargo", hint: "Escala visual análoga del dolor" },
    ],
  },
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
  {
    id: "salud-mental",
    titulo: "Salud mental",
    descripcion: "Autoinforme de la entrevista inicial: marque Sí o No según lo que refiere la propia persona.",
    campos: [
      { id: "satisfaccionVida", etiqueta: "Se siente satisfecha de su vida", tipo: "siNo" },
      { id: "buenAnimo", etiqueta: "¿Tiene buen ánimo?", tipo: "siNo" },
      { id: "abandonoActividades", etiqueta: "¿Ha abandonado actividades de su interés?", tipo: "siNo" },
      { id: "prefiereCasa", etiqueta: "¿Prefiere quedarse en casa que salir?", tipo: "siNo" },
      { id: "maravillosoVivo", etiqueta: "¿Piensa que es maravilloso estar vivo?", tipo: "siNo" },
      { id: "seSienteInutil", etiqueta: "¿Se siente “inútil” en este momento?", tipo: "siNo" },
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
  {
    id: "area-cognitiva",
    titulo: "Área cognitiva",
    descripcion: "Marque si la función está preservada y, cuando la respuesta sea No, indique en qué se observa la dificultad.",
    campos: [
      { id: "generalidades", etiqueta: "Generalidades", tipo: "textoLargo", hint: "¿Ha tenido olvidos frecuentes?" },
      { id: "atencionSelectiva", etiqueta: "Atención selectiva", tipo: "siNo", hint: "centrar la atención en un estímulo por 15 minutos" },
      { id: "atencionSelectivaEnQue", etiqueta: "Observación", tipo: "textoLargo", filas: 2 },
      { id: "atencionSostenida", etiqueta: "Atención sostenida", tipo: "siNo", hint: "mantener la atención en una actividad o estímulo durante un largo periodo de tiempo" },
      { id: "atencionSostenidaEnQue", etiqueta: "Observación", tipo: "textoLargo", filas: 2 },
      { id: "atencionDividida", etiqueta: "Atención dividida", tipo: "siNo", hint: "capacidad de atender a dos o más tareas al mismo tiempo" },
      { id: "atencionDivididaEnQue", etiqueta: "Observación", tipo: "textoLargo", filas: 2 },
      { id: "memoriaCortoPlazo", etiqueta: "Memoria corto plazo", tipo: "siNo", hint: "mantener información en la mente durante unos pocos segundos o minutos." },
      { id: "memoriaCortoPlazoEnQue", etiqueta: "Observación", tipo: "textoLargo", filas: 2 },
      { id: "memoriaLargoPlazo", etiqueta: "Memoria largo plazo", tipo: "siNo", hint: "almacenar recuerdos, pensamientos, sensaciones, que posteriormente se recuerdan de forma voluntaria o no." },
      { id: "memoriaLargoPlazoEnQue", etiqueta: "Observación", tipo: "textoLargo", filas: 2 },
      { id: "memoriaTrabajo", etiqueta: "Memoria de trabajo", tipo: "siNo", hint: "capacidad de retener y manejar información de una tarea" },
      { id: "memoriaTrabajoEnQue", etiqueta: "Observación", tipo: "textoLargo", filas: 2 },
    ],
  },
  {
    id: "lenguaje",
    titulo: "Lenguaje",
    campos: [
      { id: "comprension", etiqueta: "Comprensión", tipo: "textoLargo", hint: "capacidad de entender instrucciones" },
      { id: "expresion", etiqueta: "Expresión", tipo: "textoLargo", hint: "organizar pensamientos y expresarlos" },
      { id: "resolucionProblemas", etiqueta: "Resolución de problemas", tipo: "textoLargo", hint: "capacidad para utilizar el lenguaje en la resolución de problemas o para planificar actividades" },
    ],
  },
  {
    id: "participacion-social",
    titulo: "Participación social",
    campos: [
      { id: "interaccionPares", etiqueta: "¿Cómo interactúa con sus pares? ¿Tiene iniciativa de realizar cosas nuevas?", tipo: "textoLargo" },
      { id: "amigosCercanos", etiqueta: "¿Tiene amigos cercanos? ¿Con qué frecuencia se reúne con ellos?", tipo: "textoLargo" },
      { id: "manejoConflictos", etiqueta: "¿Cómo maneja los conflictos con sus pares? ¿Se frustra fácilmente?", tipo: "textoLargo" },
      { id: "actividadesGrupales", etiqueta: "¿Participa en actividades grupales o familiares?", tipo: "textoLargo" },
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
      { id: "participacionSocialEsparcimiento", etiqueta: "Participación social", tipo: "textoLargo" },
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
    descripcion: "Defina la problemática ocupacional y los objetivos de intervención por plazo.",
    campos: [
      { id: "problemaOcupacional", etiqueta: "Problemática ocupacional", tipo: "textoLargo", filas: 4 },
      { id: "cortoObjetivo", etiqueta: "Objetivo general (corto plazo)", tipo: "textoLargo", filas: 3 },
      { id: "cortoEspecificos", etiqueta: "Objetivos específicos (corto plazo)", tipo: "textoLargo", filas: 3 },
      { id: "medianoObjetivo", etiqueta: "Objetivo general (mediano plazo)", tipo: "textoLargo", filas: 3 },
      { id: "medianoEspecificos", etiqueta: "Objetivos específicos (mediano plazo)", tipo: "textoLargo", filas: 3 },
      { id: "largoObjetivo", etiqueta: "Objetivo general (largo plazo)", tipo: "textoLargo", filas: 3 },
      { id: "largoEspecificos", etiqueta: "Objetivos específicos (largo plazo)", tipo: "textoLargo", filas: 3 },
    ],
  },
];

/* ============================================================
   HELPERS INTERNOS
   ============================================================ */

function seccionPorId(id) {
  return SECCIONES.find((s) => s.id === id);
}

function campoPorId(seccion, id) {
  return seccion.campos.find((c) => c.id === id);
}

function limpiar(valor) {
  return (valor ?? "").toString().trim();
}

/* Etiqueta de la respuesta elegida. Los campos sí/no no declaran
   opciones en el esquema (el componente las inyecta), así que
   «etiquetaOpcion» devolvería el valor crudo; aquí se resuelve. */
function etiquetaRespuesta(campo, valor) {
  if (!valor) return "";
  if (campo.tipo === "siNo" && !campo.opciones) {
    return valor === "si" ? "Sí" : valor === "no" ? "No" : valor;
  }
  return etiquetaOpcion(campo, valor);
}

/* Une fragmentos con comas y «y» final. */
function unirConY(partes) {
  if (partes.length === 1) return partes[0];
  return `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
}

/* ============================================================
   SÍNTESIS AUTOMATIZADA
   ============================================================ */

function bloqueMotivoConsulta(v) {
  const seccion = seccionPorId("motivo-consulta");
  const partes = [];

  const origen = etiquetaOpcion(campoPorId(seccion, "origen"), v.origen);
  if (origen) partes.push(`Origen: ${origen}.`);
  const refiere = limpiar(v.refiere);
  if (refiere) partes.push(`Refiere: ${refiere}.`);
  const observa = limpiar(v.observa);
  if (observa) partes.push(`Se observa: ${observa}.`);

  const estado = [];
  if (v.condiciones && TEXTO_CONDICIONES[v.condiciones]) estado.push(TEXTO_CONDICIONES[v.condiciones]);
  if (v.animo && TEXTO_ANIMO[v.animo]) estado.push(`ánimo ${TEXTO_ANIMO[v.animo]}`);
  if (v.orientacion && TEXTO_ORIENTACION[v.orientacion]) estado.push(`orientación ${TEXTO_ORIENTACION[v.orientacion]}`);
  if (estado.length > 0) partes.push(`En la observación se registran ${unirConY(estado)}.`);

  return {
    tipo: "parrafo",
    titulo: "Motivo de consulta",
    texto: partes.length > 0 ? partes.join(" ") : "No se registra motivo de consulta en la entrevista.",
  };
}

function tablaDeEscalas(titulo, seccion, v) {
  return {
    tipo: "tabla",
    titulo,
    columnas: [
      { titulo: "Ámbito", fraccion: 0.6 },
      { titulo: "Nivel", fraccion: 0.4 },
    ],
    filas: seccion.campos.map((campo) => [campo.etiqueta, etiquetaOpcion(campo, v[campo.id]) || "—"]),
  };
}

/* Distribución de niveles sobre las escalas de independencia
   (Descanso y sueño no es un nivel de independencia y tiene su
   propia bandera). */
function escalasDeIndependencia() {
  const basicas = seccionPorId("independencia-funcional-basica").campos.filter((c) => c.id !== "descansoSueno");
  const instrumentales = seccionPorId("independencia-funcional-instrumental").campos;
  return [...basicas, ...instrumentales];
}

function distribucionDeNiveles(respondidas, v) {
  const conteo = new Map();
  for (const campo of respondidas) {
    const nivel = etiquetaOpcion(campo, v[campo.id]);
    conteo.set(nivel, (conteo.get(nivel) ?? 0) + 1);
  }
  return ORDEN_NIVELES.filter((nivel) => conteo.has(nivel)).map(
    (nivel) => `${nivel}: ${conteo.get(nivel)} de ${respondidas.length}`
  );
}

function bloqueDescanso(v) {
  const campo = campoPorId(seccionPorId("independencia-funcional-basica"), "descansoSueno");
  if (!v.descansoSueno || v.descansoSueno === "normal") return null;
  return {
    tipo: "bandera",
    nivel: "alerta",
    titulo: "Descanso y sueño",
    texto: `Descanso y sueño alterado: ${etiquetaOpcion(campo, v.descansoSueno)}. Explorar higiene del sueño y fármacos en la próxima sesión.`,
  };
}

/* Ítems de «Otras consideraciones» con respuesta positiva que
   cuentan para la bandera de alerta (dos o más). */
const ITEMS_CONSIDERACION_POSITIVA = [
  "mareos",
  "temblor",
  "alteracionEquilibrio",
  "dolorCadera",
  "dolorHombro",
  "dolorRodilla",
];

function bloquesOtrasConsideraciones(v) {
  const seccion = seccionPorId("otras-consideraciones");
  const bloques = [];

  const items = seccion.campos.filter((campo) => v[campo.id]).map(
    (campo) => `${campo.etiqueta}: ${etiquetaRespuesta(campo, v[campo.id])}`
  );
  if (items.length > 0) {
    bloques.push({ tipo: "lista", titulo: "Otras consideraciones registradas", items });
  }

  const positivos = ITEMS_CONSIDERACION_POSITIVA.filter((id) => v[id] === "si").map(
    (id) => campoPorId(seccion, id).etiqueta
  );
  if (positivos.length >= 2) {
    bloques.push({
      tipo: "bandera",
      nivel: "alerta",
      titulo: "Otras consideraciones",
      texto: `Se registran ${positivos.length} hallazgos positivos en otras consideraciones: ${positivos.join(", ")}.`,
    });
  }
  return bloques;
}

function bloquesSaludMental(v) {
  const seccion = seccionPorId("salud-mental");
  const bloques = [];

  /* Tamizaje integrado de salud mental: se describe el estado
     de la pauta sin levantar alerta automática (pauta
     integrada, no obligatoria de aplicar); la revisión
     clínica decide. */
  const consultados = seccion.campos.filter((campo) => campo.tipo === "siNo" && v[campo.id]);
  const riesgos = Object.entries(REGLAS_RIESGO_SALUD_MENTAL)
    .filter(([id, riesgo]) => v[id] === riesgo)
    .map(([id, riesgo]) => `${campoPorId(seccion, id).etiqueta}: ${riesgo === "si" ? "Sí" : "No"}`);
  if (consultados.length > 0) {
    bloques.push({
      tipo: "parrafo",
      titulo: "Salud mental (tamizaje integrado)",
      texto:
        `Se aplicaron ${consultados.length} de ${seccion.campos.filter((c) => c.tipo === "siNo").length} ítems de la pauta integrada de salud mental.` +
        (riesgos.length > 0 ? ` Respuestas de referencia: ${riesgos.join("; ")}.` : ""),
    });
  }

  if (v.alucinaciones === "si") {
    bloques.push({
      tipo: "bandera",
      nivel: "alerta",
      titulo: "Salud mental",
      texto: "Se registran alucinaciones visuales o auditivas: requiere abordaje clínico específico y derivación.",
    });
  }

  if (v.ideacionSuicida === "si") {
    bloques.push({
      tipo: "bandera",
      nivel: "critico",
      titulo: "Salud mental",
      texto: "Se registra ideación/comunicación/acto suicida: activar protocolo de crisis y derivación inmediata.",
    });
  }
  return bloques;
}

function bloquesAreaCognitiva(v) {
  const seccion = seccionPorId("area-cognitiva");
  const funciones = seccion.campos.filter((campo) => campo.tipo === "siNo");
  const bloques = [];

  const items = funciones
    .filter((campo) => v[campo.id])
    .map((campo) => {
      const respuesta = etiquetaRespuesta(campo, v[campo.id]);
      const enQue = limpiar(v[`${campo.id}EnQue`]);
      return enQue && v[campo.id] === "no"
        ? `${campo.etiqueta}: ${respuesta} (Observación: ${enQue})`
        : `${campo.etiqueta}: ${respuesta}`;
    });
  if (items.length > 0) {
    bloques.push({ tipo: "lista", titulo: "Funciones cognitivas consultadas", items });
  }

  const alteradas = funciones.filter((campo) => v[campo.id] === "no").map((campo) => campo.etiqueta);
  if (alteradas.length > 0) {
    bloques.push({
      tipo: "bandera",
      nivel: "alerta",
      titulo: "Funciones cognitivas",
      texto: `Dificultad referida en: ${alteradas.join(", ")}.`,
    });
  }
  return bloques;
}

/* Plan de intervención en el orden del impreso: filas
   [etiqueta, valor] para la tabla de dos columnas. */
function bloquePlan(v) {
  const filas = [["Problemática ocupacional", limpiar(v.problemaOcupacional) || "—"]];
  const plazos = [
    ["Corto plazo", "corto"],
    ["Mediano plazo", "mediano"],
    ["Largo plazo", "largo"],
  ];
  for (const [nombre, prefijo] of plazos) {
    filas.push([`${nombre} · Objetivo general`, limpiar(v[`${prefijo}Objetivo`]) || "—"]);
    filas.push([`${nombre} · Objetivos específicos`, limpiar(v[`${prefijo}Especificos`]) || "—"]);
  }
  return { tipo: "plan", titulo: "Plan de intervención", filas };
}

/* ============================================================
   SÍNTESIS Y DESCARGA DEL INFORME
   ============================================================ */

export function sintetizar(valores = {}) {
  const v = valores ?? {};
  const bloques = [];

  bloques.push(bloqueMotivoConsulta(v));

  const basica = seccionPorId("independencia-funcional-basica");
  const instrumental = seccionPorId("independencia-funcional-instrumental");
  bloques.push(tablaDeEscalas("Independencia funcional básica", basica, v));
  bloques.push(tablaDeEscalas("Independencia funcional instrumental", instrumental, v));

  const escalas = escalasDeIndependencia();
  const respondidas = escalas.filter((campo) => v[campo.id]);
  const conApoyo = respondidas.filter((campo) => NIVELES_APOYO.has(v[campo.id]));
  if (respondidas.length > 0) {
    bloques.push({
      tipo: "lista",
      titulo: "Distribución de niveles",
      items: distribucionDeNiveles(respondidas, v),
    });
  }
  if (conApoyo.length > 0) {
    bloques.push({
      tipo: "bandera",
      nivel: "alerta",
      titulo: "Independencia funcional",
      texto: `Requiere apoyo en: ${conApoyo
        .map((campo) => `${campo.etiqueta} (${etiquetaOpcion(campo, v[campo.id])})`)
        .join(", ")}.`,
    });
  }

  const descanso = bloqueDescanso(v);
  if (descanso) bloques.push(descanso);

  bloques.push(...bloquesOtrasConsideraciones(v));
  bloques.push(...bloquesSaludMental(v));
  bloques.push(...bloquesAreaCognitiva(v));
  bloques.push(bloquePlan(v));

  return bloques;
}

/* Configuración común del informe (PDF y Word). */
function configInforme(valores) {
  return {
    nombreArchivo: "Informe-Evaluacion-Inicial-Adulto",
    instrumento: "Evaluación inicial · Adulto",
    titulo: "Informe de evaluación inicial",
    subtitulo: "Adulto · Entrevista inicial de terapia ocupacional",
    autor: "TeraOcupame · Formulario NIÑO - ADOLESCENTE - ADULTO - PERSONA MAYOR",
    color: [234, 179, 8],
    colorOscuro: [176, 128, 0],
    colorFondo: [247, 243, 234],
    secciones: SECCIONES,
    valores,
    sintesis: sintetizar(valores),
    introduccion:
      "La ficha de evaluación inicial se completa durante la primera atención: los datos se obtienen con la propia persona, " +
      "a partir de sus palabras y de la observación del terapeuta. El informe reúne el registro completo de la entrevista " +
      "y la síntesis automatizada con las banderas clínicas para su revisión antes de firmar e integrar a la ficha clínica.",
  };
}

export function descargarInformePDF(valores) {
  descargarInformePDFEvaluacionInicial(configInforme(valores));
}

export function descargarInformeWord(valores) {
  descargarInformeWordEvaluacionInicial(configInforme(valores));
}
