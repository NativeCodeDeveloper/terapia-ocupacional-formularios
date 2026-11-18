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
  envolverTexto,
  geometriaDeGrupo,
  filasDeIntegrantes,
  genogramaVacio,
  geometriaDePareja,
  geometriaDeRelacion,
  guardarEnBiblioteca,
  etiquetaConexionesDe,
  grupoAgregado,
  leerBiblioteca,
  limitesDiagrama,
  listaDeAbreviaturas,
  normalizarGenograma,
  nuevaPersona,
  personaActualizada,
  personaEliminada,
  personaIndicada,
  rutasDeDescendencia,
} from "../src/lib/genograma.js";
import { descargarInformePDFHogarPreescolar } from "../src/lib/informe-hogar-preescolar.js";
import { descargarInformePDFToddler } from "../src/lib/informe-toddler.js";
import { descargarInformePDF as descargarInformePDFInfantilEI } from "../src/lib/informe-ei-infantil.js";
import { construirInformeWordHTML } from "../src/lib/informe-evaluacion-inicial.js";

/* ============================================================
   GENOGRAMA FAMILIAR (OPCIONAL) · EVALUACIONES INICIALES
   - Modelo: estado vacío válido, personas, vínculos de pareja
     y descendencia, relaciones de calidad, normalización y
     biblioteca (sin navegador no hace nada y no falla).
   - Informes PDF: la sección del genograma es propia de las
     fichas de Evaluación Inicial (motor común informe-ei-*).
     Con genograma el informe lo incorpora; sin genograma la
     sección no existe y el informe es igual al de siempre.
     Los informes de SPM-2 y Perfil Sensorial 2 no incorporan
     genograma (el componente no se ofrece en esos formularios).
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
  assert.deepEqual(g, { version: 1, personas: [], vinculos: [], relaciones: [], grupos: [], notas: "" });
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
  assert.equal(rutasDeDescendencia(g).some((r) => r.id === despues.id && r.recorrido.length >= 2), true);
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

  // El hijo ya desciende de la línea de pareja: vincularlo a un
  // miembro de esa pareja es redundante y no agrega vínculos.
  const hijo = g.personas.find((p) => p.nombre === "Tomás Rojas");
  const descendenciasAntes = g.vinculos.filter((v) => v.tipo === "hijo" && v.a === hijo.id).length;
  g = conexionAgregada(g, "hijo", madre.id, hijo.id);
  assert.equal(g.vinculos.filter((v) => v.tipo === "hijo" && v.a === hijo.id).length, descendenciasAntes);
  g = conexionAgregada(g, "hijo", padre.id, hijo.id);
  assert.equal(g.vinculos.filter((v) => v.tipo === "hijo" && v.a === hijo.id).length, descendenciasAntes);
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

test("la descendencia comparte tallo y guía entre hermanos y llega al techo del hijo", () => {
  const g = genogramaFamiliar();
  const hijo = g.personas.find((p) => p.nombre === "Tomás Rojas");
  const hija = g.personas.find((p) => p.nombre === "Lucía Rojas");
  const vinculoHijo = g.vinculos.find((v) => v.tipo === "hijo" && v.a === hijo.id);
  const vinculoHija = g.vinculos.find((v) => v.tipo === "hijo" && v.a === hija.id);
  const rutas = rutasDeDescendencia(g);

  // Cada vínculo termina en el borde superior de su figura.
  const caidaHijo = rutas.find((r) => r.clave === `${vinculoHijo.id}-caida`);
  const caidaHija = rutas.find((r) => r.clave === `${vinculoHija.id}-caida`);
  assert.ok(caidaHijo);
  assert.ok(caidaHija);
  const llegadaHijo = caidaHijo.recorrido[caidaHijo.recorrido.length - 1];
  const llegadaHija = caidaHija.recorrido[caidaHija.recorrido.length - 1];
  assert.deepEqual(llegadaHijo, { x: hijo.x, y: hijo.y - 20 });
  assert.deepEqual(llegadaHija, { x: hija.x, y: hija.y - 20 });

  // Ambas caídas cuelgan de la misma guía horizontal.
  assert.equal(caidaHijo.recorrido[0].y, caidaHija.recorrido[0].y);

  // La guía nace del punto medio de la línea de pareja.
  const pareja = geometriaDePareja(g, g.vinculos[0]);
  const guia = rutas.find((r) => r.clave.endsWith("-guia"));
  assert.deepEqual(guia.recorrido[0], pareja.medio);
  assert.equal(pareja.discontinua, false);
  assert.equal(pareja.barras, null);
});

test("un hijo puede descender de dos progenitores y las caídas se separan", () => {
  let g = nuevaPersona(
    nuevaPersona(nuevaPersona(genogramaVacio(), "hombre", { x: 180, y: 140 }), "mujer", { x: 380, y: 140 }),
    "hombre",
    { x: 280, y: 340 }
  );
  const [jose, maria, hijo] = g.personas;
  g = personaActualizada(g, jose.id, { nombre: "José" });
  g = personaActualizada(g, maria.id, { nombre: "María" });
  g = personaActualizada(g, hijo.id, { nombre: "Hijo común" });
  g = conexionAgregada(g, "hijo", jose.id, hijo.id);
  g = conexionAgregada(g, "hijo", maria.id, hijo.id);

  const origenes = g.vinculos.filter((v) => v.tipo === "hijo" && v.a === hijo.id);
  assert.equal(origenes.length, 2);

  // Cada progenitor tiene su propia caída, a un costado del techo.
  const caidas = rutasDeDescendencia(g).filter((r) => origenes.some((o) => o.id === r.id));
  assert.equal(caidas.length, 2);
  const xs = caidas.map((r) => r.recorrido[r.recorrido.length - 1].x).sort((a, b) => a - b);
  assert.equal(xs[0] < hijo.x && xs[1] > hijo.x, true);

  // La descripción textual nombra a ambos progenitores.
  const fila = filasDeIntegrantes(g).find((f) => f.nombre === "Hijo común");
  assert.match(fila.conexiones, /Hijo\/a de José/);
  assert.match(fila.conexiones, /Hijo\/a de María/);
});

test("la relación de calidad se dibuja junto a la línea de pareja, no encima", () => {
  let g = nuevaPersona(nuevaPersona(genogramaVacio(), "hombre", { x: 200, y: 200 }), "mujer", { x: 400, y: 200 });
  const [a, b] = g.personas;
  g = conexionAgregada(g, "union", a.id, b.id);
  g = conexionAgregada(g, "conflicto", a.id, b.id);

  const pareja = geometriaDePareja(g, g.vinculos[0]);
  const relacion = geometriaDeRelacion(g, g.relaciones[0]);
  const distancia = Math.hypot(
    relacion.inicio.x - pareja.inicio.x,
    relacion.inicio.y - pareja.inicio.y
  );
  assert.equal(distancia > 5, true);

  // Sin vínculo de pareja la relación va borde a borde.
  let solos = nuevaPersona(nuevaPersona(genogramaVacio(), "hombre", { x: 200, y: 200 }), "mujer", { x: 400, y: 200 });
  const [c, d] = solos.personas;
  solos = conexionAgregada(solos, "conflicto", c.id, d.id);
  const directa = geometriaDeRelacion(solos, solos.relaciones[0]);
  assert.deepEqual(
    { x: Math.round(directa.inicio.x), y: Math.round(directa.inicio.y) },
    { x: 220, y: 200 }
  );
});

test("envolverTexto parte las etiquetas largas y recorta con puntos suspensivos", () => {
  assert.deepEqual(envolverTexto("diabetes", 26, 3), ["diabetes"]);
  assert.deepEqual(envolverTexto("diabetes e hipertensión arterial", 12, 3), [
    "diabetes e",
    "hipertensión",
    "arterial",
  ]);
  const lineas = envolverTexto("una dos tres cuatro cinco seis siete ocho", 10, 2);
  assert.equal(lineas.length, 2);
  assert.equal(lineas[1].endsWith("…"), true);
  assert.deepEqual(envolverTexto("   ", 26, 3), []);
});

test("los hijos de una pareja cuelgan de una sola línea continua", () => {
  let g = nuevaPersona(
    nuevaPersona(nuevaPersona(genogramaVacio(), "hombre", { x: 180, y: 140 }), "mujer", { x: 380, y: 140 }),
    "hombre",
    { x: 280, y: 340 }
  );
  const [jose, maria, hijo] = g.personas;
  g = personaActualizada(g, jose.id, { nombre: "José" });
  g = personaActualizada(g, maria.id, { nombre: "María" });
  g = personaActualizada(g, hijo.id, { nombre: "Hijo común" });
  g = conexionAgregada(g, "union", jose.id, maria.id);
  const parejaId = g.vinculos[0].id;
  g = conexionAgregada(g, "hijo", jose.id, hijo.id);
  g = conexionAgregada(g, "hijo", maria.id, hijo.id);

  // La descendencia se canonicaliza a la línea de pareja.
  const descendencias = g.vinculos.filter((v) => v.tipo === "hijo" && v.a === hijo.id);
  assert.equal(descendencias.length, 1);
  assert.equal(descendencias[0].de, parejaId);

  // Una sola ruta, desde el punto medio de la pareja hasta el hijo.
  const rutas = rutasDeDescendencia(g);
  assert.equal(rutas.length, 1);
  const pareja = geometriaDePareja(g, g.vinculos[0]);
  assert.deepEqual(rutas[0].recorrido[0], pareja.medio);
  assert.deepEqual(rutas[0].recorrido[rutas[0].recorrido.length - 1], { x: hijo.x, y: hijo.y - 20 });
});

test("datos guardados con vínculos directos a ambos progenitores se dibujan como una línea", () => {
  let g = nuevaPersona(
    nuevaPersona(nuevaPersona(genogramaVacio(), "hombre", { x: 180, y: 140 }), "mujer", { x: 380, y: 140 }),
    "hombre",
    { x: 280, y: 340 }
  );
  const [jose, maria, hijo] = g.personas;
  g = conexionAgregada(g, "union", jose.id, maria.id);
  const parejaId = g.vinculos[0].id;
  // Datos legados: dos vínculos persona a persona sin canonicalizar.
  g = {
    ...g,
    vinculos: [
      ...g.vinculos,
      { id: "v-jose", tipo: "hijo", de: jose.id, a: hijo.id },
      { id: "v-maria", tipo: "hijo", de: maria.id, a: hijo.id },
    ],
  };

  // Al normalizar se canonicaliza a la línea de pareja.
  const reparado = normalizarGenograma(g);
  const descendencias = reparado.vinculos.filter((v) => v.tipo === "hijo" && v.a === hijo.id);
  assert.equal(descendencias.length, 1);
  assert.equal(descendencias[0].de, parejaId);

  // Y aunque no se normalice, el dibujo es una sola línea.
  const rutas = rutasDeDescendencia(g);
  assert.equal(rutas.length, 1);
  assert.deepEqual(rutas[0].recorrido[rutas[0].recorrido.length - 1], { x: hijo.x, y: hijo.y - 20 });
});

test("las patologías principales se guardan y aparecen en la tabla", () => {
  let g = nuevaPersona(genogramaVacio(), "mujer", { x: 120, y: 120 });
  assert.equal(g.personas[0].patologiasAbrev, "");
  g = personaActualizada(g, g.personas[0].id, {
    patologiasAbrev: "DM, HTA",
    patologias: "Diabetes tipo 2 e hipertensión",
  });
  const fila = filasDeIntegrantes(g)[0];
  assert.match(fila.observacion, /DM, HTA/);
  assert.match(fila.observacion, /Diabetes tipo 2/);
  const reparado = normalizarGenograma({
    personas: [{ id: "p1", sexo: "mujer", patologiasAbrev: "TDAH" }],
    vinculos: [],
    relaciones: [],
  });
  assert.equal(reparado.personas[0].patologiasAbrev, "TDAH");
});

test("las abreviaturas se separan por coma y se listan una por línea", () => {
  assert.deepEqual(listaDeAbreviaturas({ patologiasAbrev: "HTA, DM2, TDAH" }), ["HTA", "DM2", "TDAH"]);
  // Sin coma, la línea completa es un solo ítem.
  assert.deepEqual(listaDeAbreviaturas({ patologiasAbrev: "HTA DM2" }), ["HTA DM2"]);
  // Ignora vacíos y corta en cuatro ítems con «…» en el último.
  assert.deepEqual(listaDeAbreviaturas({ patologiasAbrev: " a , , b , c , d , e " }), ["a", "b", "c", "d…"]);
  assert.deepEqual(listaDeAbreviaturas({}), []);
  assert.deepEqual(listaDeAbreviaturas(null), []);
});

test("el contorno de convivencia rodea a sus integrantes y deja fuera a quien vive aparte", () => {
  let g = nuevaPersona(
    nuevaPersona(
      nuevaPersona(nuevaPersona(genogramaVacio(), "hombre", { x: 200, y: 200 }), "mujer", { x: 500, y: 200 }),
      "hombre",
      { x: 400, y: 300 }
    ),
    "hombre",
    { x: 320, y: 320 }
  );
  const [samuel, cristina, marcelo, felipe] = g.personas;
  g = grupoAgregado(g, [samuel.id, cristina.id, marcelo.id]);
  assert.equal(g.grupos.length, 1);
  assert.deepEqual(g.grupos[0].integrantes, [samuel.id, cristina.id, marcelo.id]);

  const geo = geometriaDeGrupo(g, g.grupos[0]);
  assert.ok(geo);

  /* Prueba de punto en polígono (ray casting). */
  const dentro = (px, py) => {
    let adentro = false;
    const pts = geo.puntos;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const a = pts[i];
      const b = pts[j];
      if (a.y > py !== b.y > py && px < ((b.x - a.x) * (py - a.y)) / (b.y - a.y) + a.x) adentro = !adentro;
    }
    return adentro;
  };

  // Los integrantes quedan dentro del contorno.
  for (const miembro of [samuel, cristina, marcelo]) {
    assert.equal(dentro(miembro.x, miembro.y), true, `integrante en ${miembro.x},${miembro.y}`);
  }
  // Quien vive aparte, fuera.
  assert.equal(dentro(felipe.x, felipe.y), false);
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

test("SPM-2: el informe nunca incluye genograma, aunque el config lo traiga", () => {
  const conGenograma = generarEnTemporal("Informe-SPM-2-Genograma-Test.pdf", () =>
    descargarInformePDFHogarPreescolar({ ...CONFIG_HOGAR, genograma: genogramaFamiliar() })
  );
  assert.doesNotMatch(conGenograma, /Genograma familiar/);
  assert.doesNotMatch(conGenograma, /Pedro Rojas/);
  assert.match(conGenograma, /Firma del\/la profesional/);

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

test("Perfil Sensorial 2: el informe nunca incluye genograma, aunque el config lo traiga", () => {
  const conGenograma = generarEnTemporal("Informe-Toddler-Genograma-Test.pdf", () =>
    descargarInformePDFToddler({ ...CONFIG_TODDLER, genograma: genogramaFamiliar() })
  );
  assert.doesNotMatch(conGenograma, /Genograma familiar/);
  assert.doesNotMatch(conGenograma, /María Vargas/);
  assert.match(conGenograma, /Firma del\/la examinador/);

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
