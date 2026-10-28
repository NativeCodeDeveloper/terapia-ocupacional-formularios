"use client";

import { useState } from "react";
import { descargarInformeWord } from "@/lib/informe";
import { descargarInformePDFEscolarPreescolar } from "@/lib/informe-escolar-preescolar";

const OPCIONES = [
  {
    valor: "nunca",
    etiqueta: "NUNCA",
    descripcion: "La conducta nunca o casi nunca ocurre.",
    puntaje: 1,
  },
  {
    valor: "ocasionalmente",
    etiqueta: "OCASIONALMENTE",
    descripcion: "La conducta ocurre a veces.",
    puntaje: 2,
  },
  {
    valor: "frecuentemente",
    etiqueta: "FRECUENTEMENTE",
    descripcion: "La conducta ocurre a menudo.",
    puntaje: 3,
  },
  {
    valor: "siempre",
    etiqueta: "SIEMPRE",
    descripcion: "La conducta ocurre siempre o casi siempre.",
    puntaje: 4,
  },
];

const SECCIONES = [
  {
    titulo: "VISIÓN",
    preguntas: [
      "Se distrae con objetos o gente que están visibles.",
      "Tiene dificultad para encontrar cosas o personas con la mirada en una habitación o en el campo de recreo.",
      "Tiene problemas para encontrar un objeto en medio de otros.",
      "Mira alrededor del salón o a sus compañeros mientras el/la maestro/a está hablando.",
      "Tiene dificultad para reconocer como se parecen o como difieren los objetos en base a sus colores, formas, o tamaños.",
      "Se tropieza con las cosas o con la gente como si no estuvieran ahí.",
      "Mira fijamente a la gente o a los objetos.",
      "Mira fijamente a las luces o a los objetos que giran o brillan.",
      "Sacude objetos o los dedos cerca de los ojos.",
      "Mira a objetos con el rabillo del ojo.",
    ],
  },
  {
    titulo: "OÍDO",
    preguntas: [
      "Se angustia cuando hay sonidos fuertes o inesperados como simulacros de incendio o bloques que se derrumban.",
      "Se angustia cuando los demás aplauden o cantan.",
      "Tiene dificultad para determinar de donde provienen los sonidos o las voces.",
      "Tararea, canta, o grita durante la clase.",
      "Gusta hacer ciertos sonidos repetidamente como tararear o jalar la cadena de la taza del baño.",
      "Se distrae o se fastidia con ruidos en el ambiente que otros ignoran como los de ventiladores o los de relojes haciendo tictac.",
      "Tiene problemas para prestar atención cuando hay ruidos en el salón de clase.",
      "Tiene dificultad para seguir instrucciones verbales.",
      "Parece estar intensamente interesado/a en sonidos que otros no notan.",
      "No responde cuando llaman su nombre.",
    ],
  },
  {
    titulo: "TACTO",
    preguntas: [
      "Cuando otros lo/la tocan por accidente, los ataca o se aparta.",
      "No se limpia la saliva o la comida de la cara.",
      "Se angustia con la sensación de ciertas texturas.",
      "Evita tocar o jugar con cosas que ensucien como la pintura o la goma de pegar.",
      "Frota objetos repetidamente con las manos o las puntas de los dedos.",
      "Tiene dificultad para manipular objetos pequeños en su mano.",
      "Da codazos, da un golpecito, o toca a sus compañeros durante la clase o cuando están en fila.",
      "Disfruta metiendo su cuerpo en espacios pequeños.",
      "Choca o se arremete contra sus compañeros o contra superficies duras como las paredes a propósito.",
      "Rehúsa comidas con mezclas de texturas como el yogurt con fruta.",
    ],
  },
  {
    titulo: "GUSTO Y OLFATO",
    preguntas: [
      "Prueba o come cosas que no son comibles como goma de pegar o pintura.",
      "Rehúsa probar comidas o refrigerios nuevos.",
      "Se angustia con sabores de comidas que a otros niños no les molestan.",
      "Insiste en comer solo ciertas comidas o ciertas marcas de alimentos.",
      "No distingue sabores ni expresa preferencias entre ellos.",
      "Prefiere comidas que tengan sabores fuertes.",
      "Olfatea o huele a la gente.",
      "Huele los objetos nuevos o las cosas nuevas antes de usarlos.",
      "Se angustia debido a aromas del jabón, del perfume o de las lociones para la piel.",
      "Hace arcadas o vomita a causa de ciertos olores.",
    ],
  },
  {
    titulo: "CONCIENCIA DEL CUERPO",
    preguntas: [
      "Mueve los muebles de la clase de una manera brusca o con mucha fuerza.",
      "Rompe barras de pegamento, lápices, crayolas o papel accidentalmente al usar demasiada fuerza.",
      "Salta de sitios en alto impactando sus pies con mucha fuerza.",
      "Tira las puertas al cerrarlas o las empuja con fuerza excesiva al abrirlas.",
      "Rompe juguetes al manejarlos con demasiada fuerza.",
      "Maneja los envases de comidas o de bebidas de una manera demasiado brusca.",
      "Derrumba los proyectos que otros niños están construyendo.",
      "Juega con sus compañeros/as de una manera demasiado brusca.",
      "Pone demasiada comida en su boca.",
      "Colorea con demasiada o muy poca fuerza.",
    ],
  },
  {
    titulo: "EQUILIBRIO Y MOVIMIENTO",
    preguntas: [
      "Gira o da vueltas excesivamente en los equipos del campo de recreo.",
      "Se desploma hacia adelante, se echa hacia atrás, o se sujeta la cabeza con las manos mientras está sentado/a.",
      "Le tiene miedo a ciertos movimientos como el de columpiarse o deslizarse en el tobogán.",
      "Se columpia excesivamente excluyendo las otras actividades.",
      "Se desorienta o se asusta cuando se inclina para recoger materiales que están en el suelo.",
      "No se sujeta cuando se está cayendo.",
      "Muestra poca coordinación en el uso de los dos lados de su cuerpo como hay que hacer para saltar y caer sobre los dos pies al mismo tiempo.",
      "Tiene dificultad moviendo su cuerpo al ritmo como aplaudiendo o marchando.",
      "Se mece, se balancea, o se retuerce al estar sentado/a.",
      "No mantiene bien el equilibrio.",
    ],
  },
  {
    titulo: "PLANIFICACIÓN E IDEAS",
    preguntas: [
      "Tiene problemas en generar nuevas ideas durante el juego.",
      "Repite actividades familiares una y otra vez en vez de probar actividades nuevas.",
      "Tiene dificultad imitando movimientos, sonidos, o expresiones correctamente.",
      "Tiene dificultad para copiar lo que hace un adulto u otro niño al construir con bloques.",
      "Tiene dificultad para planear como cargar varias cosas al mismo tiempo.",
      "Tiene dificultad con tareas que requieren coordinación de las dos manos como para abrir un envase.",
      "No termina las tareas que requieren varios pasos.",
      "No desempeña la secuencia lógica de acciones necesarias en su rutina diaria como al guardar sus artículos escolares.",
      "Tiene dificultad en generar ideas de que hacer o que construir como cuando está jugando con bloques o con materiales para el arte.",
      "Tiene dificultad copiando un modelo completo correctamente para crear uno idéntico.",
    ],
  },
  {
    titulo: "PARTICIPACIÓN SOCIAL",
    preguntas: [
      "Participa de manera apropiada en \"circle time.\"",
      "Pasa de una actividad a una nueva sin problema.",
      "Se une al juego con otros sin alterar lo que está transcurriendo.",
      "Sigue las reglas y rutinas de la clase.",
      "Comparte juguetes y materiales de la clase cuando se lo piden.",
      "Colabora con otros en una tarea común como haciendo la limpieza.",
      "Interactúa con sus compañeros en juegos \"de mentira.\"",
      "Resuelve conflictos con sus compañeros sin la intervención del/de la maestro/a.",
      "Mantiene contacto visual apropiado al conversar.",
      "Es flexible cuando su rutina cambia.",
    ],
  },
];

const ITEMS = (() => {
  let numero = 0;
  return SECCIONES.flatMap((seccion) =>
    seccion.preguntas.map((texto) => ({
      numero: ++numero,
      texto,
      seccion: seccion.titulo,
    }))
  );
})();

const DATOS = [
  { id: "dato-nombreNino", campo: "nombreNino", etiqueta: "Nombre del Niño o Niña", tipo: "text" },
  { id: "dato-edad", campo: "edad", etiqueta: "Edad", tipo: "number" },
  { id: "dato-nombreResponde", campo: "nombreResponde", etiqueta: "Nombre de quién responde", tipo: "text" },
  { id: "dato-relacion", campo: "relacion", etiqueta: "Relación con el niño o niña", tipo: "text" },
  { id: "dato-profesional", campo: "profesional", etiqueta: "Nombre del/la Profesional", tipo: "text" },
];

const DATOS_INICIALES = {
  nombreNino: "",
  edad: "",
  nombreResponde: "",
  relacion: "",
  profesional: "",
};

const ETIQUETAS_VALOR = Object.fromEntries(
  OPCIONES.map((o) => [o.valor, o.etiqueta])
);

export default function FormularioSPM2EscolarPreescolar() {
  const [datos, setDatos] = useState(DATOS_INICIALES);
  const [respuestas, setRespuestas] = useState({});
  const [errores, setErrores] = useState(new Set());
  const [resultado, setResultado] = useState(null);
  const [verResumen, setVerResumen] = useState(false);

  const totalPreguntas = ITEMS.length;
  const respondidas = Object.keys(respuestas).length;
  const progreso = Math.round((respondidas / totalPreguntas) * 100);

  function actualizarDato(campo, valor) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => {
      if (!prev.has(`dato-${campo}`)) return prev;
      const next = new Set(prev);
      next.delete(`dato-${campo}`);
      return next;
    });
  }

  function responder(numero, valor) {
    setRespuestas((prev) => ({ ...prev, [numero]: valor }));
    setErrores((prev) => {
      if (!prev.has(`q${numero}`)) return prev;
      const next = new Set(prev);
      next.delete(`q${numero}`);
      return next;
    });
  }

  function alEnviar(e) {
    e.preventDefault();

    const nuevosErrores = new Set();
    for (const d of DATOS) {
      if (!datos[d.campo].toString().trim()) nuevosErrores.add(d.id);
    }
    const edad = Number(datos.edad);
    if (!Number.isInteger(edad) || edad < 2 || edad > 5) {
      nuevosErrores.add("dato-edad");
    }
    for (const item of ITEMS) {
      if (!respuestas[item.numero]) nuevosErrores.add(`q${item.numero}`);
    }

    setErrores(nuevosErrores);

    if (nuevosErrores.size > 0) {
      const primero = document.getElementById(nuevosErrores.values().next().value);
      primero?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const conteo = { nunca: 0, ocasionalmente: 0, frecuentemente: 0, siempre: 0 };
    let puntajeTotal = 0;
    for (const item of ITEMS) {
      const valor = respuestas[item.numero];
      conteo[valor] += 1;
      puntajeTotal += OPCIONES.find((o) => o.valor === valor).puntaje;
    }

    setResultado({ conteo, puntajeTotal });
    setVerResumen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reiniciar() {
    setDatos(DATOS_INICIALES);
    setRespuestas({});
    setErrores(new Set());
    setResultado(null);
    setVerResumen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (verResumen && resultado) {
    const informe = {
      nombreArchivo: "Informe-SPM-2-ESCOLAR-Preescolar-2-5-anios",
      instrumento: "SPM-2 ESCOLAR · Preescolar 2 - 5 años",
      norma: "preescolarEscolar",
      datos: DATOS.map((d) => ({ etiqueta: d.etiqueta, valor: datos[d.campo] })),
      secciones: SECCIONES,
      respuestas,
      opciones: OPCIONES,
    };
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-6 flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl text-green-700 dark:bg-green-500/15 dark:text-green-400">
              ✓
            </span>
            <div>
              <h1 className="text-2xl font-bold">Respuestas registradas</h1>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                Gracias. El formulario SPM-2 ESCOLAR se completó correctamente.
              </p>
            </div>
          </div>

          <div className="mb-6 grid gap-2 rounded-xl bg-neutral-50 p-4 text-sm dark:bg-neutral-800/60">
            {DATOS.map((d) => (
              <p key={d.id}>
                <span className="font-semibold">{d.etiqueta}: </span>
                {datos[d.campo]}
              </p>
            ))}
          </div>

          <h2 className="mb-3 font-bold">Resumen de frecuencia</h2>
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            {OPCIONES.map((o) => (
              <div
                key={o.valor}
                className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 dark:border-neutral-800"
              >
                <span className="text-sm font-semibold">{o.etiqueta}</span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {resultado.conteo[o.valor]}
                </span>
              </div>
            ))}
          </div>

          <p className="mb-8 rounded-xl bg-indigo-50 px-4 py-3 text-sm dark:bg-indigo-500/10">
            <span className="font-semibold">Puntaje total: </span>
            {resultado.puntajeTotal} de {totalPreguntas * 4}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => descargarInformePDFEscolarPreescolar(informe)}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Descargar informe PDF
            </button>
            <button
              type="button"
              onClick={() => descargarInformeWord(informe)}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Descargar informe Word
            </button>
            <button
              type="button"
              onClick={() => setVerResumen(false)}
              className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Volver al formulario
            </button>
            <button
              type="button"
              onClick={reiniciar}
              className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Completar otro formulario
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16">
      {/* Barra de progreso fija */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <p className="truncate text-sm font-semibold">
            SPM-2 ESCOLAR <span className="font-normal text-neutral-500">· Preescolar 2 - 5 años</span>
          </p>
          <p className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
            {respondidas} de {totalPreguntas} respondidas
          </p>
        </div>
        <div className="mx-auto mt-2 h-1.5 max-w-3xl overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      <h1 className="mb-6 text-3xl font-bold sm:text-4xl">
        SPM-2 ESCOLAR <span aria-hidden="true">→</span> Preescolar 2 - 5 años
      </h1>

      {/* Instrucciones */}
      <section className="mb-10 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">Instrucciones</h2>
        <p className="text-sm leading-relaxed">
          Por favor conteste estas preguntas en base a la conducta típica de su niño/a durante el
          mes pasado. Seleccione solo la respuesta que mejor describa la frecuencia con la cual
          esta conducta ocurre, usando la siguiente escala de evaluación.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {OPCIONES.map((o) => (
            <li key={o.valor}>
              <span className="font-bold">{o.etiqueta}:</span> {o.descripcion}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed">
          Algunas preguntas inquieren acerca de que si este/a niño/a se &ldquo;angustia&rdquo; en
          ciertas situaciones. Angustia puede incluir expresiones verbales (gimiendo, llorando,
          gritando) o expresiones sin uso de palabras (apartándose, haciendo gestos, descartando
          alguna cosa, escapándose, haciendo gestos de dolor, azotando).
        </p>
        <p className="mt-4 text-xs text-red-600 dark:text-red-400">
          * Indica que la pregunta es obligatoria.
        </p>
      </section>

      <form onSubmit={alEnviar} noValidate>
        {/* Datos generales */}
        <section className="mb-10 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
          {DATOS.map((d) => {
            const conError = errores.has(d.id);
            return (
              <div key={d.id} id={d.id} className="mb-5 last:mb-0">
                <label htmlFor={d.id} className="mb-2 block text-sm font-medium">
                  {d.etiqueta} <span className="text-red-600 dark:text-red-400">*</span>
                </label>
                <input
                  id={d.id}
                  type={d.tipo}
                  value={datos[d.campo]}
                  onChange={(e) => actualizarDato(d.campo, e.target.value)}
                  min={d.campo === "edad" ? 2 : undefined}
                  max={d.campo === "edad" ? 5 : undefined}
                  step={d.campo === "edad" ? 1 : undefined}
                  required
                  aria-invalid={conError}
                  className={`w-full max-w-md rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                    conError
                      ? "border-red-400 ring-1 ring-red-300 dark:border-red-500"
                      : "border-neutral-300 dark:border-neutral-700"
                  }`}
                />
                {conError && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {d.campo === "edad"
                      ? "Ingresa una edad entera entre 2 y 5 años."
                      : "Este campo es obligatorio."}
                  </p>
                )}
              </div>
            );
          })}
        </section>

        {/* Secciones de preguntas */}
        {SECCIONES.map((seccion, indice) => {
          const desde = indice * 10 + 1;
          const hasta = desde + seccion.preguntas.length - 1;
          return (
            <section key={seccion.titulo} className="mb-10">
              <div className="mb-4 flex items-baseline gap-3">
                <h2 className="text-lg font-bold">{seccion.titulo}</h2>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Preguntas {desde} a {hasta}
                </span>
              </div>
              <div className="space-y-4">
                {seccion.preguntas.map((texto, i) => {
                  const numero = desde + i;
                  const clave = `q${numero}`;
                  const conError = errores.has(clave);
                  return (
                    <fieldset
                      key={numero}
                      id={clave}
                      className={`rounded-xl border bg-white p-4 sm:p-5 dark:bg-neutral-900 ${
                        conError
                          ? "border-red-400 ring-1 ring-red-300 dark:border-red-500"
                          : "border-neutral-200 dark:border-neutral-800"
                      }`}
                    >
                      <legend className="mb-3 text-sm font-medium leading-snug">
                        <span className="mr-1 font-bold text-neutral-500 dark:text-neutral-400">
                          {numero}.
                        </span>
                        {texto}{" "}
                        <span className="text-red-600 dark:text-red-400">*</span>
                      </legend>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {OPCIONES.map((o) => {
                          const seleccionado = respuestas[numero] === o.valor;
                          return (
                            <label
                              key={o.valor}
                              className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border px-2 py-2 text-center text-xs font-medium leading-tight transition-colors sm:text-sm ${
                                seleccionado
                                  ? "border-indigo-500 bg-indigo-50 text-indigo-900 dark:bg-indigo-500/15 dark:text-indigo-200"
                                  : "border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                              }`}
                            >
                              <input
                                type="radio"
                                name={clave}
                                value={o.valor}
                                checked={seleccionado}
                                onChange={() => responder(numero, o.valor)}
                                className="accent-indigo-600 shrink-0"
                              />
                              {o.etiqueta}
                            </label>
                          );
                        })}
                      </div>
                      {conError && (
                        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                          Seleccione una opción para continuar.
                        </p>
                      )}
                    </fieldset>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Envío */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
          {errores.size > 0 && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
              Faltan {errores.size} respuesta{errores.size === 1 ? "" : "s"} obligatoria
              {errores.size === 1 ? "" : "s"} por completar. Revise los campos marcados en rojo.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Enviar respuestas
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Seguro que desea borrar todas las respuestas?")) reiniciar();
              }}
              className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Borrar respuestas
            </button>
          </div>
        </section>
      </form>
    </main>
  );
}
