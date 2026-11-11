import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcularEdad,
  fechaLarga,
  etiquetaOpcion,
  textoValor,
  construirInformeWordHTML,
  descargarInformePDFEvaluacionInicial,
} from "../src/lib/informe-evaluacion-inicial.js";

/* ============================================================
   EVALUACIÓN INICIAL · MOTOR COMÚN
   Helpers puros compartidos por las cuatro fichas: cálculo de
   la edad desde la fecha de nacimiento, formato largo de la
   fecha y construcción del informe Word (mismo contenido que
   el PDF: identificación, síntesis automatizada y registro).
   ============================================================ */

test("calcularEdad: años cumplidos desde la fecha de nacimiento", () => {
  const hoy = new Date();
  // `dias` positivos: nacimiento DESPUÉS de esa fecha aniversaria,
  // así el cumpleaños `anos` aún no ocurre este año.
  const hace = (anos, dias = 0) => {
    const fecha = new Date(hoy);
    fecha.setFullYear(fecha.getFullYear() - anos);
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().slice(0, 10);
  };
  assert.equal(calcularEdad(hace(6)), 6);
  // Aún no ha cumplido el séptimo: edad 6.
  assert.equal(calcularEdad(hace(7, 5)), 6);
  // El sexto cumpleaños fue hace 5 días: edad 6.
  assert.equal(calcularEdad(hace(6, -5)), 6);
  assert.equal(calcularEdad(hace(0)), 0);
});

test("calcularEdad: fecha inválida o futura devuelve null", () => {
  assert.equal(calcularEdad(""), null);
  assert.equal(calcularEdad("04-05-2020"), null);
  assert.equal(calcularEdad("2020-13-40"), null);
  const futura = new Date();
  futura.setFullYear(futura.getFullYear() + 1);
  assert.equal(calcularEdad(futura.toISOString().slice(0, 10)), null);
});

test("fechaLarga: formato largo en español", () => {
  assert.equal(fechaLarga("2020-05-04"), "4 de mayo de 2020");
  assert.equal(fechaLarga("no-es-fecha"), "");
  assert.equal(fechaLarga(""), "");
});

test("etiquetaOpcion y textoValor", () => {
  const campo = { opciones: [{ valor: "si", etiqueta: "Sí" }] };
  assert.equal(etiquetaOpcion(campo, "si"), "Sí");
  assert.equal(etiquetaOpcion(campo, ""), "");
  assert.equal(textoValor("  texto  "), "texto");
  assert.equal(textoValor(""), "—");
});

const SECCIONES = [
  {
    id: "datos-personales",
    titulo: "Datos personales",
    identificacion: true,
    campos: [
      { id: "nombre", etiqueta: "Nombre", tipo: "texto" },
      { id: "fechaNacimiento", etiqueta: "Fecha de nacimiento", tipo: "fecha" },
      { id: "edad", etiqueta: "Edad", tipo: "numero", autoDesde: "fechaNacimiento" },
    ],
  },
  {
    id: "independencia",
    titulo: "Independencia funcional",
    campos: [
      {
        id: "comer",
        etiqueta: "Comer",
        tipo: "escala",
        opciones: [
          { valor: "independiente", etiqueta: "Independiente" },
          { valor: "dependiente", etiqueta: "Dependiente" },
        ],
      },
    ],
  },
];

const config = (sintesis) => ({
  nombreArchivo: "prueba",
  instrumento: "Evaluación inicial · Prueba",
  titulo: "Informe de evaluación inicial",
  subtitulo: "Prueba",
  secciones: SECCIONES,
  valores: {
    nombre: "Ana",
    fechaNacimiento: "2020-05-04",
    edad: "6",
    comer: "dependiente",
    comerObs: "Requiere ayuda total.",
  },
  sintesis,
});

test("Word: contiene encabezado, identificación, escalas y observaciones", () => {
  const html = construirInformeWordHTML(config([]));
  assert.match(html, /Informe de evaluación inicial/);
  assert.match(html, /<b>Nombre:<\/b> Ana/);
  assert.match(html, /FECHA DE APLICACIÓN/);
  assert.match(html, /ÁMBITO/);
  assert.match(html, /Comer/);
  assert.match(html, /Dependiente/);
  assert.match(html, /Requiere ayuda total\./);
  assert.match(html, /Firma Profesional/);
});

test("Word: refleja las banderas de la síntesis automatizada", () => {
  const html = construirInformeWordHTML(
    config([
      { tipo: "bandera", nivel: "critico", texto: "Se registra ideación suicida." },
      { tipo: "bandera", nivel: "ok", texto: "Independencia conservada." },
    ])
  );
  assert.match(html, /REQUIERE ATENCIÓN INMEDIATA/);
  assert.match(html, /Se registra ideación suicida\./);
  assert.match(html, /SIN ALERTAS/);
});

test("Word: escapa HTML del contenido registrado", () => {
  const html = construirInformeWordHTML(
    config([{ tipo: "parrafo", texto: "Consulta <derivada> & urgente." }])
  );
  assert.match(html, /&lt;derivada&gt; &amp; urgente\./);
});

test("Word: incluye la introducción cuando se entrega", () => {
  const html = construirInformeWordHTML({
    ...config([]),
    introduccion: "Ficha de prueba para la verificación del motor.",
  });
  assert.match(html, /Ficha de prueba para la verificación del motor\./);
});

test("El motor expone los dos constructores de informe", () => {
  assert.equal(typeof descargarInformePDFEvaluacionInicial, "function");
  assert.equal(typeof construirInformeWordHTML, "function");
});
