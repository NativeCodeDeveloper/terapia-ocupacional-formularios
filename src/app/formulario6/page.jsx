"use client";

import { useState } from "react";
import { descargarInformePDFAutoReporteAdulto } from "@/lib/informe-autoreporte-adulto";

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
      "La luz del sol o luces brillantes me fastidian.",
      "Yo tengo problemas para encontrar objetos en un estante.",
      "Las luces que parpadean me fastidian.",
      "Yo tengo problemas para seguir a objetos que se mueven con la vista.",
      "Yo me tropiezo con las cosas o con la gente porque no me doy cuenta de que están a mi paso.",
      "Yo tengo problemas para percibir los letreros de las calles o las señales de tránsito cuando estoy en un lugar nuevo.",
      "Yo tengo dificultad para juzgar la velocidad de autos que se acercan.",
      "Yo tengo dificultad para encontrar lo que busco en un mapa o en la guía de un centro comercial.",
      "Yo me distraigo por objetos que se mueven y que puedo ver con el rabillo del ojo.",
      "Yo pierdo mi lugar cuando muevo la vista de un sitio a otro, por ejemplo leyendo de una línea de texto a la siguiente.",
    ],
  },
  {
    titulo: "OÍDO",
    preguntas: [
      "Me fastidian los sonidos fuertes como el de una aspiradora.",
      "Yo necesito estar en un sitio muy silencioso para poder trabajar o dormir.",
      "Yo me distraigo fácilmente con ruidos sutiles en el ambiente como el ruido del aire acondicionado o del refrigerador.",
      "Los sonidos fuertes o inesperados me hacen sobresaltar fácilmente.",
      "Yo noto sonidos que los demás no notan.",
      "Yo tengo dificultad para determinar de dónde provienen los sonidos o las voces.",
      "Los sonidos agudos, como los de silbatos o aparatos para hacer bulla en las fiestas, me molestan.",
      "Yo evito los lugares donde hay música o ruido fuerte.",
      "Yo tengo dificultad para enfocarme en una película cuando hay ruidos cerca como el de gente abriendo los envases de comida.",
      "Yo tengo dificultad para oír a la gente cuando me están hablando en un sitio bullicioso como un restaurante.",
    ],
  },
  {
    titulo: "TACTO",
    preguntas: [
      "Yo tengo dificultad para encontrar cosas en un bolsillo, una bolsa, o una mochila sin mirar.",
      "No me gusta que la gente me toque o que esté demasiado cerca de mí.",
      "La sensación de ciertas ropas me disgusta.",
      "Me disgusta tener cosas pegajosas o sucias en mis manos.",
      "Otros tienen que decirme cuando yo necesito limpiarme algo de la cara porque yo no me doy cuenta de eso.",
      "La comida tiene que estar exactamente a la temperatura correcta para que yo me la coma.",
      "Yo evito ciertas comidas debido a sus texturas.",
      "Yo hago caer las cosas porque no las siento deslizarse de entre mis dedos.",
      "Yo tengo problemas con cierres que no puedo ver como para abotonar mi cuello sin un espejo.",
      "Me es difícil sentir cuando la ropa se me ha enrollado en el cuerpo.",
    ],
  },
  {
    titulo: "GUSTO Y OLFATO",
    preguntas: [
      "Yo evito probar comidas nuevas.",
      "Yo noto fragancias u olores que otros no notan.",
      "No me gusta comer en restaurantes debido a los diferentes olores y sabores.",
      "Me fastidian olores que a los demás no les molestan.",
      "Yo evito estar con grupos de gente en sitios encerrados, como en los ascensores o en habitaciones atestadas, debido al olor.",
      "Cuando me encuentro con algo nuevo, me gusta olerlo.",
      "Los sabores de ciertas comidas me disgustan.",
      "Yo detecto sabores amargos o ácidos aunque sean muy leves.",
      "Me gusta olfatear u oler a la gente.",
      "Yo insisto en comer la misma marca de un cierto alimento debido al sabor.",
    ],
  },
  {
    titulo: "CONCIENCIA CORPORAL",
    preguntas: [
      "Yo tiro la pelota con demasiada o con muy poca fuerza para embocarla.",
      "Yo tiendo a derramar o derribar las cosas que llevo en un azafate (bandeja).",
      "Yo manejo los recipientes tan bruscamente o tan fuerte que se abollan, se rompen, o derraman.",
      "Yo agarro las cosas de un modo tan suelto que se me caen de la mano.",
      "Yo rompo las cosas al presionarlas, jalarlas, o empujarlas demasiado fuerte.",
      "Yo vuelco las cosas por accidente.",
      "Yo tiendo a usar demasiada presión para la tarea que estoy haciendo, por ejemplo rompo las puntas de los lápices al escribir.",
      "Me gusta chocar contra las cosas.",
      "Los demás se quejan de que yo empujo, abrazo, o pego demasiado fuerte.",
      "Yo tiro las puertas al cerrarlas o las empujo al abrirlas con demasiada fuerza.",
    ],
  },
  {
    titulo: "EQUILIBRIO Y MOVIMIENTO",
    preguntas: [
      "No me gustan las actividades que me hagan echar la cabeza hacia atrás como para mirar algo que esté encima o para enjuagarme el cabello.",
      "No me gusta subir en ascensores o en escaleras mecánicas porque el movimiento me pone incómoda/o.",
      "Yo evito caminar sobre superficies desiguales que requieran equilibrio como la tierra o el pasto.",
      "Yo me tropiezo o pierdo el equilibrio.",
      "Yo me siento incómoda/o en escaleras o escaleras de mano.",
      "Cuando me siento en el suelo tengo que apoyarme en algo.",
      "Yo me mareo cuando tuerzo mi cabeza de un lado a otro como al mirar en los dos sentidos antes de cruzar la calle.",
      "Yo me pongo incómoda/o cuando tengo que sentarme en un asiento sin respaldo.",
      "Yo me mezo o me doy vueltas en la silla cuando estoy sentada/o en un escritorio o en una mesa.",
      "Yo me desplomo o sujeto mi cabeza en alto con las manos cuando estoy sentada/o en un escritorio.",
    ],
  },
  {
    titulo: "PLANIFICACIÓN E IDEAS",
    preguntas: [
      "Yo necesito más práctica que los demás para adquirir una habilidad nueva.",
      "Yo tengo dificultad para planear como cargar varias cosas al mismo tiempo.",
      "Me es difícil mantener las cosas organizadas.",
      "Yo necesito decir los pasos de una tarea dentro de mí misma/o mientras la estoy haciendo.",
      "Yo tengo dificultad para completar las tareas que requieren muchos pasos que tienen que ser hechos en el orden correcto.",
      "Yo tengo dificultad para seguir los pasos de una tarea nueva, como los de una receta o los de un manual de reparaciones.",
      "Yo tengo problemas en generar ideas para nuevas actividades.",
      "Yo tengo problemas siguiendo un diagrama para construir algo como por ejemplo para armar muebles.",
      "Yo tengo dificultad usando mi imaginación para crear nuevos juegos o actividades cuando juego con niños.",
      "Yo tengo dificultad para generar ideas durante juegos como charadas.",
    ],
  },
  {
    titulo: "PARTICIPACIÓN SOCIAL",
    preguntas: [
      "Yo me llevo bien con los demás.",
      "Yo disfruto estando con mis amigos.",
      "Yo evito actividades sociales con gente que no conozco.",
      "Yo disfruto participando en reuniones familiares.",
      "Yo me uno a actividades con otros sin perturbar la actividad que está en progreso.",
      "Me es difícil hacer contacto visual con la gente cuando les hablo.",
      "Yo me quedo atascada/o en un solo tema cuando hablo con otros.",
      "Los demás me dicen que yo parezco estar ignorando a la gente, cuando en realidad yo ni siquiera me había dado cuenta de que estaban allí.",
      "La gente me dice que yo hablo demasiado suavemente o con voz demasiado alta.",
      "Me gusta trabajar como parte de un equipo.",
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
  { id: "dato-nombre", campo: "nombre", etiqueta: "Nombre", tipo: "text", requerido: true },
  { id: "dato-edad", campo: "edad", etiqueta: "Edad", tipo: "number", requerido: true },
  { id: "dato-fechaNacimiento", campo: "fechaNacimiento", etiqueta: "Fecha de Nacimiento", tipo: "date", requerido: true },
  { id: "dato-comentarios", campo: "comentarios", etiqueta: "Comentarios", tipo: "textarea", requerido: true },
  { id: "dato-profesional", campo: "profesional", etiqueta: "Nombre del/la Profesional", tipo: "text", requerido: true },
];

const DATOS_INICIALES = {
  nombre: "",
  edad: "",
  fechaNacimiento: "",
  comentarios: "",
  profesional: "",
};

export default function FormularioSPM2AdultoAutoinforme() {
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
      nombreArchivo: "Informe-SPM-2-Adulto-Autoinforme-21-87",
      instrumento: "SPM-2 · Adulto (Autoinforme) 21 - 87",
      norma: "adultoAuto",
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
                Gracias. El formulario SPM-2 se completó correctamente.
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
              onClick={() => descargarInformePDFAutoReporteAdulto(informe)}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Descargar informe PDF
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
            SPM-2 <span className="font-normal text-neutral-500">· Adulto (Autoinforme) 21 - 87</span>
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
        SPM-2 <span aria-hidden="true">→</span> Adulto (Autoinforme) 21 - 87
      </h1>

      {/* Instrucciones */}
      <section className="mb-10 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">Instrucciones</h2>
        <p className="text-sm leading-relaxed">
          Por favor contesta estas preguntas en base a tu conducta típica durante el mes pasado.
          Selecciona solo la respuesta que mejor describa la frecuencia con la cual esta conducta
          ocurre, usando la siguiente escala de evaluación.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {OPCIONES.map((o) => (
            <li key={o.valor}>
              <span className="font-bold">{o.etiqueta}:</span> {o.descripcion}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-red-600 dark:text-red-400">
          * Indica que la pregunta es obligatoria.
        </p>
      </section>

      <form onSubmit={alEnviar} noValidate>
        {/* Datos generales */}
        <section className="mb-10 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
          {DATOS.map((d) => {
            const conError = errores.has(d.id);
            const clasesCampo = `w-full max-w-md rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
              conError
                ? "border-red-400 ring-1 ring-red-300 dark:border-red-500"
                : "border-neutral-300 dark:border-neutral-700"
            }`;
            return (
              <div key={d.id} id={d.id} className="mb-5 last:mb-0">
                <label htmlFor={d.id} className="mb-2 block text-sm font-medium">
                  {d.etiqueta}{" "}
                  {d.requerido && <span className="text-red-600 dark:text-red-400">*</span>}
                </label>
                {d.tipo === "textarea" ? (
                  <textarea
                    id={d.id}
                    rows={3}
                    value={datos[d.campo]}
                    onChange={(e) => actualizarDato(d.campo, e.target.value)}
                    required={d.requerido}
                    aria-invalid={conError}
                    className={clasesCampo}
                  />
                ) : (
                  <input
                    id={d.id}
                    type={d.tipo}
                    value={datos[d.campo]}
                    onChange={(e) => actualizarDato(d.campo, e.target.value)}
                    required={d.requerido}
                    aria-invalid={conError}
                    className={clasesCampo}
                  />
                )}
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
