import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularPuntuacion } from "../src/lib/informe.js";

/* ============================================================
   Tests de puntuación del SPM-2.
   Caso principal: la inversión de los ítems 71-80 (Participación
   Social redactados en positivo) y la estabilidad del resto de
   las escalas (regresión del informe preescolar, tabla de 5 años).
   ============================================================ */

const OPCIONES = [
  { valor: "nunca", etiqueta: "NUNCA", puntaje: 1 },
  { valor: "ocasionalmente", etiqueta: "OCASIONALMENTE", puntaje: 2 },
  { valor: "frecuentemente", etiqueta: "FRECUENTEMENTE", puntaje: 3 },
  { valor: "siempre", etiqueta: "SIEMPRE", puntaje: 4 },
];

const TITULOS = [
  "VISIÓN",
  "OÍDO",
  "TACTO",
  "GUSTO Y OLFATO",
  "CONCIENCIA DEL CUERPO",
  "EQUILIBRIO Y MOVIMIENTO",
  "PLANIFICACIÓN E IDEAS",
  "PARTICIPACIÓN SOCIAL",
];

const secciones = TITULOS.map((titulo) => ({
  titulo,
  preguntas: Array.from({ length: 10 }, (_, i) => `Pregunta ${i + 1} de ${titulo}.`),
}));

const todas = (valor) =>
  Object.fromEntries(Array.from({ length: 80 }, (_, i) => [i + 1, valor]));

const config = (norma, edad, respuestas) => ({
  nombreArchivo: "test",
  instrumento: "test",
  norma,
  datos: [{ etiqueta: "Edad", valor: edad }],
  secciones,
  respuestas,
  opciones: OPCIONES,
});

const escala = (resultado, codigo) =>
  resultado.escalas.find((e) => e.escala === codigo);

test("SOC invertida: todas las respuestas Nunca → bruto 40 (preescolar, 5 años)", () => {
  const { escalas, tablaNorma } = calcularPuntuacion(config("preescolar", "5", todas("nunca")));
  assert.equal(tablaNorma, "preescolar5");
  const soc = escalas.find((e) => e.escala === "SOC");
  assert.equal(soc.raw, 40, "nunca colabora debe sumar lo más alto");
  assert.equal(soc.t, 71);
  assert.equal(soc.pct, 98);
  assert.equal(soc.rango, "Dificultades severas");
});

test("SOC invertida: todas las respuestas Siempre → bruto 10, rango típico", () => {
  const { escalas } = calcularPuntuacion(config("preescolar", "5", todas("siempre")));
  const soc = escalas.find((e) => e.escala === "SOC");
  assert.equal(soc.raw, 10);
  assert.equal(soc.t, 40);
  assert.equal(soc.pct, 16);
  assert.equal(soc.rango, "Típico");
});

test("las otras 7 dimensiones y el ST no se invierten (todas Nunca)", () => {
  const { escalas } = calcularPuntuacion(config("preescolar", "5", todas("nunca")));
  for (const codigo of ["VIS", "HEA", "TOU", "TS", "BOD", "BAL", "PLN"]) {
    assert.equal(escalas.find((e) => e.escala === codigo).raw, 10, `${codigo} sigue directa`);
  }
  // ST = VIS+HEA+TOU+T&S+BOD+BAL (SOC y PLN no entran)
  assert.equal(escalas.find((e) => e.escala === "ST").raw, 60);
});

test("caso de regresión: SOC 27 → T 65 / p93 y el resto sin cambios (preescolar 5 años)", () => {
  // Ítems 1-70 construidos para reproducir los brutos del caso real
  // (una lista de valores por sección, en el orden de TITULOS)
  const LETRA = { 1: "nunca", 2: "ocasionalmente", 3: "frecuentemente", 4: "siempre" };
  const valoresPorSeccion = [
    [4, 4, 4, 4, 4, 2, 1, 1, 1, 1], // VISIÓN 26
    [4, 4, 4, 4, 4, 4, 4, 4, 2, 1], // OÍDO 35
    [4, 1, 1, 1, 1, 1, 1, 1, 1, 1], // TACTO 13
    [4, 4, 4, 4, 4, 1, 1, 1, 1, 1], // GUSTO Y OLFATO 25
    [4, 4, 4, 4, 4, 4, 2, 1, 1, 1], // CONCIENCIA DEL CUERPO 29
    [4, 4, 4, 4, 2, 1, 1, 1, 1, 1], // EQUILIBRIO Y MOVIMIENTO 23
    [4, 2, 1, 1, 1, 1, 1, 1, 1, 1], // PLANIFICACIÓN E IDEAS 14
    [
      "nunca",
      "ocasionalmente",
      "ocasionalmente",
      "frecuentemente",
      "ocasionalmente",
      "frecuentemente",
      "nunca",
      "frecuentemente",
      "siempre",
      "ocasionalmente",
    ], // PARTICIPACIÓN SOCIAL 71-80
  ];
  const respuestas = {};
  TITULOS.forEach((_titulo, si) => {
    valoresPorSeccion[si].forEach((valor, i) => {
      respuestas[si * 10 + i + 1] = typeof valor === "number" ? LETRA[valor] : valor;
    });
  });

  const { escalas, tablaNorma } = calcularPuntuacion(config("preescolar", "5", respuestas));
  assert.equal(tablaNorma, "preescolar5");

  const esperado = {
    VIS: { raw: 26, t: 66, pct: 95 },
    HEA: { raw: 35, t: 69, pct: 97 },
    TOU: { raw: 13, t: 52, pct: 58 },
    TS: { raw: 25, t: 65, pct: 93 },
    BOD: { raw: 29, t: 67, pct: 96 },
    BAL: { raw: 23, t: 67, pct: 96 },
    ST: { raw: 151, t: 67, pct: 96 },
    PLN: { raw: 14, t: 52, pct: 58 },
    SOC: { raw: 27, t: 65, pct: 93 },
  };
  for (const [codigo, e] of Object.entries(esperado)) {
    const escala_ = escalas.find((x) => x.escala === codigo);
    assert.equal(escala_.raw, e.raw, `${codigo} bruto`);
    assert.equal(escala_.t, e.t, `${codigo} puntaje T`);
    assert.equal(escala_.pct, e.pct, `${codigo} percentil`);
  }
  assert.equal(escala({ escalas }, "SOC").rango, "Dificultades moderadas");
});

test("formulario de niños 5-12 (child): misma inversión de la SOC", () => {
  const { escalas, tablaNorma } = calcularPuntuacion(config("child", "9", todas("nunca")));
  assert.equal(tablaNorma, "child");
  const soc = escalas.find((e) => e.escala === "SOC");
  assert.equal(soc.raw, 40);
  assert.equal(soc.t, 80);
  assert.equal(soc.pct, ">99");
  assert.equal(soc.rango, "Dificultades severas");
  assert.equal(escalas.find((e) => e.escala === "VIS").raw, 10);
});

test("preescolar escolar (W-709F): la SOC se invierte y la tabla se elige por edad", () => {
  const caso4 = calcularPuntuacion(config("preescolarEscolar", "4", todas("nunca")));
  assert.equal(caso4.tablaNorma, "preescolarEscolar24");
  const soc4 = caso4.escalas.find((e) => e.escala === "SOC");
  assert.equal(soc4.raw, 40, "nunca colabora debe sumar lo más alto");
  assert.equal(soc4.t, 80);
  assert.equal(soc4.pct, ">99");
  assert.equal(soc4.rango, "Dificultades severas");

  const caso5 = calcularPuntuacion(config("preescolarEscolar", "5", todas("nunca")));
  assert.equal(caso5.tablaNorma, "preescolarEscolar5");
  const soc5 = caso5.escalas.find((e) => e.escala === "SOC");
  assert.equal(soc5.raw, 40);
  assert.equal(soc5.t, 73);
  assert.equal(soc5.pct, 99);
});

test("preescolar escolar 2-4: conversión bruto → T en VIS, HEA, BAL y ST", () => {
  const LETRA = { 1: "nunca", 2: "ocasionalmente", 3: "frecuentemente", 4: "siempre" };
  const respuestas = todas("nunca");
  [4, 4, 4, 3, 2, 1, 1, 1, 1, 1].forEach((v, i) => { respuestas[i + 1] = LETRA[v]; }); // VIS 22
  [4, 4, 4, 4, 4, 1, 1, 1, 1, 1].forEach((v, i) => { respuestas[i + 11] = LETRA[v]; }); // HEA 25
  const { escalas } = calcularPuntuacion(config("preescolarEscolar", "4", respuestas));

  const vis = escalas.find((e) => e.escala === "VIS");
  assert.equal(vis.raw, 22);
  assert.equal(vis.t, 67);
  assert.equal(vis.pct, 96);

  const hea = escalas.find((e) => e.escala === "HEA");
  assert.equal(hea.raw, 25);
  assert.equal(hea.t, 68);
  assert.equal(hea.pct, 96);

  // BAL 10 y ST 87 salen del resto de ítems en Nunca (10 cada dimensión)
  const bal = escalas.find((e) => e.escala === "BAL");
  assert.equal(bal.raw, 10);
  assert.equal(bal.t, 41);
  assert.equal(bal.pct, 18);

  const st = escalas.find((e) => e.escala === "ST");
  assert.equal(st.raw, 22 + 25 + 10 + 10 + 10 + 10);
  assert.equal(st.t, 57);
  assert.equal(st.pct, 76);
});

test("adolescente y adulto: la SOC se invierte solo en los ítems positivos", () => {
  // adolescenteAuto: invertidos 71-74 y 77; directos 75, 76, 78, 79, 80
  const respuestasAuto = todas("nunca");
  respuestasAuto[71] = "siempre";
  respuestasAuto[75] = "siempre";
  const auto = calcularPuntuacion(config("adolescenteAuto", "15", respuestasAuto));
  assert.equal(auto.escalas.find((e) => e.escala === "SOC").raw, 25);

  // adolescenteHogar (W-707E): invertidos 71-73, 76 y 77; directos 74, 75, 78-80
  const hogar = calcularPuntuacion(config("adolescenteHogar", "15", todas("nunca")));
  assert.equal(hogar.escalas.find((e) => e.escala === "SOC").raw, 5 * 4 + 5 * 1);
  // el ítem 74 es directo: "Siempre" suma 4, no 1
  const respuestasHogar = todas("nunca");
  respuestasHogar[74] = "siempre";
  const hogar74 = calcularPuntuacion(config("adolescenteHogar", "15", respuestasHogar));
  assert.equal(hogar74.escalas.find((e) => e.escala === "SOC").raw, 5 * 4 + 4 + 4 * 1);

  // adultoEvaluador: invertidos 71-72 y 74-79; directos 73 y 80
  const evaluador = calcularPuntuacion(config("adultoEvaluador", "30", todas("nunca")));
  assert.equal(evaluador.escalas.find((e) => e.escala === "SOC").raw, 8 * 4 + 2 * 1);
  const evaluadorSiempre = calcularPuntuacion(config("adultoEvaluador", "30", todas("siempre")));
  assert.equal(evaluadorSiempre.escalas.find((e) => e.escala === "SOC").raw, 8 * 1 + 2 * 4);

  // adultoAuto: invertidos 71-72, 74-75 y 80; directos 73 y 76-79
  const autoAdulto = calcularPuntuacion(config("adultoAuto", "30", todas("nunca")));
  assert.equal(autoAdulto.escalas.find((e) => e.escala === "SOC").raw, 5 * 4 + 5 * 1);
});
