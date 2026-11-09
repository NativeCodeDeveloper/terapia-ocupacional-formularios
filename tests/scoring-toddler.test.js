import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcularPuntuacionToddler,
  clasificarFila,
  TABLA_CLASIFICACION,
} from "../src/lib/informe-toddler.js";

/* ============================================================
   TODDLER SENSORY PROFILE 2 · 7 A 35 MESES
   54 ítems en 7 secciones (10+7+8+10+6+7+6). Escala Casi
   siempre o siempre=5, Frecuentemente=4, La mitad de las
   veces=3, Ocasionalmente=2, Casi nunca=1 (sin No aplicable).
   Cada cuadrante (BU 7 ítems /35, EV 11 /55, SE 13 /65,
   RE 11 /55) y cada sección se clasifica en la tabla de corte:
   ±1 DE = Más/Menos que otros, ±2 DE = Mucho más/Mucho menos.
   ============================================================ */

const OPCIONES = [
  { valor: "casiSiempre", etiqueta: "CASI SIEMPRE O SIEMPRE", puntaje: 5 },
  { valor: "frecuentemente", etiqueta: "FRECUENTEMENTE", puntaje: 4 },
  { valor: "laMitad", etiqueta: "LA MITAD DE LAS VECES", puntaje: 3 },
  { valor: "ocasionalmente", etiqueta: "OCASIONALMENTE", puntaje: 2 },
  { valor: "casiNunca", etiqueta: "CASI NUNCA", puntaje: 1 },
];

const TITULOS = [
  "Procesamiento General", // 10 ítems (1-10)
  "Procesamiento Auditivo", // 7 ítems (11-17)
  "Procesamiento Visual", // 8 ítems (18-25)
  "Procesamiento Táctil", // 10 ítems (26-35)
  "Procesamiento de Movimiento", // 6 ítems (36-41)
  "Procesamiento Sensorial Oral", // 7 ítems (42-48)
  "Respuestas de Comportamiento asociadas con el procesamiento sensorial", // 6 ítems (49-54)
];

const CUADRANTES_SECCION = [
  ["SE", "SE", "EV", null, null, null, null, null, "RE", "EV"], // General
  ["RE", "RE", "SE", "RE", "RE", "SE", null], // Auditivo
  ["BU", "BU", "BU", null, null, "RE", "RE", "RE"], // Visual
  ["SE", "EV", "EV", "EV", "RE", "SE", "BU", "EV", "SE", "EV"], // Táctil
  ["BU", "BU", "BU", "SE", "RE", "SE"], // Movimiento
  ["EV", null, "SE", "RE", "SE", null, "SE"], // Sensorial Oral
  ["EV", null, null, "SE", "EV", "EV"], // Comportamiento
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

test("todas Casi nunca → total 54, filas en sus bandas inferiores", () => {
  const r = calcularPuntuacionToddler(config(todas("casiNunca")));
  assert.equal(r.total, 54);
  assert.equal(r.totalMaximo, 270);
  assert.deepEqual(
    r.secciones.map((s) => s.raw),
    [10, 7, 8, 10, 6, 7, 6]
  );
  assert.deepEqual(r.totalesCuadrante, { BU: 7, EV: 11, SE: 13, RE: 11 });
  assert.equal(r.dominantes.length, 1);
  assert.equal(r.dominantes[0].codigo, "SE");
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.clasificacion?.nombre),
    [
      "Mucho menos que otros", // Búsqueda 7 (0-17)
      "Como la mayoría", // Evitación 11 (11-21)
      "Como la mayoría", // Sensibilidad 13 (13-27)
      "Como la mayoría", // Registro 11 (10-21)
      "Menos que otros", // General 10 (6-10)
      "Como la mayoría", // Auditivo 7 (6-14)
      "Menos que otros", // Visual 8 (6-10)
      "Como la mayoría", // Táctil 10 (6-13)
      "Mucho menos que otros", // Movimiento 6 (0-9)
      "Como la mayoría", // Oral 7 (6-15)
      "Menos que otros", // Comportamiento 6 (4-6)
    ]
  );
});

test("todas Casi siempre → total 270 y cuadrantes en su máximo", () => {
  const r = calcularPuntuacionToddler(config(todas("casiSiempre")));
  assert.equal(r.total, 270);
  assert.deepEqual(r.totalesCuadrante, { BU: 35, EV: 55, SE: 65, RE: 55 });
  assert.equal(r.dominantes.length, 1);
  assert.equal(r.dominantes[0].codigo, "SE");
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.clasificacion?.nombre),
    [
      "Más que otros", // Búsqueda 35 (34-35); Mucho más es inalcanzable (**)
      "Mucho más que otros", // Evitación 55
      "Mucho más que otros", // Sensibilidad 65
      "Mucho más que otros", // Registro 55
      "Mucho más que otros", // General 50
      "Mucho más que otros", // Auditivo 35
      "Mucho más que otros", // Visual 40
      "Mucho más que otros", // Táctil 50
      "Mucho más que otros", // Movimiento 30
      "Mucho más que otros", // Oral 35
      "Mucho más que otros", // Comportamiento 30
    ]
  );
});

test("cantidad de ítems y máximos de cada fila según la pauta", () => {
  const r = calcularPuntuacionToddler(config(todas("casiNunca")));
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.items),
    [7, 11, 13, 11, 10, 7, 8, 10, 6, 7, 6]
  );
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.maximo),
    [35, 55, 65, 55, 50, 35, 40, 50, 30, 35, 30]
  );
});

test("caso de regresión: total 104 con mezcla de respuestas", () => {
  // Brutos: General 24, Auditivo 13, Visual 17, Táctil 21,
  // Movimiento 16, Oral 7, Comportamiento 6.
  // Cuadrantes: BU 25 · EV 23 · SE 24 · RE 20 (predominante BU).
  const L = { 1: "casiNunca", 2: "ocasionalmente", 3: "laMitad", 4: "frecuentemente", 5: "casiSiempre" };
  const respuestas = todas("casiNunca");
  const vector = (indices, valores) => indices.forEach((idx, i) => { respuestas[idx] = L[valores[i]]; });
  // General 24: SE 1,2 = 9 · EV 3,10 = 5 · RE 9 = 5 · sin cuadrante 4-8 = 5
  vector([1, 2], [5, 4]);
  vector([3, 10], [3, 2]);
  vector([9], [5]);
  // Auditivo 13: RE 11,14 = 6 · SE 13 = 3 · resto 1
  vector([11, 14], [4, 2]);
  vector([13], [3]);
  // Visual 17: BU 18,19,20 = 12 · RE 23,24,25 = 3 · sin cuadrante 21,22 = 2
  vector([18, 19, 20], [5, 4, 3]);
  // Táctil 21: SE 26 = 2 · EV 27,28,29 = 12 · RE 30 = 2 · resto 1
  vector([26], [2]);
  vector([27, 28, 29], [5, 4, 3]);
  vector([30], [2]);
  // Movimiento 16: BU 36,37,38 = 12 · SE 39 = 2 · resto 1
  vector([36, 37, 38], [5, 4, 3]);
  vector([39], [2]);

  const r = calcularPuntuacionToddler(config(respuestas));
  assert.deepEqual(
    r.secciones.map((s) => s.raw),
    [24, 13, 17, 21, 16, 7, 6]
  );
  assert.equal(r.total, 104);
  assert.deepEqual(r.totalesCuadrante, { BU: 25, EV: 23, SE: 24, RE: 20 });
  assert.equal(r.dominantes.length, 1);
  assert.equal(r.dominantes[0].codigo, "BU");
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.clasificacion?.nombre),
    [
      "Como la mayoría", // Búsqueda 25 (23-33)
      "Más que otros", // Evitación 23 (22-26)
      "Como la mayoría", // Sensibilidad 24 (13-27)
      "Como la mayoría", // Registro 20 (10-21)
      "Más que otros", // General 24 (23-27)
      "Como la mayoría", // Auditivo 13 (6-14)
      "Como la mayoría", // Visual 17 (11-19)
      "Mucho más que otros", // Táctil 21 (17-50)
      "Como la mayoría", // Movimiento 16 (13-20)
      "Como la mayoría", // Oral 7 (6-15)
      "Menos que otros", // Comportamiento 6 (4-6)
    ]
  );
});

test("la tabla de corte es contigua y cubre todo el rango de cada fila", () => {
  for (const fila of TABLA_CLASIFICACION) {
    const cortes = fila.cortes.filter((c) => c.min != null);
    let esperado = 0;
    for (const corte of cortes) {
      assert.equal(corte.min, esperado, `${fila.nombre}: inicio de ${corte.nombre}`);
      esperado = corte.max + 1;
    }
    assert.equal(esperado, fila.maximo + 1, `${fila.nombre}: cobertura hasta el máximo`);
  }
});

test("clasificación en los límites de cada banda de la tabla de corte", () => {
  for (const fila of TABLA_CLASIFICACION) {
    const cortes = fila.cortes.filter((c) => c.min != null);
    cortes.forEach((corte, i) => {
      const previo = cortes[i - 1];
      const siguiente = cortes[i + 1];
      assert.equal(clasificarFila(fila, corte.min)?.nombre, corte.nombre, `${fila.nombre} ${corte.min}`);
      assert.equal(clasificarFila(fila, corte.max)?.nombre, corte.nombre, `${fila.nombre} ${corte.max}`);
      if (previo) {
        assert.equal(
          clasificarFila(fila, corte.min - 1)?.nombre,
          previo.nombre,
          `${fila.nombre} ${corte.min - 1}`
        );
      }
      if (siguiente) {
        assert.equal(
          clasificarFila(fila, corte.max + 1)?.nombre,
          siguiente.nombre,
          `${fila.nombre} ${corte.max + 1}`
        );
      }
    });
    assert.equal(clasificarFila(fila, 0)?.nombre, cortes[0].nombre, `${fila.nombre} 0`);
    assert.equal(clasificarFila(fila, fila.maximo)?.nombre, cortes[cortes.length - 1].nombre, `${fila.nombre} máximo`);
  }
});

test("Búsqueda/Buscador nunca alcanza Mucho más que otros (**)", () => {
  const busqueda = TABLA_CLASIFICACION.find((f) => f.nombre === "Búsqueda/Buscador");
  const inalcanzable = busqueda.cortes.find((c) => c.min == null);
  assert.equal(inalcanzable.nombre, "Mucho más que otros");
  assert.equal(clasificarFila(busqueda, busqueda.maximo)?.nombre, "Más que otros");
});
