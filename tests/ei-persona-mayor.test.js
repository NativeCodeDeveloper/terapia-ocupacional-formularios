import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SECCIONES,
  sintetizar,
  INDICADORES_RIESGO_SALUD_MENTAL,
  contarNivelesIndependencia,
  ambitosConApoyo,
  contarIndicadoresRiesgoSaludMental,
  etiquetasIndicadoresRiesgoSaludMental,
  contarSindromesGeriatricos,
} from "../src/lib/informe-ei-persona-mayor.js";

/* ============================================================
   EVALUACIÓN INICIAL · PERSONA MAYOR (PESTAÑA PERSONA MAYOR)
   Ficha de entrevista de 18 secciones y 144 campos. Las 22
   escalas (11 ámbitos básicos + descanso y sueño + 10
   instrumentales) generan su observación `${id}Obs` fuera del
   esquema y cada sí/no del área cognitiva lleva el companion
   `${id}EnQue`. Secciones propias de esta ficha: Síndromes
   geriátricos (8 campos) y Entorno y adaptaciones (3). Salud
   mental: 15 sí/no, con 13 indicadores de riesgo definidos
   (alucinaciones e ideación suicida llevan bandera propia).
   La síntesis automatizada no usa puntajes: construye
   párrafos, tablas, listas y banderas a partir del registro.
   ============================================================ */

const TODOS_LOS_CAMPOS = SECCIONES.flatMap((s) => s.campos);
const CAMPOS_ESCALA = TODOS_LOS_CAMPOS.filter((c) => c.tipo === "escala");
const CAMPOS_BASICA = SECCIONES.find((s) => s.id === "independencia-basica").campos.filter(
  (c) => c.tipo === "escala"
);
const CAMPOS_INSTRUMENTAL = SECCIONES.find((s) => s.id === "independencia-instrumental").campos.filter(
  (c) => c.tipo === "escala"
);
const CAMPOS_INDEPENDENCIA = CAMPOS_ESCALA.filter((c) => c.id !== "descansoSueno");
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

test("Síndromes geriátricos: 8 sí/no con su pregunta y observación opcional", () => {
  const seccion = SECCIONES.find((s) => s.id === "sindromes-geriatricos");
  assert.equal(seccion.campos.length, 16);
  const siNo = seccion.campos.filter((c) => c.tipo === "siNo");
  assert.equal(siNo.length, 8);
  for (const campo of siNo) {
    assert.ok(campo.hint, `${campo.id} debe llevar la pregunta del impreso como hint`);
    const obs = seccion.campos.find((c) => c.id === `${campo.id}Obs`);
    assert.ok(obs, `falta la observación de ${campo.id}`);
    assert.equal(obs.tipo, "textoLargo");
    assert.equal(obs.requerido, false);
  }
  assert.deepEqual(siNo.map((c) => c.id), [
    "movilidadCaidas",
    "incontinencia",
    "deterioroCognitivo",
    "depresion",
    "polifarmacia",
    "fragilidad",
    "sensorial",
    "socioeconomico",
  ]);
  assert.equal(siNo[0].hint, "¿Ha sufrido alguna caída en los últimos 12 meses?");
  assert.equal(siNo[7].hint, "¿Considera que sus ingresos cubren sus necesidades básicas?");
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

test("Salud mental tiene exactamente 15 sí/no y 13 indicadores de riesgo", () => {
  assert.equal(CAMPOS_SALUD_MENTAL.length, 15);
  assert.equal(SECCIONES.find((s) => s.id === "salud-mental").campos.length, 15);
  // La pregunta repetida del impreso aparece una sola vez.
  assert.equal(
    CAMPOS_SALUD_MENTAL.filter((c) => c.id === "maravillosoVivo").length,
    1
  );
  assert.equal(Object.keys(INDICADORES_RIESGO_SALUD_MENTAL).length, 13);
  // Alucinaciones e ideación suicida van con bandera propia, fuera del conteo.
  assert.equal("alucinaciones" in INDICADORES_RIESGO_SALUD_MENTAL, false);
  assert.equal("ideacionSuicida" in INDICADORES_RIESGO_SALUD_MENTAL, false);
});

test("básica 12 escalas e instrumental 10, con Obs fuera del esquema", () => {
  assert.equal(CAMPOS_BASICA.length, 12);
  assert.equal(CAMPOS_INSTRUMENTAL.length, 10);
  assert.equal(CAMPOS_INDEPENDENCIA.length, 21);
  for (const campo of CAMPOS_ESCALA) {
    assert.equal(campo.opciones.length, 4, campo.id);
    assert.equal(
      TODOS_LOS_CAMPOS.some((c) => c.id === `${campo.id}Obs`),
      false,
      `${campo.id}Obs no debe declararse en el esquema`
    );
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
  const conSupervision = CAMPOS_ESCALA.filter((c) =>
    c.opciones.some((o) => o.valor === "supervision")
  ).map((c) => c.id);
  // 21 ámbitos de independencia - 2 con «Asistencia» (el descanso
  // y sueño no es escala de independencia).
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

test("sintetizar con valores vacíos no lanza y no genera bandera crítico", () => {
  const bloques = sintetizar({});
  assert.ok(bloques.length > 0);
  assert.equal(bloques.some((b) => b.tipo === "bandera" && b.nivel === "critico"), false);
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
});

test("la síntesis arma las tablas del impreso: básica 12, instrumental 10, síndromes 8", () => {
  const bloques = sintetizar({});
  const basica = bloques.find((b) => b.tipo === "tabla" && b.titulo === "Independencia funcional básica");
  const instrumental = bloques.find(
    (b) => b.tipo === "tabla" && b.titulo === "Independencia funcional instrumental"
  );
  const sindromes = bloques.find((b) => b.tipo === "tabla" && b.titulo === "Síndromes geriátricos");
  assert.equal(basica.filas.length, 12);
  assert.equal(instrumental.filas.length, 10);
  assert.equal(sindromes.filas.length, 8);
  assert.deepEqual(sindromes.columnas.map((c) => c.titulo), ["Síndrome", "Respuesta", "Observación"]);
  assert.deepEqual(sindromes.filas[0], ["Movilidad y caídas", "—", "—"]);
  assert.deepEqual(
    basica.filas.map((fila) => fila[0]),
    CAMPOS_BASICA.map((c) => c.etiqueta)
  );
});

test("ideacionSuicida «si» → bandera crítico con protocolo de crisis", () => {
  const bloques = sintetizar({ ideacionSuicida: "si" });
  const critico = bloques.find((b) => b.tipo === "bandera" && b.nivel === "critico");
  assert.ok(critico, "debe existir la bandera crítica");
  assert.equal(
    critico.texto,
    "Se registra ideación/comunicación/acto suicida: activar protocolo de crisis y derivación inmediata."
  );
});

test("alucinaciones «si» → bandera alerta propia", () => {
  const bloques = sintetizar({ alucinaciones: "si" });
  const alerta = bloques.find(
    (b) => b.tipo === "bandera" && b.nivel === "alerta" && b.texto.includes("alucinaciones")
  );
  assert.ok(alerta, "debe existir la bandera de alucinaciones");
  // Las alucinaciones no cuentan como indicador de riesgo general.
  assert.equal(contarIndicadoresRiesgoSaludMental({ alucinaciones: "si" }), 0);
});

test("todas las respuestas de riesgo → párrafo de tamizaje integrado, sin alerta", () => {
  const valores = Object.fromEntries(
    Object.entries(INDICADORES_RIESGO_SALUD_MENTAL).map(([id, riesgo]) => [id, riesgo])
  );
  const bloques = sintetizar(valores);
  const tablaSM = bloques.find((b) => b.tipo === "tabla" && b.titulo === "Salud mental (pauta integrada)");
  assert.ok(tablaSM, "debe existir la tabla de resultados de salud mental");
  assert.equal(tablaSM.filas.length, 13);
  assert.ok(
    tablaSM.filas.some((fila) => fila[0] === "Se siente satisfecha de su vida" && fila[1] === "No"),
    "cada ítem muestra su respuesta"
  );
  assert.equal(contarIndicadoresRiesgoSaludMental(valores), 13);
  // La pauta integrada no levanta alerta automática por sí sola.
  assert.ok(!bloques.some((b) => b.tipo === "bandera" && b.texto.includes("indicadores de riesgo")));
});

test("respuestas sanas de salud mental → tamizaje integrado sin banderas", () => {
  const valores = Object.fromEntries(
    Object.entries(INDICADORES_RIESGO_SALUD_MENTAL).map(([id, riesgo]) => [
      id,
      riesgo === "si" ? "no" : "si",
    ])
  );
  const bloques = sintetizar(valores);
  assert.equal(bloques.filter((b) => b.tipo === "bandera").length, 0);
  assert.ok(
    bloques.some((b) => b.tipo === "tabla" && b.titulo === "Salud mental (pauta integrada)"),
    "la tabla de salud mental muestra los resultados"
  );
  assert.equal(contarIndicadoresRiesgoSaludMental(valores), 0);
});

test("síndromes geriátricos quedan en la tabla del resumen sin banderas", () => {
  const bloques = sintetizar({
    movilidadCaidas: "si",
    movilidadCaidasObs: "Dos caídas en el último año.",
    polifarmacia: "si",
    polifarmaciaObs: "Siete fármacos diarios.",
  });
  // Los síndromes quedan registrados en su tabla del resumen, sin banderas.
  const tabla = bloques.find((b) => b.tipo === "tabla" && b.titulo === "Síndromes geriátricos");
  assert.ok(
    tabla.filas.some((fila) => fila[0] === "Movilidad y caídas" && fila[1] === "Sí" && fila[2] === "Dos caídas en el último año."),
    "sí/no con la observación al lado"
  );
  assert.ok(
    tabla.filas.some((fila) => fila[0] === "Polifarmacia" && fila[1] === "Sí" && fila[2].includes("Siete fármacos"))
  );
  assert.ok(!bloques.some((b) => b.tipo === "bandera" && b.texto.includes("síndromes geriátricos")));
  assert.equal(sintetizar({}).filter((b) => b.tipo === "bandera").length, 0);
  assert.equal(contarSindromesGeriatricos({}), 0);
  assert.equal(contarSindromesGeriatricos({ movilidadCaidas: "si" }), 1);
});

test("dos o más Sí en otras consideraciones → alerta; una sola no genera bandera", () => {
  const dos = sintetizar({ mareos: "si", temblor: "si", vision: "mala" });
  const alerta = dos.find(
    (b) => b.tipo === "bandera" && b.texto.includes("otras consideraciones")
  );
  assert.equal(alerta.nivel, "alerta");
  assert.match(alerta.texto, /2 hallazgos positivos/);
  assert.ok(alerta.texto.includes("Mareos"));
  assert.ok(alerta.texto.includes("Temblor"));

  const una = sintetizar({ dolorCadera: "si" });
  assert.ok(!una.some((b) => b.tipo === "bandera" && b.texto.includes("otras consideraciones")));
});

test("todo bien: sin banderas y con el tamizaje integrado de salud mental", () => {
  const valores = {
    ...todosLosNiveles("independiente", { conDescanso: true }),
    descansoSueno: "normal",
    ...Object.fromEntries(CAMPOS_COGNITIVOS.map((c) => [c.id, "si"])),
    // Salud mental sana: todas las respuestas contrarias al riesgo.
    ...Object.fromEntries(
      Object.entries(INDICADORES_RIESGO_SALUD_MENTAL).map(([id, riesgo]) => [
        id,
        riesgo === "si" ? "no" : "si",
      ])
    ),
    alucinaciones: "no",
    ideacionSuicida: "no",
  };
  const bloques = sintetizar(valores);
  assert.equal(bloques.some((b) => b.tipo === "bandera" && b.nivel === "critico"), false);
  assert.equal(bloques.some((b) => b.tipo === "bandera" && b.nivel === "alerta"), false);

  // Perfil sano: sin distribución ni banderas (las ok/info no se
  // imprimen y la salud mental es una tabla de resultados).
  assert.equal(bloques.filter((b) => b.tipo === "bandera").length, 0);
  const tablaSM = bloques.find((b) => b.tipo === "tabla" && b.titulo === "Salud mental (pauta integrada)");
  assert.ok(tablaSM, "la tabla de salud mental muestra los resultados");
  assert.equal(tablaSM.filas.length, 15);
  assert.ok(tablaSM.filas.every((fila) => fila[1] === "Sí" || fila[1] === "No"));
});

test("un ámbito con supervisión → alerta por conteo, sin distribución", () => {
  const valores = todosLosNiveles("independiente");
  valores.marcha = "supervision";
  const bloques = sintetizar(valores);
  const alerta = bloques.find(
    (b) => b.tipo === "bandera" && b.texto.startsWith("Requiere apoyo en")
  );
  assert.equal(alerta.texto, "Requiere apoyo en 1 de los 21 ámbitos evaluados.");
  assert.ok(!bloques.some((b) => b.tipo === "lista" && b.titulo === "Distribución de niveles"));
});

test("descanso y sueño distinto de normal → bandera alerta que menciona el nivel", () => {
  const bloques = sintetizar({ ...todosLosNiveles("independiente"), descansoSueno: "insomnioMantencion" });
  const alerta = bloques.filter((b) => b.tipo === "bandera").find((b) => b.texto.includes("Insomnio de mantención"));
  assert.equal(alerta.nivel, "alerta");
  assert.ok(alerta.texto.includes("descanso y sueño"));
});

test("el motivo de consulta arma el párrafo con origen, refiere y observación", () => {
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
      "En la observación se registran Buenas condiciones generales, ánimo eutímico y orientación orientado temporoespacial."
    )
  );
});

test("el listado de entorno y adaptaciones recoge los tres campos uno por línea", () => {
  const bloques = sintetizar({
    barrerasEntorno: "Escalera sin baranda en el acceso.",
    adaptacionesDisponibles: "Barra de apoyo en la ducha.",
    adaptacionRequerida: "Rampa de acceso.",
  });
  const lista = bloques.find((b) => b.tipo === "lista" && b.titulo === "Entorno y adaptaciones");
  assert.deepEqual(lista.items, [
    "Barreras en el entorno: Escalera sin baranda en el acceso.",
    "Adaptaciones disponibles: Barra de apoyo en la ducha.",
    "Adaptación requerida: Rampa de acceso.",
  ]);
  // Sin entorno registrado el listado no aparece.
  assert.equal(
    sintetizar({}).some((b) => b.titulo === "Entorno y adaptaciones"),
    false
  );
});

test("el plan de intervención se estructura en el orden del impreso", () => {
  const bloques = sintetizar({
    problemaOcupacional: "Caídas recurrentes y pérdida de roles del hogar.",
    cortoObjetivo: "Recuperar la marcha segura en el hogar.",
    cortoEspecificos: "Caminar 50 metros con bastón sin apoyo externo.",
    largoEspecificos: "Retomar las compras semanales de forma autónoma.",
  });
  const plan = bloques.find((b) => b.tipo === "plan" && b.titulo === "Plan de intervención");
  assert.deepEqual(plan.filas[0], ["Problemática ocupacional", "Caídas recurrentes y pérdida de roles del hogar."]);
  assert.deepEqual(plan.filas[1], ["Corto plazo · Objetivo general", "Recuperar la marcha segura en el hogar."]);
  assert.deepEqual(plan.filas[2], ["Corto plazo · Objetivos específicos", "Caminar 50 metros con bastón sin apoyo externo."]);
  assert.deepEqual(plan.filas[6], ["Largo plazo · Objetivos específicos", "Retomar las compras semanales de forma autónoma."]);
  assert.deepEqual(plan.filas[3], ["Mediano plazo · Objetivo general", "—"]);
});

test("contarNivelesIndependencia y ambitosConApoyo sobre un caso mixto", () => {
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
  const alerta = bloques.find((b) => b.tipo === "bandera" && b.texto.startsWith("Requiere apoyo en"));
  assert.equal(alerta.texto, "Requiere apoyo en 3 de los 21 ámbitos evaluados.");
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

test("etiquetasIndicadoresRiesgoSaludMental devuelve las etiquetas del impreso", () => {
  const etiquetas = etiquetasIndicadoresRiesgoSaludMental({
    buenAnimo: "no",
    sinEsperanzas: "si",
    alucinaciones: "si",
  });
  assert.deepEqual(etiquetas, ["¿Tiene buen ánimo?", "¿Se ha sentido sin esperanzas?"]);
});
