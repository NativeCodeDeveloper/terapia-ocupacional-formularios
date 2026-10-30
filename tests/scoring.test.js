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

test("adolescente escolar (W-707F): la SOC se invierte en 71-79 y el 80 es directo", () => {
  const { escalas, tablaNorma } = calcularPuntuacion(
    config("adolescenteEscolar", "15", todas("nunca"))
  );
  assert.equal(tablaNorma, "adolescenteEscolar");
  const soc = escalas.find((e) => e.escala === "SOC");
  // 9 ítems invertidos en Nunca → 4 puntos c/u; el 80 directo en Nunca → 1
  assert.equal(soc.raw, 9 * 4 + 1);
  assert.equal(soc.t, 80);
  assert.equal(soc.pct, ">99");
  assert.equal(soc.rango, "Dificultades severas");

  const siempre = calcularPuntuacion(config("adolescenteEscolar", "15", todas("siempre")));
  const socSiempre = siempre.escalas.find((e) => e.escala === "SOC");
  assert.equal(socSiempre.raw, 9 * 1 + 4);
  assert.equal(socSiempre.rango, "Típico");
});

test("adolescente escolar (W-707F): conversión bruto → T en VIS, T&S, BAL y ST", () => {
  const LETRA = { 1: "nunca", 2: "ocasionalmente", 3: "frecuentemente", 4: "siempre" };
  const respuestas = todas("nunca");
  [4, 4, 4, 4, 4, 1, 1, 1, 1, 1].forEach((v, i) => { respuestas[i + 1] = LETRA[v]; }); // VIS 25
  [4, 4, 4, 4, 4, 4, 4, 1, 1, 1].forEach((v, i) => { respuestas[i + 31] = LETRA[v]; }); // T&S 31
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 1].forEach((v, i) => { respuestas[i + 51] = LETRA[v]; }); // BAL 37
  const { escalas } = calcularPuntuacion(config("adolescenteEscolar", "15", respuestas));

  const vis = escalas.find((e) => e.escala === "VIS");
  assert.equal(vis.raw, 25);
  assert.equal(vis.t, 70);
  assert.equal(vis.pct, 98);

  const ts = escalas.find((e) => e.escala === "TS");
  assert.equal(ts.raw, 31);
  assert.equal(ts.t, 75);
  assert.equal(ts.pct, 99);

  const bal = escalas.find((e) => e.escala === "BAL");
  assert.equal(bal.raw, 37);
  assert.equal(bal.t, 80);
  assert.equal(bal.pct, ">99");

  const st = escalas.find((e) => e.escala === "ST");
  assert.equal(st.raw, 25 + 31 + 37 + 10 + 10 + 10);
  assert.equal(st.t, 69);
  assert.equal(st.pct, 97);
});

test("adolescente y adulto: la SOC se invierte solo en los ítems positivos", () => {
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

/* ============================================================
   AUTOREPORTE ADOLESCENTE 12-21 (W-707G)
   80 ítems: la Participación Social (71-80) se invierte en
   71-74 y 77 (redactados en positivo); 75, 76 y 78-80 son
   directos, según la Scoring Worksheet del formulario.
   ============================================================ */

test("autoreporte adolescente (W-707G): SOC se invierte en 71-74 y 77; el 80 es directo", () => {
  const { escalas } = calcularPuntuacion(config("adolescenteAuto", "15", todas("nunca")));

  const soc = escalas.find((e) => e.escala === "SOC");
  assert.equal(soc.raw, 5 * 4 + 5 * 1, "invertidos 71-74 y 77 en Nunca; directos 75, 76 y 78-80");
  assert.equal(soc.t, 66);
  assert.equal(soc.pct, 95);
  assert.equal(soc.rango, "Dificultades moderadas");

  assert.equal(escalas.find((e) => e.escala === "VIS").raw, 10);
  // ST suma las 6 dimensiones sensoriales de 10 ítems cada una
  assert.equal(escalas.find((e) => e.escala === "ST").raw, 60);

  // Ítem 77 positivo: "Siempre" suma 1 (invertido), no 4
  const con77 = todas("nunca");
  con77[77] = "siempre";
  assert.equal(calcularPuntuacion(config("adolescenteAuto", "15", con77)).escalas.find((e) => e.escala === "SOC").raw, 25 - 4 + 1);

  // Ítem 75 negativo: "Siempre" suma 4 (directo), no 1
  const con75 = todas("nunca");
  con75[75] = "siempre";
  assert.equal(calcularPuntuacion(config("adolescenteAuto", "15", con75)).escalas.find((e) => e.escala === "SOC").raw, 25 - 1 + 4);

  // Ítem 80 directo ("hablo demasiado suavemente o con voz demasiado alta")
  const con80 = todas("nunca");
  con80[80] = "siempre";
  assert.equal(calcularPuntuacion(config("adolescenteAuto", "15", con80)).escalas.find((e) => e.escala === "SOC").raw, 25 - 1 + 4);

  const siempre = calcularPuntuacion(config("adolescenteAuto", "15", todas("siempre")));
  const socSiempre = siempre.escalas.find((e) => e.escala === "SOC");
  assert.equal(socSiempre.raw, 5 * 1 + 5 * 4);
  assert.equal(socSiempre.t, 66);
  assert.equal(socSiempre.pct, 95);
  assert.equal(socSiempre.rango, "Dificultades moderadas");
});

test("autoreporte adolescente (W-707G): en la hoja de resumen SOC 14 es T42 y PLN 12 es T43", () => {
  // SOC 14: 71-73 en Siempre (1 c/u), 74 y 77 en Ocasionalmente (3 c/u), resto en Nunca
  const respuestas = todas("nunca");
  respuestas[71] = "siempre";
  respuestas[72] = "siempre";
  respuestas[73] = "siempre";
  respuestas[74] = "ocasionalmente";
  respuestas[77] = "ocasionalmente";
  // PLN 12: dos ítems (61 y 62) en Ocasionalmente sobre la base de 10
  respuestas[61] = "ocasionalmente";
  respuestas[62] = "ocasionalmente";

  const { escalas } = calcularPuntuacion(config("adolescenteAuto", "15", respuestas));
  const soc = escalas.find((e) => e.escala === "SOC");
  assert.equal(soc.raw, 3 * 1 + 2 * 3 + 5 * 1, "invertidos 1+1+1+3+3 y directos 1×5");
  assert.equal(soc.t, 42);
  assert.equal(soc.pct, 21);

  const pln = escalas.find((e) => e.escala === "PLN");
  assert.equal(pln.raw, 12);
  assert.equal(pln.t, 43);
  assert.equal(pln.pct, 24);
});

/* ============================================================
   ESCOLAR NIÑOS 5-12 (W-708F)
   80 ítems: la Participación Social (71-80) se invierte completa
   (los diez ítems redactados en positivo), según la Scoring
   Worksheet del formulario; tabla normativa única 5-12 años.
   ============================================================ */

test("escolar niños (W-708F): la SOC se invierte en los 10 ítems", () => {
  const { escalas, tablaNorma } = calcularPuntuacion(config("childEscolar", "8", todas("nunca")));
  assert.equal(tablaNorma, "childEscolar");

  const soc = escalas.find((e) => e.escala === "SOC");
  assert.equal(soc.raw, 40, "nunca colabora debe sumar lo más alto");
  assert.equal(soc.t, 78);
  assert.equal(soc.pct, ">99");
  assert.equal(soc.rango, "Dificultades severas");

  const siempre = calcularPuntuacion(config("childEscolar", "8", todas("siempre")));
  const socSiempre = siempre.escalas.find((e) => e.escala === "SOC");
  assert.equal(socSiempre.raw, 10);
  assert.equal(socSiempre.t, 40);
  assert.equal(socSiempre.pct, 16);
  assert.equal(socSiempre.rango, "Típico");

  // El ítem 80 ("Demuestra respeto y cortesía...") también es invertido
  const con80 = todas("nunca");
  con80[80] = "siempre";
  assert.equal(
    calcularPuntuacion(config("childEscolar", "8", con80)).escalas.find((e) => e.escala === "SOC").raw,
    40 - 4 + 1
  );
});

test("escolar niños (W-708F): el resto de las escalas sigue directa", () => {
  const { escalas } = calcularPuntuacion(config("childEscolar", "8", todas("nunca")));
  for (const codigo of ["VIS", "HEA", "TOU", "TS", "BOD", "BAL", "PLN"]) {
    assert.equal(escalas.find((e) => e.escala === codigo).raw, 10, `${codigo} sigue directa`);
  }
  assert.equal(escalas.find((e) => e.escala === "ST").raw, 60);
});

test("escolar niños (W-708F): conversión bruto → T según la hoja de resumen", () => {
  const LETRA = { 1: "nunca", 2: "ocasionalmente", 3: "frecuentemente", 4: "siempre" };
  const respuestas = todas("nunca");
  [4, 4, 4, 4, 4, 2, 1, 1, 1, 1].forEach((v, i) => { respuestas[i + 1] = LETRA[v]; }); // VIS 26
  [4, 4, 4, 4, 4, 2, 1, 1, 1, 1].forEach((v, i) => { respuestas[i + 11] = LETRA[v]; }); // HEA 26
  [4, 4, 4, 4, 4, 4, 4, 1, 1, 1].forEach((v, i) => { respuestas[i + 31] = LETRA[v]; }); // T&S 31
  [4, 4, 4, 4, 1, 1, 1, 1, 1, 1].forEach((v, i) => { respuestas[i + 51] = LETRA[v]; }); // BAL 22
  const { escalas } = calcularPuntuacion(config("childEscolar", "8", respuestas));

  const vis = escalas.find((e) => e.escala === "VIS");
  assert.equal(vis.raw, 26);
  assert.equal(vis.t, 79);
  assert.equal(vis.pct, ">99");

  const hea = escalas.find((e) => e.escala === "HEA");
  assert.equal(hea.raw, 26);
  assert.equal(hea.t, 79);
  assert.equal(hea.pct, ">99");

  // T&S 31: dentro del rango 19-40 → T80
  const ts = escalas.find((e) => e.escala === "TS");
  assert.equal(ts.raw, 31);
  assert.equal(ts.t, 80);
  assert.equal(ts.pct, ">99");

  const bal = escalas.find((e) => e.escala === "BAL");
  assert.equal(bal.raw, 22);
  assert.equal(bal.t, 78);
  assert.equal(bal.pct, ">99");

  // ST = 26 + 26 + 10 + 31 + 10 + 22 = 125
  const st = escalas.find((e) => e.escala === "ST");
  assert.equal(st.raw, 125);
  assert.equal(st.t, 80);
  assert.equal(st.pct, ">99");

  // PLN 10 (base Nunca) → T40 y SOC 40 (invertida) → T78
  const pln = escalas.find((e) => e.escala === "PLN");
  assert.equal(pln.raw, 10);
  assert.equal(pln.t, 40);
  assert.equal(pln.pct, 16);

  const soc = escalas.find((e) => e.escala === "SOC");
  assert.equal(soc.raw, 40);
  assert.equal(soc.t, 78);
  assert.equal(soc.pct, ">99");
});

test("escolar niños (W-708F): caso moderado de la hoja de resumen", () => {
  // Todas Ocasionalmente: brutos 20 en las escalas directas, ST 120
  // y SOC 30 (invertida: cada ítem Ocasionalmente suma 3)
  const { escalas } = calcularPuntuacion(config("childEscolar", "8", todas("ocasionalmente")));

  const esperado = {
    VIS: { raw: 20, t: 68, pct: 96 },
    HEA: { raw: 20, t: 69, pct: 97 },
    TOU: { raw: 20, t: 80, pct: ">99" },
    TS: { raw: 20, t: 80, pct: ">99" },
    BOD: { raw: 20, t: 75, pct: 99 },
    BAL: { raw: 20, t: 74, pct: 99 },
    ST: { raw: 120, t: 78, pct: ">99" },
    PLN: { raw: 20, t: 62, pct: 88 },
    SOC: { raw: 30, t: 72, pct: 99 },
  };
  for (const [codigo, e] of Object.entries(esperado)) {
    const escala_ = escalas.find((x) => x.escala === codigo);
    assert.equal(escala_.raw, e.raw, `${codigo} bruto`);
    assert.equal(escala_.t, e.t, `${codigo} puntaje T`);
    assert.equal(escala_.pct, e.pct, `${codigo} percentil`);
  }
});
