import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcularPuntuacionBreve,
  clasificarFila,
  TABLA_CLASIFICACION,
} from "../src/lib/informe-breve.js";

/* ============================================================
   PERFIL SENSORIAL 2 BREVE · 3:0 A 14:11 AÑOS
   34 ítems en 2 secciones (Sensorial 14 + Conductual 20).
   Escala Casi siempre o siempre=5, Frecuentemente=4, La mitad
   de las veces=3, Ocasionalmente=2, Casi nunca o nunca=1,
   No aplicable=0 (excluido de la suma). Todos los ítems tienen
   cuadrante: BU 7 ítems /35, EV 9 /45, SE 10 /50, RE 8 /40.
   Clasificación única 3:0-14:11 (Tabla 4.12 del manual):
   ±1 Dt = Más/Menos que los demás, ±2 Dt = Mucho más/Mucho
   menos que los demás.
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
  "Procesamiento Sensorial", // 14 ítems (1-14)
  "Respuesta Conductual", // 20 ítems (15-34)
];

const CUADRANTES_SECCION = [
  [
    "SE", "SE", "SE", "SE", "SE", // 1-5
    "BU", "BU", "BU", "RE", "RE", // 6-10
    "BU", "RE", "RE", "BU", // 11-14
  ],
  [
    "RE", "EV", "EV", "EV", "EV", "EV", // 15-20
    "SE", "EV", "EV", "EV", "SE", "EV", // 21-26
    "RE", "SE", "SE", "RE", "BU", "BU", "SE", "RE", // 27-34
  ],
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

test("todas Casi nunca → total 34, todas las filas Como los demás", () => {
  const r = calcularPuntuacionBreve(config(todas("casiNunca")));
  assert.equal(r.total, 34);
  assert.equal(r.totalMaximo, 170);
  assert.deepEqual(
    r.secciones.map((s) => s.raw),
    [14, 20]
  );
  assert.deepEqual(r.totalesCuadrante, { BU: 7, EV: 9, SE: 10, RE: 8 });
  assert.equal(r.dominantes.length, 1);
  assert.equal(r.dominantes[0].codigo, "SE");
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.clasificacion?.nombre),
    [
      "Como los demás", // Búsqueda 7 (7-17)
      "Como los demás", // Evitación 9 (9-20)
      "Como los demás", // Sensibilidad 10 (10-24)
      "Como los demás", // Registro 8 (6-14)
      "Como los demás", // Sensoriales 14 (13-27)
      "Como los demás", // Conductuales 20 (19-43)
    ]
  );
});

test("todas Casi siempre → total 170 y cuadrantes en su máximo", () => {
  const r = calcularPuntuacionBreve(config(todas("casiSiempre")));
  assert.equal(r.total, 170);
  assert.deepEqual(r.totalesCuadrante, { BU: 35, EV: 45, SE: 50, RE: 40 });
  assert.equal(r.dominantes.length, 1);
  assert.equal(r.dominantes[0].codigo, "SE");
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.clasificacion?.nombre),
    [
      "Mucho más que los demás", // Búsqueda 35
      "Mucho más que los demás", // Evitación 45
      "Mucho más que los demás", // Sensibilidad 50
      "Mucho más que los demás", // Registro 40
      "Mucho más que los demás", // Sensoriales 70
      "Mucho más que los demás", // Conductuales 100
    ]
  );
});

test("cantidad de ítems y máximos de cada fila según la pauta", () => {
  const r = calcularPuntuacionBreve(config(todas("casiNunca")));
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.items),
    [7, 9, 10, 8, 14, 20]
  );
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.maximo),
    [35, 45, 50, 40, 70, 100]
  );
});

test("No aplicable puntúa 0 y queda contado por sección", () => {
  const respuestas = todas("casiSiempre");
  respuestas[1] = "noAplicable"; // SE, sección Sensorial
  respuestas[15] = "noAplicable"; // RE, sección Conductual
  const r = calcularPuntuacionBreve(config(respuestas));
  assert.equal(r.total, 170 - 10);
  assert.equal(r.secciones[0].noAplicables, 1);
  assert.equal(r.secciones[1].noAplicables, 1);
  assert.equal(r.secciones[0].raw, 65);
  assert.equal(r.secciones[1].raw, 95);
  assert.equal(r.totalNoAplicables, 2);
  assert.equal(r.totalesCuadrante.SE, 50 - 5);
  assert.equal(r.totalesCuadrante.RE, 40 - 5);
});

test("caso de regresión: total 74 con Registro Más que los demás", () => {
  // Brutos: Sensorial 33, Conductual 41.
  // Cuadrantes: BU 17 · EV 19 · SE 22 · RE 16 (predominante SE).
  const L = { 1: "casiNunca", 2: "ocasionalmente", 3: "laMitad", 4: "frecuentemente", 5: "casiSiempre" };
  const respuestas = todas("casiNunca");
  const vector = (indices, valores) => indices.forEach((idx, i) => { respuestas[idx] = L[valores[i]]; });
  // Sensorial 33: SE 1,2,3 = 12 · BU 6,7,8 = 12 · RE 9 = 2 · resto 1
  vector([1, 2, 3], [5, 4, 3]);
  vector([6, 7, 8], [5, 4, 3]);
  vector([9], [2]);
  // Conductual 41: RE 15 = 5 · EV 16,20 = 9 · SE 21 = 3 · EV 22,24 = 5 ·
  // RE 27 = 4 · SE 28 = 2 · BU 31 = 2 · resto 1
  vector([15], [5]);
  vector([16, 20], [5, 4]);
  vector([21], [3]);
  vector([22, 24], [2, 3]);
  vector([27], [4]);
  vector([28], [2]);
  vector([31], [2]);

  const r = calcularPuntuacionBreve(config(respuestas));
  assert.deepEqual(
    r.secciones.map((s) => s.raw),
    [33, 41]
  );
  assert.equal(r.total, 74);
  assert.deepEqual(r.totalesCuadrante, { BU: 17, EV: 19, SE: 22, RE: 16 });
  assert.equal(r.dominantes.length, 1);
  assert.equal(r.dominantes[0].codigo, "SE");
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.clasificacion?.nombre),
    [
      "Como los demás", // Búsqueda 17 (7-17)
      "Como los demás", // Evitación 19 (9-20)
      "Como los demás", // Sensibilidad 22 (10-24)
      "Más que los demás", // Registro 16 (15-18)
      "Más que los demás", // Sensoriales 33 (28-34)
      "Como los demás", // Conductuales 41 (19-43)
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
