import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcularPuntuacionInfante,
  clasificarTotal,
} from "../src/lib/informe-infantil.js";

/* ============================================================
   INFANT SENSORY PROFILE 2 · NACIMIENTO A 6 MESES
   25 ítems en 6 secciones (8+4+4+3+4+2). Escala Casi siempre=5,
   Frecuentemente=4, La mitad del tiempo=3, Ocasionalmente=2,
   Casi nunca=1, No aplicable=0 (excluido de la suma).
   Clasificación del total en la curva: 0-30 Mucho menos,
   31-40 Menos, 41-61 Como la mayoría, 62-71 Más, 72-125 Mucho
   más que los demás. Cuadrantes: BU, EV, SE, RE (el mayor es el
   destacado).
   ============================================================ */

const OPCIONES = [
  { valor: "casiSiempre", etiqueta: "CASI SIEMPRE", puntaje: 5 },
  { valor: "frecuentemente", etiqueta: "FRECUENTEMENTE", puntaje: 4 },
  { valor: "laMitad", etiqueta: "LA MITAD DEL TIEMPO", puntaje: 3 },
  { valor: "ocasionalmente", etiqueta: "OCASIONALMENTE", puntaje: 2 },
  { valor: "casiNunca", etiqueta: "CASI NUNCA", puntaje: 1 },
  { valor: "noAplicable", etiqueta: "NO APLICABLE", puntaje: 0 },
];

const TITULOS = [
  "Procesamiento General", // 8 ítems (1-8)
  "Procesamiento Auditivo", // 4 ítems (9-12)
  "Procesamiento Visual", // 4 ítems (13-16)
  "Procesamiento Táctil", // 3 ítems (17-19)
  "Procesamiento de Movimiento", // 4 ítems (20-23)
  "Procesamiento Sensorial Oral", // 2 ítems (24-25)
];

const CUADRANTES_SECCION = [
  ["RE", "RE", "SE", null, "SE", "SE", null, "RE"], // General
  ["BU", null, null, "BU"], // Auditivo
  ["EV", "EV", "EV", "SE"], // Visual
  [null, "SE", "SE"], // Táctil
  ["BU", "EV", null, "RE"], // Movimiento
  [null, "BU"], // Sensorial Oral
];

const secciones = CUADRANTES_SECCION.map((cuadrantes, si) => ({
  titulo: TITULOS[si],
  preguntas: cuadrantes.map((cuadrante, i) => ({
    texto: `Pregunta ${i + 1} de ${TITULOS[si]}.`,
    cuadrante,
  })),
}));

const todas = (valor) =>
  Object.fromEntries(
    secciones.flatMap((seccion) => seccion.preguntas.map(() => null)).map((_, i) => [i + 1, valor])
  );

const config = (respuestas) => ({ secciones, respuestas, opciones: OPCIONES });

test("todas Casi nunca → total 25, Mucho menos que los demás", () => {
  const r = calcularPuntuacionInfante(config(todas("casiNunca")));
  assert.equal(r.total, 25);
  assert.deepEqual(
    r.secciones.map((s) => s.raw),
    [8, 4, 4, 3, 4, 2]
  );
  assert.equal(r.clasificacion.nombre, "Mucho menos que los demás");
  assert.deepEqual(r.totalesCuadrante, { BU: 4, EV: 4, SE: 6, RE: 4 });
  assert.equal(r.dominantes.length, 1);
  assert.equal(r.dominantes[0].codigo, "SE");
});

test("todas Casi siempre → total 125, Mucho más que los demás", () => {
  const r = calcularPuntuacionInfante(config(todas("casiSiempre")));
  assert.equal(r.total, 125);
  assert.equal(r.clasificacion.nombre, "Mucho más que los demás");
  assert.deepEqual(r.totalesCuadrante, { BU: 20, EV: 20, SE: 30, RE: 20 });
  assert.equal(r.totalNoAplicables, 0);
});

test("No aplicable puntúa 0 y queda contado por sección", () => {
  const respuestas = todas("casiSiempre");
  respuestas[1] = "noAplicable";
  respuestas[9] = "noAplicable";
  const r = calcularPuntuacionInfante(config(respuestas));
  assert.equal(r.total, 125 - 10);
  assert.equal(r.secciones[0].noAplicables, 1);
  assert.equal(r.secciones[0].raw, 35);
  assert.equal(r.secciones[1].raw, 15);
  assert.equal(r.totalNoAplicables, 2);
  // El ítem 1 es RE: con No aplicable no suma al cuadrante
  assert.equal(r.totalesCuadrante.RE, 20 - 5);
});

test("caso de regresión de la planilla: total 73 → Mucho más que los demás", () => {
  // Brutos: General 27, Auditivo 4, Visual 17, Táctil 7, Movimiento 13, Oral 5.
  // Cuadrantes por sección: SE 10 / RE 9 · BU 1 · EV 14 / SE 3 · SE 4 ·
  // BU 2 / EV 5 / RE 2 · BU 2.
  const L = { 1: "casiNunca", 2: "ocasionalmente", 3: "laMitad", 4: "frecuentemente", 5: "casiSiempre" };
  const respuestas = todas("casiNunca");
  const vector = (indices, valores) => indices.forEach((idx, i) => { respuestas[idx] = L[valores[i]]; });
  // General 27: RE 1,2,8 = 9 · SE 3,5,6 = 10 · sin cuadrante 4,7 = 8
  vector([1, 2, 8], [4, 4, 1]);
  vector([3, 5, 6], [4, 3, 3]);
  vector([4, 7], [4, 4]);
  // Auditivo 4: BU 9 = 1 · sin cuadrante 10, 11 = 3 · ítem 12 No aplicable
  vector([9], [1]);
  vector([10, 11], [1, 2]);
  respuestas[12] = "noAplicable";
  // Visual 17: EV 13,14,15 = 14 · SE 16 = 3
  vector([13, 14, 15], [5, 4, 5]);
  vector([16], [3]);
  // Táctil 7: sin cuadrante 17 = 3 · SE 18,19 = 4
  vector([17], [3]);
  vector([18, 19], [2, 2]);
  // Movimiento 13: BU 20 = 2 · EV 21 = 5 · sin cuadrante 22 = 4 · RE 23 = 2
  vector([20], [2]);
  vector([21], [5]);
  vector([22], [4]);
  vector([23], [2]);
  // Oral 5: sin cuadrante 24 = 3 · BU 25 = 2
  vector([24], [3]);
  vector([25], [2]);

  const r = calcularPuntuacionInfante(config(respuestas));
  assert.deepEqual(
    r.secciones.map((s) => s.raw),
    [27, 4, 17, 7, 13, 5]
  );
  assert.equal(r.total, 73);
  assert.equal(r.clasificacion.nombre, "Mucho más que los demás");
  assert.deepEqual(r.totalesCuadrante, { BU: 5, EV: 19, SE: 17, RE: 11 });
  assert.equal(r.dominantes.length, 1);
  assert.equal(r.dominantes[0].codigo, "EV");
});

test("clasificación del total según la curva del Score Summary", () => {
  const casos = [
    [0, "Mucho menos que los demás"],
    [30, "Mucho menos que los demás"],
    [31, "Menos que los demás"],
    [40, "Menos que los demás"],
    [41, "Como la mayoría de los demás"],
    [61, "Como la mayoría de los demás"],
    [62, "Más que los demás"],
    [71, "Más que los demás"],
    [72, "Mucho más que los demás"],
    [125, "Mucho más que los demás"],
  ];
  for (const [total, esperado] of casos) {
    assert.equal(clasificarTotal(total)?.nombre, esperado, `total ${total}`);
  }
});
