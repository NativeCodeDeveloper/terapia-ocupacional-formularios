import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcularPuntuacionNino,
  clasificarFila,
  TABLA_CLASIFICACION,
} from "../src/lib/informe-nino.js";

/* ============================================================
   PERFIL SENSORIAL 2 NIÑO · 3:0 A 14:11 AÑOS
   86 ítems en 9 secciones (Auditivo 8 + Visual 7 + Táctil 11 +
   Movimiento 8 + Corporal 8 + Oral 10 + Conductual 9 +
   Socioemocional 14 + Atencional 11). Escala Casi siempre o
   siempre=5 … Casi nunca o nunca=1, No aplicable=0 (excluido).
   Los ítems 15 (Visual) y 86 (Atencional) puntúan solo en su
   cuadrante: las secciones puntúan sobre 84 ítems (/420).
   Cuadrantes: BU 19 /95, EV 20 /100, SE 19 /95, RE 22 /110
   (los 86 ítems). Clasificación única 3:0-14:11; en Corporal y
   Oral la banda «Mucho menos que los demás» es solo el 0.
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
  "Procesamiento Auditivo", // 8 ítems (1-8)
  "Procesamiento Visual", // 7 ítems (9-15)
  "Procesamiento Táctil", // 11 ítems (16-26)
  "Procesamiento de Movimiento", // 8 ítems (27-34)
  "Procesamiento Corporal", // 8 ítems (35-42)
  "Procesamiento Sensorial Oral", // 10 ítems (43-52)
  "Respuesta Conductual", // 9 ítems (53-61)
  "Respuesta Socioemocional", // 14 ítems (62-75)
  "Respuesta Atencional", // 11 ítems (76-86)
];

const CUADRANTES_SECCION = [
  ["EV", "EV", "SE", "SE", "EV", "SE", "SE", "RE"], // Auditivo
  ["SE", null, null, "RE", "SE", "BU", "EV"], // Visual (15 solo cuadrante)
  ["SE", null, "EV", "SE", "SE", "BU", "BU", "RE", "RE", "BU", "RE"], // Táctil
  ["BU", "BU", null, "BU", "BU", "BU", "RE", "RE"], // Movimiento
  ["RE", "RE", "RE", "RE", "RE", "RE", "BU", null], // Corporal
  [null, "SE", "SE", "SE", "SE", "BU", "BU", "BU", "BU", "SE"], // Oral
  ["RE", "RE", "BU", "BU", "RE", "EV", "EV", "BU", "EV"], // Conductual
  ["RE", "EV", "EV", "EV", "EV", "EV", "EV", "SE", "EV", "EV", "EV", "SE", "EV", "EV"], // Socioemocional
  ["RE", "SE", "SE", "RE", "RE", "EV", "BU", "BU", "SE", "RE", "RE"], // Atencional (86 solo cuadrante)
];

const SOLO_CUADRANTE = new Set([15, 86]);

const secciones = (() => {
  let numero = 0;
  return CUADRANTES_SECCION.map((cuadrantes, si) => ({
    titulo: TITULOS[si],
    preguntas: cuadrantes.map((cuadrante) => {
      numero += 1;
      return {
        texto: `Pregunta ${numero} de ${TITULOS[si]}.`,
        cuadrante,
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

test("todas Casi nunca → total 84, filas en sus bandas inferiores", () => {
  const r = calcularPuntuacionNino(config(todas("casiNunca")));
  assert.equal(r.total, 84);
  assert.equal(r.totalMaximo, 420);
  assert.deepEqual(
    r.secciones.map((s) => s.raw),
    [8, 6, 11, 8, 8, 10, 9, 14, 10]
  );
  assert.deepEqual(r.totalesCuadrante, { BU: 19, EV: 20, SE: 19, RE: 22 });
  assert.equal(r.dominantes.length, 1);
  assert.equal(r.dominantes[0].codigo, "RE");
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.clasificacion?.nombre),
    [
      "Menos que los demás", // Búsqueda 19 (9-20)
      "Menos que los demás", // Evitación 20 (11-20)
      "Como los demás", // Sensibilidad 19 (19-40)
      "Como los demás", // Registro 22 (19-39)
      "Menos que los demás", // Auditivo 8 (3-9)
      "Menos que los demás", // Visual 6 (3-6)
      "Como los demás", // Táctil 11 (9-20)
      "Como los demás", // Movimiento 8 (8-18)
      "Como los demás", // Corporal 8 (5-14)
      "Como los demás", // Oral 10 (9-24)
      "Como los demás", // Conductual 9 (8-19)
      "Como los demás", // Socioemocional 14 (13-30)
      "Como los demás", // Atencional 10 (10-23)
    ]
  );
});

test("todas Casi siempre → total 420 y cuadrantes en su máximo", () => {
  const r = calcularPuntuacionNino(config(todas("casiSiempre")));
  assert.equal(r.total, 420);
  assert.equal(r.totalMaximo, 420);
  assert.deepEqual(
    r.secciones.map((s) => s.raw),
    [40, 30, 55, 40, 40, 50, 45, 70, 50]
  );
  assert.deepEqual(r.totalesCuadrante, { BU: 95, EV: 100, SE: 95, RE: 110 });
  assert.equal(r.dominantes.length, 1);
  assert.equal(r.dominantes[0].codigo, "RE");
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.clasificacion?.nombre),
    [
      "Mucho más que los demás", // Búsqueda 95
      "Mucho más que los demás", // Evitación 100
      "Mucho más que los demás", // Sensibilidad 95
      "Mucho más que los demás", // Registro 110
      "Mucho más que los demás", // Auditivo 40
      "Mucho más que los demás", // Visual 30
      "Mucho más que los demás", // Táctil 55
      "Mucho más que los demás", // Movimiento 40
      "Mucho más que los demás", // Corporal 40
      "Mucho más que los demás", // Oral 50
      "Mucho más que los demás", // Conductual 45
      "Mucho más que los demás", // Socioemocional 70
      "Mucho más que los demás", // Atencional 50
    ]
  );
});

test("cantidad de ítems y máximos de cada fila según la pauta", () => {
  const r = calcularPuntuacionNino(config(todas("casiNunca")));
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.items),
    [19, 20, 19, 22, 8, 6, 11, 8, 8, 10, 9, 14, 10]
  );
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.maximo),
    [95, 100, 95, 110, 40, 30, 55, 40, 40, 50, 45, 70, 50]
  );
});

test("No aplicable puntúa 0 y queda contado por sección", () => {
  const respuestas = todas("casiSiempre");
  respuestas[1] = "noAplicable"; // EV, Auditivo
  respuestas[53] = "noAplicable"; // RE, Conductual
  const r = calcularPuntuacionNino(config(respuestas));
  assert.equal(r.total, 420 - 10);
  assert.equal(r.secciones[0].noAplicables, 1);
  assert.equal(r.secciones[6].noAplicables, 1);
  assert.equal(r.secciones[0].raw, 35);
  assert.equal(r.secciones[6].raw, 40);
  assert.equal(r.totalNoAplicables, 2);
  assert.equal(r.totalesCuadrante.EV, 100 - 5);
  assert.equal(r.totalesCuadrante.RE, 110 - 5);
});

test("los ítems solo cuadrante (15 y 86) no suman en su sección", () => {
  const respuestas = todas("casiNunca");
  respuestas[15] = "casiSiempre"; // EV, Visual (solo cuadrante)
  respuestas[86] = "casiSiempre"; // RE, Atencional (solo cuadrante)
  const r = calcularPuntuacionNino(config(respuestas));
  assert.equal(r.secciones[1].raw, 6); // Visual no cambia (9-14)
  assert.equal(r.secciones[1].maximo, 30);
  assert.equal(r.secciones[8].raw, 10); // Atencional no cambia (76-85)
  assert.equal(r.secciones[8].maximo, 50);
  assert.equal(r.totalesCuadrante.EV, 20 + 4);
  assert.equal(r.totalesCuadrante.RE, 22 + 4);
  assert.equal(r.total, 84); // el total de secciones no cambia
});

test("caso de regresión: total 136 con Registro Más y Corporal Mucho más", () => {
  // Brutos: Auditivo 18, Visual 13, Táctil 18, Movimiento 13,
  // Corporal 20, Oral 10, Conductual 13, Socioemocional 20,
  // Atencional 11.
  // Cuadrantes (los 86 ítems): BU 29 · EV 30 · SE 31 · RE 42
  // (predominante RE).
  const L = { 1: "casiNunca", 2: "ocasionalmente", 3: "laMitad", 4: "frecuentemente", 5: "casiSiempre" };
  const respuestas = todas("casiNunca");
  const vector = (indices, valores) => indices.forEach((idx, i) => { respuestas[idx] = L[valores[i]]; });
  // Auditivo 18: EV 1,2,5 = 12 · SE 3,4,6,7 = 4 · RE 8 = 2
  vector([1], [5]);
  vector([2], [4]);
  vector([5], [3]);
  vector([8], [2]);
  // Visual 13: SE 9 = 5 · SE 13 = 4 · resto 1
  vector([9], [5]);
  vector([13], [4]);
  // Táctil 18: SE 16 = 3 · SE 19 = 2 · BU 21 = 5 · resto 1
  vector([16], [3]);
  vector([19], [2]);
  vector([21], [5]);
  // Movimiento 13: BU 27 = 4 · BU 30 = 3 · resto 1
  vector([27], [4]);
  vector([30], [3]);
  // Corporal 20: RE 35-38 = 16 · resto 1
  vector([35, 36, 37, 38], [4, 4, 4, 4]);
  // Conductual 13: RE 53 = 5 · resto 1
  vector([53], [5]);
  // Socioemocional 20: RE 62 = 4 · EV 63 = 2 · SE 69 = 3 · resto 1
  vector([62], [4]);
  vector([63], [2]);
  vector([69], [3]);
  // Atencional 11: BU 82 = 2 · resto 1
  vector([82], [2]);

  const r = calcularPuntuacionNino(config(respuestas));
  assert.deepEqual(
    r.secciones.map((s) => s.raw),
    [18, 13, 18, 13, 20, 10, 13, 20, 11]
  );
  assert.equal(r.total, 136);
  assert.deepEqual(r.totalesCuadrante, { BU: 29, EV: 30, SE: 31, RE: 42 });
  assert.equal(r.dominantes.length, 1);
  assert.equal(r.dominantes[0].codigo, "RE");
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.clasificacion?.nombre),
    [
      "Como los demás", // Búsqueda 29 (21-46)
      "Como los demás", // Evitación 30 (21-42)
      "Como los demás", // Sensibilidad 31 (19-40)
      "Más que los demás", // Registro 42 (40-49)
      "Como los demás", // Auditivo 18 (10-22)
      "Como los demás", // Visual 13 (7-16)
      "Como los demás", // Táctil 18 (9-20)
      "Como los demás", // Movimiento 13 (8-18)
      "Mucho más que los demás", // Corporal 20 (19-40)
      "Como los demás", // Oral 10 (9-24)
      "Como los demás", // Conductual 13 (8-19)
      "Como los demás", // Socioemocional 20 (13-30)
      "Como los demás", // Atencional 11 (10-23)
    ]
  );
});

test("la tabla de corte es contigua y cubre todo el rango de cada fila", () => {
  for (const fila of TABLA_CLASIFICACION) {
    const cortes = fila.cortes;
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
    fila.cortes.forEach((corte, i) => {
      const previo = fila.cortes[i - 1];
      const siguiente = fila.cortes[i + 1];
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
    assert.equal(clasificarFila(fila, 0)?.nombre, fila.cortes[0].nombre, `${fila.nombre} 0`);
    assert.equal(
      clasificarFila(fila, fila.maximo)?.nombre,
      fila.cortes[fila.cortes.length - 1].nombre,
      `${fila.nombre} máximo`
    );
  }
});
