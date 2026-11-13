import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  SECCIONES,
  configInforme,
  descargarInformePDF,
} from "../src/lib/informe-ei-persona-mayor.js";
import {
  construirInformeWordHTML,
  descargarInformePDFEvaluacionInicial,
} from "../src/lib/informe-evaluacion-inicial.js";

/* ============================================================
   CASO 8 · INFORME FINAL (PDF Y WORD) Y CASO 10 · REGRESIÓN
   Genera el PDF real con jsPDF en Node y verifica su contenido
   textual: encabezado directo sin párrafo introductorio,
   registro completo por sección, hallazgos y alertas en hoja
   final separada, sin valores técnicos ni contenido truncado.
   ============================================================ */

const CAMPOS = SECCIONES.flatMap((s) => s.campos);
const CAMPOS_ID = SECCIONES.find((s) => s.identificacion).campos;

/* Caso 1 · Evaluación completa: todos los campos con datos de
   prueba, observaciones incluidas; los opcionales del cliente
   (ocupación de hijas/os y pareja, ubicación de mascotas)
   quedan vacíos (Caso 2). Los datos históricos de las preguntas
   retiradas del cuestionario activo se simulan (Caso 9). */
function valoresCompletos() {
  const valores = {
    nombre: "María Teresa Rojas Silva",
    run: "12.345.678-9",
    fechaNacimiento: "1948-03-14",
    edad: "78",
    estadoCivil: "Viuda",
    direccion: "Pasaje Los Aromos 1234, Villa Esperanza, Santiago",
    telefono: "+56 9 8765 4321",
    ocupacion: "Dueña de casa",
    origen: "derivacion",
    refiereQue: "Refiere cansancio al caminar y miedo a caerse en la ducha.",
    seObserva: "Marcha lentificada, se apoya en los muebles para desplazarse por el hogar.",
    condicionesGenerales: "regulares",
    animo: "eutimico",
    orientacion: "orientadoTemporoespacial",
    hijasOs: "2 hijas",
    viveCon: "Hija mayor",
    nombres: "Claudia y Loreto",
    mascotas: "Una gata",
    // Caso 2 · opcionales del cliente sin completar.
    ocupacionHijasOs: "",
    ocupacionPareja: "",
    mascotasUbicacion: "",
  };
  for (const campo of CAMPOS) {
    if (campo.id in valores) continue;
    if (campo.tipo === "escala") valores[campo.id] = campo.opciones[0].valor;
    else if (campo.tipo === "siNo") valores[campo.id] = "no";
    else if (campo.tipo === "radio") valores[campo.id] = campo.opciones[0].valor;
    else valores[campo.id] = `Registro de prueba para ${campo.etiqueta.toLowerCase()}.`;
  }
  for (const campo of CAMPOS) {
    if (campo.tipo === "escala") valores[`${campo.id}Obs`] = `Observación de ${campo.etiqueta.toLowerCase()}.`;
  }
  // Los síndromes no respondidos van a «No»; solo dos afirmativos.
  for (const campo of SECCIONES.find((s) => s.id === "sindromes-geriatricos").campos) {
    valores[campo.id] = "no";
  }
  valores.movilidadCaidas = "si";
  valores.polifarmacia = "si";
  valores.atencionSelectivaEnQue = "Pierde el hilo en conversaciones con ruido ambiental.";
  valores.memoriaTrabajoEnQue = "No retiene los pasos de una receta dictada.";
  // Caso 3 · combinación de niveles de independencia.
  valores.higieneMenor = "supervision";
  valores.transferenciasDucha = "ayudaModerada";
  valores.compras = "dependiente";
  // Autoinforme: dos respuestas en dirección que puntúa alcanzan
  // el corte de probable depresión (7 puntos con los «no» por defecto).
  valores.sinEsperanzas = "si";
  valores.vidaVacia = "si";
  valores.seAburre = "si";
  // Caso 9 · datos históricos de preguntas retiradas del formulario.
  valores.alucinaciones = "si";
  valores.ideacionSuicida = "si";
  return valores;
}


/* Extrae el texto dibujado del PDF (los flujos de contenido de
   jsPDF van sin comprimir) y lo normaliza: vuelve a Unicode los
   bytes WinAnsi de los signos fuera de Latin-1 (guiones,
   comillas) y tolera los saltos de línea del ajuste de texto. */
const WINANSI_UNICODE = {
  "": "‘",
  "": "’",
  "": "“",
  "": "”",
  "": "•",
  "": "–",
  "": "—",
  "": "…",
};

function extraerTextoPDF(ruta) {
  const raw = fs.readFileSync(ruta, "latin1");
  const fragmentos = [];
  const re = /\((?:\\.|[^()\\])*\)/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const crudo = m[0].slice(1, -1).replace(/\\([()\\])/g, "$1");
    fragmentos.push(crudo.replace(/[-]/g, (c) => WINANSI_UNICODE[c] ?? c));
  }
  return fragmentos.join(" ").replace(/\s+/g, " ").trim();
}

const sinEspacios = (texto) => texto.replace(/\s+/g, "");

const TITULOS_SECCION = [
  "Resultados de la evaluación",
  "Motivo de consulta",
  "Historial médico",
  "Antecedentes familiares",
  "Independencia funcional básica (análisis narrativo)",
  "Independencia funcional básica (resultado por actividad)",
  "Independencia funcional instrumental (análisis narrativo)",
  "Independencia funcional instrumental (resultado por actividad)",
  "Área física",
  "Síndromes geriátricos",
  "Otras consideraciones",
  "Salud mental (escala de Yesavage)",
  "Salud mental (respuesta por ítem)",
  "Área cognitiva",
  "Lenguaje",
  "Participación social",
  "Entorno y adaptaciones",
  "Habituación",
  "Esparcimiento",
  "Volición",
  "Plan de intervención",
  "Hallazgos relevantes",
  "Alertas clínicas",
];

function generarPDF(tmp, valores) {
  process.chdir(tmp);
  descargarInformePDF(valores);
  const ruta = path.join(tmp, "Informe-Evaluacion-Inicial-Persona-Mayor.pdf");
  assert.ok(fs.existsSync(ruta), "el PDF se genera");
  return ruta;
}

test("caso 1 y 8 · informe completo: encabezado directo, registro completo y hoja final", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ei-pm-informe-"));
  const cwdOriginal = process.cwd();
  try {
    const valores = valoresCompletos();
    const ruta = generarPDF(tmp, valores);
    const texto = extraerTextoPDF(ruta);
    const plano = sinEspacios(texto);

    /* El informe inicia con el título del instrumento, sin
       párrafo introductorio genérico. */
    assert.match(texto, /EVALUACI.N INICIAL . PERSONA MAYOR/);
    assert.ok(
      !texto.includes("La ficha de evaluación inicial Persona mayor se completa"),
      "el párrafo introductorio automático no aparece"
    );
    assert.ok(
      !texto.includes("Síntesis automatizada de la evaluación"),
      "los resultados usan su título propio"
    );
    assert.ok(plano.includes(sinEspacios("Resultados de la evaluación")));

    /* Las 18 secciones del impreso aparecen con su encabezado,
       en orden, y el cierre de hallazgos va al final. */
    const posiciones = TITULOS_SECCION.map((titulo) => plano.indexOf(sinEspacios(titulo)));
    assert.ok(posiciones.every((p) => p !== -1), "cada sección tiene encabezado en el informe");
    assert.deepEqual(posiciones, [...posiciones].sort((a, b) => a - b));
    assert.ok(plano.includes(sinEspacios("HALLAZGOS RELEVANTES Y ALERTAS CLÍNICAS")));
    const indicePlan = plano.indexOf(sinEspacios("Plan de intervención"));
    const indiceHallazgos = plano.indexOf(sinEspacios("HALLAZGOS RELEVANTES"));
    assert.ok(indiceHallazgos > indicePlan, "hallazgos y alertas cierran el informe");

    /* Datos de identificación y autoría del impreso. */
    for (const campo of CAMPOS_ID) {
      assert.ok(plano.includes(sinEspacios(campo.etiqueta.toUpperCase())), campo.id);
    }
    assert.ok(plano.includes(sinEspacios("María Teresa Rojas Silva")));
    assert.ok(plano.includes(sinEspacios("TeraOcupame · Formulario NIÑO - ADOLESCENTE - ADULTO - PERSONA MAYOR")));

    /* Los campos opcionales vacíos se declaran sin inventar
       valores (Caso 2). */
    assert.ok(plano.includes(sinEspacios("Ocupación hijas/os: —")));
    assert.ok(plano.includes(sinEspacios("Ocupación pareja: —")));
    assert.ok(plano.includes(sinEspacios("Ubicación de las mascotas: Sin respuesta")));

    /* Contenido con tildes, eñes y saltos de línea se conserva. */
    assert.ok(plano.includes(sinEspacios("Refiere cansancio al caminar y miedo a caerse en la ducha.")));
    assert.ok(plano.includes(sinEspacios("Marcha lentificada, se apoya en los muebles")));
    assert.ok(plano.includes(sinEspacios("Registro de prueba para antecedentes médicos.")));

    /* Caso 3 · clasificación exacta de cada nivel. */
    assert.ok(plano.includes(sinEspacios("Higiene menor Supervisión")));
    assert.ok(plano.includes(sinEspacios("Transferencias a ducha Ayuda moderada")));
    assert.ok(plano.includes(sinEspacios("Compras Dependiente")));
    assert.ok(plano.includes(sinEspacios("Requiere apoyo (supervisión, asistencia, ayuda moderada o dependencia) en 3 de los 21 ámbitos")));
    assert.ok(!plano.includes(sinEspacios("Distribución de niveles")));

    /* Caso 5 · escala de Yesavage completa con resultado por
       punto de corte. Puntúan los «no» de los ítems 1, 5, 7,
       11 y 13 y los «sí» de los ítems 3, 4 y 14: 8 puntos,
       probable depresión. */
    assert.ok(
      plano.includes(
        sinEspacios("Se respondieron 15 de 15 ítems de la escala de depresión geriátrica de Yesavage.")
      )
    );
    assert.ok(plano.includes(sinEspacios("N.º")));
    assert.ok(plano.includes(sinEspacios("¿Está Ud. básicamente satisfecho con su vida? No 1")));
    assert.ok(plano.includes(sinEspacios("¿Se encuentra sin esperanza ante su situación actual? Sí 1")));
    assert.ok(plano.includes(sinEspacios("Puntuación total: 8 de 15 puntos.")));
    assert.ok(plano.includes(sinEspacios("Resultado según punto de corte: Probable depresión.")));
    assert.ok(
      plano.includes(
        sinEspacios("arroja 8 de 15 puntos: Probable depresión. Resultado de tamizaje referido, no constituye diagnóstico.")
      )
    );

    /* Caso 6 · síndromes con pregunta, respuesta y observación. */
    assert.ok(plano.includes(sinEspacios("¿Ha sufrido alguna caída en los últimos 12 meses?")));
    assert.ok(plano.includes(sinEspacios("Antecedentes referidos en síndromes geriátricos")));

    /* Caso 7 · dificultades cognitivas como hallazgos. */
    assert.ok(plano.includes(sinEspacios("Se registran dificultades referidas en funciones cognitivas")));

    /* Caso 9 · datos históricos conservados como alerta clínica. */
    assert.ok(plano.includes(sinEspacios("REQUIERE ATENCIÓN INMEDIATA")));
    assert.ok(plano.includes(sinEspacios("activar protocolo de crisis y derivación inmediata")));

    /* Sin valores técnicos ni respuestas truncadas. */
    assert.ok(!texto.includes("undefined"));
    assert.ok(!texto.includes("null"));
    assert.ok(!texto.includes("[object Object]"));

    /* El informe tiene varias páginas (hoja final independiente). */
    const raw = fs.readFileSync(ruta, "latin1");
    const paginas = (raw.match(/\/Type\s*\/Page(?![s])/g) || []).length;
    assert.ok(paginas >= 2, `el informe tiene al menos 2 páginas (${paginas})`);
  } finally {
    process.chdir(cwdOriginal);
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("caso 4 · informe con respuestas vacías: sin hallazgos ni alertas falsas", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ei-pm-vacio-"));
  const cwdOriginal = process.cwd();
  try {
    const ruta = generarPDF(tmp, {});
    const texto = extraerTextoPDF(ruta);
    const plano = sinEspacios(texto);
    assert.ok(plano.includes(sinEspacios("No se registran hallazgos relevantes en esta evaluación.")));
    /* Sin alertas activadas no se imprime el bloque de alertas. */
    assert.ok(!plano.includes(sinEspacios("No se activaron alertas clínicas")));
    assert.ok(!plano.includes(sinEspacios("Y ALERTAS CLÍNICAS")));
    assert.ok(plano.includes(sinEspacios("HALLAZGOS RELEVANTES")));
    assert.ok(!plano.includes(sinEspacios("Requiere apoyo")));
    assert.ok(!plano.includes(sinEspacios("Antecedentes referidos")));
    assert.ok(plano.includes(sinEspacios("Se respondieron 0 de 15 ítems")));
    assert.ok(plano.includes(sinEspacios("Escala incompleta")));
    assert.ok(!texto.includes("undefined"));
  } finally {
    process.chdir(cwdOriginal);
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("el informe Word replica estructura, numeración y separación de hallazgos", () => {
  const html = construirInformeWordHTML(configInforme(valoresCompletos()));
  assert.ok(html.includes("EVALUACIÓN INICIAL – PERSONA MAYOR"));
  assert.ok(html.includes("Resultados de la evaluación"));
  assert.ok(html.includes("HALLAZGOS RELEVANTES Y ALERTAS CLÍNICAS"));
  assert.ok(html.includes("Hallazgos relevantes</h3>"));
  assert.ok(html.includes("Alertas clínicas</h3>"));
  assert.ok(html.includes("REQUIERE ATENCIÓN INMEDIATA"));
  assert.ok(!html.includes("Alertas en información recabada"));
  assert.ok(
    !html.includes("La ficha de evaluación inicial Persona mayor se completa"),
    "sin párrafo introductorio en Word"
  );
  assert.ok(html.includes("María Teresa Rojas Silva"));
  assert.ok(html.includes("Ocupación pareja: —"));
  assert.ok(html.includes(">15</td>"));
  assert.ok(html.includes("¿Se encuentra sin esperanza ante su situación actual?"));
  assert.ok(html.includes("Puntuación total: 8 de 15 puntos."));
  assert.ok(html.includes("Resultado según punto de corte: Probable depresión."));
  assert.ok(!html.includes("undefined"));
  assert.ok(html.includes("Firma Profesional"));
});

test("caso 10 · el motor conserva el informe de las demás fichas sin la sección de hallazgos", () => {
  const html = construirInformeWordHTML({
    instrumento: "Evaluación inicial de terapia ocupacional",
    titulo: "Informe de evaluación inicial",
    secciones: [],
    valores: {},
    sintesis: [
      { tipo: "parrafo", titulo: "Motivo", texto: "Texto de la ficha." },
      { tipo: "bandera", nivel: "alerta", texto: "Alerta de la ficha." },
      { tipo: "bandera", nivel: "critico", texto: "Crítico de la ficha." },
      { tipo: "bandera", nivel: "info", texto: "Info no se imprime." },
    ],
  });
  assert.ok(html.includes("EVALUACIÓN INICIAL DE TERAPIA OCUPACIONAL"));
  assert.ok(html.includes("Síntesis automatizada de la evaluación"));
  assert.ok(html.includes("Alertas en información recabada"));
  assert.ok(html.includes("Alerta de la ficha."));
  assert.ok(html.includes("Crítico de la ficha."));
  assert.ok(!html.includes("Info no se imprime."));
  assert.ok(!html.includes("HALLAZGOS RELEVANTES Y ALERTAS CLÍNICAS"));
});

test("caso 10 · el PDF de las demás fichas mantiene su hoja de alertas", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ei-pm-legacy-"));
  const cwdOriginal = process.cwd();
  try {
    process.chdir(tmp);
    descargarInformePDFEvaluacionInicial({
      nombreArchivo: "Informe-Legado",
      instrumento: "Evaluación inicial de terapia ocupacional",
      titulo: "Informe de evaluación inicial",
      secciones: [],
      valores: {},
      sintesis: [
        { tipo: "parrafo", titulo: "Motivo", texto: "Texto de la ficha." },
        { tipo: "bandera", nivel: "alerta", texto: "Alerta de la ficha." },
      ],
    });
    const ruta = path.join(tmp, "Informe-Legado.pdf");
    assert.ok(fs.existsSync(ruta));
    const texto = extraerTextoPDF(ruta);
    assert.match(texto, /EVALUACI.N INICIAL DE TERAPIA OCUPACIONAL/);
    assert.ok(texto.includes("Alertas en información recabada"));
    assert.ok(texto.includes("Alerta de la ficha."));
    assert.ok(!texto.includes("HALLAZGOS RELEVANTES"));
  } finally {
    process.chdir(cwdOriginal);
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
