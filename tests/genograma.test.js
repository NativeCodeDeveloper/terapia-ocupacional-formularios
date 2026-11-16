import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  TIPOS_RELACION,
  TIPOS_VINCULO,
  conexionAgregada,
  conexionEliminada,
  copiarParaEvaluacion,
  eliminarDeBiblioteca,
  filasDeIntegrantes,
  genogramaVacio,
  geometriaDeHijo,
  geometriaDePareja,
  guardarEnBiblioteca,
  etiquetaConexionesDe,
  leerBiblioteca,
  limitesDiagrama,
  normalizarGenograma,
  nuevaPersona,
  personaActualizada,
  personaEliminada,
  personaIndicada,
} from "../src/lib/genograma.js";
import { descargarInformePDFHogarPreescolar } from "../src/lib/informe-hogar-preescolar.js";
import { descargarInformePDFToddler } from "../src/lib/informe-toddler.js";
import { descargarInformePDF as descargarInformePDFInfantilEI } from "../src/lib/informe-ei-infantil.js";
import { construirInformeWordHTML } from "../src/lib/informe-evaluacion-inicial.js";

/* ============================================================
   GENOGRAMA FAMILIAR (OPCIONAL) EN LOS 19 FORMULARIOS
   - Modelo: estado vacío válido, personas, vínculos de pareja
     y descendencia, relaciones de calidad, normalización y
     biblioteca (sin navegador no hace nada y no falla).
   - Informes PDF: con genograma la sección aparece en los tres
     motores (SPM-2 / Perfil Sensorial 2 / Evaluación Inicial);
     sin genograma la sección no existe y el informe es igual
     al de siempre.
   - Informe Word: sección de integrantes solo cuando hay
     genograma.
   ============================================================ */

/* ---- Fixture: familia nuclear con usuario evaluado, una
   descendencia desde la línea de pareja y una relación de
   conflicto padre-hijo. ---- */
function genogramaFamiliar() {
  let g = nuevaPersona(
    nuevaPersona(nuevaPersona(nuevaPersona(genogramaVacio(), "hombre", { x: 180, y: 140 }), "mujer", { x: 380, y: 140 }), "hombre", { x: 220, y: 330 }),
    "mujer",
    { x: 420, y: 330 }
  );
  const [padre, madre, hijo, hija] = g.personas;
  g = personaActualizada(g, padre.id, { nombre: "Pedro Rojas", edad: "45", ocupacion: "Comerciante" });
  g = personaActualizada(g, madre.id, { nombre: "María Vargas", edad: "43" });
  g = personaActualizada(g, hijo.id, { nombre: "Tomás Rojas", edad: "12" });
  g = personaActualizada(g, hija.id, { nombre: "Lucía Rojas", edad: "9" });
  g = personaIndicada(g, hijo.id);
  const conPareja = conexionAgregada(g, "union", padre.id, madre.id);
  const pareja = conPareja.vinculos[0];
  g = conexionAgregada(conPareja, "hijo", pareja.id, hijo.id);
  g = conexionAgregada(g, "hijo", pareja.id, hija.id);
  g = conexionAgregada(g, "conflicto", padre.id, hijo.id);
  return { ...g, notas: "Familia nuclear; la abuela paterna cuida a los niños en las tardes." };
}

/* ============================================================
   MODELO
   ============================================================ */

test("el genograma vacío es un estado válido y completo", () => {
  const g = genogramaVacio();
  assert.deepEqual(g, { version: 1, personas: [], vinculos: [], relaciones: [], notas: "" });
  assert.equal(limitesDiagrama(g), null);
  assert.deepEqual(filasDeIntegrantes(g), []);
  assert.deepEqual(etiquetaConexionesDe(g, { id: "x" }), []);
});

test("agregar y editar personas conserva el resto", () => {
  let g = nuevaPersona(genogramaVacio(), "mujer", { x: 120, y: 120 });
  assert.equal(g.personas.length, 1);
  assert.equal(g.personas[0].sexo, "mujer");
  g = personaActualizada(g, g.personas[0].id, { nombre: "Ana Soto", edad: "38" });
  assert.equal(g.personas[0].nombre, "Ana Soto");
  assert.equal(g.personas[0].edad, "38");
});

test("personaEliminada reasigna la descendencia al otro integrante de la pareja", () => {
  let g = genogramaFamiliar();
  const madre = g.personas.find((p) => p.nombre === "María Vargas");
  const hija = g.personas.find((p) => p.nombre === "Lucía Rojas");
  const antes = g.vinculos.find((v) => v.tipo === "hijo" && v.a === hija.id);
  const parejaId = antes.de;
  const pareja = g.vinculos.find((v) => v.id === parejaId);
  const padreId = pareja.de === madre.id ? pareja.a : pareja.de;

  g = personaEliminada(g, madre.id);
  assert.equal(g.personas.some((p) => p.id === madre.id), false);
  const despues = g.vinculos.find((v) => v.tipo === "hijo" && v.a === hija.id);
  assert.equal(despues.de, padreId);
  assert.equal(geometriaDeHijo(g, despues) !== null, true);
});

test("conexionAgregada evita duplicados y reemplazos según el tipo", () => {
  let g = genogramaFamiliar();
  const [padre, madre] = g.personas;
  const parejasAntes = g.vinculos.filter((v) => v.tipo !== "hijo").length;

  // Mismo par en vínculo de pareja: no se duplica.
  g = conexionAgregada(g, "union", madre.id, padre.id);
  assert.equal(g.vinculos.filter((v) => v.tipo !== "hijo").length, parejasAntes);

  // Relación nueva del mismo par: reemplaza la anterior.
  const delPar = (gg) =>
    gg.relaciones.filter(
      (r) => (r.de === padre.id && r.a === madre.id) || (r.de === madre.id && r.a === padre.id)
    ).length;
  g = conexionAgregada(g, "cercana", padre.id, madre.id);
  assert.equal(delPar(g), 1);
  g = conexionAgregada(g, "distante", padre.id, madre.id);
  assert.equal(delPar(g), 1);
  assert.equal(g.relaciones.find((r) => (r.de === padre.id && r.a === madre.id) || (r.de === madre.id && r.a === padre.id)).tipo, "distante");

  // Segundo origen de descendencia para el mismo hijo: reemplaza.
  const hijo = g.personas.find((p) => p.nombre === "Tomás Rojas");
  g = conexionAgregada(g, "hijo", madre.id, hijo.id);
  assert.equal(g.vinculos.filter((v) => v.tipo === "hijo" && v.a === hijo.id).length, 1);
  assert.equal(g.vinculos.find((v) => v.tipo === "hijo" && v.a === hijo.id).de, madre.id);
});

test("conexionAgregada ignora conexiones imposibles", () => {
  const g = genogramaFamiliar();
  const [padre] = g.personas;
  const antes = JSON.stringify(g);
  assert.equal(JSON.stringify(conexionAgregada(g, "union", padre.id, padre.id)), antes);
  assert.equal(JSON.stringify(conexionAgregada(g, "union", "no-existe", padre.id)), antes);
  assert.equal(JSON.stringify(conexionAgregada(g, "hijo", "no-existe", padre.id)), antes);
  assert.equal(JSON.stringify(conexionAgregada(g, "tipo-inventado", padre.id, g.personas[1].id)), antes);
});

test("conexionEliminada quita el vínculo y deja el resto intacto", () => {
  let g = genogramaFamiliar();
  const conflicto = g.relaciones[0];
  g = conexionEliminada(g, conflicto.id);
  assert.equal(g.relaciones.length, 0);
  assert.equal(g.vinculos.length, 3); // pareja + dos descendencias
});

test("normalizarGenograma repara datos vacíos, incompletos o corruptos", () => {
  assert.deepEqual(normalizarGenograma(null), genogramaVacio());
  assert.deepEqual(normalizarGenograma(undefined), genogramaVacio());
  assert.deepEqual(normalizarGenograma("basura"), genogramaVacio());
  const reparado = normalizarGenograma({
    personas: [{ nombre: "X", sexo: "no-valido" }, null, { id: "p1", nombre: "Y", sexo: "mujer", x: 10, y: 20 }],
    vinculos: [{ tipo: "union", de: "fantasma", a: "p1" }, "mal"],
    relaciones: [{ tipo: "cercana", de: "p1", a: "fantasma" }],
    notas: 5,
  });
  assert.equal(reparado.personas.length, 2);
  assert.equal(reparado.personas[0].sexo, "hombre");
  assert.ok(Number.isFinite(reparado.personas[0].x));
  assert.equal(reparado.vinculos.length, 0); // el origen no existe
  assert.equal(reparado.relaciones.length, 0); // el destino no existe
  assert.equal(reparado.notas, "5");
});

test("copiarParaEvaluacion entrega una copia independiente", () => {
  const original = genogramaFamiliar();
  const copia = copiarParaEvaluacion(original);
  copia.personas[0].nombre = "Modificado";
  copia.personas.push({ id: "extra" });
  assert.equal(original.personas[0].nombre, "Pedro Rojas");
  assert.equal(original.personas.length, 4);
});

test("la biblioteca es inofensiva sin navegador (Node)", () => {
  assert.deepEqual(leerBiblioteca(), []);
  assert.equal(guardarEnBiblioteca(genogramaFamiliar(), "Familia Rojas"), null);
  assert.deepEqual(eliminarDeBiblioteca("cualquiera"), []);
});

test("los tipos de conexión cubren la pauta del genograma", () => {
  assert.deepEqual(TIPOS_VINCULO.map((t) => t.valor), [
    "union",
    "convivencia",
    "separacion",
    "divorcio",
    "hijo",
  ]);
  assert.deepEqual(TIPOS_RELACION.map((t) => t.valor), [
    "cercana",
    "fusion",
    "distante",
    "conflicto",
    "corte",
  ]);
});

test("la descripción textual de integrantes resume vínculos y relaciones", () => {
  const g = genogramaFamiliar();
  const filas = filasDeIntegrantes(g);
  const padre = filas.find((f) => f.nombre === "Pedro Rojas");
  const hijo = filas.find((f) => f.nombre === "Tomás Rojas");
  assert.match(padre.conexiones, /Pareja \(matrimonio o pareja estable\) de María Vargas/);
  assert.match(padre.conexiones, /Padre\/Madre de Tomás Rojas/);
  assert.match(hijo.conexiones, /Hijo\/a de Pedro Rojas y María Vargas/);
  assert.match(hijo.conexiones, /Relación de conflicto con Pedro Rojas/);
  assert.equal(hijo.observacion, "Usuario/a evaluado/a");
});

/* ============================================================
   GEOMETRÍA COMPARTIDA
   ============================================================ */

test("la línea de descendencia baja en codo desde la pareja al hijo", () => {
  const g = genogramaFamiliar();
  const hijo = g.personas.find((p) => p.nombre === "Tomás Rojas");
  const vinculo = g.vinculos.find((v) => v.tipo === "hijo" && v.a === hijo.id);
  const ruta = geometriaDeHijo(g, vinculo);
  assert.ok(ruta.recorrido.length >= 2);
  const ultimo = ruta.recorrido[ruta.recorrido.length - 1];
  assert.equal(ultimo.x, hijo.x);
  assert.equal(ultimo.y, hijo.y - 16); // borde superior de la figura
  const pareja = geometriaDePareja(g, g.vinculos[0]);
  assert.equal(pareja.discontinua, false);
  assert.equal(pareja.barras, null);
});

/* ============================================================
   INFORMES PDF · CON Y SIN GENOGRAMA
   Extrae el texto dibujado de los flujos de contenido sin
   comprimir de jsPDF (mismo método que los demás tests).
   ============================================================ */

const WINANSI_UNICODE = { "": "‘", "": "’", "": "“", "": "”", "": "•", "": "–", "": "—", "": "…" };

function extraerTextoPDF(ruta) {
  const raw = fs.readFileSync(ruta, "latin1");
  const fragmentos = [];
  const re = /\((?:\\.|[^()\\])*\)/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const crudo = m[0].slice(1, -1).replace(/\\([()\\])/g, "$1");
    fragmentos.push(crudo.replace(/[\x91-\x97\x85]/g, (c) => WINANSI_UNICODE[c] ?? c));
  }
  return fragmentos.join(" ").replace(/\s+/g, " ").trim();
}

function generarEnTemporal(nombre, descargar) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "genograma-"));
  const cwd = process.cwd();
  process.chdir(tmp);
  try {
    descargar();
  } finally {
    process.chdir(cwd);
  }
  const ruta = path.join(tmp, nombre);
  assert.equal(fs.existsSync(ruta), true, `No se generó ${nombre}`);
  return extraerTextoPDF(ruta);
}

/* ---- SPM-2 HOGAR Preescolar (representa los formularios 1-9) ---- */

const OPCIONES_SPM2 = [
  { valor: "nunca", etiqueta: "NUNCA", descripcion: "", puntaje: 1 },
  { valor: "ocasionalmente", etiqueta: "OCASIONALMENTE", descripcion: "", puntaje: 2 },
  { valor: "frecuentemente", etiqueta: "FRECUENTEMENTE", descripcion: "", puntaje: 3 },
  { valor: "siempre", etiqueta: "SIEMPRE", descripcion: "", puntaje: 4 },
];

const SECCIONES_SPM2 = [
  "VISIÓN",
  "OÍDO",
  "TACTO",
  "GUSTO Y OLFATO",
  "CONCIENCIA CORPORAL",
  "EQUILIBRIO Y MOVIMIENTO",
  "PLANIFICACIÓN E IDEAS",
  "PARTICIPACIÓN SOCIAL",
].map((titulo) => ({
  titulo,
  preguntas: Array.from({ length: 10 }, (_v, i) => `Ítem ${i + 1} de ${titulo}.`),
}));

const RESPUESTAS_SPM2 = Object.fromEntries(
  Array.from({ length: 80 }, (_v, i) => [i + 1, "nunca"])
);

const CONFIG_HOGAR = {
  nombreArchivo: "Informe-SPM-2-Genograma-Test",
  instrumento: "SPM-2 HOGAR · Niños 2 - 5 años",
  norma: "preescolar",
  datos: [
    { etiqueta: "Nombre del Niño o Niña", valor: "Tomás Rojas" },
    { etiqueta: "Edad", valor: "3" },
    { etiqueta: "Nombre de quién responde", valor: "María Vargas" },
    { etiqueta: "Relación con el niño o niña", valor: "Madre" },
    { etiqueta: "Nombre del/la Profesional", valor: "C. Torres" },
  ],
  secciones: SECCIONES_SPM2,
  respuestas: RESPUESTAS_SPM2,
  opciones: OPCIONES_SPM2,
};

test("SPM-2: el informe incluye el genograma cuando existe y no lo menciona cuando no", () => {
  const conGenograma = generarEnTemporal("Informe-SPM-2-Genograma-Test.pdf", () =>
    descargarInformePDFHogarPreescolar({ ...CONFIG_HOGAR, genograma: genogramaFamiliar() })
  );
  assert.match(conGenograma, /Genograma familiar/);
  assert.match(conGenograma, /VÍNCULOS Y RELACIONES/);
  assert.match(conGenograma, /Pedro Rojas/);
  assert.match(conGenograma, /Hijo\/a de Pedro Rojas y María Vargas/);
  assert.match(conGenograma, /abuela paterna cuida a los niños/);
  assert.match(conGenograma, /Cuadrado: hombre/);

  const sinGenograma = generarEnTemporal("Informe-SPM-2-Genograma-Test.pdf", () =>
    descargarInformePDFHogarPreescolar(CONFIG_HOGAR)
  );
  assert.doesNotMatch(sinGenograma, /Genograma familiar/);
  assert.match(sinGenograma, /Firma del\/la profesional/);
});

/* ---- Toddler Sensory Profile 2 (representa los formularios 10-15) ---- */

const OPCIONES_TODDLER = [
  { valor: "casiSiempre", etiqueta: "CASI SIEMPRE O SIEMPRE", puntaje: 5 },
  { valor: "frecuentemente", etiqueta: "FRECUENTEMENTE", puntaje: 4 },
  { valor: "laMitad", etiqueta: "LA MITAD DE LAS VECES", puntaje: 3 },
  { valor: "ocasionalmente", etiqueta: "OCASIONALMENTE", puntaje: 2 },
  { valor: "casiNunca", etiqueta: "CASI NUNCA", puntaje: 1 },
];

const SECCIONES_TODDLER = (() => {
  const titulos = [
    "Procesamiento General",
    "Procesamiento Auditivo",
    "Procesamiento Visual",
    "Procesamiento Táctil",
    "Procesamiento de Movimiento",
    "Procesamiento Sensorial Oral",
    "Respuestas de Comportamiento asociadas con el procesamiento sensorial",
  ];
  const cuadrantesPorSeccion = [
    ["SE", "SE", "EV", null, null, null, null, null, "RE", "EV"],
    ["RE", "RE", "SE", "RE", "RE", "SE", null],
    ["BU", "BU", "BU", null, null, "RE", "RE", "RE"],
    ["SE", "EV", "EV", "EV", "RE", "SE", "BU", "EV", "SE", "EV"],
    ["BU", "BU", "BU", "SE", "RE", "SE"],
    ["EV", null, "SE", "RE", "SE", null, "SE"],
    ["EV", null, null, "SE", "EV", "EV"],
  ];
  let numero = 0;
  return cuadrantesPorSeccion.map((cuadrantes, si) => ({
    titulo: titulos[si],
    preguntas: cuadrantes.map((cuadrante) => {
      numero += 1;
      return { texto: `Pregunta ${numero}.`, cuadrante, soloCuadrante: false };
    }),
  }));
})();

const RESPUESTAS_TODDLER = Object.fromEntries(
  Array.from({ length: 54 }, (_v, i) => [i + 1, "casiNunca"])
);

const CONFIG_TODDLER = {
  nombreArchivo: "Informe-Toddler-Genograma-Test",
  instrumento: "PERFIL SENSORIAL 2 TODDLER",
  intro: "Texto de introducción del formulario Toddler.",
  datos: [{ etiqueta: "Nombre del niño o niña", valor: "Tomás Rojas" }],
  secciones: SECCIONES_TODDLER,
  respuestas: RESPUESTAS_TODDLER,
  opciones: OPCIONES_TODDLER,
};

test("Perfil Sensorial 2: el informe incluye el genograma cuando existe y no lo menciona cuando no", () => {
  const conGenograma = generarEnTemporal("Informe-Toddler-Genograma-Test.pdf", () =>
    descargarInformePDFToddler({ ...CONFIG_TODDLER, genograma: genogramaFamiliar() })
  );
  assert.match(conGenograma, /Genograma familiar/);
  assert.match(conGenograma, /María Vargas/);
  assert.match(conGenograma, /usuario\/a/);

  const sinGenograma = generarEnTemporal("Informe-Toddler-Genograma-Test.pdf", () =>
    descargarInformePDFToddler(CONFIG_TODDLER)
  );
  assert.doesNotMatch(sinGenograma, /Genograma familiar/);
  assert.match(sinGenograma, /Firma del\/la examinador/);
});

/* ---- Evaluación Inicial · Infantil (representa los formularios 16-19) ---- */

const VALORES_EI = {
  nombre: "Tomás Rojas",
  run: "12.345.678-9",
  fechaNacimiento: "2014-03-04",
  edad: "12",
  nombreTutor: "María Vargas",
  direccion: "Pasaje Los Aromos 1234, Santiago",
  telefono: "+56 9 8765 4321",
  escolaridad: "6° básico",
};

test("Evaluación Inicial: el informe PDF incluye el genograma cuando existe y no lo menciona cuando no", () => {
  const conGenograma = generarEnTemporal("Informe-Evaluacion-Inicial-Infantil.pdf", () =>
    descargarInformePDFInfantilEI(VALORES_EI, genogramaFamiliar())
  );
  assert.match(conGenograma, /Genograma familiar/);
  assert.match(conGenograma, /Lucía Rojas/);
  assert.match(conGenograma, /Nota general del genograma/);

  const sinGenograma = generarEnTemporal("Informe-Evaluacion-Inicial-Infantil.pdf", () =>
    descargarInformePDFInfantilEI(VALORES_EI)
  );
  assert.doesNotMatch(sinGenograma, /Genograma familiar/);
  assert.match(sinGenograma, /Plan de intervención/);
});

/* ============================================================
   INFORME WORD · SECCIÓN SOLO CON GENOGRAMA
   ============================================================ */

const CONFIG_WORD_BASE = {
  nombreArchivo: "Informe-Word-Test",
  titulo: "Informe de prueba",
  secciones: [],
  valores: {},
  sintesis: [],
};

test("el informe Word incluye los integrantes solo cuando hay genograma", () => {
  const conGenograma = construirInformeWordHTML({ ...CONFIG_WORD_BASE, genograma: genogramaFamiliar() });
  assert.match(conGenograma, /Genograma familiar/);
  assert.match(conGenograma, /Vínculos y relaciones/);
  assert.match(conGenograma, /Pedro Rojas/);

  const sinGenograma = construirInformeWordHTML(CONFIG_WORD_BASE);
  assert.doesNotMatch(sinGenograma, /Genograma familiar/);
});
