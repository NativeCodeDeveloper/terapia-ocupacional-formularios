"use client";

import { useState } from "react";
import { descargarInformePDF, descargarInformeWord } from "@/lib/informe";

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
      "Se tropieza con las cosas o con la gente como si no estuvieran ahí.",
      "Se distrae con cosas que están a la vista cerca de él/ella, como objetos en la pared o gente moviéndose alrededor.",
      "Tiene problemas para encontrar objetos en un estante.",
      "Tiene dificultad para seguir a objetos que se mueven con la vista.",
      "Mira fijamente a la gente o a los objetos.",
      "Se fastidia cuando el alumbrado que generalmente hay en un ambiente familiar cambia.",
      "Mira fijamente a algo que los demás no notan.",
      "Se abruma o se distrae en las tiendas por todas las cosas que se ven en las vitrinas.",
      "Se angustia o se pone incómodo(a) al mirar a objetos que se mueven rápidamente o a imágenes que parpadean.",
    ],
  },
  {
    titulo: "OÍDO",
    preguntas: [
      "Se fastidia tanto con los sonidos fuertes, como el de una aspiradora, que tiene que irse del sitio o hacer callar la fuente del algún modo.",
      "No nota los sonidos que otros notan.",
      "Nota o se fastidia con los sonidos que los demás no notan.",
      "Se distrae fácilmente con ruidos sutiles en el ambiente como el ruido del aire acondicionado o del refrigerador.",
      "Tiene dificultad para determinar de dónde provienen los sonidos o las voces.",
      "Tiene dificultad para enfocarse en una película cuando hay sonidos como gente abriendo envases de comida cerca de él/ella.",
      "No responde cuando llaman su nombre.",
      "Se fastidia con los sonidos agudos cómo los de silbatos o los de aparatos para hacer bulla en las fiestas.",
      "Se fija en sonidos a los que la mayoría de la gente no les presta atención.",
      "Oye cosas que otras personas no oyen.",
    ],
  },
  {
    titulo: "TACTO",
    preguntas: [
      "No se limpia la saliva o la comida de la cara.",
      "Reacciona a pequeños cortes o golpes quejándose de intenso dolor.",
      "Disfruta teniendo cosas como lápices o ropa en la boca.",
      "Trata de tocar superficies frías.",
      "Lame cosas que no son comibles.",
      "Reacciona fuertemente a toques leves o inesperados.",
      "Tiene dificultad para encontrar cosas en un bolsillo, una bolsa, o una mochila sin mirar.",
      "Evita cortarse las uñas de las manos o de los pies.",
      "Tiene que ser abrazado cada vez que se cepilla los dientes o cuando recibe atención dental.",
      "No se da cuenta cuando la ropa se le ha enrollado en el cuerpo.",
    ],
  },
  {
    titulo: "GUSTO Y OLFATO",
    preguntas: [
      "Se fastidia con olores que no les molestan a los demás.",
      "Evita probar comidas nuevas.",
      "Tiene arcadas a causa de los olores de la comida.",
      "No le gusta comer en restaurantes porque los olores y sabores son diferentes.",
      "Evita las comidas que tengan un sabor u olor fuerte.",
      "Evita ciertos olores como los del perfume o las velas.",
      "Se fastidia con el sabor de ciertas comidas.",
      "Se fastidia con el olor de ciertas comidas.",
      "Nota fragancias u olores que otros no notan.",
      "Evita estar con grupos de gente en espacios cerrados como en los ascensores o en habitaciones atestadas a causa del olor.",
    ],
  },
  {
    titulo: "CONCIENCIA CORPORAL",
    preguntas: [
      "Usa demasiada fuerza para ciertas cosas, por ejemplo tira las puertas o presiona el teclado muy fuerte.",
      "Tiende a derramar o tirar las cosas que lleva en un azafate.",
      "Muerde cosas como lápices o ropa repetidamente.",
      "Maneja los recipientes tan bruscamente o tan fuerte que se abollan, se rompen, o se derraman.",
      "Agarra las cosas de un modo tan suelto que se le caen de la mano.",
      "Empuja, pega, o abraza tan fuerte que los demás se quejan.",
      "Rompe las cosas al presionarlas, jalarlas, o empujarlas demasiado fuerte.",
      "Vuelca las cosas por accidente.",
      "Tiene dificultad para soplar con suficiente fuerza como para inflar un globo.",
      "No controla los cubiertos bien.",
    ],
  },
  {
    titulo: "EQUILIBRIO Y MOVIMIENTO",
    preguntas: [
      "Se disgusta al echar su cabeza hacia atrás, como cuando mira algo que está encima de él/ella o cuando se enjuaga el cabello.",
      "Se disgusta al subir en ascensores o en escaleras mecánicas debido al movimiento.",
      "Evita caminar sobre superficies disparejas que requieren equilibrio como la tierra o el pasto.",
      "Se tropieza, se cae, o pierde el equilibrio al correr o hacer deportes.",
      "Se siente incómodo(a) en escaleras o escalones.",
      "Tiene que apoyarse en algo cuando se sienta en el suelo.",
      "No se sujeta cuando se está cayendo.",
      "Pierde el equilibrio cuando se agacha.",
      "Tiene dificultad para mirar algo mientras su cabeza está en movimiento como al correr para agarrar una pelota.",
      "Evita sentarse en asientos que no tienen respaldo.",
    ],
  },
  {
    titulo: "PLANIFICACIÓN E IDEAS",
    preguntas: [
      "Tiene problemas imitando acciones que se le demuestran como un nuevo paso de baile o el uso de una herramienta nueva.",
      "Tiene problemas siguiendo las instrucciones de como armar algo como un estante o un carro en miniatura.",
      "Necesita más práctica que los demás para adquirir una habilidad nueva.",
      "Tiene problemas con tareas que requieren coordinación de las dos manos como abrir un envase o empacar un regalo.",
      "Tiene dificultad para seguir los pasos de una tarea nueva como los de una receta o de un manual de reparaciones.",
      "Tiene problemas para generar ideas para nuevas actividades o juegos.",
      "Prefiere repetir actividades una y otra vez de la misma forma en vez de cambiar algo en la actividad o cambiar a una nueva actividad.",
      "Toma más tiempo que los demás en completar las tareas necesarias en el hogar.",
      "Tiene dificultad para planear como cargar varias cosas al mismo tiempo.",
      "Tiene problemas para completar en el orden correcto los pasos de las rutinas familiares, como al vestirse o al preparar el desayuno.",
    ],
  },
  {
    titulo: "PARTICIPACIÓN SOCIAL",
    preguntas: [
      "Se lleva bien con sus amigos, con facilidad, sin hacer dramas o discutir.",
      "Se lleva bien con los adultos que no son parte de la familia.",
      "Participa en actividades sociales fuera de la escuela.",
      "Muestra interés en hacer contacto visual con la gente cuando les habla.",
      "No se pone nervioso(a) cuando está rodeado de gente.",
      "Busca actividades extracurriculares como los deportes organizados o clubes de intereses especializados.",
      "Hace cosas para agradar a sus amigos.",
      "Luce como si siempre estuviera limpio/a y bien arreglado/a, hasta el punto que sus amigos y su familia se quejan.",
      "Parece que ignora a la gente.",
      "Habla demasiado suavemente o con voz demasiado alta.",
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
  { id: "dato-nombreUsuario", campo: "nombreUsuario", etiqueta: "Nombre del Usuario/a", tipo: "text", requerido: true },
  { id: "dato-edad", campo: "edad", etiqueta: "Edad", tipo: "number", requerido: true },
  { id: "dato-nombreResponde", campo: "nombreResponde", etiqueta: "Nombre de quién responde", tipo: "text", requerido: true },
  { id: "dato-relacion", campo: "relacion", etiqueta: "Relación de quién responde con el usuario/a", tipo: "text", requerido: true },
  { id: "dato-profesional", campo: "profesional", etiqueta: "Nombre del/la Profesional", tipo: "text", requerido: true },
];

const DATOS_INICIALES = {
  nombreUsuario: "",
  edad: "",
  nombreResponde: "",
  relacion: "",
  profesional: "",
};

export default function FormularioSPM2HogarAdolescente() {
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
      if (d.requerido && !datos[d.campo].toString().trim()) nuevosErrores.add(d.id);
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
      nombreArchivo: "Informe-SPM-2-HOGAR-Adolescente-12-21",
      instrumento: "SPM-2 HOGAR · Adolescente 12 - 21",
      norma: "adolescenteHogar",
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
                Gracias. El formulario SPM-2 HOGAR se completó correctamente.
              </p>
            </div>
          </div>

          <div className="mb-6 grid gap-2 rounded-xl bg-neutral-50 p-4 text-sm dark:bg-neutral-800/60">
            {DATOS.map((d) => (
              <p key={d.id}>
                <span className="font-semibold">{d.etiqueta}: </span>
                {datos[d.campo] || "—"}
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
              onClick={() => descargarInformePDF(informe)}
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
            SPM-2 HOGAR <span className="font-normal text-neutral-500">· Adolescente 12 - 21</span>
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
        SPM-2 HOGAR <span aria-hidden="true">→</span> Adolescente 12 - 21
      </h1>

      {/* Instrucciones */}
      <section className="mb-10 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">Instrucciones</h2>
        <p className="text-sm leading-relaxed">
          Por favor conteste estas preguntas en base a la conducta típica del usuario durante el
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
          Algunas preguntas inquieren acerca de que si se &ldquo;angustia&rdquo; en ciertas
          situaciones. Angustia puede incluir expresiones verbales (gimiendo, llorando, gritando)
          o expresiones sin uso de palabras (apartándose, haciendo gestos, descartando alguna
          cosa, escapándose, haciendo gestos de dolor, azotando).
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
                  {d.etiqueta}{" "}
                  {d.requerido && <span className="text-red-600 dark:text-red-400">*</span>}
                </label>
                <input
                  id={d.id}
                  type={d.tipo}
                  value={datos[d.campo]}
                  onChange={(e) => actualizarDato(d.campo, e.target.value)}
                  required={d.requerido}
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
