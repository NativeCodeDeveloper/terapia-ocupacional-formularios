"use client";

import { useState } from "react";
import { descargarPDF, descargarWord } from "@/lib/descargar";

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
      "Se fastidia con la luz brillante.",
      "Tiene problemas para encontrar objetos en medio de otros.",
      "Se angustia en lugares donde el ambiente visual es poco común como en habitaciones de colores fuertes o habitaciones con poca luz.",
      "Tiene dificultad siguiendo a objetos que se mueven con la vista.",
      "Tiene dificultad para reconocer como se parecen o como difieren los objetos en base a sus colores, formas o tamaños.",
      "Se disgusta con ciertos tipos de iluminación como luces estroboscópicas (destellos muy rápidos), luces parpadeantes, o luces fluorescentes.",
      "Mira a objetos con el rabillo del ojo.",
      "Se abruma o se distrae en las tiendas por todas las cosas que se ven en las vitrinas.",
      "Se distrae con objetos o gente que están visibles.",
      "Busca áreas que estén oscuras.",
    ],
  },
  {
    titulo: "OÍDO",
    preguntas: [
      "Se fastidia con los sonidos caseros comunes como el de una aspiradora.",
      "Responde a los ruidos fuertes escampándose, llorando, o poniéndose las manos sobre los oídos.",
      "No nota los sonidos que otros notan.",
      "Parece estar intensamente interesado/a en sonidos que otros no notan.",
      "Se asusta con sonidos que a los demás no les molestan.",
      "Se distrae o se fastidia con ruidos en el ambiente que otros ignoran como una máquina de cortar el césped o el ruido del aire acondicionado.",
      "Le gusta hacer ciertos sonidos repetidamente como tararear o jalar la cadena de la taza del baño.",
      "Se angustia cuando hay sonidos agudos como silbatos o aparatos para hacer bulla en las fiestas.",
      "Se sobresalta fácilmente cuando hay ruidos fuertes o inesperados.",
      "Evita los lugares donde hay música o ruido fuerte.",
    ],
  },
  {
    titulo: "TACTO",
    preguntas: [
      "Se aparta cuando lo/la tocan levemente o inesperadamente.",
      "Se angustia con la sensación de la ropa nueva.",
      "Se angustia cuando le cortan las uñas de las manos o de los pies.",
      "Se fastidia cuando alguien le toca la cara.",
      "Evita tocar o jugar con cosas que ensucian como la pintura o la goma de pegar.",
      "Tiene una gran capacidad para tolerar el dolor y heridas pequeñas, demuestra nada o poca/o molestia.",
      "No le gusta cepillarse los dientes.",
      "Tiene dificultad para encontrar cosas en un bolsillo, una bolsa, o una mochila sin mirar.",
      "No se limpia la saliva o la comida de la cara.",
      "Se queja de que las comidas están “demasiado calientes” o “demasiado frías.”",
    ],
  },
  {
    titulo: "GUSTO Y OLFATO",
    preguntas: [
      "Hace arcadas o vomita a causa de ciertos olores.",
      "Se fastidia con olores que no les molestan a los demás.",
      "No nota los olores fuertes o raros.",
      "Huele los objetos nuevos o las cosas nuevas antes de usarlos.",
      "Nota fragancias u olores que otros no notan.",
      "Se fastidia con el sabor de ciertas comidas.",
      "Insiste en comer solo ciertas comidas o ciertas marcas de alimentos.",
      "Evita probar comidas nuevas.",
      "Evita baños públicos debido a los olores.",
      "No distingue sabores ni expresa preferencias entre ellos.",
    ],
  },
  {
    titulo: "CONCIENCIA DEL CUERPO",
    preguntas: [
      "Busca actividades que consisten en empujar, jalar, o arrastrar.",
      "Agarra objetos, como un lápiz o una cuchara, de una manera demasiado suelta o demasiado fuerte para poder usarlos fácilmente.",
      "Usa demasiada fuerza para ciertas cosas, por ejemplo tira las puertas o presiona el teclado muy fuerte.",
      "Salta mucho.",
      "Juega con sus compañeros/as de una manera demasiado brusca.",
      "Rompe las cosas al presionarlas, jalarlas, o empujarlas demasiado fuerte.",
      "Pone demasiada comida en su boca.",
      "Se golpea la cabeza a propósito contra algún objeto o contra la gente.",
      "Derrama o vuelca las cosas.",
      "Tira la pelota con mucha o con muy poca fuerza.",
    ],
  },
  {
    titulo: "EQUILIBRIO Y MOVIMIENTO",
    preguntas: [
      "Le tiene miedo a ciertos movimientos como el de columpiarse o deslizarse en el tobogán.",
      "No mantiene bien el equilibrio.",
      "Evita caminar sobre superficies disiguales que requieren equilibrio como la tierra o el pasto.",
      "Se cae de la silla cuando cambia de posición.",
      "No le gusta echar su cabeza hacia atrás como cuando mira algo que esté encima de él/ella o cuando se enjuaga el cabello.",
      "Muestra poca coordinación en el uso de los dos lados de su cuerpo como al cruzar un pie sobre los dos pies al mismo tiempo o para sacar algo de una esquina con una cuchara.",
      "Se apoya sobre las paredes, los muebles, o la gente para sostenerse al estar parado/a.",
      "Se mece, se balancea, o se retuerce al estar sentado/a.",
      "Busca oportunidades para estar de cabeza.",
      "Tiene dificultad en mirar algo mientras su cabeza está en movimiento como al correr para agarrar una pelota.",
    ],
  },
  {
    titulo: "PLANIFICACIÓN E IDEAS",
    preguntas: [
      "Tiene dificultad para planear como cargar varias cosas al mismo tiempo.",
      "Tiene dificultad para guardar sus pertenencias en sus lugares correctos.",
      "No desempeña la secuencia lógica de acciones necesarias en su rutina diaria como al vestirse o poner la mesa.",
      "No termina las tareas que requieren varios pasos.",
      "Tiene dificultad imitando movimientos, sonidos, o expresiones correctamente.",
      "Tiene dificultad para copiar un modelo al construir con bloques o con Legos.",
      "Tiene dificultad con tareas que requieren coordinación de las dos manos como para abrir un envase.",
      "Necesita más práctica que los demás para adquirir una habilidad nueva.",
      "Toma demasiado tiempo para completar tareas rutinarias.",
      "Tiene dificultad para generar ideas de que construir como cuando juega con bloques o con materiales de artesanía.",
    ],
  },
  {
    titulo: "PARTICIPACIÓN SOCIAL",
    preguntas: [
      "Colabora con sus amigos sin mucha discusión cuando juega con ellos.",
      "Interactúa de manera apropiada con padres y otros adultos.",
      "Comparte las cosas cuando se lo piden.",
      "Conversa con otros sin pararse o sentarse demasiado cerca de ellos.",
      "Mantiene contacto visual apropiado al conversar.",
      "Se une al juego con otros sin alterar lo que está transcurriendo.",
      "Interactúa y participa de manera apropiada en la conversación durante las comidas.",
      "Participa de manera apropiada en reuniones y salidas con la familia.",
      "Es flexible cuando su rutina cambia.",
      "Coopera con miembros de la familia mientras hacen recados.",
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
];

const DATOS_INICIALES = {
  nombreNino: "",
  edad: "",
  nombreResponde: "",
  relacion: "",
};

export default function FormularioSPM2Hogar512() {
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
    const descarga = {
      nombreArchivo: "SPM-2-HOGAR-Ninos-5-12-anios",
      titulo: "SPM-2 HOGAR",
      subtitulo: "Niños 5 - 12 años",
      datos: DATOS.map((d) => ({ etiqueta: d.etiqueta, valor: datos[d.campo] })),
      secciones: SECCIONES,
      respuestas,
      opciones: OPCIONES,
      resultado,
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
                Gracias. El formulario SPM-2 HOGAR se completó correctamente.
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
              onClick={() => descargarPDF(descarga)}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Descargar PDF
            </button>
            <button
              type="button"
              onClick={() => descargarWord(descarga)}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Descargar Word
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
            SPM-2 HOGAR <span className="font-normal text-neutral-500">· Niños 5 - 12 años</span>
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
        SPM-2 HOGAR <span aria-hidden="true">→</span> Niños 5 - 12 años
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
          Algunas preguntas inquireren acerca de que si este/a niño/a se &ldquo;angustia&rdquo; en
          ciertas situaciones. Angustia puede incluir expresiones verbales (gimiendo, llorando,
          gritando) o expresiones sin uso de palabras (apartándose, haciendo gestos, descartando
          alguna cosa, escampándose, haciendo gestos de dolor, azotando).
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
                    Esta pregunta es obligatoria.
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
                              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors sm:text-sm ${
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
                                className="accent-indigo-600"
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
