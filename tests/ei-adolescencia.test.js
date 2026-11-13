import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SECCIONES,
  FUNCIONES_COGNITIVAS,
  contarNivelesIndependencia,
  sintetizar,
} from "../src/lib/informe-ei-adolescencia.js";

/* ============================================================
   EVALUACIÓN INICIAL · ADOLESCENCIA
   Esquema de la ficha: 18 secciones y 103 campos (sin contar
   las observaciones de las escalas). La independencia funcional
   de esta versión NO evalúa «Gatear» (solo aparece en hitos
   del desarrollo) y el área académica reemplaza al área de
   juego del infantil. La síntesis automatizada se cubre con
   valores vacíos, todo dependiente, todo independiente,
   descanso alterado, hitos, funciones cognitivas sí/no,
   área académica y plan de intervención.
   ============================================================ */

const seccionPorId = (id) => SECCIONES.find((s) => s.id === id);
const camposDe = (id) => seccionPorId(id)?.campos ?? [];
const escalasDe = (id) => camposDe(id).filter((c) => c.tipo === "escala");

const CUENTA_CAMPOS = {
  "datos-personales": 8,
  "historial-medico": 5,
  "motivo-consulta": 7,
  "antecedentes-familiares": 9,
  "independencia-funcional": 11,
  "hitos-desarrollo": 7,
  "area-sensorial": 7,
  "area-fisica": 3,
  "area-cognitiva": 12,
  lenguaje: 3,
  conducta: 2,
  "interaccion-social": 4,
  "expresion-emociones": 5,
  "area-academica": 4,
  habituacion: 3,
  esparcimiento: 3,
  volicion: 3,
  "plan-intervencion": 7,
};

const PREGUNTAS_INTERACCION = [
  "¿Cómo interactúa el adolescente con sus pares? ¿Busca activamente jugar con ellos?",
  "¿Tiene amigos cercanos? ¿Con qué frecuencia se reúne con ellos?",
  "¿Cómo maneja el adolescente con los conflictos con sus pares? ¿Se frustra fácilmente?",
  "¿Participa en juegos grupales? ¿Cómo se adapta a las reglas y la dinámica del grupo?",
];

const PREGUNTAS_EMOCIONES = [
  "¿Cómo expresa sus emociones (alegría, tristeza, frustración, ira)?",
  "¿Reconoce y nombra sus propias emociones y las de los demás?",
  "¿Hay emociones específicas que le resulten más difíciles de manejar?",
  "¿Qué estrategias utiliza su hijo para calmarse cuando está molesto o ansioso?",
  "¿Observan rabietas o crisis emocionales frecuentes?",
];

test("la primera sección es la de identificación y es la única", () => {
  assert.equal(SECCIONES.length, 18);
  assert.equal(SECCIONES[0].id, "datos-personales");
  assert.equal(SECCIONES[0].identificacion, true);
  assert.equal(SECCIONES.filter((s) => s.identificacion).length, 1);
  assert.deepEqual(
    SECCIONES.map((s) => s.id),
    Object.keys(CUENTA_CAMPOS)
  );
});

test("cada sección tiene la cantidad de campos transcritos del impreso", () => {
  for (const [id, cuenta] of Object.entries(CUENTA_CAMPOS)) {
    assert.equal(camposDe(id).length, cuenta, `sección ${id}`);
  }
  const total = SECCIONES.reduce((n, s) => n + s.campos.length, 0);
  assert.equal(total, 103);
});

test("los ids de secciones y de campos son únicos", () => {
  const idsSeccion = SECCIONES.map((s) => s.id);
  assert.equal(new Set(idsSeccion).size, idsSeccion.length);
  const idsCampos = SECCIONES.flatMap((s) => s.campos.map((c) => c.id));
  assert.equal(new Set(idsCampos).size, idsCampos.length);
});

test("los campos solo usan tipos del contrato y las escalas no declaran su obs", () => {
  const TIPOS = new Set(["texto", "numero", "fecha", "textoLargo", "radio", "siNo", "escala"]);
  for (const seccion of SECCIONES) {
    for (const campo of seccion.campos) {
      assert.ok(TIPOS.has(campo.tipo), `${campo.id} con tipo ${campo.tipo}`);
      assert.ok(!campo.id.endsWith("Obs"), `${campo.id} no debe declarar la observación`);
      if (campo.tipo === "radio") assert.ok(campo.opciones.length >= 2, `${campo.id} sin opciones`);
    }
  }
});

test("la independencia funcional evalúa 10 ámbitos más descanso y sueño", () => {
  const escalas = escalasDe("independencia-funcional");
  assert.equal(escalas.length, 11);
  const ambitos = escalas.filter((c) => c.id !== "descansoSueno");
  assert.equal(ambitos.length, 10);
  assert.deepEqual(ambitos.map((c) => c.etiqueta), [
    "Comer",
    "Aseo personal",
    "Bañarse",
    "Vestirse",
    "Uso del baño",
    "Manejo de vejiga/intestinos",
    "Transferencias",
    "Comprensión",
    "Solución de problemas",
    "Memoria",
  ]);
  for (const campo of ambitos) {
    assert.deepEqual(campo.opciones.map((o) => o.valor), [
      "independiente",
      "ayudaModerada",
      "asistencia",
      "dependiente",
    ]);
    assert.deepEqual(campo.opciones.map((o) => o.etiqueta), [
      "Independiente",
      "Ayuda moderada",
      "Asistencia",
      "Dependiente",
    ]);
  }
  const descanso = escalas.find((c) => c.id === "descansoSueno");
  assert.deepEqual(descanso.opciones.map((o) => o.valor), [
    "normal",
    "conFarmacos",
    "insomnioConciliacion",
    "insomnioMantencion",
  ]);
  assert.deepEqual(descanso.opciones.map((o) => o.etiqueta), [
    "Normal",
    "Con fármacos",
    "Insomnio de conciliación",
    "Insomnio de mantención",
  ]);
});

test("la independencia funcional no evalúa «Gatear» (solo hitos del desarrollo)", () => {
  const etiquetas = camposDe("independencia-funcional").map((c) => c.etiqueta);
  assert.ok(!etiquetas.includes("Gatear"));
  assert.ok(camposDe("hitos-desarrollo").some((c) => c.etiqueta === "Gatear"));
});

test("existe el área académica y no hay sección de juego", () => {
  assert.ok(SECCIONES.some((s) => s.titulo === "Área académica"));
  assert.ok(!SECCIONES.some((s) => /juego/i.test(s.titulo)));
  const academica = camposDe("area-academica");
  assert.deepEqual(academica.map((c) => c.etiqueta), [
    "Rendimiento",
    "Habilidades específicas",
    "Observación",
    "Apoyos al aprendizaje",
  ]);
});

test("cada función cognitiva sí/no tiene su companion «Observación»", () => {
  const campos = camposDe("area-cognitiva");
  const siNo = campos.filter((c) => c.tipo === "siNo");
  assert.equal(siNo.length, 6);
  for (const campo of siNo) {
    assert.ok(campo.hint, `${campo.id} sin descripción del impreso`);
    const companion = campos.find((c) => c.id === `${campo.id}EnQue`);
    assert.ok(companion, `falta ${campo.id}EnQue`);
    assert.equal(companion.tipo, "textoLargo");
    assert.equal(companion.etiqueta, "Observación");
  }
  assert.deepEqual(FUNCIONES_COGNITIVAS.map((f) => f.id), [
    "atencionSelectiva",
    "atencionSostenida",
    "atencionDividida",
    "memoriaCortoPlazo",
    "memoriaLargoPlazo",
    "memoriaTrabajo",
  ]);
});

test("los radios del motivo de consulta y de las mascotas tienen los valores del impreso", () => {
  const origen = camposDe("motivo-consulta").find((c) => c.id === "origenConsulta");
  assert.deepEqual(origen.opciones, [
    { valor: "derivacion", etiqueta: "Derivación" },
    { valor: "espontanea", etiqueta: "Consulta espontánea" },
  ]);
  const mascotas = camposDe("antecedentes-familiares").find((c) => c.id === "mascotasUbicacion");
  assert.deepEqual(mascotas.opciones, [
    { valor: "dentro", etiqueta: "Adentro" },
    { valor: "fuera", etiqueta: "Afuera" },
  ]);
  assert.deepEqual(camposDe("motivo-consulta").find((c) => c.id === "condicionesGenerales").opciones.map((o) => o.etiqueta), [
    "Buenas condiciones generales",
    "Regulares condiciones generales",
    "Malas condiciones generales",
  ]);
  assert.deepEqual(camposDe("motivo-consulta").find((c) => c.id === "animo").opciones.map((o) => o.etiqueta), [
    "Eutímico",
    "Deprimido",
    "Aplanamiento afectivo",
  ]);
  assert.deepEqual(camposDe("motivo-consulta").find((c) => c.id === "estadoAlerta").opciones.map((o) => o.etiqueta), [
    "Bajo",
    "Normal",
    "Alto",
  ]);
});

test("las preguntas de interacción social y emociones están transcritas literalmente", () => {
  assert.deepEqual(camposDe("interaccion-social").map((c) => c.etiqueta), PREGUNTAS_INTERACCION);
  const emociones = camposDe("expresion-emociones").map((c) => c.etiqueta);
  assert.deepEqual(emociones, PREGUNTAS_EMOCIONES);
  // Literal del impreso: mantiene «su hijo» aunque la ficha es de adolescencia.
  assert.ok(emociones.includes("¿Qué estrategias utiliza su hijo para calmarse cuando está molesto o ansioso?"));
});

test("sintetizar con valores vacíos no lanza y no marca crítico", () => {
  const bloques = sintetizar({});
  assert.ok(Array.isArray(bloques));
  assert.ok(bloques.length > 0);
  assert.ok(!bloques.some((b) => b.tipo === "bandera" && b.nivel === "critico"));
  const motivo = bloques.find((b) => b.titulo === "Motivo de consulta");
  assert.equal(motivo.texto, "No se registra motivo de consulta en la entrevista.");
  const plan = bloques.find((b) => b.tipo === "plan" && b.titulo === "Plan de intervención");
  assert.equal(plan.filas.length, 7);
  assert.ok(plan.filas.every((fila) => fila[1] === "—"));
});

test("el informe reproduce el registro completo del impreso en su orden", () => {
  const bloques = sintetizar({});
  const titulos = bloques.map((b) => b.titulo);
  assert.deepEqual(titulos, [
    "Motivo de consulta",
    "Historial médico",
    "Antecedentes familiares",
    "Independencia funcional",
    "Hitos del desarrollo",
    "Área sensorial",
    "Área física",
    "Área cognitiva",
    "Lenguaje",
    "Conducta",
    "Interacción social",
    "Expresión y reconocimiento de emociones",
    "Área académica",
    "Habituación",
    "Esparcimiento",
    "Volición",
    "Plan de intervención",
  ]);
  // Cada lista del registro declara todos los campos de su sección.
  const CUENTA_REGISTRO = {
    "Historial médico": 5,
    "Antecedentes familiares": 9,
    "Área sensorial": 7,
    "Área física": 3,
    Lenguaje: 3,
    Conducta: 2,
    "Interacción social": 4,
    "Expresión y reconocimiento de emociones": 5,
    "Área académica": 4,
    Habituación: 3,
    Esparcimiento: 3,
    Volición: 3,
  };
  for (const [titulo, cuenta] of Object.entries(CUENTA_REGISTRO)) {
    const lista = bloques.find((b) => b.tipo === "lista" && b.titulo === titulo);
    assert.ok(lista, `falta la lista ${titulo}`);
    assert.equal(lista.items.length, cuenta, `lista ${titulo}`);
  }
});

test("las preguntas sin respuesta del registro se declaran, no se omiten", () => {
  const bloques = sintetizar({});
  const registro = (titulo) => bloques.find((b) => b.tipo === "lista" && b.titulo === titulo).items;
  assert.ok(registro("Historial médico").every((item) => item.endsWith(": —")));
  assert.ok(registro("Interacción social").every((item) => item.endsWith(": —")));
  const mascotas = registro("Antecedentes familiares").find((item) => item.startsWith("Ubicación de las mascotas"));
  assert.equal(mascotas, "Ubicación de las mascotas: Sin respuesta");
  const retrasoLista = registro("Área académica");
  assert.ok(retrasoLista.includes("Rendimiento: —"));
});

test("la tabla de independencia lista las 11 escalas con nivel y observación", () => {
  const bloques = sintetizar({
    comer: "independiente",
    comerObs: "Usa cubiertos con la mano dominante.",
  });
  const tabla = bloques.find((b) => b.tipo === "tabla" && b.titulo === "Independencia funcional");
  assert.deepEqual(tabla.columnas.map((c) => c.titulo), ["Ámbito", "Nivel", "Observación"]);
  assert.equal(tabla.filas.length, 11);
  assert.deepEqual(tabla.filas[0], ["Comer", "Independiente", "Usa cubiertos con la mano dominante."]);
  assert.deepEqual(tabla.filas[1], ["Aseo personal", "Sin respuesta", "—"]);
  assert.deepEqual(tabla.filas[10], ["Descanso y sueño", "Sin respuesta", "—"]);
});

test("todas las escalas en «Dependiente» generan alerta por conteo", () => {
  const valores = {};
  for (const campo of escalasDe("independencia-funcional")) {
    if (campo.id !== "descansoSueno") valores[campo.id] = "dependiente";
  }
  assert.deepEqual(contarNivelesIndependencia(valores), {
    independiente: 0,
    ayudaModerada: 0,
    asistencia: 0,
    dependiente: 10,
  });
  const bloques = sintetizar(valores);
  const alerta = bloques.find((b) => b.tipo === "bandera" && b.nivel === "alerta");
  assert.ok(alerta, "falta la bandera de alerta");
  assert.equal(alerta.texto, "Requiere apoyo en 10 de los 10 ámbitos evaluados.");
  assert.ok(!bloques.some((b) => b.tipo === "lista" && b.titulo === "Distribución de niveles"));
});

test("todo independiente y descanso normal no genera alertas", () => {
  const valores = {};
  for (const campo of escalasDe("independencia-funcional")) {
    valores[campo.id] = campo.id === "descansoSueno" ? "normal" : "independiente";
  }
  assert.deepEqual(contarNivelesIndependencia(valores), {
    independiente: 10,
    ayudaModerada: 0,
    asistencia: 0,
    dependiente: 0,
  });
  const bloques = sintetizar(valores);
  assert.equal(bloques.filter((b) => b.tipo === "bandera").length, 0);
  assert.ok(!bloques.some((b) => b.tipo === "lista" && b.titulo === "Distribución de niveles"));
});

test("descanso y sueño distinto de normal genera alerta mencionando el nivel", () => {
  const bloques = sintetizar({ descansoSueno: "insomnioConciliacion" });
  const alerta = bloques.find((b) => b.tipo === "bandera" && b.nivel === "alerta");
  assert.equal(alerta.texto, "Descanso y sueño alterado: Insomnio de conciliación.");
  assert.ok(!bloques.some((b) => b.tipo === "lista" && b.titulo === "Distribución de niveles"));
  assert.equal(sintetizar({ descansoSueno: "normal" }).filter((b) => b.tipo === "bandera").length, 0);
});

test("la tabla de hitos registra las 6 edades y el retraso psicomotor marca la bandera", () => {
  const valores = {
    hitoSostenerCabeza: "2 meses",
    gatear: "9 meses",
    caminar: "14 meses",
    primerasPalabras: "18 meses",
    hitoComprension: "2 años",
    controlEsfinteres: "3 años",
    retrasoPsicomotor: "si",
  };
  const bloques = sintetizar(valores);
  const tabla = bloques.find((b) => b.tipo === "tabla" && b.titulo === "Hitos del desarrollo");
  assert.deepEqual(tabla.columnas.map((c) => c.titulo), ["Hito", "Edad registrada"]);
  assert.deepEqual(tabla.filas, [
    ["Sostener la cabeza", "2 meses"],
    ["Gatear", "9 meses"],
    ["Caminar", "14 meses"],
    ["Primeras palabras", "18 meses"],
    ["Comprensión", "2 años"],
    ["Control de esfínteres", "3 años"],
    ["Retraso psicomotor (control de niño sano)", "Sí"],
  ]);
  const alerta = bloques.find((b) => b.tipo === "bandera" && b.nivel === "alerta" && b.texto.includes("retraso"));
  assert.ok(alerta, "falta la bandera de retraso psicomotor");
  const sinRetraso = sintetizar({ retrasoPsicomotor: "no" });
  const filaNo = sinRetraso
    .find((b) => b.tipo === "tabla" && b.titulo === "Hitos del desarrollo")
    .filas.find((fila) => fila[0].includes("Retraso psicomotor"));
  assert.equal(filaNo[1], "No");
  assert.equal(sinRetraso.filter((b) => b.tipo === "bandera").length, 0);
});

test("las 6 funciones cognitivas en «No» quedan en la lista, sin alerta", () => {
  const valores = {};
  for (const f of FUNCIONES_COGNITIVAS) valores[f.id] = "no";
  const bloques = sintetizar(valores);
  assert.equal(bloques.filter((b) => b.tipo === "bandera").length, 0);
  const lista = bloques.find((b) => b.tipo === "lista" && b.titulo === "Área cognitiva");
  assert.equal(lista.items.length, 6);
  assert.ok(lista.items.every((item) => item.endsWith(": No")));
});

test("las funciones cognitivas sin respuesta se declaran, no se omiten", () => {
  const lista = sintetizar({ atencionSelectiva: "si" }).find(
    (b) => b.tipo === "lista" && b.titulo === "Área cognitiva"
  );
  assert.equal(lista.items.length, 6);
  assert.deepEqual(lista.items, [
    "Atención selectiva: Sí",
    "Atención sostenida: Sin respuesta",
    "Atención dividida: Sin respuesta",
    "Memoria corto plazo: Sin respuesta",
    "Memoria largo plazo: Sin respuesta",
    "Memoria de trabajo: Sin respuesta",
  ]);
});

test("el texto de «¿En qué?» acompaña a la función respondida «No»", () => {
  const valores = {
    atencionSelectiva: "no",
    atencionSelectivaEnQue: "No logra sostener la lectura",
  };
  const lista = sintetizar(valores).find((b) => b.tipo === "lista" && b.titulo === "Área cognitiva");
  assert.deepEqual(lista.items[0], "Atención selectiva: No — No logra sostener la lectura");
});

test("las 6 funciones cognitivas en «Sí» no generan banderas", () => {
  const valores = {};
  for (const f of FUNCIONES_COGNITIVAS) valores[f.id] = "si";
  const bloques = sintetizar(valores);
  assert.equal(bloques.filter((b) => b.tipo === "bandera").length, 0);
  const lista = bloques.find((b) => b.tipo === "lista" && b.titulo === "Área cognitiva");
  assert.deepEqual(lista.items, [
    "Atención selectiva: Sí",
    "Atención sostenida: Sí",
    "Atención dividida: Sí",
    "Memoria corto plazo: Sí",
    "Memoria largo plazo: Sí",
    "Memoria de trabajo: Sí",
  ]);
});

test("el área académica se reproduce ítem por ítem y el plan en el orden del impreso", () => {
  const bloques = sintetizar({
    rendimiento: "Aprobado en todas las asignaturas",
    habilidadesEspecificas: "Dificultad en comprensión lectora",
    observacionAcademica: "Inicia las tareas con apoyo",
    apoyosAprendizaje: "Programa de integración escolar (PIE)",
    problemaOcupacional: "Dificultad de autorregulación en la rutina escolar",
    cortoObjetivo: "Favorecer la autorregulación",
    cortoEspecificos: "Trabajar pausas activas",
  });
  const academica = bloques.find((b) => b.tipo === "lista" && b.titulo === "Área académica");
  assert.ok(academica, "falta el registro del área académica");
  assert.deepEqual(academica.items, [
    "Rendimiento: Aprobado en todas las asignaturas",
    "Habilidades específicas: Dificultad en comprensión lectora",
    "Observación: Inicia las tareas con apoyo",
    "Apoyos al aprendizaje: Programa de integración escolar (PIE)",
  ]);
  const plan = bloques.find((b) => b.tipo === "plan" && b.titulo === "Plan de intervención");
  assert.deepEqual(plan.filas[0], [
    "Problemática ocupacional",
    "Dificultad de autorregulación en la rutina escolar",
  ]);
  assert.deepEqual(plan.filas[1], ["Corto plazo · Objetivo general", "Favorecer la autorregulación"]);
  assert.deepEqual(plan.filas[2], ["Corto plazo · Objetivos específicos", "Trabajar pausas activas"]);
  assert.deepEqual(plan.filas[3], ["Mediano plazo · Objetivo general", "—"]);
  assert.deepEqual(plan.filas[6], ["Largo plazo · Objetivos específicos", "—"]);
});

test("el motivo de consulta combina origen, motivo y observación", () => {
  const motivo = sintetizar({
    origenConsulta: "derivacion",
    motivoConsulta: "Dificultades atencionales",
    condicionesGenerales: "buenas",
    animo: "eutimico",
    estadoAlerta: "normal",
  }).find((b) => b.titulo === "Motivo de consulta");
  assert.equal(
    motivo.texto,
    "Origen de la consulta: Derivación. Motivo: Dificultades atencionales. En la observación se registran Buenas condiciones generales, ánimo eutímico y estado de alerta normal."
  );
  const parcial = sintetizar({ condicionesGenerales: "malas" }).find((b) => b.titulo === "Motivo de consulta");
  assert.equal(parcial.texto, "En la observación se registran Malas condiciones generales.");
});
