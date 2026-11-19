import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  TIPOS_RELACION,
  TIPOS_VINCULO,
  NODO,
  conexionAgregada,
  conexionEliminada,
  copiarParaEvaluacion,
  eliminarDeBiblioteca,
  envolverTexto,
  esDescendencia,
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
  organizarGenograma,
  personaActualizada,
  personaEliminada,
  personaIndicada,
  relacionActualizada,
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

  // Descender de la pareja y de un miembro por separado son
  // conexiones independientes: se acumulan.
  const hijo = g.personas.find((p) => p.nombre === "Tomás Rojas");
  const descendenciasAntes = g.vinculos.filter((v) => v.tipo === "hijo" && v.a === hijo.id).length;
  g = conexionAgregada(g, "hijo", madre.id, hijo.id);
  assert.equal(g.vinculos.filter((v) => v.tipo === "hijo" && v.a === hijo.id).length, descendenciasAntes + 1);
  // El mismo origen dos veces no se duplica.
  g = conexionAgregada(g, "hijo", madre.id, hijo.id);
  assert.equal(g.vinculos.filter((v) => v.tipo === "hijo" && v.a === hijo.id).length, descendenciasAntes + 1);
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
    "adoptado",
    "crianza",
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
  // Con pareja la relación nace desviada (11) junto a la línea:
  // los extremos tocan las figuras y el medio queda separado.
  assert.equal(relacion.desvio, 11);
  const separacion = Math.hypot(
    relacion.medio.x - pareja.medio.x,
    relacion.medio.y - pareja.medio.y
  );
  assert.equal(separacion > 5, true);

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

test("la relación se puede desviar arrastrándola para que no se monte sobre otras líneas", () => {
  let g = nuevaPersona(nuevaPersona(genogramaVacio(), "hombre", { x: 200, y: 200 }), "mujer", { x: 400, y: 200 });
  const [a, b] = g.personas;
  g = conexionAgregada(g, "conflicto", a.id, b.id);

  // Recta por defecto; el zigzag parte y termina en los extremos.
  const recta = geometriaDeRelacion(g, g.relaciones[0]);
  assert.equal(recta.desvio, 0);
  assert.deepEqual(recta.zigzag[0], [recta.inicio.x, recta.inicio.y]);
  const ultimoZigzag = recta.zigzag[recta.zigzag.length - 1];
  assert.deepEqual(ultimoZigzag, [recta.fin.x, recta.fin.y]);

  // El usuario desvía la línea 40 unidades: el medio se corre a
  // un lado pero los extremos siguen sobre el borde de las dos
  // figuras (goma elástica sujeta en sus extremos).
  g = relacionActualizada(g, g.relaciones[0].id, { desvio: 40 });
  const desviada = geometriaDeRelacion(g, g.relaciones[0]);
  assert.equal(desviada.desvio, 40);
  const correccion = Math.hypot(
    desviada.medio.x - recta.medio.x,
    desviada.medio.y - recta.medio.y
  );
  assert.equal(correccion > 30, true);
  assert.equal(Math.hypot(desviada.inicio.x - a.x, desviada.inicio.y - a.y) <= NODO.radio + 0.6, true);
  assert.equal(Math.hypot(desviada.fin.x - b.x, desviada.fin.y - b.y) <= NODO.radio + 0.6, true);

  // El desvío sobrevive a la normalización (datos guardados).
  const reparado = normalizarGenograma(JSON.parse(JSON.stringify(g)));
  assert.equal(reparado.relaciones[0].desvio, 40);

  // Quitar el desvío vuelve al comportamiento automático.
  g = relacionActualizada(g, g.relaciones[0].id, { desvio: null });
  assert.equal(geometriaDeRelacion(g, g.relaciones[0]).desvio, 0);
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

test("el hijo de una pareja cuelga de una sola línea desde el punto medio", () => {
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

  // Las dos conexiones se unifican en la línea de pareja.
  const descendencias = g.vinculos.filter((v) => esDescendencia(v.tipo) && v.a === hijo.id);
  assert.equal(descendencias.length, 1);
  assert.equal(descendencias[0].de, parejaId);

  // Una sola ruta: del punto medio de la pareja al hijo.
  const rutas = rutasDeDescendencia(g);
  assert.equal(rutas.length, 1);
  const pareja = geometriaDePareja(g, g.vinculos[0]);
  assert.deepEqual(rutas[0].recorrido[0], pareja.medio);
  assert.deepEqual(rutas[0].recorrido[rutas[0].recorrido.length - 1], { x: hijo.x, y: hijo.y - 20 });
});

test("datos antiguos con vínculos a ambos progenitores se dibujan como una línea", () => {
  let g = nuevaPersona(
    nuevaPersona(nuevaPersona(genogramaVacio(), "hombre", { x: 180, y: 140 }), "mujer", { x: 380, y: 140 }),
    "hombre",
    { x: 280, y: 340 }
  );
  const [jose, maria, hijo] = g.personas;
  g = conexionAgregada(g, "union", jose.id, maria.id);
  // Datos guardados con dos vínculos persona a persona.
  g = {
    ...g,
    vinculos: [
      ...g.vinculos,
      { id: "v-jose", tipo: "hijo", de: jose.id, a: hijo.id },
      { id: "v-maria", tipo: "hijo", de: maria.id, a: hijo.id },
    ],
  };

  // El dibujo los unifica: una sola descendencia desde la pareja.
  const rutas = rutasDeDescendencia(g);
  assert.equal(rutas.length, 1);
  const pareja = geometriaDePareja(g, g.vinculos[0]);
  assert.deepEqual(rutas[0].recorrido[0], pareja.medio);
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

test("no se crea ni se conserva una pareja entre progenitor e hijo", () => {
  // El «triángulo» del diagrama: parejas creadas por error entre
  // Samuel y sus hijos, que se dibujaban como líneas rectas sobre
  // la descendencia y además la desviaban del punto medio.
  let g = nuevaPersona(
    nuevaPersona(
      nuevaPersona(nuevaPersona(genogramaVacio(), "hombre", { x: 200, y: 140 }), "mujer", { x: 480, y: 140 }),
      "hombre",
      { x: 300, y: 340 }
    ),
    "hombre",
    { x: 420, y: 340 }
  );
  const [samuel, cristina, felipe] = g.personas;
  g = conexionAgregada(g, "union", samuel.id, cristina.id);
  g = conexionAgregada(g, "hijo", samuel.id, felipe.id);

  // Crear la pareja progenitor–hijo no tiene ningún efecto.
  const antes = g;
  g = conexionAgregada(g, "union", samuel.id, felipe.id);
  assert.equal(g, antes);

  // Los datos guardados con ese error se reparan al cargar: solo
  // queda la pareja de verdad y la descendencia vuelve a salir del
  // punto medio de la línea de pareja (pauta).
  const guardado = {
    ...g,
    vinculos: [...g.vinculos, { id: "v-error", tipo: "union", de: samuel.id, a: felipe.id }],
  };
  const reparado = normalizarGenograma(guardado);
  const parejas = reparado.vinculos.filter((v) => !esDescendencia(v.tipo));
  assert.equal(parejas.length, 1);
  const medio = geometriaDePareja(reparado, parejas[0]).medio;
  for (const ruta of rutasDeDescendencia(reparado).filter((r) => r.clave.includes("-guia"))) {
    assert.deepEqual(ruta.recorrido[0], medio);
  }
});

test("marcar la descendencia reemplaza una pareja equivocada entre las mismas personas", () => {
  // Pareja creada por error primero y «es hijo/a de» después: no
  // deben quedar dos líneas (diagonal + codo) entre las dos figuras.
  let g = nuevaPersona(
    nuevaPersona(nuevaPersona(genogramaVacio(), "hombre", { x: 220, y: 210 }), "hombre", { x: 540, y: 530 })
  );
  const [gabriel, nicolas] = g.personas;
  g = conexionAgregada(g, "union", gabriel.id, nicolas.id);
  assert.equal(g.vinculos.length, 1);
  g = conexionAgregada(g, "hijo", gabriel.id, nicolas.id);

  // Queda una sola conexión: la descendencia.
  assert.equal(g.vinculos.length, 1);
  assert.equal(esDescendencia(g.vinculos[0].tipo), true);
  assert.equal(g.vinculos[0].de, gabriel.id);
  assert.equal(g.vinculos[0].a, nicolas.id);

  // El dibujo no tiene tramos diagonales: todo el recorrido es
  // vertical u horizontal.
  for (const ruta of rutasDeDescendencia(g)) {
    for (let i = 1; i < ruta.recorrido.length; i++) {
      const a = ruta.recorrido[i - 1];
      const b = ruta.recorrido[i];
      assert.ok(a.x === b.x || a.y === b.y);
    }
  }

  // Un vínculo de pareja entre progenitor e hijo sigue sin crearse
  // (orden inverso: descendencia primero, pareja después).
  const conDescendencia = g;
  assert.equal(conexionAgregada(conDescendencia, "union", gabriel.id, nicolas.id), conDescendencia);
});

test("la descendencia registrada al revés se corrige y no se duplica", () => {
  // El flujo real del error: primero se conecta en el sentido
  // equivocado («B es hijo/a de A») y después se corrige con el
  // bueno. Antes quedaban dos descendencias y la invertida se
  // dibujaba como una diagonal recta sobre el codo correcto.
  let g = nuevaPersona(
    nuevaPersona(genogramaVacio(), "hombre", { x: 280, y: 140 }),
    "hombre",
    { x: 280, y: 340 }
  );
  const [b, a] = g.personas; // B arriba (progenitor), A abajo (hijo)
  g = conexionAgregada(g, "hijo", a.id, b.id); // registrado al revés
  assert.equal(g.vinculos.length, 1);
  g = conexionAgregada(g, "hijo", b.id, a.id); // marca el sentido bueno

  // Queda una sola descendencia, con el sentido correcto.
  assert.equal(g.vinculos.length, 1);
  assert.equal(g.vinculos[0].de, b.id);
  assert.equal(g.vinculos[0].a, a.id);

  // Repetir la marca correcta no cambia nada…
  const antes = g;
  g = conexionAgregada(g, "hijo", b.id, a.id);
  assert.equal(g, antes);

  // …y ningún recorrido tiene tramos diagonales.
  for (const ruta of rutasDeDescendencia(g)) {
    for (let i = 1; i < ruta.recorrido.length; i++) {
      const p = ruta.recorrido[i - 1];
      const q = ruta.recorrido[i];
      assert.ok(p.x === q.x || p.y === q.y);
    }
  }

  // Los datos guardados con las dos direcciones se reparan al
  // cargar: queda la que va del progenitor (arriba) hacia el hijo.
  const reparado = normalizarGenograma({
    ...g,
    vinculos: [
      { id: "v-inv", tipo: "hijo", de: a.id, a: b.id },
      { id: "v-bueno", tipo: "hijo", de: b.id, a: a.id },
    ],
  });
  const descendencias = reparado.vinculos.filter((v) => esDescendencia(v.tipo));
  assert.equal(descendencias.length, 1);
  assert.equal(descendencias[0].de, b.id);
  assert.equal(descendencias[0].a, a.id);
});

test("el dibujo garantiza una sola línea por par y jamás dibuja diagonales", () => {
  // Garantía a nivel de dibujo: aunque los datos traigan el mismo
  // par duplicado en los dos sentidos, solo se dibuja una línea.
  let g = nuevaPersona(
    nuevaPersona(genogramaVacio(), "hombre", { x: 180, y: 140 }),
    "hombre",
    { x: 460, y: 515 }
  );
  const [padre, hijo] = g.personas;
  g = {
    ...g,
    vinculos: [
      { id: "v1", tipo: "hijo", de: padre.id, a: hijo.id },
      { id: "v2", tipo: "hijo", de: hijo.id, a: padre.id },
    ],
  };
  const rutas = rutasDeDescendencia(g);
  assert.equal(rutas.length, 1);
  const sinDiagonales = (rutasDe) => {
    for (const ruta of rutasDe) {
      for (let i = 1; i < ruta.recorrido.length; i++) {
        const p = ruta.recorrido[i - 1];
        const q = ruta.recorrido[i];
        assert.ok(p.x === q.x || p.y === q.y);
      }
    }
  };
  sinDiagonales(rutas);

  // Vínculo invertido suelto (el «hijo» quedó arriba): codo hacia
  // arriba, también sin diagonales.
  const invertido = { ...g, vinculos: [{ id: "v", tipo: "hijo", de: hijo.id, a: padre.id }] };
  const rutasInvertidas = rutasDeDescendencia(invertido);
  assert.equal(rutasInvertidas.length, 1);
  sinDiagonales(rutasInvertidas);
});

test("la descendencia de un progenitor con pareja sale del punto medio de la pareja", () => {
  // Felipe y Marcelo conectados solo con Samuel, que forma
  // pareja con Cristina: las líneas salen del medio de la pareja.
  let g = nuevaPersona(
    nuevaPersona(
      nuevaPersona(nuevaPersona(genogramaVacio(), "hombre", { x: 200, y: 140 }), "mujer", { x: 480, y: 140 }),
      "hombre",
      { x: 300, y: 340 }
    ),
    "hombre",
    { x: 420, y: 340 }
  );
  const [samuel, cristina, felipe, marcelo] = g.personas;
  g = personaActualizada(g, samuel.id, { nombre: "Samuel" });
  g = personaActualizada(g, cristina.id, { nombre: "Cristina" });
  g = personaActualizada(g, felipe.id, { nombre: "Felipe" });
  g = personaActualizada(g, marcelo.id, { nombre: "Marcelo" });
  g = conexionAgregada(g, "union", samuel.id, cristina.id);
  g = conexionAgregada(g, "hijo", samuel.id, felipe.id);
  g = conexionAgregada(g, "hijo", samuel.id, marcelo.id);

  // El tallo y la guía nacen del punto medio de la línea de
  // pareja, y cada hijo tiene su caída.
  const pareja = geometriaDePareja(g, g.vinculos.find((v) => !esDescendencia(v.tipo)));
  const rutas = rutasDeDescendencia(g);
  const guias = rutas.filter((r) => r.clave.includes("-guia"));
  const caidas = rutas.filter((r) => r.clave.endsWith("-caida"));
  assert.equal(caidas.length, 2);
  assert.ok(guias.length >= 1);
  for (const ruta of guias) assert.deepEqual(ruta.recorrido[0], pareja.medio);

  // Al ordenar, los hijos quedan centrados entre la pareja.
  const ordenado = organizarGenograma(g);
  const de = (nombre) => ordenado.personas.find((p) => p.nombre === nombre);
  const centroPareja = (de("Samuel").x + de("Cristina").x) / 2;
  const centroHijos = (de("Felipe").x + de("Marcelo").x) / 2;
  assert.equal(Math.round(centroHijos), Math.round(centroPareja));
});

test("gemelos, adoptado y alineado: parto múltiple, etiquetas y filas parejas", () => {
  // Descendencia adoptada: se describe con su etiqueta propia.
  let g = nuevaPersona(
    nuevaPersona(nuevaPersona(genogramaVacio(), "hombre", { x: 180, y: 140 }), "mujer", { x: 380, y: 140 }),
    "hombre",
    { x: 280, y: 340 }
  );
  const [padre, madre, hijo] = g.personas;
  g = personaActualizada(g, padre.id, { nombre: "Pedro Rojas" });
  g = personaActualizada(g, madre.id, { nombre: "María Vargas" });
  g = conexionAgregada(g, "union", padre.id, madre.id);
  const parejaId = g.vinculos[0].id;
  g = conexionAgregada(g, "adoptado", parejaId, hijo.id);
  assert.match(
    filasDeIntegrantes(g).find((f) => f.nombre === "Sin nombre").conexiones,
    /Hijo\/a adoptado\/a de Pedro Rojas y María Vargas/
  );

  // Gemelos: la segunda hija del mismo origen comparte punto de partida.
  let gemelos = nuevaPersona(
    nuevaPersona(nuevaPersona(genogramaVacio(), "hombre", { x: 180, y: 140 }), "mujer", { x: 380, y: 140 }),
    "mujer",
    { x: 240, y: 340 }
  );
  gemelos = nuevaPersona(gemelos, "mujer", { x: 320, y: 340 });
  const [padreGemelos, , gemela1, gemela2] = gemelos.personas;
  gemelos = conexionAgregada(gemelos, "hijo", padreGemelos.id, gemela1.id);
  gemelos = conexionAgregada(gemelos, "hijo", padreGemelos.id, gemela2.id);
  const v1 = gemelos.vinculos.find((v) => esDescendencia(v.tipo) && v.a === gemela1.id);
  const v2 = gemelos.vinculos.find((v) => esDescendencia(v.tipo) && v.a === gemela2.id);
  const grupo = "g-test";
  gemelos = {
    ...gemelos,
    vinculos: gemelos.vinculos.map((v) => (v.id === v1.id || v.id === v2.id ? { ...v, gemelar: grupo } : v)),
  };
  const rutasGemelas = rutasDeDescendencia(gemelos).filter((r) => r.clave.endsWith("-gemelo"));
  assert.equal(rutasGemelas.length, 2);
  assert.equal(rutasGemelas[0].recorrido[0].x, rutasGemelas[1].recorrido[0].x);
  // Sin caídas individuales para las gemelas.
  assert.equal(rutasDeDescendencia(gemelos).filter((r) => r.clave.endsWith("-caida")).length, 0);

  // Ordenar: una fila por generación y hijos centrados bajo la pareja.
  let familia = nuevaPersona(
    nuevaPersona(nuevaPersona(nuevaPersona(genogramaVacio(), "hombre", { x: 180, y: 140 }), "mujer", { x: 380, y: 170 }), "hombre", { x: 240, y: 360 }),
    "mujer",
    { x: 320, y: 320 }
  );
  const [p2, m2, h2a, h2b] = familia.personas;
  familia = personaActualizada(familia, p2.id, { nombre: "P2" });
  familia = personaActualizada(familia, m2.id, { nombre: "M2" });
  familia = personaActualizada(familia, h2a.id, { nombre: "Ha" });
  familia = personaActualizada(familia, h2b.id, { nombre: "Hb" });
  familia = conexionAgregada(familia, "union", p2.id, m2.id);
  const parejaFamiliar = familia.vinculos.find((v) => !esDescendencia(v.tipo)).id;
  familia = conexionAgregada(familia, "hijo", parejaFamiliar, h2a.id);
  familia = conexionAgregada(familia, "hijo", parejaFamiliar, h2b.id);
  const ordenado = organizarGenograma(familia);
  const de = (nombre) => ordenado.personas.find((p) => p.nombre === nombre);
  // La pareja comparte altura; los hijos también.
  assert.equal(de("P2").y, de("M2").y);
  assert.equal(de("Ha").y, de("Hb").y);
  // Una fila por generación.
  assert.notEqual(de("P2").y, de("Ha").y);
  // Los hijos quedan centrados bajo el punto medio de la pareja.
  const centroPareja = (de("P2").x + de("M2").x) / 2;
  const centroHijos = (de("Ha").x + de("Hb").x) / 2;
  assert.equal(Math.round(centroHijos), Math.round(centroPareja));

  // Símbolos especiales se normalizan; los inválidos quedan vacíos.
  const reparado = normalizarGenograma({
    personas: [
      { id: "p1", sexo: "mujer", simbolo: "embarazo" },
      { id: "p2", sexo: "hombre", simbolo: "inventado" },
    ],
    vinculos: [],
    relaciones: [],
  });
  assert.equal(reparado.personas[0].simbolo, "embarazo");
  assert.equal(reparado.personas[1].simbolo, "");
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
