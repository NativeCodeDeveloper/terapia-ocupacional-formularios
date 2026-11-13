import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SECCIONES,
  sintetizar,
  configInforme,
  INDICADORES_RIESGO_SALUD_MENTAL,
  contarNivelesIndependencia,
  ambitosConApoyo,
  contarIndicadoresRiesgoSaludMental,
  etiquetasIndicadoresRiesgoSaludMental,
  contarSindromesGeriatricos,
} from "../src/lib/informe-ei-persona-mayor.js";

/* ============================================================
   EVALUACIÓN INICIAL · PERSONA MAYOR (PESTAÑA PERSONA MAYOR)
   Ficha de entrevista de 18 secciones. Las 22 escalas (11
   ámbitos básicos + descanso y sueño + 10 instrumentales + 8
   síndromes geriátricos Sí/No) generan su observación
   `${id}Obs` fuera del esquema y cada sí/no del área cognitiva
   lleva el companion `${id}EnQue`. Secciones propias de esta
   ficha: Síndromes geriátricos y Entorno y adaptaciones.
   Salud mental: autoinforme de 13 preguntas numeradas (el
   impreso repite una pregunta y el cliente retiró
   alucinaciones e ideación suicida del cuestionario activo),
   con 13 indicadores de riesgo referido como referencia
   descriptiva, sin puntos de corte. La síntesis reproduce el
   registro completo del impreso, arma el análisis narrativo de
   las independencias y separa hallazgos de alertas.
   ============================================================ */

const TODOS_LOS_CAMPOS = SECCIONES.flatMap((s) => s.campos);
const CAMPOS_ESCALA = TODOS_LOS_CAMPOS.filter((c) => c.tipo === "escala");
const CAMPOS_BASICA = SECCIONES.find((s) => s.id === "independencia-basica").campos;
const CAMPOS_INSTRUMENTAL = SECCIONES.find((s) => s.id === "independencia-instrumental").campos;
/* 21 ámbitos de independencia (11 básicos + 10 instrumentales). */
const CAMPOS_INDEPENDENCIA = [...CAMPOS_BASICA, ...CAMPOS_INSTRUMENTAL].filter(
  (c) => c.id !== "descansoSueno"
);
const CAMPOS_SALUD_MENTAL = SECCIONES.find((s) => s.id === "salud-mental").campos.filter(
  (c) => c.tipo === "siNo"
);
const CAMPOS_COGNITIVOS = SECCIONES.find((s) => s.id === "area-cognitiva").campos.filter(
  (c) => c.tipo === "siNo"
);

const todosLosNiveles = (valor, { conDescanso = false } = {}) => {
  const valores = Object.fromEntries(CAMPOS_INDEPENDENCIA.map((c) => [c.id, valor]));
  if (conDescanso) valores.descansoSueno = valor;
  return valores;
};

const esBandera = (bloque) => bloque.tipo === "bandera";

test("la primera sección es la de identificación y es la única", () => {
  const conIdentificacion = SECCIONES.filter((s) => s.identificacion);
  assert.equal(conIdentificacion.length, 1);
  assert.equal(SECCIONES[0].id, "datos-personales");
  assert.equal(SECCIONES[0].titulo, "Datos personales");
  assert.deepEqual(
    SECCIONES[0].campos.map((c) => [c.id, c.tipo]),
    [
      ["nombre", "texto"],
      ["run", "texto"],
      ["fechaNacimiento", "fecha"],
      ["edad", "numero"],
      ["estadoCivil", "texto"],
      ["direccion", "texto"],
      ["telefono", "texto"],
      ["ocupacion", "texto"],
    ]
  );
});

test("los ids de secciones y de campos son únicos", () => {
  const idsSecciones = SECCIONES.map((s) => s.id);
  assert.equal(new Set(idsSecciones).size, idsSecciones.length);
  const idsCampos = TODOS_LOS_CAMPOS.map((c) => c.id);
  assert.equal(new Set(idsCampos).size, idsCampos.length);
});

test("el esquema cubre las 18 secciones del impreso en su orden", () => {
  assert.equal(SECCIONES.length, 18);
  assert.deepEqual(
    SECCIONES.map((s) => s.id),
    [
      "datos-personales",
      "historial-medico",
      "motivo-consulta",
      "antecedentes-familiares",
      "independencia-basica",
      "independencia-instrumental",
      "area-fisica",
      "sindromes-geriatricos",
      "otras-consideraciones",
      "salud-mental",
      "area-cognitiva",
      "lenguaje",
      "participacion-social",
      "entorno-adaptaciones",
      "habitucion",
      "esparcimiento",
      "volicion",
      "plan-intervencion",
    ]
  );
});

test("Síndromes geriátricos: 8 escalas Sí/No con la pregunta del impreso y observación implícita", () => {
  const seccion = SECCIONES.find((s) => s.id === "sindromes-geriatricos");
  assert.equal(seccion.campos.length, 8);
  for (const campo of seccion.campos) {
    assert.equal(campo.tipo, "escala");
    assert.ok(campo.hint, `${campo.id} debe llevar la pregunta del impreso como hint`);
    assert.deepEqual(
      campo.opciones.map((o) => [o.valor, o.etiqueta]),
      [
        ["si", "Sí"],
        ["no", "No"],
      ]
    );
    // La observación `${id}Obs` se genera fuera del esquema.
    assert.equal(
      TODOS_LOS_CAMPOS.some((c) => c.id === `${campo.id}Obs`),
      false,
      `${campo.id}Obs no debe declararse en el esquema`
    );
  }
  assert.deepEqual(seccion.campos.map((c) => c.id), [
    "movilidadCaidas",
    "incontinencia",
    "deterioroCognitivo",
    "depresion",
    "polifarmacia",
    "fragilidad",
    "sensorial",
    "socioeconomico",
  ]);
  assert.equal(seccion.campos[0].hint, "¿Ha sufrido alguna caída en los últimos 12 meses?");
  assert.equal(
    seccion.campos[7].hint,
    "¿Considera que sus ingresos cubren sus necesidades básicas?"
  );
});

test("Entorno y adaptaciones tiene los 3 campos propios de Persona Mayor", () => {
  const seccion = SECCIONES.find((s) => s.id === "entorno-adaptaciones");
  assert.equal(seccion.campos.length, 3);
  assert.deepEqual(seccion.campos.map((c) => [c.id, c.etiqueta]), [
    ["barrerasEntorno", "Barreras en el entorno"],
    ["adaptacionesDisponibles", "Adaptaciones disponibles"],
    ["adaptacionRequerida", "Adaptación requerida"],
  ]);
});

test("Salud mental: 13 preguntas numeradas 1-13 sin las dos retiradas por el cliente", () => {
  assert.equal(CAMPOS_SALUD_MENTAL.length, 13);
  assert.equal(SECCIONES.find((s) => s.id === "salud-mental").campos.length, 13);
  // Las dos preguntas retiradas del cuestionario activo.
  const ids = CAMPOS_SALUD_MENTAL.map((c) => c.id);
  assert.equal(ids.includes("alucinaciones"), false);
  assert.equal(ids.includes("ideacionSuicida"), false);
  // La pregunta repetida del impreso aparece una sola vez.
  assert.equal(ids.filter((id) => id === "maravillosoVivo").length, 1);
  // Numeración correlativa 1..13.
  assert.deepEqual(
    CAMPOS_SALUD_MENTAL.map((c) => c.numero),
    Array.from({ length: 13 }, (_, i) => i + 1)
  );
  assert.deepEqual(CAMPOS_SALUD_MENTAL.map((c) => c.id), [
    "satisfaccionVida",
    "abandonoActividades",
    "maravillosoVivo",
    "llenaEnergia",
    "muyPreocupado",
    "dificultadConcentrarse",
    "buenAnimo",
    "prefiereCasa",
    "seSienteInutil",
    "mayoriaMejor",
    "pocaEnergia",
    "perdidoInteres",
    "sinEsperanzas",
  ]);
  assert.equal(Object.keys(INDICADORES_RIESGO_SALUD_MENTAL).length, 13);
});

test("básica 12 escalas e instrumental 10, con Obs fuera del esquema", () => {
  assert.equal(CAMPOS_BASICA.length, 12);
  assert.equal(CAMPOS_INSTRUMENTAL.length, 10);
  assert.equal(CAMPOS_INDEPENDENCIA.length, 21);
  for (const campo of [...CAMPOS_BASICA, ...CAMPOS_INSTRUMENTAL]) {
    assert.equal(campo.opciones.length, 4, campo.id);
  }
  assert.deepEqual(
    CAMPOS_ESCALA.find((c) => c.id === "descansoSueno").opciones.map((o) => o.valor),
    ["normal", "conFarmacos", "insomnioConciliacion", "insomnioMantencion"]
  );
  // El impreso usa «Asistencia» solo en Alimentación (básica) y
  // Cuidado de otros (instrumental); el resto usa «Supervisión».
  const conAsistencia = CAMPOS_ESCALA.filter((c) =>
    c.opciones.some((o) => o.valor === "asistencia")
  ).map((c) => c.id);
  assert.deepEqual(conAsistencia.sort(), ["alimentacion", "cuidadoDeOtros"]);
  const conSupervision = CAMPOS_ESCALA.filter(
    (c) => c.tipo === "escala" && c.opciones.some((o) => o.valor === "supervision")
  ).map((c) => c.id);
  // 19 ámbitos de independencia (21 - 2 con «Asistencia»); el
  // descanso y sueño y los síndromes no son de independencia.
  assert.equal(conSupervision.length, 19);
});

test("cada función cognitiva tiene su companion «Observación»", () => {
  assert.equal(CAMPOS_COGNITIVOS.length, 6);
  const seccion = SECCIONES.find((s) => s.id === "area-cognitiva");
  assert.equal(seccion.campos.length, 13); // Generalidades + 6 funciones + 6 companions
  for (const campo of CAMPOS_COGNITIVOS) {
    const companion = seccion.campos.find((c) => c.id === `${campo.id}EnQue`);
    assert.ok(companion, `falta ${campo.id}EnQue`);
    assert.equal(companion.tipo, "textoLargo");
    assert.equal(companion.etiqueta, "Observación");
  }
});

test("los campos opcionales del cliente quedan sin obligatoriedad", () => {
  const seccion = SECCIONES.find((s) => s.id === "antecedentes-familiares");
  const buscar = (id) => seccion.campos.find((c) => c.id === id);
  assert.equal(buscar("ocupacionHijasOs").requerido, false);
  assert.equal(buscar("ocupacionPareja").requerido, false);
  assert.equal(buscar("mascotasUbicacion").requerido, false);
});

test("configInforme: título directo sin párrafo introductorio y hoja de hallazgos", () => {
  const config = configInforme({});
  assert.equal(config.titulo, "EVALUACIÓN INICIAL – PERSONA MAYOR");
  assert.equal(config.subtitulo, "");
  assert.equal("introduccion" in config, false);
  assert.equal(config.seccionHallazgos, true);
  assert.equal(config.tituloSintesis, "Resultados de la evaluación");
  assert.equal(config.instrumento, "");
});

test("caso respuestas vacías: sin banderas y con el registro declarado como sin respuesta", () => {
  const bloques = sintetizar({});
  assert.ok(bloques.length > 0);
  // Ninguna respuesta vacía genera hallazgo ni alerta.
  assert.equal(bloques.filter(esBandera).length, 0);
  assert.equal(bloques.some((b) => esBandera(b) && b.nivel === "critico"), false);
  assert.equal(
    bloques.find((b) => b.tipo === "parrafo" && b.titulo === "Motivo de consulta").texto,
    "No se registra motivo de consulta en la entrevista."
  );
  const plan = bloques.find((b) => b.tipo === "plan" && b.titulo === "Plan de intervención");
  assert.equal(plan.filas.length, 7);
  assert.ok(plan.filas.every((fila) => fila[1] === "—"));
  // Sin escalas respondidas no hay distribución de niveles.
  assert.equal(
    bloques.some((b) => b.tipo === "lista" && b.titulo === "Distribución de niveles"),
    false
  );

  // El registro completo declara los vacíos, no los omite.
  const historial = bloques.find((b) => b.tipo === "lista" && b.titulo === "Historial médico");
  assert.ok(historial.items.includes("Hábitos · Tabaco: Sin respuesta"));
  assert.ok(historial.items.includes("Ayudas técnicas: —"));
  const familiares = bloques.find(
    (b) => b.tipo === "lista" && b.titulo === "Antecedentes familiares"
  );
  assert.ok(familiares.items.includes("Ocupación pareja: —"));
  assert.ok(familiares.items.includes("Ubicación de las mascotas: Sin respuesta"));
  const fisica = bloques.find((b) => b.tipo === "lista" && b.titulo === "Área física");
  assert.equal(fisica.items.length, 11);
  assert.ok(fisica.items.includes("Fuerza: —"));
  const entorno = bloques.find((b) => b.tipo === "lista" && b.titulo === "Entorno y adaptaciones");
  assert.deepEqual(entorno.items, [
    "Barreras en el entorno: —",
    "Adaptaciones disponibles: —",
    "Adaptación requerida: —",
  ]);
  const sm = bloques.find((b) => b.tipo === "parrafo" && b.titulo === "Salud mental (autoinforme numerado)");
  assert.ok(sm.texto.includes("Se respondieron 0 de 13 ítems"));
  assert.ok(sm.texto.includes("ítem 1 (Se siente satisfecha de su vida)"));
  const narrativaBasica = bloques.find(
    (b) => b.tipo === "parrafo" && b.titulo === "Independencia funcional básica (análisis narrativo)"
  );
  assert.equal(narrativaBasica.texto, "No se registran niveles de independencia para esta sección.");
  const narrativaInstrumental = bloques.find(
    (b) =>
      b.tipo === "parrafo" && b.titulo === "Independencia funcional instrumental (análisis narrativo)"
  );
  assert.equal(narrativaInstrumental.texto, "No se registran niveles de independencia para esta sección.");
});

test("la síntesis reproduce el registro del impreso en su orden", () => {
  const bloques = sintetizar({});
  const titulos = bloques.map((b) => b.titulo);
  const posiciones = [
    "Motivo de consulta",
    "Historial médico",
    "Antecedentes familiares",
    "Independencia funcional básica (análisis narrativo)",
    "Independencia funcional básica (resultado por actividad)",
    "Independencia funcional instrumental (análisis narrativo)",
    "Independencia funcional instrumental (resultado por actividad)",
    "Área física",
    "Síndromes geriátricos",
    "Otras consideraciones",
    "Salud mental (autoinforme numerado)",
    "Salud mental (respuesta por ítem)",
    "Área cognitiva",
    "Lenguaje",
    "Participación social",
    "Entorno y adaptaciones",
    "Habituación",
    "Esparcimiento",
    "Volición",
    "Plan de intervención",
  ].map((titulo) => titulos.indexOf(titulo));
  assert.ok(posiciones.every((p) => p !== -1), "todas las secciones del impreso están en el informe");
  assert.deepEqual(posiciones, [...posiciones].sort((a, b) => a - b));
});

test("las tablas de independencia llevan nivel y observación por actividad", () => {
  const valores = {
    ...todosLosNiveles("independiente"),
    descansoSueno: "conFarmacos",
    descansoSuenoObs: "Usa trazol por las noches.",
    comprasObs: "Acompañada por su hija.",
  };
  const bloques = sintetizar(valores);
  const basica = bloques.find(
    (b) => b.tipo === "tabla" && b.titulo === "Independencia funcional básica (resultado por actividad)"
  );
  const instrumental = bloques.find(
    (b) =>
      b.tipo === "tabla" && b.titulo === "Independencia funcional instrumental (resultado por actividad)"
  );
  assert.equal(basica.filas.length, 12);
  assert.equal(instrumental.filas.length, 10);
  assert.deepEqual(basica.columnas.map((c) => c.titulo), ["Actividad", "Nivel", "Observación"]);
  const filaDescanso = basica.filas.find((fila) => fila[0] === "Descanso y sueño");
  assert.deepEqual(filaDescanso, ["Descanso y sueño", "Con fármacos", "Usa trazol por las noches."]);
  const filaCompras = instrumental.filas.find((fila) => fila[0] === "Compras");
  assert.deepEqual(filaCompras, ["Compras", "Independiente", "Acompañada por su hija."]);
  const filaSinObs = basica.filas.find((fila) => fila[0] === "Vestuario");
  assert.deepEqual(filaSinObs, ["Vestuario", "Independiente", "—"]);
  assert.ok(
    instrumental.filas.every((fila) => fila[1] === "Independiente"),
    "ninguna actividad independiente se clasifica como apoyo"
  );
});

test("el análisis narrativo básico construye el párrafo solo con lo registrado", () => {
  const valores = todosLosNiveles("independiente");
  valores.alimentacion = "asistencia";
  valores.higieneMenor = "supervision";
  valores.higieneMayor = "supervision";
  valores.transferenciasCamaSilla = "ayudaModerada";
  valores.descansoSueno = "insomnioMantencion";
  const bloques = sintetizar(valores);
  const narrativa = bloques.find(
    (b) => b.tipo === "parrafo" && b.titulo === "Independencia funcional básica (análisis narrativo)"
  ).texto;
  assert.ok(
    narrativa.startsWith("La persona evaluada presenta independencia en Vestuario"),
    "empieza con las actividades independientes: " + narrativa
  );
  assert.ok(narrativa.includes("presenta independencia en Vestuario"));
  assert.ok(narrativa.includes("Requiere supervisión en Higiene menor y Higiene mayor."));
  assert.ok(narrativa.includes("Requiere ayuda moderada en Transferencias cama/silla."));
  assert.ok(narrativa.includes("Requiere asistencia en Alimentación."));
  assert.ok(narrativa.includes("El descanso y sueño se registra como «Insomnio de mantención»."));
  assert.ok(
    narrativa.includes("Estos resultados evidencian necesidades específicas de apoyo en las actividades de la vida diaria.")
  );
  // La narrativa básica no mezcla ítems de la instrumental.
  assert.ok(!narrativa.includes("Compras"));
});

test("el análisis narrativo instrumental separa lo independiente de lo apoyado", () => {
  const valores = todosLosNiveles("independiente");
  valores.cuidadoDeOtros = "dependiente";
  valores.compras = "supervision";
  const bloques = sintetizar(valores);
  const narrativa = bloques.find(
    (b) =>
      b.tipo === "parrafo" && b.titulo === "Independencia funcional instrumental (análisis narrativo)"
  ).texto;
  assert.ok(narrativa.startsWith("La persona evaluada presenta independencia en"));
  assert.ok(narrativa.includes("Requiere supervisión en Compras."));
  assert.ok(narrativa.includes("Presenta dependencia en Cuidado de otros."));
  assert.ok(!narrativa.includes("Alimentación"), "no mezcla ítems de la básica");
});

test("caso independencia mixta: cada actividad clasifica con su nivel exacto", () => {
  const valores = todosLosNiveles("independiente");
  valores.alimentacion = "asistencia";
  valores.vestuario = "ayudaModerada";
  valores.compras = "dependiente";
  assert.deepEqual(contarNivelesIndependencia(valores), {
    independiente: 18,
    supervision: 0,
    asistencia: 1,
    ayudaModerada: 1,
    dependiente: 1,
  });
  assert.deepEqual(ambitosConApoyo(valores), ["Alimentación", "Vestuario", "Compras"]);

  const bloques = sintetizar(valores);
  const basica = bloques.find(
    (b) => b.tipo === "tabla" && b.titulo === "Independencia funcional básica (resultado por actividad)"
  );
  assert.deepEqual(
    basica.filas.find((fila) => fila[0] === "Alimentación"),
    ["Alimentación", "Asistencia", "—"]
  );
  assert.deepEqual(
    basica.filas.find((fila) => fila[0] === "Vestuario"),
    ["Vestuario", "Ayuda moderada", "—"]
  );
  const instrumental = bloques.find(
    (b) =>
      b.tipo === "tabla" && b.titulo === "Independencia funcional instrumental (resultado por actividad)"
  );
  assert.deepEqual(
    instrumental.filas.find((fila) => fila[0] === "Compras"),
    ["Compras", "Dependiente", "—"]
  );

  const hallazgo = bloques.find((b) => esBandera(b) && b.texto.includes("Requiere apoyo"));
  assert.equal(hallazgo.categoria, "hallazgo");
  assert.equal(hallazgo.nivel, "hallazgo");
  assert.equal(
    hallazgo.texto,
    "Requiere apoyo (supervisión, asistencia, ayuda moderada o dependencia) en 3 de los 21 ámbitos de independencia funcional evaluados."
  );
  // Sin "Distribución de niveles".
  assert.ok(!bloques.some((b) => b.tipo === "lista" && b.titulo === "Distribución de niveles"));
});

test("contarNivelesIndependencia ignora niveles vacíos o desconocidos", () => {
  assert.deepEqual(contarNivelesIndependencia({}), {
    independiente: 0,
    supervision: 0,
    asistencia: 0,
    ayudaModerada: 0,
    dependiente: 0,
  });
  assert.deepEqual(contarNivelesIndependencia({ alimentacion: "independiente", compras: "noExiste" }), {
    independiente: 1,
    supervision: 0,
    asistencia: 0,
    ayudaModerada: 0,
    dependiente: 0,
  });
});

test("el motivo de consulta arma el párrafo solo con lo registrado", () => {
  const bloques = sintetizar({
    origen: "derivacion",
    refiereQue: "Se cansa al caminar media cuadra.",
    seObserva: "Marcha lentificada con apoyo en muebles.",
    condicionesGenerales: "buenas",
    animo: "eutimico",
    orientacion: "orientadoTemporoespacial",
  });
  const texto = bloques.find((b) => b.tipo === "parrafo" && b.titulo === "Motivo de consulta").texto;
  assert.ok(texto.includes("Origen de la consulta: Derivación."));
  assert.ok(texto.includes("Refiere que: Se cansa al caminar media cuadra."));
  assert.ok(texto.includes("Se observa: Marcha lentificada con apoyo en muebles."));
  assert.ok(
    texto.includes(
      "En la observación se registran: Buenas condiciones generales · Ánimo eutímico · Orientado temporoespacial."
    )
  );

  // Registrando solo una de las tres observaciones no rellena con «—».
  const parcial = sintetizar({ condicionesGenerales: "regulares" });
  const textoParcial = parcial.find((b) => b.tipo === "parrafo" && b.titulo === "Motivo de consulta").texto;
  assert.ok(textoParcial.includes("En la observación se registran: Regulares condiciones generales."));
  assert.ok(!textoParcial.includes("—, ánimo"));
});

test("caso salud mental completo: numeración, respuesta individual y conteo", () => {
  const valores = Object.fromEntries(
    CAMPOS_SALUD_MENTAL.map((c) => [c.id, INDICADORES_RIESGO_SALUD_MENTAL[c.id]])
  );
  const bloques = sintetizar(valores);
  const tablaSM = bloques.find(
    (b) => b.tipo === "tabla" && b.titulo === "Salud mental (respuesta por ítem)"
  );
  assert.ok(tablaSM, "debe existir la tabla numerada de salud mental");
  assert.equal(tablaSM.filas.length, 13);
  assert.deepEqual(tablaSM.columnas.map((c) => c.titulo), ["N.º", "Ítem", "Respuesta"]);
  assert.deepEqual(tablaSM.filas[0], ["1", "Se siente satisfecha de su vida", "No"]);
  assert.deepEqual(tablaSM.filas[6], ["7", "¿Tiene buen ánimo?", "No"]);
  const parrafoSM = bloques.find(
    (b) => b.tipo === "parrafo" && b.titulo === "Salud mental (autoinforme numerado)"
  );
  assert.equal(
    parrafoSM.texto,
    "Se respondieron 13 de 13 ítems del autoinforme de salud mental."
  );
  assert.equal(contarIndicadoresRiesgoSaludMental(valores), 13);
  const hallazgo = bloques.find((b) => esBandera(b) && b.texto.includes("salud mental"));
  assert.equal(hallazgo.categoria, "hallazgo");
  assert.ok(hallazgo.texto.includes("13 respuestas en la dirección de riesgo referido"));
  assert.ok(
    hallazgo.texto.includes("no se aplican puntos de corte ni interpretación diagnóstica"),
    "sin puntos de corte inventados"
  );
  assert.ok(!bloques.some((b) => esBandera(b) && b.nivel === "critico"));
});

test("caso salud mental parcial: identifica los ítems faltantes por número", () => {
  const bloques = sintetizar({ buenAnimo: "no", sinEsperanzas: "si" });
  const parrafoSM = bloques.find(
    (b) => b.tipo === "parrafo" && b.titulo === "Salud mental (autoinforme numerado)"
  );
  assert.ok(parrafoSM.texto.includes("Se respondieron 2 de 13 ítems"));
  assert.ok(parrafoSM.texto.includes("ítem 1 (Se siente satisfecha de su vida)"));
  assert.ok(parrafoSM.texto.includes("ítem 3 (¿Piensa que es maravilloso estar vivo?)"));
  // Los dos respondidos no figuran como faltantes.
  assert.ok(!parrafoSM.texto.includes("ítem 7 (¿Tiene buen ánimo?)"));
  assert.ok(!parrafoSM.texto.includes("ítem 13 (¿Se ha sentido sin esperanzas?)"));
  const tablaSM = bloques.find(
    (b) => b.tipo === "tabla" && b.titulo === "Salud mental (respuesta por ítem)"
  );
  assert.deepEqual(tablaSM.filas[12], ["13", "¿Se ha sentido sin esperanzas?", "Sí"]);
  assert.deepEqual(tablaSM.filas[0][2], "Sin respuesta");
});

test("respuestas sanas de salud mental → sin hallazgos ni alertas", () => {
  const valores = Object.fromEntries(
    Object.entries(INDICADORES_RIESGO_SALUD_MENTAL).map(([id, riesgo]) => [
      id,
      riesgo === "si" ? "no" : "si",
    ])
  );
  const bloques = sintetizar(valores);
  assert.equal(bloques.filter(esBandera).length, 0);
  assert.equal(contarIndicadoresRiesgoSaludMental(valores), 0);
  assert.equal(
    bloques.find((b) => b.tipo === "parrafo" && b.titulo === "Salud mental (autoinforme numerado)").texto,
    "Se respondieron 13 de 13 ítems del autoinforme de salud mental."
  );
});

test("etiquetasIndicadoresRiesgoSaludMental devuelve las etiquetas del impreso", () => {
  const etiquetas = etiquetasIndicadoresRiesgoSaludMental({
    buenAnimo: "no",
    sinEsperanzas: "si",
    alucinaciones: "si",
  });
  assert.deepEqual(etiquetas, ["¿Tiene buen ánimo?", "¿Se ha sentido sin esperanzas?"]);
});

test("caso síndromes geriátricos: Sí/No con observación, antecedentes referidos sin diagnóstico", () => {
  const valores = {
    movilidadCaidas: "si",
    movilidadCaidasObs: "Dos caídas en el último año.",
    polifarmacia: "si",
    polifarmaciaObs: "Siete fármacos diarios.",
    incontinencia: "no",
  };
  const bloques = sintetizar(valores);
  const tabla = bloques.find((b) => b.tipo === "tabla" && b.titulo === "Síndromes geriátricos");
  assert.equal(tabla.filas.length, 8);
  assert.deepEqual(tabla.columnas.map((c) => c.titulo), ["Dominio", "Pregunta", "Respuesta", "Observación"]);
  assert.deepEqual(tabla.filas[0], [
    "Movilidad y caídas",
    "¿Ha sufrido alguna caída en los últimos 12 meses?",
    "Sí",
    "Dos caídas en el último año.",
  ]);
  assert.deepEqual(tabla.filas[1][2], "No");
  assert.deepEqual(tabla.filas[2][2], "Sin respuesta");
  const hallazgo = bloques.find((b) => esBandera(b) && b.texto.includes("síndromes geriátricos"));
  assert.equal(hallazgo.categoria, "hallazgo");
  assert.ok(
    hallazgo.texto.startsWith("Antecedentes referidos en síndromes geriátricos:"),
    "respuesta afirmativa = antecedente referido, no diagnóstico"
  );
  assert.ok(hallazgo.texto.includes("Movilidad y caídas"));
  assert.ok(hallazgo.texto.includes("Polifarmacia"));
  assert.ok(!hallazgo.texto.includes("Incontinencia"), "los «No» no son hallazgo");
  assert.equal(contarSindromesGeriatricos(valores), 3);
  assert.equal(contarSindromesGeriatricos({}), 0);
  assert.equal(sintetizar({}).filter(esBandera).length, 0);
});

test("otras consideraciones: registro completo de los 8 ítems y hallazgo con los positivos", () => {
  const bloques = sintetizar({ mareos: "si", temblor: "si", vision: "mala", dolorCadera: "no" });
  const lista = bloques.find((b) => b.tipo === "lista" && b.titulo === "Otras consideraciones");
  assert.equal(lista.items.length, 8);
  assert.ok(lista.items.includes("Mareos: Sí"));
  assert.ok(lista.items.includes("Dolor de cadera: No"));
  assert.ok(lista.items.includes("Audición: Sin respuesta"));
  const hallazgo = bloques.find((b) => esBandera(b) && b.texto.includes("otras consideraciones"));
  assert.equal(hallazgo.categoria, "hallazgo");
  assert.ok(
    hallazgo.texto.includes("Hallazgos registrados en otras consideraciones: Mareos (Sí), Temblor (Sí) y Visión (Mala).")
  );
  // Un solo positivo también es hallazgo descriptivo.
  const uno = sintetizar({ dolorCadera: "si" });
  const hallazgoUno = uno.find((b) => esBandera(b) && b.texto.includes("otras consideraciones"));
  assert.ok(hallazgoUno.texto.includes("Dolor de cadera (Sí)"));
});

test("caso área cognitiva: las dificultades son hallazgos, no alertas", () => {
  const valores = {
    atencionSelectiva: "no",
    atencionSelectivaEnQue: "Pierde la conversación con ruido ambiental.",
    memoriaTrabajo: "no",
    atencionSostenida: "si",
  };
  const bloques = sintetizar(valores);
  const lista = bloques.find((b) => b.tipo === "lista" && b.titulo === "Área cognitiva");
  assert.equal(lista.items.length, 7);
  assert.ok(lista.items.includes("Generalidades: —"));
  assert.ok(
    lista.items.includes(
      "Atención selectiva: No — Pierde la conversación con ruido ambiental."
    )
  );
  assert.ok(lista.items.includes("Atención sostenida: Sí"));
  assert.ok(lista.items.includes("Memoria largo plazo: Sin respuesta"));
  const hallazgo = bloques.find((b) => esBandera(b) && b.texto.includes("funciones cognitivas"));
  assert.equal(hallazgo.categoria, "hallazgo");
  assert.equal(
    hallazgo.texto,
    "Se registran dificultades referidas en funciones cognitivas: Atención selectiva y Memoria de trabajo."
  );
  assert.ok(!bloques.some((b) => esBandera(b) && b.texto.includes("alerta")));
  // Sin dificultades registradas no hay hallazgo cognitivo.
  assert.equal(sintetizar({ atencionSelectiva: "si" }).filter(esBandera).length, 0);
});

test("descanso y sueño distinto de normal → hallazgo descriptivo, no alerta", () => {
  const bloques = sintetizar({
    ...todosLosNiveles("independiente"),
    descansoSueno: "insomnioMantencion",
  });
  const hallazgo = bloques.filter(esBandera).find((b) => b.texto.includes("Insomnio de mantención"));
  assert.equal(hallazgo.nivel, "hallazgo");
  assert.equal(hallazgo.categoria, "hallazgo");
  assert.ok(hallazgo.texto.includes("El descanso y sueño se registra como «Insomnio de mantención»."));
  // Descanso normal no genera hallazgo.
  const normal = sintetizar({ ...todosLosNiveles("independiente"), descansoSueno: "normal" });
  assert.equal(normal.filter(esBandera).length, 0);
});

test("el plan de intervención se estructura en el orden del impreso y precede a los hallazgos", () => {
  const bloques = sintetizar({
    problemaOcupacional: "Caídas recurrentes y pérdida de roles del hogar.",
    cortoObjetivo: "Recuperar la marcha segura en el hogar.",
    cortoEspecificos: "Caminar 50 metros con bastón sin apoyo externo.",
    largoEspecificos: "Retomar las compras semanales de forma autónoma.",
    movilidadCaidas: "si",
  });
  const plan = bloques.find((b) => b.tipo === "plan" && b.titulo === "Plan de intervención");
  assert.deepEqual(plan.filas[0], ["Problemática ocupacional", "Caídas recurrentes y pérdida de roles del hogar."]);
  assert.deepEqual(plan.filas[1], ["Corto plazo · Objetivo general", "Recuperar la marcha segura en el hogar."]);
  assert.deepEqual(plan.filas[2], ["Corto plazo · Objetivos específicos", "Caminar 50 metros con bastón sin apoyo externo."]);
  assert.deepEqual(plan.filas[6], ["Largo plazo · Objetivos específicos", "Retomar las compras semanales de forma autónoma."]);
  assert.deepEqual(plan.filas[3], ["Mediano plazo · Objetivo general", "—"]);

  const indicesBandera = bloques
    .map((b, i) => (esBandera(b) ? i : -1))
    .filter((i) => i !== -1);
  const indicePlan = bloques.indexOf(plan);
  assert.ok(
    indicesBandera.every((i) => i > indicePlan),
    "hallazgos y alertas van después del plan de intervención"
  );
});

test("datos históricos retirados del formulario: la información se conserva como alerta", () => {
  const bloques = sintetizar({ alucinaciones: "si", ideacionSuicida: "si" });
  const critico = bloques.find((b) => esBandera(b) && b.nivel === "critico");
  assert.ok(critico, "debe existir la bandera crítica para datos históricos");
  assert.equal(critico.categoria, "alerta");
  assert.equal(
    critico.texto,
    "Se registra ideación/comunicación/acto suicida: activar protocolo de crisis y derivación inmediata."
  );
  const alerta = bloques.find(
    (b) => esBandera(b) && b.nivel === "alerta" && b.texto.includes("alucinaciones")
  );
  assert.equal(alerta.categoria, "alerta");
  // Las alucinaciones no cuentan como indicador de riesgo general.
  assert.equal(contarIndicadoresRiesgoSaludMental({ alucinaciones: "si" }), 0);
  // La tabla numerada de salud mental sigue en 13 ítems activos.
  const tablaSM = bloques.find(
    (b) => b.tipo === "tabla" && b.titulo === "Salud mental (respuesta por ítem)"
  );
  assert.equal(tablaSM.filas.length, 13);
});

test("las banderas del informe son hallazgos o alertas categorizadas, nunca sueltas", () => {
  const valores = {
    ...todosLosNiveles("independiente"),
    descansoSueno: "conFarmacos",
    mareos: "si",
    buenAnimo: "no",
    atencionDividida: "no",
    movilidadCaidas: "si",
    alucinaciones: "si",
  };
  const bloques = sintetizar(valores);
  const banderas = bloques.filter(esBandera);
  assert.ok(banderas.length >= 4);
  for (const bandera of banderas) {
    assert.ok(
      bandera.categoria === "hallazgo" || bandera.categoria === "alerta",
      "cada bandera declara su categoría"
    );
    if (bandera.categoria === "hallazgo") assert.equal(bandera.nivel, "hallazgo");
    else assert.ok(bandera.nivel === "alerta" || bandera.nivel === "critico");
  }
});

test("la síntesis nunca emite valores técnicos en los bloques", () => {
  const valores = {
    ...todosLosNiveles("independiente"),
    refiereQue: "Texto con\nsalto de línea.",
    antecedentesMedicos: "Hipertensión arterial.",
  };
  const serializado = JSON.stringify(sintetizar(valores));
  assert.equal(serializado.includes("undefined"), false);
  assert.equal(serializado.includes("[object Object]"), false);
});
