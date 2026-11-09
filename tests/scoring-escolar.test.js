import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcularPuntuacionEscolar,
  clasificarFila,
  TABLA_CLASIFICACION,
  CUADRANTES,
  FACTORES,
} from "../src/lib/informe-escolar.js";

/* ============================================================
   PERFIL SENSORIAL 2 ESCOLAR · 3:0 A 14:11 AÑOS
   44 ítems en 5 secciones (Auditivo 7 + Visual 7 + Táctil 8 +
   Movimiento 10 + Conductual 12). Escala Casi siempre o
   siempre=5 … Casi nunca o nunca=1, No aplicable=0 (excluido).
   Los ítems 31 y 32 (Movimiento) y 44 (Conductual) puntúan
   solo en su cuadrante y factor: las secciones puntúan sobre
   41 ítems (/205). Cuadrantes (los 44 ítems): BU 8 /40,
   EV 12 /60, SE 11 /55, RE 13 /65. Factores escolares:
   F1 13 /65, F2 10 /50, F3 12 /60, F4 9 /45. Clasificación
   única 3:0-14:11; en el Factor escolar 4 la banda «Mucho
   menos que los demás» no tiene puntuaciones disponibles.
   ============================================================ */

const OPCIONES = [
  { valor: "casiSiempre", etiqueta: "CASI SIEMPRE O SIEMPRE", puntaje: 5 },
  { valor: "frecuentemente", etiqueta: "FRECUENTEMENTE", puntaje: 4 },
  { valor: "laMitad", etiqueta: "LA MITAD DE LAS VECES", puntaje: 3 },
  { valor: "ocasionalmente", etiqueta: "OCASIONALMENTE", puntaje: 2 },
  { valor: "casiNunca", etiqueta: "CASI NUNCA O NUNCA", puntaje: 1 },
  { valor: "noAplicable", etiqueta: "NO APLICABLE", puntaje: 0 },
];

const TITULOS = [
  "Procesamiento Auditivo", // 7 ítems (1-7)
  "Procesamiento Visual", // 7 ítems (8-14)
  "Procesamiento Táctil", // 8 ítems (15-22)
  "Procesamiento de Movimiento", // 10 ítems (23-32; 31-32 solo cuadrante)
  "Respuesta Conductual", // 12 ítems (33-44; 44 solo cuadrante)
];

// [cuadrante, factor] de cada ítem según la pauta.
const ITEMS = [
  ["RE", "F1"], ["RE", "F1"], ["RE", "F3"], ["SE", "F2"], ["EV", "F3"], ["SE", "F3"], ["SE", "F3"], // Auditivo
  ["RE", "F1"], ["RE", "F1"], ["RE", "F1"], ["BU", "F2"], ["SE", "F2"], ["RE", "F4"], ["BU", "F2"], // Visual
  ["BU", "F1"], ["RE", "F1"], ["BU", "F1"], ["BU", "F2"], ["SE", "F2"], ["SE", "F2"], ["SE", "F3"], ["EV", "F3"], // Táctil
  ["RE", "F4"], ["BU", "F1"], ["SE", "F1"], ["RE", "F1"], ["RE", "F1"], ["BU", "F1"], ["BU", "F2"], ["EV", "F4"], // Movimiento
  ["EV", "F4"], ["EV", "F4"], // Movimiento (solo cuadrante)
  ["RE", "F3"], ["RE", "F4"], ["SE", "F2"], ["EV", "F4"], ["EV", "F4"], ["EV", "F3"], ["SE", "F3"], // Conductual
  ["EV", "F3"], ["EV", "F3"], ["EV", "F3"], ["EV", "F4"], ["SE", "F2"], // Conductual
];

const SOLO_CUADRANTE = new Set([31, 32, 44]);

const LARGOS = [7, 7, 8, 10, 12];

const secciones = (() => {
  let numero = 0;
  return TITULOS.map((titulo, si) => ({
    titulo,
    preguntas: Array.from({ length: LARGOS[si] }, () => {
      numero += 1;
      const [cuadrante, factor] = ITEMS[numero - 1];
      return {
        texto: `Pregunta ${numero} de ${titulo}.`,
        cuadrante,
        factor,
        soloCuadrante: SOLO_CUADRANTE.has(numero),
      };
    }),
  }));
})();

const todas = (valor) =>
  Object.fromEntries(
    secciones.flatMap((seccion) => seccion.preguntas.map(() => null)).map((_, i) => [i + 1, valor])
  );

const config = (respuestas) => ({ secciones, respuestas, opciones: OPCIONES });

test("todas Casi nunca → total 41, filas en sus bandas", () => {
  const r = calcularPuntuacionEscolar(config(todas("casiNunca")));
  assert.equal(r.total, 41);
  assert.equal(r.totalMaximo, 205);
  assert.deepEqual(
    r.secciones.map((s) => s.raw),
    [7, 7, 8, 8, 11]
  );
  assert.deepEqual(r.totalesCuadrante, { BU: 8, EV: 12, SE: 11, RE: 13 });
  assert.deepEqual(r.totalesFactor, { F1: 13, F2: 10, F3: 12, F4: 9 });
  assert.equal(r.dominantes.length, 1);
  assert.equal(r.dominantes[0].codigo, "RE");
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.clasificacion?.nombre),
    [
      "Menos que los demás", // Búsqueda 8 (3-8)
      "Como los demás", // Evitación 12 (8-24)
      "Menos que los demás", // Sensibilidad 11 (6-11)
      "Como los demás", // Registro 13 (10-27)
      "Como los demás", // Auditivo 7 (6-15)
      "Menos que los demás", // Visual 7 (2-7)
      "Como los demás", // Táctil 8 (6-16)
      "Como los demás", // Movimiento 8 (7-19)
      "Como los demás", // Conductual 11 (8-23)
      "Como los demás", // Factor escolar 1: 13 (11-27)
      "Menos que los demás", // Factor escolar 2: 10 (5-11)
      "Como los demás", // Factor escolar 3: 12 (10-24)
      "Como los demás", // Factor escolar 4: 9 (6-18)
    ]
  );
});

test("todas Casi siempre → total 205 y cuadrantes y factores en su máximo", () => {
  const r = calcularPuntuacionEscolar(config(todas("casiSiempre")));
  assert.equal(r.total, 205);
  assert.equal(r.totalMaximo, 205);
  assert.deepEqual(
    r.secciones.map((s) => s.raw),
    [35, 35, 40, 40, 55]
  );
  assert.deepEqual(r.totalesCuadrante, { BU: 40, EV: 60, SE: 55, RE: 65 });
  assert.deepEqual(r.totalesFactor, { F1: 65, F2: 50, F3: 60, F4: 45 });
  assert.equal(r.dominantes.length, 1);
  assert.equal(r.dominantes[0].codigo, "RE");
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.clasificacion?.nombre),
    Array(13).fill("Mucho más que los demás")
  );
});

test("cantidad de ítems y máximos de cada fila según la pauta", () => {
  const r = calcularPuntuacionEscolar(config(todas("casiNunca")));
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.items),
    [8, 12, 11, 13, 7, 7, 8, 8, 11, 13, 10, 12, 9]
  );
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.maximo),
    [40, 60, 55, 65, 35, 35, 40, 40, 55, 65, 50, 60, 45]
  );
  assert.deepEqual(r.filasClasificacion.map((f) => f.nombre), [
    "Búsqueda/Buscador",
    "Evitación/Evitativo",
    "Sensibilidad/Sensitivo",
    "Registro/Espectador",
    "Auditivo",
    "Visual",
    "Táctil",
    "Movimiento",
    "Conductual",
    "Factor escolar 1",
    "Factor escolar 2",
    "Factor escolar 3",
    "Factor escolar 4",
  ]);
});

test("No aplicable puntúa 0 y queda contado por sección", () => {
  const respuestas = todas("casiSiempre");
  respuestas[1] = "noAplicable"; // RE, F1, Auditivo
  respuestas[44] = "noAplicable"; // SE, F2, Conductual (solo cuadrante)
  const r = calcularPuntuacionEscolar(config(respuestas));
  assert.equal(r.total, 205 - 5); // el 44 ya no sumaba en su sección
  assert.equal(r.secciones[0].noAplicables, 1);
  assert.equal(r.secciones[4].noAplicables, 1);
  assert.equal(r.secciones[0].raw, 30);
  assert.equal(r.secciones[4].raw, 55); // Conductual no cambia
  assert.equal(r.totalNoAplicables, 2);
  assert.equal(r.totalesCuadrante.RE, 65 - 5);
  assert.equal(r.totalesCuadrante.SE, 55 - 5);
  assert.equal(r.totalesFactor.F1, 65 - 5);
  assert.equal(r.totalesFactor.F2, 50 - 5);
});

test("los ítems solo cuadrante (31, 32 y 44) no suman en su sección", () => {
  const respuestas = todas("casiNunca");
  respuestas[31] = "casiSiempre"; // EV, F4, Movimiento (solo cuadrante)
  respuestas[32] = "casiSiempre"; // EV, F4, Movimiento (solo cuadrante)
  respuestas[44] = "casiSiempre"; // SE, F2, Conductual (solo cuadrante)
  const r = calcularPuntuacionEscolar(config(respuestas));
  assert.deepEqual(r.secciones.map((s) => s.raw), [7, 7, 8, 8, 11]); // sin cambios
  assert.deepEqual(
    r.secciones.map((s) => s.maximo),
    [35, 35, 40, 40, 55]
  );
  assert.equal(r.totalesCuadrante.EV, 12 + 8); // 31 y 32 pasan de 1 a 5
  assert.equal(r.totalesCuadrante.SE, 11 + 4); // 44 pasa de 1 a 5
  assert.equal(r.totalesFactor.F4, 9 + 8);
  assert.equal(r.totalesFactor.F2, 10 + 4);
  assert.equal(r.total, 41); // el total de secciones no cambia
});

test("caso de regresión: total 80 con Búsqueda Más y Factores 1 y 2 Más", () => {
  // Brutos: Auditivo 15, Visual 14, Táctil 15, Movimiento 18,
  // Conductual 18.
  // Cuadrantes (los 44 ítems): BU 26 · EV 15 · SE 21 · RE 25
  // (predominante BU). Factores: F1 31 · F2 27 · F3 13 · F4 16.
  const L = { 1: "casiNunca", 2: "ocasionalmente", 3: "laMitad", 4: "frecuentemente", 5: "casiSiempre" };
  const respuestas = todas("casiNunca");
  const vector = (indices, valores) => indices.forEach((idx, i) => { respuestas[idx] = L[valores[i]]; });
  // Auditivo 15: RE 1=5 (+4), RE 2=4 (+3), RE 3=2 (+1)
  vector([1], [5]);
  vector([2], [4]);
  vector([3], [2]);
  // Visual 14: BU 11=5 (+4), BU 14=4 (+3)
  vector([11], [5]);
  vector([14], [4]);
  // Táctil 15: BU 15=5 (+4), SE 19=4 (+3)
  vector([15], [5]);
  vector([19], [4]);
  // Movimiento 18: BU 24=4 (+3), BU 28=5 (+4), EV 30=4 (+3)
  vector([24], [4]);
  vector([28], [5]);
  vector([30], [4]);
  // Conductual 18: RE 34=5 (+4), SE 35=4 (+3); el 44 (solo cuadrante) no suma en la sección
  vector([34], [5]);
  vector([35], [4]);
  vector([44], [5]);

  const r = calcularPuntuacionEscolar(config(respuestas));
  assert.deepEqual(
    r.secciones.map((s) => s.raw),
    [15, 14, 15, 18, 18]
  );
  assert.equal(r.total, 80);
  assert.deepEqual(r.totalesCuadrante, { BU: 26, EV: 15, SE: 21, RE: 25 });
  assert.deepEqual(r.totalesFactor, { F1: 31, F2: 27, F3: 13, F4: 16 });
  assert.equal(r.dominantes.length, 1);
  assert.equal(r.dominantes[0].codigo, "BU");
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.clasificacion?.nombre),
    [
      "Más que los demás", // Búsqueda 26 (22-27)
      "Como los demás", // Evitación 15 (8-24)
      "Como los demás", // Sensibilidad 21 (12-24)
      "Como los demás", // Registro 25 (10-27)
      "Como los demás", // Auditivo 15 (6-15)
      "Como los demás", // Visual 14 (8-18)
      "Como los demás", // Táctil 15 (6-16)
      "Como los demás", // Movimiento 18 (7-19)
      "Como los demás", // Conductual 18 (8-23)
      "Más que los demás", // Factor escolar 1: 31 (28-35)
      "Más que los demás", // Factor escolar 2: 27 (27-33)
      "Como los demás", // Factor escolar 3: 13 (10-24)
      "Como los demás", // Factor escolar 4: 16 (6-18)
    ]
  );
});

test("los cuadrantes y factores cubren los 44 ítems sin solaparse", () => {
  const r = calcularPuntuacionEscolar(config(todas("casiNunca")));
  const porTipo = (tipo) => r.filasClasificacion.filter((f) => f.nombre.startsWith(tipo));
  const sumaCuadrantes = r.filasClasificacion
    .filter((f) => CUADRANTES.some((c) => c.nombre === f.nombre))
    .reduce((n, f) => n + f.items, 0);
  const sumaFactores = r.filasClasificacion
    .filter((f) => FACTORES.some((c) => c.nombre === f.nombre))
    .reduce((n, f) => n + f.items, 0);
  assert.equal(sumaCuadrantes, 44);
  assert.equal(sumaFactores, 44);
  assert.equal(porTipo("Factor escolar").length, 4);
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

test("el Factor escolar 4 no tiene banda «Mucho menos que los demás»", () => {
  const f4 = TABLA_CLASIFICACION.find((f) => f.codigo === "F4");
  assert.equal(f4.cortes[0].min, null);
  assert.equal(clasificarFila(f4, 0)?.nombre, "Menos que los demás");
  for (let bruto = 0; bruto <= f4.maximo; bruto++) {
    assert.notEqual(
      clasificarFila(f4, bruto)?.nombre,
      "Mucho menos que los demás",
      `Factor escolar 4 con bruto ${bruto}`
    );
  }
});

test("clasificación en los límites de cada banda de la tabla de corte", () => {
  for (const fila of TABLA_CLASIFICACION) {
    fila.cortes.forEach((corte, i) => {
      if (corte.min == null) return;
      const previo = fila.cortes[i - 1];
      const siguiente = fila.cortes[i + 1];
      assert.equal(clasificarFila(fila, corte.min)?.nombre, corte.nombre, `${fila.nombre} ${corte.min}`);
      assert.equal(clasificarFila(fila, corte.max)?.nombre, corte.nombre, `${fila.nombre} ${corte.max}`);
      if (previo && previo.min != null) {
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
    assert.equal(clasificarFila(fila, 0)?.nombre, fila.cortes.find((c) => c.min != null).nombre, `${fila.nombre} 0`);
    assert.equal(
      clasificarFila(fila, fila.maximo)?.nombre,
      fila.cortes[fila.cortes.length - 1].nombre,
      `${fila.nombre} máximo`
    );
  }
});
