import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SECCIONES,
  sintetizar,
  contarNivelesIndependencia,
  ambitosConApoyo,
} from "../src/lib/informe-ei-infantil.js";

/* ============================================================
   EVALUACIÓN INICIAL · INFANTIL (PESTAÑA NIÑO)
   Ficha de entrevista de 18 secciones y 104 campos. Los 12
   campos escala (11 ámbitos de independencia funcional + el
   descanso y sueño) generan su observación `${id}Obs` fuera
   del esquema y cada sí/no del área cognitiva lleva el
   companion `${id}EnQue`. La síntesis automatizada no usa
   puntajes: construye párrafos, tablas, listas y banderas
   (alerta, nunca crítico; las banderas ok/info no se imprimen) a partir del registro.
   ============================================================ */

const TODOS_LOS_CAMPOS = SECCIONES.flatMap((s) => s.campos);
const CAMPOS_ESCALA = TODOS_LOS_CAMPOS.filter((c) => c.tipo === "escala");
const CAMPOS_INDEPENDENCIA = CAMPOS_ESCALA.filter((c) => c.id !== "descansoSueno");
const FUNCIONES_COGNITIVAS = SECCIONES.find((s) => s.id === "area-cognitiva").campos.filter(
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
      ["nombreTutor", "texto"],
      ["direccion", "texto"],
      ["telefono", "texto"],
      ["escolaridad", "texto"],
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
      "independencia-funcional",
      "hitos-desarrollo",
      "area-sensorial",
      "area-fisica",
      "area-cognitiva",
      "lenguaje",
      "conducta",
      "interaccion-social",
      "expresion-emociones",
      "juego",
      "habitucion",
      "esparcimiento",
      "volicion",
      "plan-intervencion",
    ]
  );
});

test("los 12 campos escala tienen 4 opciones y su Obs no está en el esquema", () => {
  assert.equal(CAMPOS_ESCALA.length, 12);
  assert.equal(CAMPOS_INDEPENDENCIA.length, 11);
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
  assert.deepEqual(
    CAMPOS_ESCALA.find((c) => c.id === "comer").opciones.map((o) => o.valor),
    ["independiente", "ayudaModerada", "asistencia", "dependiente"]
  );
});

test("cada función cognitiva tiene su companion «Observación»", () => {
  assert.equal(FUNCIONES_COGNITIVAS.length, 6);
  for (const campo of FUNCIONES_COGNITIVAS) {
    const companion = SECCIONES.find((s) => s.id === "area-cognitiva").campos.find(
      (c) => c.id === `${campo.id}EnQue`
    );
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
});

test("todas las escalas dependiente → alerta y distribución de 11 dependientes", () => {
  const valores = todosLosNiveles("dependiente");
  const bloques = sintetizar(valores);
  const distribucion = bloques.find((b) => b.tipo === "lista" && b.titulo === "Distribución de niveles");
  assert.deepEqual(distribucion.items, ["Dependiente: 11"]);
  const alerta = bloques.find((b) => b.tipo === "bandera" && b.nivel === "alerta");
  assert.ok(alerta.texto.startsWith("Requiere apoyo en:"));
  for (const campo of CAMPOS_INDEPENDENCIA) {
    assert.ok(alerta.texto.includes(campo.etiqueta), `${campo.etiqueta} debe aparecer en la alerta`);
  }
  // El descanso y sueño se modela aparte: sin responder no genera bandera propia.
  assert.equal(contarNivelesIndependencia(valores).dependiente, 11);
});

test("todo independiente y descanso normal no genera banderas", () => {
  const valores = {
    ...todosLosNiveles("independiente"),
    descansoSueno: "normal",
  };
  const bloques = sintetizar(valores);
  assert.equal(bloques.filter((b) => b.tipo === "bandera").length, 0);
  const distribucion = bloques.find((b) => b.tipo === "lista" && b.titulo === "Distribución de niveles");
  assert.deepEqual(distribucion.items, ["Independiente: 11"]);
});

test("descanso y sueño distinto de normal → bandera alerta que menciona el nivel", () => {
  const bloques = sintetizar({ ...todosLosNiveles("independiente"), descansoSueno: "insomnioMantencion" });
  const alerta = bloques.filter((b) => b.tipo === "bandera").find((b) => b.texto.includes("Insomnio de mantención"));
  assert.equal(alerta.nivel, "alerta");
  assert.ok(alerta.texto.includes("descanso y sueño"));
});

test("retrasoPsicomotor «si» → alerta; «no» → fila en la tabla de hitos, sin bandera", () => {
  const conRetraso = sintetizar({ retrasoPsicomotor: "si" });
  const alerta = conRetraso.find((b) => b.tipo === "bandera" && b.nivel === "alerta");
  assert.ok(alerta.texto.includes("retraso"));
  assert.ok(alerta.texto.includes("control de niño sano"));

  const sinRetraso = sintetizar({ retrasoPsicomotor: "no" });
  assert.equal(sinRetraso.filter((b) => b.tipo === "bandera").length, 0);
  const hitos = sinRetraso.find((b) => b.tipo === "tabla" && b.titulo === "Hitos del desarrollo");
  const filaRetraso = hitos.filas.find((fila) => fila[0].includes("Retraso psicomotor"));
  assert.equal(filaRetraso[1], "No");
});

test("las 6 funciones cognitivas en «No» → alerta con las 6 y detalle ¿en qué?", () => {
  const valores = Object.fromEntries(
    FUNCIONES_COGNITIVAS.map((c) => [c.id, "no"]).concat([["atencionSelectivaEnQue", "en la tarea de poner la mesa"]])
  );
  const bloques = sintetizar(valores);
  const alerta = bloques.find((b) => b.tipo === "bandera" && b.texto.startsWith("Dificultades referidas en:"));
  assert.ok(alerta);
  assert.equal(alerta.nivel, "alerta");
  for (const campo of FUNCIONES_COGNITIVAS) {
    assert.ok(alerta.texto.includes(campo.etiqueta), `${campo.etiqueta} debe aparecer en la alerta`);
  }
  const lista = bloques.find((b) => b.tipo === "lista" && b.titulo === "Funciones cognitivas consultadas");
  assert.equal(lista.items.length, 6);
  assert.ok(lista.items.some((item) => item === "Atención selectiva: No — en la tarea de poner la mesa"));
  assert.ok(lista.items.includes("Memoria de trabajo: No"));
});

test("las 6 funciones cognitivas en «Sí» no generan banderas", () => {
  const valores = Object.fromEntries(FUNCIONES_COGNITIVAS.map((c) => [c.id, "si"]));
  const bloques = sintetizar(valores);
  assert.equal(bloques.filter((b) => b.tipo === "bandera").length, 0);
  const lista = bloques.find((b) => b.tipo === "lista" && b.titulo === "Funciones cognitivas consultadas");
  assert.deepEqual(lista.items, FUNCIONES_COGNITIVAS.map((c) => `${c.etiqueta}: Sí`));
});

test("el motivo de consulta arma el párrafo con origen, motivo y observación", () => {
  const bloques = sintetizar({
    origen: "derivacion",
    motivoConsulta: "Dificultades en el lápiz y en la escritura.",
    refiereQue: "Se cansa al escribir.",
    seObserva: "Postura de pinza inmadura.",
    condicionesGenerales: "buenas",
    animo: "eutimico",
    estadoAlerta: "normal",
  });
  const texto = bloques.find((b) => b.tipo === "parrafo" && b.titulo === "Motivo de consulta").texto;
  assert.ok(texto.includes("Origen de la consulta: Derivación."));
  assert.ok(texto.includes("Motivo de consulta: Dificultades en el lápiz y en la escritura."));
  assert.ok(texto.includes("Refiere que: Se cansa al escribir."));
  assert.ok(
    texto.includes(
      "En la observación se registran Buenas condiciones generales, ánimo eutímico y estado de alerta normal."
    )
  );
});

test("el plan de intervención se estructura en el orden del impreso", () => {
  const bloques = sintetizar({
    problemaOcupacional: "Rendimiento escolar afectado por la motricidad fina.",
    cortoObjetivo: "Mejorar la pinza.",
    cortoEspecificos: "Tomar el lápiz con pinza trípode en 4 de 5 oportunidades.",
    largoEspecificos: "Escribir un párrafo sin fatiga.",
  });
  const plan = bloques.find((b) => b.tipo === "plan" && b.titulo === "Plan de intervención");
  assert.equal(plan.filas.length, 7);
  assert.deepEqual(plan.filas[0], [
    "Problemática ocupacional",
    "Rendimiento escolar afectado por la motricidad fina.",
  ]);
  assert.deepEqual(plan.filas[1], ["Corto plazo · Objetivo general", "Mejorar la pinza."]);
  assert.deepEqual(plan.filas[2], ["Corto plazo · Objetivos específicos", "Tomar el lápiz con pinza trípode en 4 de 5 oportunidades."]);
  assert.deepEqual(plan.filas[3], ["Mediano plazo · Objetivo general", "—"]);
  assert.deepEqual(plan.filas[6], ["Largo plazo · Objetivos específicos", "Escribir un párrafo sin fatiga."]);
});

test("contarNivelesIndependencia y ambitosConApoyo sobre un caso mixto", () => {
  const valores = todosLosNiveles("independiente");
  valores.banarse = "asistencia";
  valores.vestirse = "ayudaModerada";
  valores.gatear = "dependiente";
  assert.deepEqual(contarNivelesIndependencia(valores), {
    independiente: 8,
    ayudaModerada: 1,
    asistencia: 1,
    dependiente: 1,
  });
  assert.deepEqual(ambitosConApoyo(valores), ["Bañarse", "Vestirse", "Gatear"]);

  const bloques = sintetizar(valores);
  const alerta = bloques.find((b) => b.tipo === "bandera" && b.nivel === "alerta");
  assert.equal(alerta.texto, "Requiere apoyo en: Bañarse, Vestirse, Gatear.");
  const distribucion = bloques.find((b) => b.tipo === "lista" && b.titulo === "Distribución de niveles");
  assert.deepEqual(distribucion.items, [
    "Independiente: 8",
    "Ayuda moderada: 1",
    "Asistencia: 1",
    "Dependiente: 1",
  ]);
});

test("contarNivelesIndependencia ignora niveles vacíos o desconocidos", () => {
  assert.deepEqual(contarNivelesIndependencia({}), {
    independiente: 0,
    ayudaModerada: 0,
    asistencia: 0,
    dependiente: 0,
  });
  assert.deepEqual(contarNivelesIndependencia({ comer: "independiente", banarse: "noExiste" }), {
    independiente: 1,
    ayudaModerada: 0,
    asistencia: 0,
    dependiente: 0,
  });
});
