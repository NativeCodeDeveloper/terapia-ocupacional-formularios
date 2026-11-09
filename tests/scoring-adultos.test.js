import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcularPuntuacionAdultos,
  clasificarFila,
  grupoEdadPara,
  GRUPOS_EDAD,
} from "../src/lib/informe-adultos.js";

/* ============================================================
   PERFIL SENSORIAL ADOLESCENTES Y ADULTOS · AUTOINFORME
   60 ítems en 6 secciones (8+8+10+13+10+11), todos con
   cuadrante de 15 ítems (/75): RE Bajo Registro, BU Búsqueda
   Sensorial, SE Sensibilidad Sensorial y EV Evitación
   Sensorial (hoja de puntaje). Escala Casi nunca=1 … Casi
   siempre=5 (sin No aplicable): el mínimo por cuadrante es 15.
   La clasificación usa el gráfico normativo del grupo de edad:
   11-17, 18-64 o 65 años o más. Las secciones son
   referenciales y no se clasifican.
   ============================================================ */

const OPCIONES = [
  { valor: "casiNunca", etiqueta: "CASI NUNCA", puntaje: 1 },
  { valor: "raramente", etiqueta: "RARAMENTE", puntaje: 2 },
  { valor: "aVeces", etiqueta: "A VECES", puntaje: 3 },
  { valor: "frecuentemente", etiqueta: "FRECUENTEMENTE", puntaje: 4 },
  { valor: "casiSiempre", etiqueta: "CASI SIEMPRE", puntaje: 5 },
];

const TITULOS = [
  "Procesamiento Gusto/Olfato", // 8 ítems (1-8)
  "Procesamiento Movimiento", // 8 ítems (9-16)
  "Procesamiento Visual", // 10 ítems (17-26)
  "Procesamiento Tacto", // 13 ítems (27-39)
  "Nivel de Actividad", // 10 ítems (40-49)
  "Procesamiento Auditivo", // 11 ítems (50-60)
];

const CUADRANTES_SECCION = [
  ["EV", "BU", "RE", "BU", "EV", "RE", "SE", "BU"], // Gusto/Olfato
  ["SE", "BU", "EV", "RE", "SE", "BU", "RE", "SE"], // Movimiento
  ["BU", "EV", "BU", "SE", "RE", "SE", "RE", "EV", "SE", "EV"], // Visual
  ["SE", "BU", "EV", "BU", "SE", "BU", "SE", "SE", "EV", "RE", "RE", "EV", "RE"], // Tacto
  ["BU", "RE", "BU", "EV", "RE", "RE", "EV", "BU", "SE", "EV"], // Nivel de Actividad
  ["BU", "SE", "RE", "EV", "SE", "RE", "EV", "EV", "BU", "RE", "SE"], // Auditivo
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

const config = (respuestas, edadAnos) => ({
  secciones,
  respuestas,
  opciones: OPCIONES,
  valores: { edadAnos },
});

test("todas Casi nunca con edad 30 → cuadrantes en 15, Mucho menos", () => {
  const r = calcularPuntuacionAdultos(config(todas("casiNunca"), "30"));
  assert.equal(r.total, 60);
  assert.equal(r.totalMaximo, 300);
  assert.deepEqual(r.totalesCuadrante, { RE: 15, BU: 15, SE: 15, EV: 15 });
  assert.equal(r.dominantes.length, 4);
  assert.deepEqual(r.secciones.map((s) => s.raw), [8, 8, 10, 13, 10, 11]);
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.clasificacion?.nombre),
    [
      "Mucho menos que la mayoría de las personas", // Bajo Registro 15 (15-18)
      "Mucho menos que la mayoría de las personas", // Búsqueda 15 (15-35)
      "Mucho menos que la mayoría de las personas", // Sensibilidad 15 (15-18)
      "Mucho menos que la mayoría de las personas", // Evitación 15 (15-19)
    ]
  );
});

test("todas Casi siempre → cuadrantes en 75, Mucho más", () => {
  const r = calcularPuntuacionAdultos(config(todas("casiSiempre"), "45"));
  assert.equal(r.total, 300);
  assert.deepEqual(r.totalesCuadrante, { RE: 75, BU: 75, SE: 75, EV: 75 });
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.clasificacion?.nombre),
    Array(4).fill("Mucho más que la mayoría de las personas")
  );
});

test("el grupo de edad cambia la banda: mismas respuestas, tres edades", () => {
  // Todas A veces → 45 en cada cuadrante.
  const respuestas = todas("aVeces");
  const nombres = (edad) =>
    calcularPuntuacionAdultos(config(respuestas, edad))
      .filasClasificacion.map((f) => f.clasificacion?.nombre);
  assert.deepEqual(nombres("15"), [
    "Más que la mayoría de las personas", // RE 45 (41-51)
    "Similar a la mayoría de las personas", // BU 45 (42-58)
    "Más que la mayoría de las personas", // SE 45 (41-48)
    "Más que la mayoría de las personas", // EV 45 (41-48)
  ]);
  assert.deepEqual(nombres("30"), [
    "Mucho más que la mayoría de las personas", // RE 45 (45-75)
    "Similar a la mayoría de las personas", // BU 45 (43-56)
    "Más que la mayoría de las personas", // SE 45 (42-48)
    "Más que la mayoría de las personas", // EV 45 (42-49)
  ]);
  assert.deepEqual(nombres("70"), [
    "Más que la mayoría de las personas", // RE 45 (41-51)
    "Similar a la mayoría de las personas", // BU 45 (40-52)
    "Más que la mayoría de las personas", // SE 45 (42-48)
    "Más que la mayoría de las personas", // EV 45 (43-49)
  ]);
});

test("sin edad válida los cuadrantes quedan sin clasificar", () => {
  for (const edad of [undefined, "", "10", "abc"]) {
    const r = calcularPuntuacionAdultos(config(todas("casiNunca"), edad));
    assert.equal(r.grupoEdad, null, `edad ${edad}`);
    assert.deepEqual(
      r.filasClasificacion.map((f) => f.clasificacion),
      [null, null, null, null],
      `edad ${edad}`
    );
    assert.deepEqual(r.filasClasificacion.map((f) => f.bruto), [15, 15, 15, 15]);
  }
});

test("grupoEdadPara asigna los rangos de la pauta", () => {
  assert.equal(grupoEdadPara(11)?.id, "11-17");
  assert.equal(grupoEdadPara(17)?.id, "11-17");
  assert.equal(grupoEdadPara(18)?.id, "18-64");
  assert.equal(grupoEdadPara(64)?.id, "18-64");
  assert.equal(grupoEdadPara(65)?.id, "65");
  assert.equal(grupoEdadPara(90)?.id, "65");
  assert.equal(grupoEdadPara(10), null);
});

test("caso de regresión: total 91 con Búsqueda predominante", () => {
  // RE 22 (3=3, 12=2, 55=5) · BU 24 (2=4, 40=5, 58=3) ·
  // SE 22 (9=5, 27=4) · EV 23 (1=5, 18=4, 43=2). Edad 30.
  const L = { 1: "casiNunca", 2: "raramente", 3: "aVeces", 4: "frecuentemente", 5: "casiSiempre" };
  const respuestas = todas("casiNunca");
  const pon = (idx, v) => { respuestas[idx] = L[v]; };
  pon(1, 5); pon(2, 4); pon(3, 3);
  pon(9, 5); pon(12, 2);
  pon(18, 4);
  pon(27, 4);
  pon(40, 5); pon(43, 2);
  pon(55, 5); pon(58, 3);

  const r = calcularPuntuacionAdultos(config(respuestas, "30"));
  assert.deepEqual(r.secciones.map((s) => s.raw), [17, 13, 13, 16, 15, 17]);
  assert.equal(r.total, 91);
  assert.deepEqual(r.totalesCuadrante, { RE: 22, BU: 24, SE: 22, EV: 23 });
  assert.equal(r.dominantes.length, 1);
  assert.equal(r.dominantes[0].codigo, "BU");
  assert.deepEqual(
    r.filasClasificacion.map((f) => f.clasificacion?.nombre),
    [
      "Menos que la mayoría de las personas", // Bajo Registro 22 (19-23)
      "Mucho menos que la mayoría de las personas", // Búsqueda 24 (15-35)
      "Menos que la mayoría de las personas", // Sensibilidad 22 (19-25)
      "Menos que la mayoría de las personas", // Evitación 23 (20-26)
    ]
  );
});

test("cada grupo normativo es contiguo y arranca en 15", () => {
  for (const grupo of GRUPOS_EDAD) {
    assert.equal(grupo.tabla.length, 4, grupo.id);
    for (const fila of grupo.tabla) {
      let esperado = 15;
      assert.equal(fila.maximo, 75, `${grupo.id} ${fila.nombre}`);
      for (const corte of fila.cortes) {
        assert.equal(corte.min, esperado, `${grupo.id} ${fila.nombre}: inicio de ${corte.nombre}`);
        esperado = corte.max + 1;
      }
      assert.equal(esperado, 76, `${grupo.id} ${fila.nombre}: cobertura hasta el máximo`);
    }
  }
});

test("clasificación en los límites de cada banda y grupo", () => {
  for (const grupo of GRUPOS_EDAD) {
    for (const fila of grupo.tabla) {
      fila.cortes.forEach((corte, i) => {
        const previo = fila.cortes[i - 1];
        const siguiente = fila.cortes[i + 1];
        assert.equal(clasificarFila(fila, corte.min)?.nombre, corte.nombre, `${grupo.id} ${fila.nombre} ${corte.min}`);
        assert.equal(clasificarFila(fila, corte.max)?.nombre, corte.nombre, `${grupo.id} ${fila.nombre} ${corte.max}`);
        if (previo) {
          assert.equal(
            clasificarFila(fila, corte.min - 1)?.nombre,
            previo.nombre,
            `${grupo.id} ${fila.nombre} ${corte.min - 1}`
          );
        }
        if (siguiente) {
          assert.equal(
            clasificarFila(fila, corte.max + 1)?.nombre,
            siguiente.nombre,
            `${grupo.id} ${fila.nombre} ${corte.max + 1}`
          );
        }
      });
      assert.equal(
        clasificarFila(fila, fila.maximo)?.nombre,
        fila.cortes[fila.cortes.length - 1].nombre,
        `${grupo.id} ${fila.nombre} máximo`
      );
    }
  }
});
