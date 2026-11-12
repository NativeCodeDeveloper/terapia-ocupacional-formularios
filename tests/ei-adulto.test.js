import { test } from "node:test";
import assert from "node:assert/strict";
import { SECCIONES, sintetizar } from "../src/lib/informe-ei-adulto.js";

/* ============================================================
   EVALUACIÓN INICIAL DE TERAPIA OCUPACIONAL · ADULTO
   La ficha no tiene puntaje ni tabla de corte: se valida el
   esquema transcrita del impreso (16 secciones, 125 campos sin
   contar las observaciones de las escalas) y la síntesis
   automatizada: tablas de independencia funcional (12 + 10
   filas), distribución de niveles, descanso y sueño, otras
   consideraciones, salud mental (15 ítems sí/no con banderas
   ok/alerta/crítico), funciones cognitivas y plan de
   intervención. El impreso repite «¿Piensa que es maravilloso
   estar vivo?» en Salud mental: se incluye una sola vez.
   ============================================================ */

const todosLosCampos = () => SECCIONES.flatMap((s) => s.campos);
const seccionPorId = (id) => SECCIONES.find((s) => s.id === id);

/* Las 21 escalas de independencia (Descanso y sueño queda
   fuera porque sus opciones no son niveles de asistencia). */
function escalasDeIndependencia() {
  const basicas = seccionPorId("independencia-funcional-basica").campos.filter(
    (c) => c.id !== "descansoSueno"
  );
  const instrumentales = seccionPorId("independencia-funcional-instrumental").campos;
  return [...basicas, ...instrumentales];
}

test("esquema: 16 secciones, 125 campos con ids únicos", () => {
  assert.deepEqual(
    SECCIONES.map((s) => s.id),
    [
      "datos-personales",
      "historial-medico",
      "motivo-consulta",
      "antecedentes-familiares",
      "independencia-funcional-basica",
      "independencia-funcional-instrumental",
      "area-fisica",
      "otras-consideraciones",
      "salud-mental",
      "area-cognitiva",
      "lenguaje",
      "participacion-social",
      "habituacion",
      "esparcimiento",
      "volicion",
      "plan-intervencion",
    ]
  );
  assert.deepEqual(
    SECCIONES.map((s) => s.campos.length),
    [8, 11, 6, 8, 12, 10, 11, 8, 15, 13, 3, 4, 3, 3, 3, 7]
  );
  const campos = todosLosCampos();
  assert.equal(campos.length, 125); // sin contar las observaciones de las escalas
  const ids = campos.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("la primera sección es la de identificación", () => {
  assert.equal(SECCIONES[0].id, "datos-personales");
  assert.equal(SECCIONES[0].identificacion, true);
  assert.deepEqual(
    SECCIONES[0].campos.map((c) => c.etiqueta),
    ["Nombre", "RUN", "Fecha de nacimiento", "Edad", "Estado civil", "Dirección", "Teléfono", "Ocupación"]
  );
});

test("salud mental: 15 ítems sí/no y el ítem repetido del impreso aparece una sola vez", () => {
  const saludMental = seccionPorId("salud-mental");
  const siNo = saludMental.campos.filter((c) => c.tipo === "siNo");
  assert.equal(siNo.length, 15);
  const maravilloso = siNo.filter((c) => c.etiqueta.includes("maravilloso estar vivo"));
  assert.equal(maravilloso.length, 1); // el impreso lo repite en la página siguiente
  assert.ok(siNo.some((c) => c.id === "ideacionSuicida"));
  assert.ok(siNo.some((c) => c.id === "alucinaciones"));
  assert.ok(siNo.some((c) => c.etiqueta.includes("inútil")));
});

test("independencia básica con 12 escalas e instrumental con 10", () => {
  const basica = seccionPorId("independencia-funcional-basica");
  const instrumental = seccionPorId("independencia-funcional-instrumental");
  assert.equal(basica.campos.filter((c) => c.tipo === "escala").length, 12);
  assert.equal(instrumental.campos.filter((c) => c.tipo === "escala").length, 10);
  // ninguna escala declara su observación (se genera sola)
  for (const campo of [...basica.campos, ...instrumental.campos]) {
    assert.ok(!campo.id.endsWith("Obs"));
  }
});

test("«Cuidado de otros» usa Asistencia y el resto de la instrumental Supervisión", () => {
  const instrumental = seccionPorId("independencia-funcional-instrumental");
  const cuidadoOtros = instrumental.campos.find((c) => c.id === "cuidadoOtros");
  assert.deepEqual(
    cuidadoOtros.opciones.map((o) => o.etiqueta),
    ["Independiente", "Asistencia", "Ayuda moderada", "Dependiente"]
  );
  for (const campo of instrumental.campos.filter((c) => c.id !== "cuidadoOtros")) {
    assert.deepEqual(
      campo.opciones.map((o) => o.etiqueta),
      ["Independiente", "Supervisión", "Ayuda moderada", "Dependiente"]
    );
  }
});

test("transcripción verbatim del impreso: Alimentación también usa Asistencia", () => {
  const basica = seccionPorId("independencia-funcional-basica");
  const alimentacion = basica.campos.find((c) => c.id === "alimentacion");
  assert.deepEqual(
    alimentacion.opciones.map((o) => o.etiqueta),
    ["Independiente", "Asistencia", "Ayuda moderada", "Dependiente"]
  );
  for (const campo of basica.campos.filter((c) => !["alimentacion", "descansoSueno"].includes(c.id))) {
    assert.deepEqual(
      campo.opciones.map((o) => o.etiqueta),
      ["Independiente", "Supervisión", "Ayuda moderada", "Dependiente"]
    );
  }
  const descanso = basica.campos.find((c) => c.id === "descansoSueno");
  assert.deepEqual(
    descanso.opciones.map((o) => o.etiqueta),
    ["Normal", "Con fármacos", "Insomnio de conciliación", "Insomnio de mantención"]
  );
});

test("área cognitiva: cada función sí/no lleva su campo «Observación»", () => {
  const cognitiva = seccionPorId("area-cognitiva");
  const funciones = cognitiva.campos.filter((c) => c.tipo === "siNo");
  assert.deepEqual(
    funciones.map((c) => c.etiqueta),
    [
      "Atención selectiva",
      "Atención sostenida",
      "Atención dividida",
      "Memoria corto plazo",
      "Memoria largo plazo",
      "Memoria de trabajo",
    ]
  );
  for (const campo of funciones) {
    const enQue = cognitiva.campos.find((c) => c.id === `${campo.id}EnQue`);
    assert.ok(enQue, `falta el campo Observación de ${campo.id}`);
    assert.equal(enQue.etiqueta, "Observación");
    assert.equal(enQue.tipo, "textoLargo");
    assert.equal(enQue.requerido ?? false, false);
  }
});

test("sintetizar con valores vacíos: no lanza y no hay bandera crítica", () => {
  const bloques = sintetizar({});
  assert.ok(bloques.length > 0);
  assert.ok(!bloques.some((b) => b.tipo === "bandera" && b.nivel === "critico"));
  assert.equal(
    bloques.find((b) => b.tipo === "parrafo" && b.titulo === "Motivo de consulta").texto,
    "No se registra motivo de consulta en la entrevista."
  );
  const plan = bloques.find((b) => b.tipo === "plan" && b.titulo === "Plan de intervención");
  assert.equal(plan.filas.length, 7);
  assert.ok(plan.filas.every((fila) => fila[1] === "—"));
});

test("las tablas de la síntesis tienen 12 y 10 filas", () => {
  const tablas = sintetizar({}).filter((b) => b.tipo === "tabla");
  assert.equal(tablas.length, 2);
  assert.deepEqual(tablas.map((t) => t.titulo), [
    "Independencia funcional básica",
    "Independencia funcional instrumental",
  ]);
  assert.deepEqual(tablas.map((t) => t.filas.length), [12, 10]);
  assert.deepEqual(tablas.map((t) => t.filas[0][0]), ["Alimentación", "Cuidado de otros"]);
});

test("ideación suicida en Sí genera bandera crítica con protocolo de crisis", () => {
  const bloques = sintetizar({ ideacionSuicida: "si" });
  const critico = bloques.find((b) => b.tipo === "bandera" && b.nivel === "critico");
  assert.ok(critico, "debe existir la bandera crítica");
  assert.match(critico.texto, /ideación\/comunicación\/acto suicida/);
  assert.match(critico.texto, /protocolo de crisis/);
});

test("alucinaciones en Sí generan una bandera de alerta propia", () => {
  const bloques = sintetizar({ alucinaciones: "si" });
  const alerta = bloques.find((b) => b.tipo === "bandera" && b.texto.includes("alucinaciones visuales o auditivas"));
  assert.ok(alerta);
  assert.equal(alerta.nivel, "alerta");
});

test("todas las respuestas de riesgo → alerta de salud mental con 13 indicadores", () => {
  const valores = {
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
  const bloques = sintetizar(valores);
  const tamizaje = bloques.find(
    (b) => b.tipo === "parrafo" && b.titulo === "Salud mental (tamizaje integrado)"
  );
  assert.ok(tamizaje, "debe existir el párrafo de tamizaje integrado");
  assert.match(tamizaje.texto, /Se aplicaron 13 de 15 ítems/);
  assert.match(tamizaje.texto, /Se siente satisfecha de su vida: No/);
  assert.match(tamizaje.texto, /¿Se ha sentido sin esperanzas\?: Sí/);
  // La pauta integrada no levanta alerta automática por sí sola.
  assert.ok(!bloques.some((b) => b.tipo === "bandera" && b.texto.startsWith("Se registran 13 indicadores")));
});

test("perfil sano: sin banderas y con el tamizaje integrado de salud mental", () => {
  const valores = {
    satisfaccionVida: "si",
    buenAnimo: "si",
    abandonoActividades: "no",
    prefiereCasa: "no",
    maravillosoVivo: "si",
    seSienteInutil: "no",
    llenaEnergia: "si",
    mayoriaMejor: "no",
    pocaEnergia: "no",
    muyPreocupado: "no",
    perdidoInteres: "no",
    dificultadConcentrarse: "no",
    sinEsperanzas: "no",
    descansoSueno: "normal",
  };
  for (const campo of escalasDeIndependencia()) valores[campo.id] = "independiente";

  const bloques = sintetizar(valores);
  // Perfil sano: ninguna bandera (las ok/info no se imprimen y
  // el tamizaje integrado de salud mental es un párrafo).
  assert.equal(bloques.filter((b) => b.tipo === "bandera").length, 0);
  const tamizaje = bloques.find((b) => b.titulo === "Salud mental (tamizaje integrado)");
  assert.ok(tamizaje, "el tamizaje integrado resume los ítems aplicados");
  assert.match(tamizaje.texto, /Se aplicaron 13 de 15 ítems/);

  const distribucion = bloques.find((b) => b.tipo === "lista" && b.titulo === "Distribución de niveles");
  assert.deepEqual(distribucion.items, ["Independiente: 21 de 21"]);
});

test("una escala con apoyo genera la lista de distribución y la alerta con los ámbitos", () => {
  const bloques = sintetizar({ alimentacion: "asistencia", compras: "supervision", cuidadoOtros: "dependiente" });
  const distribucion = bloques.find((b) => b.tipo === "lista" && b.titulo === "Distribución de niveles");
  assert.deepEqual(distribucion.items, [
    "Supervisión: 1 de 3",
    "Asistencia: 1 de 3",
    "Dependiente: 1 de 3",
  ]);
  const alerta = bloques.find((b) => b.tipo === "bandera" && b.texto.startsWith("Requiere apoyo en:"));
  assert.match(alerta.texto, /Alimentación \(Asistencia\)/);
  assert.match(alerta.texto, /Compras \(Supervisión\)/);
  assert.match(alerta.texto, /Cuidado de otros \(Dependiente\)/);
});

test("insomnio distinto de Normal genera alerta de descanso y sueño", () => {
  const bloques = sintetizar({ descansoSueno: "insomnioMantencion" });
  const alerta = bloques.find((b) => b.tipo === "bandera" && b.texto.startsWith("Descanso y sueño alterado"));
  assert.ok(alerta);
  assert.match(alerta.texto, /Insomnio de mantención/);
});

test("mareos, temblor y dolor de rodilla en Sí → alerta de otras consideraciones", () => {
  const bloques = sintetizar({ mareos: "si", temblor: "si", dolorRodilla: "si", vision: "mala" });
  const lista = bloques.find((b) => b.tipo === "lista" && b.titulo === "Otras consideraciones registradas");
  assert.deepEqual(lista.items, [
    "Mareos: Sí",
    "Temblor: Sí",
    "Dolor de rodilla: Sí",
    "Visión: Mala",
  ]);
  const alerta = bloques.find(
    (b) => b.tipo === "bandera" && b.nivel === "alerta" && b.texto.includes("otras consideraciones")
  );
  assert.ok(alerta, "debe existir la bandera de otras consideraciones");
  assert.match(alerta.texto, /3 hallazgos positivos/);
  assert.match(alerta.texto, /Mareos, Temblor, Dolor de rodilla/);
});

test("un solo hallazgo positivo en otras consideraciones no genera alerta", () => {
  const bloques = sintetizar({ mareos: "si" });
  assert.ok(!bloques.some((b) => b.texto?.includes("hallazgos positivos")));
});

test("funciones cognitivas en No → alerta con las funciones alteradas y su «Observación»", () => {
  const bloques = sintetizar({
    atencionSelectiva: "no",
    atencionSelectivaEnQue: "lectura prolongada",
    memoriaTrabajo: "no",
  });
  const lista = bloques.find((b) => b.tipo === "lista" && b.titulo === "Funciones cognitivas consultadas");
  assert.deepEqual(lista.items, [
    "Atención selectiva: No (Observación: lectura prolongada)",
    "Memoria de trabajo: No",
  ]);
  const alerta = bloques.find((b) => b.tipo === "bandera" && b.texto.startsWith("Dificultad referida en:"));
  assert.equal(alerta.nivel, "alerta");
  assert.match(alerta.texto, /Atención selectiva, Memoria de trabajo/);
});

test("funciones cognitivas todas en Sí no generan banderas", () => {
  const valores = {};
  for (const campo of seccionPorId("area-cognitiva").campos.filter((c) => c.tipo === "siNo")) {
    valores[campo.id] = "si";
  }
  const bloques = sintetizar(valores);
  assert.equal(bloques.filter((b) => b.tipo === "bandera").length, 0);
});

test("el plan de intervención se estructura en el orden del impreso", () => {
  const bloques = sintetizar({
    problemaOcupacional: "Dificultad para vestirse de forma independiente",
    cortoObjetivo: "Recuperar la autonomía en el vestuario superior",
    largoEspecificos: "Retomar el rol laboral con adaptaciones",
  });
  const plan = bloques.find((b) => b.tipo === "plan" && b.titulo === "Plan de intervención");
  assert.deepEqual(plan.filas[0], [
    "Problemática ocupacional",
    "Dificultad para vestirse de forma independiente",
  ]);
  assert.deepEqual(plan.filas[1], ["Corto plazo · Objetivo general", "Recuperar la autonomía en el vestuario superior"]);
  assert.deepEqual(plan.filas[6], ["Largo plazo · Objetivos específicos", "Retomar el rol laboral con adaptaciones"]);
  assert.deepEqual(plan.filas[3], ["Mediano plazo · Objetivo general", "—"]);
});
