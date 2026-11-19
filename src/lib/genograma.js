/* ============================================================
   GENOGRAMA FAMILIAR · MODELO, BIBLIOTECA Y GEOMETRÍA
   Modelo de datos compartido por la sección opcional de los
   formularios, la vista previa SVG y la sección del informe.
   El genograma es un complemento de la evaluación: un
   genograma vacío o ausente es un estado válido y no altera
   ningún cálculo ni validación de los instrumentos.

   - persona:  { id, nombre, sexo, edad, fallecido, causaMuerte,
                 ocupacion, nota, indicado (usuario/a evaluado/a),
                 x, y }
   - vínculo:  { id, tipo, de, a }
       pareja: union (matrimonio) · convivencia · separacion ·
               divorcio — línea entre las dos personas.
       hijo:   `de` es el padre, la madre o el ID del vínculo de
               pareja (línea de descendencia) y `a` es el hijo.
               Un hijo admite varios orígenes (p. ej., hijo del
               padre y de la madre por separado).
   - relación: { id, tipo, de, a } calidad de la relación entre
               dos personas: cercana · fusion · distante ·
               conflicto · corte.

   Todas las operaciones son puras (devuelven un objeto nuevo)
   y toleran datos vacíos, incompletos o corruptos: nunca
   lanzan errores por falta de información.
   ============================================================ */

export const SEXOS = [
  { valor: "hombre", etiqueta: "Hombre" },
  { valor: "mujer", etiqueta: "Mujer" },
  { valor: "otro", etiqueta: "Otro" },
];

export const TIPOS_VINCULO = [
  { valor: "union", etiqueta: "Matrimonio o pareja estable", grupo: "pareja" },
  { valor: "convivencia", etiqueta: "Convivencia o pareja de hecho", grupo: "pareja" },
  { valor: "separacion", etiqueta: "Separación", grupo: "pareja" },
  { valor: "divorcio", etiqueta: "Divorcio", grupo: "pareja" },
  { valor: "hijo", etiqueta: "Hijo/a biológico/a", grupo: "descendencia" },
  { valor: "adoptado", etiqueta: "Hijo/a adoptado/a", grupo: "descendencia" },
  { valor: "crianza", etiqueta: "Hijo/a de crianza", grupo: "descendencia" },
];

/* Tipos de vínculo que son líneas de descendencia. */
export const esDescendencia = (tipo) => tipo === "hijo" || tipo === "adoptado" || tipo === "crianza";

/* Color de la descendencia especial (pauta: discontinua). */
export const COLOR_DESCENDENCIA = { adoptado: "#2563eb", crianza: "#15803d" };

/* Símbolos especiales de la persona (embarazo y partos). */
export const SIMBOLOS_PERSONA = [
  { valor: "embarazo", etiqueta: "Embarazo" },
  { valor: "abortoEspontaneo", etiqueta: "Aborto espontáneo" },
  { valor: "abortoInducido", etiqueta: "Aborto inducido" },
  { valor: "muerteFetal", etiqueta: "Muerte fetal" },
];

export const TIPOS_RELACION = [
  { valor: "cercana", etiqueta: "Relación cercana" },
  { valor: "fusion", etiqueta: "Relación de fusión" },
  { valor: "distante", etiqueta: "Relación distante" },
  { valor: "conflicto", etiqueta: "Relación de conflicto" },
  { valor: "corte", etiqueta: "Corte o ruptura del vínculo" },
];

export const ETIQUETA_SEXO = Object.fromEntries(SEXOS.map((s) => [s.valor, s.etiqueta]));
export const ETIQUETA_VINCULO = Object.fromEntries(TIPOS_VINCULO.map((t) => [t.valor, t.etiqueta]));
export const ETIQUETA_RELACION = Object.fromEntries(TIPOS_RELACION.map((t) => [t.valor, t.etiqueta]));

/* Tamaño de las figuras (semieje en unidades del lienzo SVG y
   del diagrama del informe). Compartido por editor, vista
   previa y PDF. */
export const NODO = { lado: 40, radio: 20 };

/* Colores de las relaciones de calidad, compartidos por el
   diagrama SVG, el PDF y los botones del editor: verdes las
   cercanas, rojas las distantes o rotas. */
export const COLOR_RELACION = {
  cercana: "#15803d",
  fusion: "#15803d",
  distante: "#dc2626",
  conflicto: "#dc2626",
  corte: "#dc2626",
};

/* Leyenda impresa bajo el diagrama del informe (pauta:
   «El genograma y el mapa de relaciones familiares»). */
export const LEYENDA_GENOGRAMA =
  "Cuadrado: hombre · Círculo: mujer · Rombo: otro · X dentro del símbolo: fallecido · Amarillo con doble borde: usuario/a evaluado/a · Triángulo: embarazo · Triángulo con X: aborto · Símbolo pequeño con X que sobresale: muerte fetal · Línea continua entre dos personas: matrimonio o pareja estable · Línea discontinua con casa: convivencia (pareja no casada) · Dos barras diagonales sobre la línea: separación o divorcio · Contorno continuo: hogar (quiénes viven juntos) · Línea verde doble: relación cercana; triple: relación de fusión · Línea roja punteada: relación distante; en zigzag: conflicto; con dos barras: corte o ruptura · Descendencia discontinua azul: hijo/a adoptado/a; verde: hijo/a de crianza · Líneas que nacen del mismo punto: gemelos o trillizos · Al costado de la figura: patologías principales";

/* ============================================================
   IDENTIFICADORES Y CREACIÓN
   ============================================================ */

export function nuevoId(prefijo = "g") {
  const sufijo =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefijo}-${sufijo}`;
}

export function genogramaVacio() {
  return { version: 1, personas: [], vinculos: [], relaciones: [], grupos: [], notas: "" };
}

/* Posición de cuadrícula por defecto: filas de cuatro figuras,
   con espacio para las etiquetas. */
function posicionDeCuadricula(indice) {
  return { x: 88 + (indice % 4) * 160, y: 88 + Math.floor(indice / 4) * 120 };
}

export function nuevaPersona(genograma, sexo = "hombre", posicion = null, simbolo = "") {
  const persona = {
    id: nuevoId("p"),
    nombre: "",
    sexo: SEXOS.some((s) => s.valor === sexo) ? sexo : "hombre",
    edad: "",
    fallecido: false,
    causaMuerte: "",
    patologiasAbrev: "",
    patologias: "",
    ocupacion: "",
    nota: "",
    indicado: false,
    simbolo: SIMBOLOS_PERSONA.some((s) => s.valor === simbolo) ? simbolo : "",
    ...(posicion ?? posicionDeCuadricula(genograma.personas.length)),
  };
  return { ...genograma, personas: [...genograma.personas, persona] };
}

export function personaActualizada(genograma, id, cambios) {
  return {
    ...genograma,
    personas: genograma.personas.map((p) => (p.id === id ? { ...p, ...cambios } : p)),
  };
}

/* Al eliminar una persona se limpian también los vínculos y
   relaciones que la referenciaban. Los hijos que descendían de
   una línea de pareja de la persona eliminada quedan unidos al
   otro integrante de la pareja, y los círculos de convivencia
   que quedan con menos de dos integrantes se disuelven. */
export function personaEliminada(genograma, id) {
  const otroDe = new Map(); // vínculo de pareja → integrante que queda
  for (const v of genograma.vinculos) {
    if (!esDescendencia(v.tipo)) {
      if (v.de === id) otroDe.set(v.id, v.a);
      else if (v.a === id) otroDe.set(v.id, v.de);
    }
  }
  return {
    ...genograma,
    personas: genograma.personas.filter((p) => p.id !== id),
    vinculos: genograma.vinculos
      .filter((v) => v.de !== id && v.a !== id)
      .map((v) => (esDescendencia(v.tipo) && otroDe.has(v.de) ? { ...v, de: otroDe.get(v.de) } : v)),
    relaciones: genograma.relaciones.filter((r) => r.de !== id && r.a !== id),
    grupos: (genograma.grupos ?? [])
      .map((g) => ({ ...g, integrantes: g.integrantes.filter((i) => i !== id) }))
      .filter((g) => g.integrantes.length >= 2),
  };
}

/* ============================================================
   CÍRCULOS DE CONVIVENCIA (quiénes viven juntos)
   Cada grupo se dibuja como un contorno continuo que rodea a
   sus integrantes en el diagrama (pauta: «línea continua
   alrededor» del hogar). Exige al menos dos personas.
   ============================================================ */

export const ETIQUETA_CONVIVENCIA = "Convivencia";

export function grupoAgregado(genograma, integrantes) {
  const ids = [...new Set(integrantes.filter((i) => genograma.personas.some((p) => p.id === i)))];
  if (ids.length < 2) return genograma;
  return {
    ...genograma,
    grupos: [...(genograma.grupos ?? []), { id: nuevoId("c"), nombre: "", integrantes: ids }],
  };
}

export function grupoActualizado(genograma, id, cambios) {
  return {
    ...genograma,
    grupos: (genograma.grupos ?? []).map((g) => (g.id === id ? { ...g, ...cambios } : g)),
  };
}

export function grupoEliminado(genograma, id) {
  return { ...genograma, grupos: (genograma.grupos ?? []).filter((g) => g.id !== id) };
}

/* ============================================================
   CONEXIONES (VÍNCULOS Y RELACIONES)
   ============================================================ */

function parDe(conexion) {
  return [conexion.de, conexion.a].sort().join("|");
}

/* Mapa de hijos directos: para cada persona, quiénes descienden
   de ella —por vínculo directo o por la línea de pareja de la
   que forma parte. */
function hijosDirectos(vinculos) {
  const parejas = new Map(
    vinculos.filter((v) => !esDescendencia(v.tipo)).map((v) => [v.id, [v.de, v.a]])
  );
  const hijos = new Map();
  for (const v of vinculos) {
    if (!esDescendencia(v.tipo)) continue;
    for (const miembro of parejas.get(v.de) ?? [v.de]) {
      hijos.set(miembro, [...(hijos.get(miembro) ?? []), v.a]);
    }
  }
  return hijos;
}

/* Verdadero cuando entre las dos personas ya hay una relación
   progenitor–hijo directa: una pareja entre ambas no tendría
   sentido en el genograma (es siempre un error de conexión) y
   no se crea; los datos guardados que la traigan se reparan. */
export function esProgenitorHijo(genograma, idA, idB) {
  const hijos = hijosDirectos(genograma.vinculos);
  return (hijos.get(idA) ?? []).includes(idB) || (hijos.get(idB) ?? []).includes(idA);
}

/* Vínculo de pareja entre dos personas, si existe. */
export function parejaEntre(genograma, idA, idB) {
  return (
    genograma.vinculos.find(
      (v) => !esDescendencia(v.tipo) && ((v.de === idA && v.a === idB) || (v.de === idB && v.a === idA))
    ) ?? null
  );
}

/* Agrega un vínculo o una relación. Reglas mínimas para
   mantener el diagrama legible:
   - exige que ambas personas existan («hijo» admite que `de`
     sea el ID del vínculo de pareja);
   - un hijo admite varios orígenes (p. ej., hijo del padre y
     de la madre); solo se evita duplicar el mismo origen;
   - una relación nueva reemplaza la anterior del mismo par;
   - no duplica el mismo par en un vínculo de pareja;
   - no crea parejas entre progenitor e hijo: la familia ya
     está relacionada por la descendencia;
   - marcar la descendencia entre dos personas ya unidas como
     pareja reemplaza ese vínculo equivocado: quedan relacionadas
     solo como progenitor e hijo, con una sola línea;
   - marcar la descendencia entre dos personas que ya la tienen
     registrada en el sentido inverso corrige el sentido, no
     agrega una segunda línea. */
export function conexionAgregada(genograma, tipo, de, a) {
  const personaA = genograma.personas.find((p) => p.id === a);
  if (!personaA || de === a) return genograma;
  const esHijo = esDescendencia(tipo);
  const esRelacion = TIPOS_RELACION.some((t) => t.valor === tipo);
  const origenValido = esHijo
    ? genograma.personas.some((p) => p.id === de) || genograma.vinculos.some((v) => v.id === de)
    : genograma.personas.some((p) => p.id === de);
  if (!origenValido) return genograma;

  if (esHijo) {
    /* Un hijo puede quedar conectado a varias personas a la vez
       (padres no emparentados, u otros familiares). Cuando los
       dos progenitores forman pareja, la descendencia se unifica
       en una sola línea que sale del punto medio de la pareja,
       como marca la pauta. */
    const parejaOrigen = genograma.vinculos.find((v) => v.id === de && !esDescendencia(v.tipo));
    if (parejaOrigen) {
      if (genograma.vinculos.some((v) => esDescendencia(v.tipo) && v.de === de && v.a === a)) return genograma;
      // Vínculos directos a los miembros de esta pareja que
      // existieran antes quedan absorbidos por la línea común.
      const miembros = [parejaOrigen.de, parejaOrigen.a];
      const restantes = genograma.vinculos.filter(
        (v) => !(esDescendencia(v.tipo) && v.a === a && miembros.includes(v.de))
      );
      return { ...genograma, vinculos: [...restantes, { id: nuevoId("v"), tipo, de, a, gemelar: "", identicos: false }] };
    }
    /* Dentro del mismo par de personas solo puede haber una
       descendencia y ninguna pareja:
       - ya registrada en el mismo sentido: no se duplica (y si
         quedara una pareja equivocada entre ambos, se elimina);
       - ya registrada en el sentido inverso (p. ej., primero
         «B es hijo/a de A» y ahora «A es hijo/a de B»): la nueva
         marca corrige el sentido en lugar de sumar una segunda
         línea, que era la que dibujaba la diagonal;
       - una pareja entre ambos (conexión equivocada): la
         descendencia la reemplaza y sus hijos pasan al
         progenitor. */
    const previaMisma = genograma.vinculos.find(
      (v) => esDescendencia(v.tipo) && v.de === de && v.a === a
    );
    const previaInvertida = genograma.vinculos.find(
      (v) => esDescendencia(v.tipo) && v.de === a && v.a === de
    );
    const parejaPrevia = parejaEntre(genograma, de, a);
    const sinPareja = parejaPrevia
      ? genograma.vinculos
          .filter((v) => v.id !== parejaPrevia.id)
          .map((v) => (esDescendencia(v.tipo) && v.de === parejaPrevia.id ? { ...v, de } : v))
      : genograma.vinculos;
    if (previaMisma) {
      return parejaPrevia ? { ...genograma, vinculos: sinPareja } : genograma;
    }
    if (previaInvertida) {
      return {
        ...genograma,
        vinculos: sinPareja.map((v) => (v.id === previaInvertida.id ? { ...v, de, a, tipo } : v)),
      };
    }
    const agregada = {
      ...genograma,
      vinculos: [...sinPareja, { id: nuevoId("v"), tipo, de, a, gemelar: "", identicos: false }],
    };
    const parejaDe = (idA, idB) =>
      agregada.vinculos.find(
        (c) => !esDescendencia(c.tipo) && ((c.de === idA && c.a === idB) || (c.de === idB && c.a === idA))
      );
    const otroProgenitor = agregada.vinculos.find(
      (w) => esDescendencia(w.tipo) && w.a === a && w.de !== de && parejaDe(de, w.de)
    );
    if (!otroProgenitor) return agregada;
    const pareja = parejaDe(de, otroProgenitor.de);
    return {
      ...genograma,
      vinculos: [
        ...agregada.vinculos.filter(
          (w) => !(esDescendencia(w.tipo) && w.a === a && (w.de === de || w.de === otroProgenitor.de))
        ),
        { id: nuevoId("v"), tipo, de: pareja.id, a, gemelar: "", identicos: false },
      ],
    };
  }
  if (esRelacion) {
    const nueva = { id: nuevoId("r"), tipo, de, a, desvio: null };
    return {
      ...genograma,
      relaciones: [...genograma.relaciones.filter((r) => parDe(r) !== parDe(nueva)), nueva],
    };
  }
  if (!TIPOS_VINCULO.some((t) => t.valor === tipo)) return genograma;
  const nueva = { id: nuevoId("v"), tipo, de, a, gemelar: "", identicos: false };
  if (genograma.vinculos.some((v) => !esDescendencia(v.tipo) && parDe(v) === parDe(nueva))) return genograma;
  // Progenitor e hijo ya están relacionados por la descendencia:
  // una pareja entre ambos no se crea (rompería el dibujo).
  if (esProgenitorHijo(genograma, de, a)) return genograma;
  return { ...genograma, vinculos: [...genograma.vinculos, nueva] };
}

export function conexionEliminada(genograma, id) {
  const eraVinculo = genograma.vinculos.some((v) => v.id === id);
  const siguiente = {
    ...genograma,
    vinculos: genograma.vinculos.filter((v) => v.id !== id),
    relaciones: genograma.relaciones.filter((r) => r.id !== id),
  };
  if (eraVinculo) {
    // Los hijos que descendían de esta línea de pareja pasan a
    // quedar sin origen (se dibujan solo si lo recuperan).
    siguiente.vinculos = siguiente.vinculos.filter((v) => !(esDescendencia(v.tipo) && v.de === id));
  }
  return siguiente;
}

export function cambiarTipoConexion(genograma, id, tipo) {
  const vinculo = genograma.vinculos.find((v) => v.id === id);
  if (vinculo) return { ...genograma, vinculos: genograma.vinculos.map((v) => (v.id === id ? { ...v, tipo } : v)) };
  return { ...genograma, relaciones: genograma.relaciones.map((r) => (r.id === id ? { ...r, tipo } : r)) };
}

/* Desvío lateral de una relación de calidad (arrastre en el
   lienzo): `null` vuelve al comportamiento automático (junto a
   la línea de pareja si la tiene, recta si no). */
export function relacionActualizada(genograma, id, cambios) {
  return {
    ...genograma,
    relaciones: genograma.relaciones.map((r) => (r.id === id ? { ...r, ...cambios } : r)),
  };
}

/* Marca a una persona como usuario/a evaluado/a y desmarca al
   resto (solo hay un usuario por genograma). */
export function personaIndicada(genograma, id) {
  return {
    ...genograma,
    personas: genograma.personas.map((p) => ({ ...p, indicado: p.id === id })),
  };
}

/* ============================================================
   NORMALIZACIÓN Y BIBLIOTECA (localStorage)
   ============================================================ */

function texto(valor) {
  return typeof valor === "string" ? valor : valor == null ? "" : String(valor);
}

function personaNormalizada(p, indice) {
  if (!p || typeof p !== "object") return null;
  const lugar = Number.isFinite(p.x) && Number.isFinite(p.y) ? { x: p.x, y: p.y } : posicionDeCuadricula(indice);
  return {
    id: texto(p.id) || nuevoId("p"),
    nombre: texto(p.nombre),
    sexo: SEXOS.some((s) => s.valor === p.sexo) ? p.sexo : "hombre",
    edad: texto(p.edad),
    fallecido: Boolean(p.fallecido),
    causaMuerte: texto(p.causaMuerte),
    patologiasAbrev: texto(p.patologiasAbrev),
    patologias: texto(p.patologias),
    ocupacion: texto(p.ocupacion),
    nota: texto(p.nota),
    indicado: Boolean(p.indicado),
    simbolo: SIMBOLOS_PERSONA.some((s) => s.valor === p.simbolo) ? p.simbolo : "",
    ...lugar,
  };
}

/* Repara cualquier dato guardado o importado: garantiza las
   listas y los campos mínimos. Nunca lanza errores. */
export function normalizarGenograma(datos) {
  const base = datos && typeof datos === "object" ? datos : {};
  const personas = Array.isArray(base.personas)
    ? base.personas.map(personaNormalizada).filter(Boolean)
    : [];
  const ids = new Set(personas.map((p) => p.id));
  const idsDeVinculo = new Set(
    (Array.isArray(base.vinculos) ? base.vinculos : []).map((v) => (v && typeof v === "object" ? v.id : null))
  );
  const vinculos = (Array.isArray(base.vinculos) ? base.vinculos : [])
    .filter((v) => v && typeof v === "object" && TIPOS_VINCULO.some((t) => t.valor === v.tipo))
    .map((v) => ({
      id: texto(v.id) || nuevoId("v"),
      tipo: v.tipo,
      de: typeof v.de === "string" && (ids.has(v.de) || (esDescendencia(v.tipo) && idsDeVinculo.has(v.de))) ? v.de : null,
      a: typeof v.a === "string" && ids.has(v.a) ? v.a : null,
      gemelar: texto(v.gemelar),
      identicos: Boolean(v.identicos),
    }))
    .filter((v) => v.a != null && v.de != null);
  const relaciones = (Array.isArray(base.relaciones) ? base.relaciones : [])
    .filter(
      (r) =>
        r &&
        typeof r === "object" &&
        TIPOS_RELACION.some((t) => t.valor === r.tipo) &&
        typeof r.de === "string" &&
        typeof r.a === "string" &&
        ids.has(r.de) &&
        ids.has(r.a)
    )
    .map((r) => ({
      id: texto(r.id) || nuevoId("r"),
      tipo: r.tipo,
      de: r.de,
      a: r.a,
      desvio: Number.isFinite(r.desvio) ? r.desvio : null,
    }));
  /* Datos guardados con parejas entre progenitor e hijo (error
     de conexión: dibujan un triángulo sin sentido sobre la
     descendencia): se descartan al reparar. */
  const parejasInvalidas = new Set(
    vinculos
      .filter((v) => !esDescendencia(v.tipo) && esProgenitorHijo({ vinculos }, v.de, v.a))
      .map((v) => v.id)
  );
  /* Descendencia registrada en los dos sentidos (p. ej., «B es
     hijo/a de A» y también «A es hijo/a de B»): se conserva una
     sola, prefiriendo la que va del progenitor hacia el hijo
     (el progenitor queda arriba en el dibujo); a igualdad, la
     primera registrada. */
  const porPar = new Map();
  for (const v of vinculos) {
    if (!esDescendencia(v.tipo)) continue;
    const clave = parDe(v);
    const lista = porPar.get(clave) ?? [];
    lista.push(v);
    porPar.set(clave, lista);
  }
  const invertidas = new Set();
  for (const lista of porPar.values()) {
    if (lista.length < 2) continue;
    const buena =
      lista.find((v) => {
        const origen = personas.find((p) => p.id === v.de);
        const hijo = personas.find((p) => p.id === v.a);
        return origen && hijo && origen.y <= hijo.y;
      }) ?? lista[0];
    for (const v of lista) if (v !== buena) invertidas.add(v.id);
  }
  const vinculosValidos = vinculos.filter(
    (v) => !parejasInvalidas.has(v.id) && !invertidas.has(v.id)
  );
  return {
    version: 1,
    personas,
    vinculos: vinculosValidos,
    relaciones,
    grupos: (Array.isArray(base.grupos) ? base.grupos : [])
      .filter((g) => g && typeof g === "object")
      .map((g) => ({
        id: texto(g.id) || nuevoId("c"),
        nombre: texto(g.nombre),
        integrantes: [...new Set((Array.isArray(g.integrantes) ? g.integrantes : []).filter((i) => typeof i === "string" && ids.has(i)))],
      }))
      .filter((g) => g.integrantes.length >= 2),
    notas: texto(base.notas),
  };
}

const CLAVE_BIBLIOTECA = "to-genograma-biblioteca";

/* Cada entrada: { id, nombre, creado, actualizado, datos }. */
export function leerBiblioteca() {
  if (typeof window === "undefined") return [];
  try {
    const bruto = window.localStorage.getItem(CLAVE_BIBLIOTECA);
    if (!bruto) return [];
    const lista = JSON.parse(bruto);
    if (!Array.isArray(lista)) return [];
    return lista
      .filter((e) => e && typeof e === "object" && e.datos)
      .map((e) => ({
        id: texto(e.id) || nuevoId("b"),
        nombre: texto(e.nombre) || "Genograma sin título",
        creado: texto(e.creado),
        actualizado: texto(e.actualizado),
        datos: normalizarGenograma(e.datos),
      }));
  } catch {
    return [];
  }
}

export function guardarEnBiblioteca(genograma, nombre) {
  if (typeof window === "undefined") return null;
  const ahora = new Date().toISOString();
  const existentes = leerBiblioteca();
  const datos = normalizarGenograma(genograma);
  const existente = existentes.find((e) => e.nombre === nombre);
  const entrada = existente
    ? { ...existente, actualizado: ahora, datos }
    : { id: nuevoId("b"), nombre: nombre || `Genograma ${ahora.slice(0, 10)}`, creado: ahora, actualizado: ahora, datos };
  const lista = [entrada, ...existentes.filter((e) => e.id !== entrada.id)];
  try {
    window.localStorage.setItem(CLAVE_BIBLIOTECA, JSON.stringify(lista));
  } catch {
    return null; // cuota llena o almacenamiento no disponible
  }
  return entrada;
}

export function eliminarDeBiblioteca(id) {
  if (typeof window === "undefined") return [];
  const lista = leerBiblioteca().filter((e) => e.id !== id);
  try {
    window.localStorage.setItem(CLAVE_BIBLIOTECA, JSON.stringify(lista));
  } catch {
    // sin cambios si el almacenamiento falla
  }
  return lista;
}

/* Copia independiente para vincular a una evaluación: editar la
   copia no modifica la entrada de la biblioteca. */
export function copiarParaEvaluacion(genograma) {
  return normalizarGenograma(JSON.parse(JSON.stringify(normalizarGenograma(genograma))));
}

/* ============================================================
   DESCRIPCIÓN TEXTUAL DE LOS INTEGRANTES
   (columna «Vínculos y relaciones» de la tabla del informe)
   ============================================================ */

const nombreDe = (genograma, id) => genograma.personas.find((p) => p.id === id)?.nombre?.trim() || "integrante";

/* Etiqueta de descendencia según el tipo de vínculo. */
const etiquetaHijoDe = (tipo) =>
  tipo === "adoptado" ? "Hijo/a adoptado/a de" : tipo === "crianza" ? "Hijo/a de crianza de" : "Hijo/a de";

export function etiquetaConexionesDe(genograma, persona) {
  const partes = [];
  for (const v of genograma.vinculos) {
    if (!esDescendencia(v.tipo) && (v.de === persona.id || v.a === persona.id)) {
      const otro = v.de === persona.id ? v.a : v.de;
      partes.push(`Pareja (${ETIQUETA_VINCULO[v.tipo]?.toLowerCase() ?? v.tipo}) de ${nombreDe(genograma, otro)}`);
      // Hijos que descienden de esta línea de pareja: la persona
      // es padre/madre de cada uno de ellos.
      for (const h of genograma.vinculos) {
        if (esDescendencia(h.tipo) && h.de === v.id) {
          partes.push(`Padre/Madre de ${nombreDe(genograma, h.a)}`);
        }
      }
    }
    if (esDescendencia(v.tipo) && v.a === persona.id) {
      const origen = genograma.vinculos.find((x) => x.id === v.de);
      if (origen && !esDescendencia(origen.tipo)) {
        partes.push(`${etiquetaHijoDe(v.tipo)} ${nombreDe(genograma, origen.de)} y ${nombreDe(genograma, origen.a)}`);
      } else if (origen) {
        partes.push(`${etiquetaHijoDe(v.tipo)} ${nombreDe(genograma, origen.de)}`);
      } else if (v.de) {
        partes.push(`${etiquetaHijoDe(v.tipo)} ${nombreDe(genograma, v.de)}`);
      }
    }
    if (esDescendencia(v.tipo) && v.de === persona.id) {
      partes.push(`Padre/Madre de ${nombreDe(genograma, v.a)}`);
    }
  }
  for (const r of genograma.relaciones) {
    if (r.de === persona.id || r.a === persona.id) {
      const otro = r.de === persona.id ? r.a : r.de;
      partes.push(`${ETIQUETA_RELACION[r.tipo] ?? r.tipo} con ${nombreDe(genograma, otro)}`);
    }
  }
  for (const grupo of genograma.grupos ?? []) {
    if (!grupo.integrantes.includes(persona.id)) continue;
    const otros = grupo.integrantes.filter((i) => i !== persona.id);
    if (otros.length === 0) continue;
    const lista =
      otros.length === 1
        ? nombreDe(genograma, otros[0])
        : `${otros.slice(0, -1).map((i) => nombreDe(genograma, i)).join(", ")} y ${nombreDe(genograma, otros[otros.length - 1])}`;
    partes.push(`Convive en «${grupo.nombre?.trim() || ETIQUETA_CONVIVENCIA}» con ${lista}`);
  }
  return partes;
}

/* Descripción de una persona para listas: nombre (edad) + estado. */
export function etiquetaPersona(persona) {
  const nombre = persona.nombre?.trim() || "Sin nombre";
  const partes = [nombre];
  const edad = persona.edad?.toString().trim();
  const estado = [];
  if (edad) estado.push(`${edad} ${/^\d+$/.test(edad) ? (Number(edad) === 1 ? "año" : "años") : ""}`.trim());
  if (persona.fallecido) estado.push("fallecido/a");
  if (persona.indicado) estado.push("usuario/a evaluado/a");
  if (persona.ocupacion?.trim()) estado.push(persona.ocupacion.trim());
  return `${partes[0]}${estado.length ? ` (${estado.join(" · ")})` : ""}`;
}

/* Filas de la tabla de integrantes del informe:
   [nombre+edad, vínculos y relaciones, observación]. */
export function filasDeIntegrantes(genograma) {
  return genograma.personas.map((p) => {
    const nombre = p.nombre?.trim() || "Sin nombre";
    const edad = p.edad?.toString().trim() || "—";
    const estado = [p.fallecido ? `Fallecido/a${p.causaMuerte?.trim() ? ` (${p.causaMuerte.trim()})` : ""}` : "", p.indicado ? "Usuario/a evaluado/a" : ""]
      .filter(Boolean)
      .join(" · ");
    const conexiones = etiquetaConexionesDe(genograma, p).join(" · ");
    const observacion = [p.patologiasAbrev?.trim(), p.patologias?.trim(), estado, p.ocupacion?.trim(), p.nota?.trim()]
      .filter(Boolean)
      .join(" · ");
    return { nombre, edad, conexiones: conexiones || "—", observacion: observacion || "—" };
  });
}

/* ============================================================
   GEOMETRÍA COMPARTIDA (SVG DEL EDITOR Y DIAGRAMA DEL PDF)
   ============================================================ */

/* Divide un texto en líneas de hasta `maxCaracteres` (máximo
   `maxLineas`; la última lleva «…» si se recorta). Compartido
   por las etiquetas del SVG y del PDF. */
export function envolverTexto(texto, maxCaracteres = 26, maxLineas = 3) {
  const limpio = String(texto ?? "").trim();
  if (!limpio) return [];
  const palabras = limpio.split(/\s+/);
  const lineas = [];
  let actual = "";
  for (const palabra of palabras) {
    const candidata = actual ? `${actual} ${palabra}` : palabra;
    if (candidata.length > maxCaracteres && actual) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = candidata;
    }
  }
  if (actual) lineas.push(actual);
  if (lineas.length > maxLineas) {
    const recortadas = lineas.slice(0, maxLineas);
    recortadas[maxLineas - 1] = `${recortadas[maxLineas - 1].replace(/…$/, "")}…`;
    return recortadas;
  }
  return lineas;
}

/* Lista de abreviaturas de las patologías principales: el texto
   se separa por comas y se dibuja una línea por patología,
   sobre la figura (máximo cuatro; la última con «…»). */
export function listaDeAbreviaturas(persona) {
  const bruto = String(persona?.patologiasAbrev ?? "").trim();
  if (!bruto) return [];
  const items = bruto
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => envolverTexto(s, 24, 1)[0]);
  if (items.length <= 4) return items;
  const recortadas = items.slice(0, 4);
  recortadas[3] = `${recortadas[3].replace(/…$/, "")}…`;
  return recortadas;
}

export function personaDe(genograma, id) {
  return genograma.personas.find((p) => p.id === id) ?? null;
}

export function vinculoDe(genograma, id) {
  return genograma.vinculos.find((v) => v.id === id) ?? null;
}

/* Límite del lienzo: { minX, minY, ancho, alto } incluyendo el
   espacio de las etiquetas (nombre y detalle debajo, marca de
   usuario encima, abreviaturas al costado) y los contornos de
   convivencia. Devuelve null sin personas. */
export function limitesDiagrama(genograma) {
  if (!genograma?.personas?.length) return null;
  const xs = genograma.personas.map((p) => p.x);
  const ys = genograma.personas.map((p) => p.y);
  let minX = Math.min(...xs) - 72;
  let minY = Math.min(...ys) - NODO.radio - 26;
  let maxX = Math.max(...xs) + 72;
  let maxY = Math.max(...ys) + 82;
  /* Las abreviaturas van al costado de la figura: ensancha el
     límite según el lado elegido y el largo del texto. */
  for (const p of genograma.personas) {
    const lineas = listaDeAbreviaturas(p);
    if (lineas.length === 0) continue;
    const ancho = Math.max(...lineas.map((l) => l.length)) * 5.2 + NODO.radio + 12;
    if (ladoDeAbreviaturas(genograma, p) === "derecha") maxX = Math.max(maxX, p.x + ancho);
    else minX = Math.min(minX, p.x - ancho);
  }
  for (const grupo of genograma.grupos ?? []) {
    const geo = geometriaDeGrupo(genograma, grupo);
    if (!geo) continue;
    minX = Math.min(minX, geo.minX - 8);
    minY = Math.min(minY, geo.minY - 8);
    maxX = Math.max(maxX, geo.maxX + 8);
    maxY = Math.max(maxY, geo.maxY + 8);
  }
  return { minX, minY, ancho: maxX - minX, alto: maxY - minY };
}

/* Envolvente convexa de los puntos (cadena de monotanía), en
   orden con área positiva. */
function envolventeConvexa(puntos) {
  const ordenados = [...puntos].sort((a, b) => a.x - b.x || a.y - b.y);
  if (ordenados.length < 3) return ordenados;
  const cruz = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const inferior = [];
  for (const p of ordenados) {
    while (inferior.length >= 2 && cruz(inferior[inferior.length - 2], inferior[inferior.length - 1], p) <= 0) {
      inferior.pop();
    }
    inferior.push(p);
  }
  const superior = [];
  for (let i = ordenados.length - 1; i >= 0; i--) {
    const p = ordenados[i];
    while (superior.length >= 2 && cruz(superior[superior.length - 2], superior[superior.length - 1], p) <= 0) {
      superior.pop();
    }
    superior.push(p);
  }
  inferior.pop();
  superior.pop();
  const lista = inferior.concat(superior);
  const area = lista.reduce((acc, p, i) => {
    const q = lista[(i + 1) % lista.length];
    return acc + (p.x * q.y - q.x * p.y);
  }, 0);
  return area >= 0 ? lista : lista.reverse();
}

/* Contorno cerrado de la envolvente convexa de `centros`,
   expandida `margen` hacia afuera y con esquinas redondeadas
   (suma de Minkowski con un disco): abraza a los integrantes
   del círculo de convivencia sin tragar a vecinos que no. */
function contornoDePuntos(centros, margen) {
  const hull = envolventeConvexa(centros);
  if (hull.length === 0) return null;
  const puntos = [];
  if (hull.length === 1) {
    for (let i = 0; i < 24; i++) {
      const t = (i / 24) * Math.PI * 2;
      puntos.push({ x: hull[0].x + Math.cos(t) * margen, y: hull[0].y + Math.sin(t) * margen });
    }
    return puntos;
  }
  if (hull.length === 2) {
    // Cápsula: dos lados con extremos semicirculares.
    const [a, b] = hull;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = dy / len;
    const ny = -dx / len;
    puntos.push({ x: a.x + nx * margen, y: a.y + ny * margen });
    puntos.push({ x: b.x + nx * margen, y: b.y + ny * margen });
    const a0 = Math.atan2(ny, nx);
    for (let i = 1; i < 8; i++) {
      const t = a0 + (i / 8) * Math.PI;
      puntos.push({ x: b.x + Math.cos(t) * margen, y: b.y + Math.sin(t) * margen });
    }
    puntos.push({ x: b.x - nx * margen, y: b.y - ny * margen });
    puntos.push({ x: a.x - nx * margen, y: a.y - ny * margen });
    for (let i = 1; i < 8; i++) {
      const t = a0 + Math.PI + (i / 8) * Math.PI;
      puntos.push({ x: a.x + Math.cos(t) * margen, y: a.y + Math.sin(t) * margen });
    }
    return puntos;
  }
  const n = hull.length;
  const normales = [];
  for (let i = 0; i < n; i++) {
    const a = hull[i];
    const b = hull[(i + 1) % n];
    const ex = b.x - a.x;
    const ey = b.y - a.y;
    const len = Math.hypot(ex, ey) || 1;
    normales.push({ x: ey / len, y: -ex / len }); // hacia afuera
  }
  for (let i = 0; i < n; i++) {
    const v = hull[(i + 1) % n];
    const n0 = normales[i];
    const n1 = normales[(i + 1) % n];
    puntos.push({ x: v.x + n0.x * margen, y: v.y + n0.y * margen });
    const a0 = Math.atan2(n0.y, n0.x);
    let delta = Math.atan2(n1.y, n1.x) - a0;
    while (delta <= -Math.PI) delta += Math.PI * 2;
    while (delta > Math.PI) delta -= Math.PI * 2;
    for (let s = 1; s <= 6; s++) {
      const t = a0 + (delta * s) / 7;
      puntos.push({ x: v.x + Math.cos(t) * margen, y: v.y + Math.sin(t) * margen });
    }
  }
  return puntos;
}

/* Contorno continuo del círculo de convivencia: deja más
   espacio para las etiquetas cuando el hogar ocupa todo el
   diagrama y un margen más compacto si hay otros hogares. Devuelve
   { puntos, etiqueta, minX, minY, maxX, maxY } o null con
   menos de dos miembros. */
export function geometriaDeGrupo(genograma, grupo) {
  const miembros = (grupo.integrantes ?? [])
    .map((id) => personaDe(genograma, id))
    .filter(Boolean);
  if (miembros.length < 2) return null;
  const puntos = contornoDePuntos(
    miembros.map((p) => ({ x: p.x, y: p.y })),
    miembros.length === genograma.personas.length ? 108 : 52
  );
  if (!puntos) return null;
  const xs = puntos.map((p) => p.x);
  const ys = puntos.map((p) => p.y);
  return {
    puntos,
    etiqueta: grupo.nombre?.trim() || ETIQUETA_CONVIVENCIA,
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
}

/* Lado de la figura donde se dibujan las abreviaturas de
   patologías: hacia afuera del centro del genograma, para que
   no interfieran con las líneas. */
export function ladoDeAbreviaturas(genograma, persona) {
  const xs = genograma?.personas?.map((p) => p.x) ?? [];
  const centroX = xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
  return persona.x >= centroX ? "derecha" : "izquierda";
}

/* Punto del borde de la figura en la dirección del vector
   (dx, dy) desde el centro. Los triángulos (embarazo, aborto)
   se resuelven sobre sus lados; la muerte fetal usa la mitad
   del tamaño. */
export function puntoBorde(persona, dx, dy) {
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  if (persona.simbolo === "embarazo" || persona.simbolo === "abortoEspontaneo" || persona.simbolo === "abortoInducido") {
    // Triángulo: ápice arriba (0, -r), base abajo (±1.1 r, 0.85 r).
    const r = NODO.radio;
    const ts = [];
    if (uy > 1e-9) ts.push((r * 0.85) / uy);
    if (ux > 0.55 * uy + 1e-9) ts.push((0.55 * r) / (ux - 0.55 * uy));
    if (-ux > 0.55 * uy + 1e-9) ts.push((0.55 * r) / (-ux - 0.55 * uy));
    const t = ts.length ? Math.max(Math.min(...ts), 0) : r;
    return { x: persona.x + ux * t, y: persona.y + uy * t };
  }
  const rr = persona.simbolo === "muerteFetal" ? NODO.radio * 0.55 : NODO.radio;
  if (persona.sexo === "mujer") return { x: persona.x + ux * rr, y: persona.y + uy * rr };
  if (persona.sexo === "otro") {
    const t = rr / (Math.abs(ux) + Math.abs(uy));
    return { x: persona.x + ux * t, y: persona.y + uy * t };
  }
  const t = rr / Math.max(Math.abs(ux), Math.abs(uy), 1e-9);
  return { x: persona.x + ux * t, y: persona.y + uy * t };
}

function puntosEntre(a, b) {
  return [puntoBorde(a, b.x - a.x, b.y - a.y), puntoBorde(b, a.x - b.x, a.y - b.y)];
}

/* Geometría de un vínculo de pareja: segmento [inicio, fin] y
   marcas. Pauta: separación y divorcio llevan dos barras
   diagonales paralelas (inclined ~30° desde la perpendicular),
   y la convivencia lleva una casa al medio de la línea
   discontinua (quienes comparten hogar). */
export function geometriaDePareja(genograma, vinculo) {
  const p1 = personaDe(genograma, vinculo.de);
  const p2 = personaDe(genograma, vinculo.a);
  if (!p1 || !p2) return null;
  const [inicio, fin] = puntosEntre(p1, p2);
  const medio = { x: (inicio.x + fin.x) / 2, y: (inicio.y + fin.y) / 2 };
  const dx = fin.x - inicio.x;
  const dy = fin.y - inicio.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const barras =
    vinculo.tipo === "separacion" || vinculo.tipo === "divorcio"
      ? {
          largo: 16,
          posiciones: [
            { x: medio.x - ux * 6, y: medio.y - uy * 6 },
            { x: medio.x + ux * 6, y: medio.y + uy * 6 },
          ],
          /* Diagonal inclinada (como «//»): perpendicular girada
             30° hacia la dirección de la línea. */
          direccion: { x: -uy * 0.866 - ux * 0.5, y: ux * 0.866 - uy * 0.5 },
        }
      : null;
  return {
    inicio,
    fin,
    medio,
    discontinua: vinculo.tipo === "convivencia",
    casa: vinculo.tipo === "convivencia" ? medio : null,
    barras,
  };
}

/* Recorridos dibujables de toda la descendencia. Los hijos
   que comparten origen (una pareja o un progenitor) cuelgan de
   una misma guía: un solo tallo baja del origen hasta una
   línea horizontal y de ahí cae una línea por hijo. Un hijo
   conectado a varios progenitores recibe una caída por
   progenitor, con puntos de llegada repartidos sobre su borde
   superior y codos y guías a alturas distintas, para que las
   líneas no se pisen. Devuelve { id, clave, recorrido } —
   `id` es el vínculo al que pertenece la ruta (para selección)
   y `clave` identifica cada tramo dibujado. */
export function rutasDeDescendencia(genograma) {
  const rutas = [];
  const crudos = genograma.vinculos.filter((v) => esDescendencia(v.tipo));
  if (crudos.length === 0) return rutas;

  /* Garantía de dibujo: una sola línea por par progenitor–hijo.
     Si el mismo par llegara duplicado —en cualquiera de los dos
     sentidos y sin importar el estado de los datos— solo se
     dibuja una: la que va del progenitor de arriba hacia el hijo. */
  const porParDibujo = new Map();
  const vaDelProgenitorArriba = (v) => {
    const origen = personaDe(genograma, v.de);
    const hijo = personaDe(genograma, v.a);
    return Boolean(origen && hijo && origen.y <= hijo.y);
  };
  for (const v of crudos) {
    const clave = parDe(v);
    const previa = porParDibujo.get(clave);
    porParDibujo.set(clave, previa && vaDelProgenitorArriba(v) && !vaDelProgenitorArriba(previa) ? v : previa ?? v);
  }
  const hijos = [...porParDibujo.values()];

  /* Origen efectivo de cada vínculo: punto medio de la línea
     de pareja (si el vínculo sale de una pareja) o borde
     inferior del progenitor. */
  const infoDe = new Map();
  for (const v of hijos) {
    const vinculoParejaDirecto = genograma.vinculos.find((w) => w.id === v.de && !esDescendencia(w.tipo));
    if (vinculoParejaDirecto) {
      const pareja = geometriaDePareja(genograma, vinculoParejaDirecto);
      if (pareja) infoDe.set(v.id, { origen: pareja.medio, clave: `v:${vinculoParejaDirecto.id}` });
      continue;
    }
    const progenitor = personaDe(genograma, v.de);
    if (!progenitor) continue;
    /* Si el progenitor forma pareja, la descendencia sale del
       punto medio de la línea de pareja (pauta estándar), aunque
       solo se haya conectado con uno de los dos. Con varias
       parejas (segundas nupcias) se prefiere aquella cuyo otro
       miembro también está conectado al hijo; si no hay certeza,
       la línea sale del progenitor. */
    const parejasDelProgenitor = genograma.vinculos.filter(
      (c) => !esDescendencia(c.tipo) && (c.de === v.de || c.a === v.de)
    );
    let parejaElegida = null;
    if (parejasDelProgenitor.length === 1) {
      parejaElegida = parejasDelProgenitor[0];
    } else if (parejasDelProgenitor.length > 1) {
      const conOtroProgenitor = hijos.find((w) => w !== v && w.a === v.a && w.de !== v.de);
      parejaElegida = conOtroProgenitor
        ? parejasDelProgenitor.find(
            (c) => c.de === conOtroProgenitor.de || c.a === conOtroProgenitor.de
          ) ?? null
        : null;
    }
    if (parejaElegida) {
      const pareja = geometriaDePareja(genograma, parejaElegida);
      if (pareja) {
        infoDe.set(v.id, { origen: pareja.medio, clave: `v:${parejaElegida.id}` });
        continue;
      }
    }
    infoDe.set(v.id, { origen: { x: progenitor.x, y: progenitor.y + NODO.radio }, clave: `p:${v.de}` });
  }

  /* Reparto de llegadas por hijo: los orígenes distintos se
     ordenan por su x; cada uno recibe un desplazamiento lateral
     y una altura de codo propia. */
  const desvioDeClave = new Map();
  const codoDeClave = new Map();
  const clavesPorHijo = new Map();
  for (const v of hijos) {
    const info = infoDe.get(v.id);
    if (!info) continue;
    const lista = clavesPorHijo.get(v.a) ?? [];
    if (!lista.some((e) => e.clave === info.clave)) lista.push(info);
    clavesPorHijo.set(v.a, lista);
  }
  for (const [hijoId, lista] of clavesPorHijo) {
    const orden = lista.slice().sort((a, b) => a.origen.x - b.origen.x);
    orden.forEach((e, i) => {
      desvioDeClave.set(`${hijoId}|${e.clave}`, (i - (orden.length - 1) / 2) * 12);
      codoDeClave.set(`${hijoId}|${e.clave}`, (i - (orden.length - 1) / 2) * 14);
    });
  }

  /* Agrupa los vínculos por origen efectivo. */
  const porOrigen = new Map();
  for (const v of hijos) {
    const info = infoDe.get(v.id);
    if (!info) continue;
    const lista = porOrigen.get(info.clave) ?? [];
    lista.push({ v, clave: info.clave, origen: info.origen });
    porOrigen.set(info.clave, lista);
  }

  for (const lista of porOrigen.values()) {
    const origen = lista[0].origen;
    const conTecho = [];
    for (const { v, clave } of lista) {
      const hijo = personaDe(genograma, v.a);
      if (!hijo) continue;
      const llegada = { x: hijo.x + (desvioDeClave.get(`${v.a}|${clave}`) ?? 0), y: hijo.y - NODO.radio };
      if (llegada.y <= origen.y + 6) {
        if (origen.y - llegada.y <= NODO.radio) {
          /* Hijo a la altura del origen: línea directa borde a
             borde (casi horizontal), sin tallo ni guía. */
          rutas.push({
            id: v.id,
            clave: v.id,
            recorrido: [origen, puntoBorde(hijo, origen.x - hijo.x, origen.y - hijo.y)],
          });
        } else {
          /* Hijo por encima del origen (vínculo invertido o figura
             muy arriba): codo hacia arriba desde el borde superior
             del progenitor — una diagonal nunca. */
          const progenitorPersona = personaDe(genograma, v.de);
          const salida = progenitorPersona
            ? puntoBorde(progenitorPersona, hijo.x - progenitorPersona.x, hijo.y - progenitorPersona.y)
            : origen;
          const yCodo = (salida.y + llegada.y) / 2;
          rutas.push({
            id: v.id,
            clave: v.id,
            recorrido: [salida, { x: salida.x, y: yCodo }, { x: llegada.x, y: yCodo }, llegada],
          });
        }
      } else {
        conTecho.push({ v, clave, llegada });
      }
    }
    if (conTecho.length === 0) continue;

    /* Vínculos distintos que llegan al mismo punto (los dos
       progenitores de una misma pareja): una sola línea. */
    const vistos = new Set();
    const unicos = [];
    for (const e of conTecho) {
      const marca = `${e.v.a}|${e.llegada.x}`;
      if (vistos.has(marca)) continue;
      vistos.add(marca);
      unicos.push(e);
    }

    if (unicos.length === 1) {
      const { v, clave, llegada } = unicos[0];
      const yCodo = (origen.y + llegada.y) / 2 + (codoDeClave.get(`${v.a}|${clave}`) ?? 0);
      rutas.push({
        id: v.id,
        clave: v.id,
        recorrido: [origen, { x: origen.x, y: yCodo }, { x: llegada.x, y: yCodo }, llegada],
      });
      continue;
    }

    /* La guía de cada origen se separa verticalmente de la de
       otros orígenes que comparten los mismos hijos. */
    const yBus =
      Math.min(...unicos.map(({ llegada }) => llegada.y)) -
      16 +
      (codoDeClave.get(`${unicos[0].v.a}|${unicos[0].clave}`) ?? 0);
    if (yBus <= origen.y + 12) {
      // Sin espacio para la guía compartida: codos individuales.
      for (const { v, clave, llegada } of unicos) {
        const yCodo = (origen.y + llegada.y) / 2 + (codoDeClave.get(`${v.a}|${clave}`) ?? 0);
        rutas.push({
          id: v.id,
          clave: v.id,
          recorrido: [origen, { x: origen.x, y: yCodo }, { x: llegada.x, y: yCodo }, llegada],
        });
      }
      continue;
    }

    /* Guía compartida: el tallo baja del origen y la línea
       horizontal corre hacia los hijos de cada lado. */
    const claveGuia = `${lista[0].v.id}-guia`;
    const izquierda = unicos.filter(({ llegada }) => llegada.x < origen.x - 0.5);
    const derecha = unicos.filter(({ llegada }) => llegada.x > origen.x + 0.5);
    if (izquierda.length > 0 || derecha.length > 0) {
      if (izquierda.length > 0) {
        const xLejano = Math.min(...izquierda.map(({ llegada }) => llegada.x));
        rutas.push({ id: lista[0].v.id, clave: claveGuia, recorrido: [origen, { x: origen.x, y: yBus }, { x: xLejano, y: yBus }] });
      }
      if (derecha.length > 0) {
        const xLejano = Math.max(...derecha.map(({ llegada }) => llegada.x));
        rutas.push({
          id: lista[0].v.id,
          clave: izquierda.length > 0 ? `${claveGuia}-d` : claveGuia,
          recorrido: [origen, { x: origen.x, y: yBus }, { x: xLejano, y: yBus }],
        });
      }
    } else {
      rutas.push({ id: lista[0].v.id, clave: claveGuia, recorrido: [origen, { x: origen.x, y: yBus }] });
    }
    /* Partos múltiples (gemelos o trillizos): los hermanos
       marcados con el mismo grupo gemelar salen del mismo
       punto con líneas oblicuas; los idénticos llevan además
       una barra que une sus líneas. */
    const gruposGemelares = new Map();
    for (const e of unicos) {
      if (!e.v.gemelar) continue;
      const lista = gruposGemelares.get(e.v.gemelar) ?? [];
      lista.push(e);
      gruposGemelares.set(e.v.gemelar, lista);
    }
    const enGemelar = new Set();
    for (const lista of gruposGemelares.values()) {
      for (const { v } of lista) enGemelar.add(v.id);
    }
    for (const { v, llegada } of unicos) {
      if (enGemelar.has(v.id)) continue;
      rutas.push({ id: v.id, clave: `${v.id}-caida`, recorrido: [{ x: llegada.x, y: yBus }, llegada] });
    }
    for (const lista of gruposGemelares.values()) {
      const xsGemelos = lista.map(({ llegada }) => llegada.x);
      const xComun = (Math.min(...xsGemelos) + Math.max(...xsGemelos)) / 2;
      for (const { v, llegada } of lista) {
        rutas.push({ id: v.id, clave: `${v.id}-gemelo`, recorrido: [{ x: xComun, y: yBus }, llegada] });
      }
      if (lista.length >= 2 && lista.some(({ v }) => v.identicos)) {
        const orden = [...lista].sort((a, b) => a.llegada.x - b.llegada.x);
        const izq = orden[0].llegada;
        const der = orden[orden.length - 1].llegada;
        const yBarra = (yBus + izq.y) / 2;
        rutas.push({
          id: lista[0].v.id,
          clave: `${lista[0].v.id}-barra`,
          recorrido: [
            { x: izq.x, y: yBarra },
            { x: der.x, y: yBarra },
          ],
        });
      }
    }
  }
  return rutas;
}

/* Organiza el genograma como en la pauta: una fila por
   generación (parejas compartiendo altura) y los hijos centrados
   bajo el punto medio de su pareja o progenitor, de modo que la
   descendencia quede vertical y los hermanos cuelguen de un
   mismo bus. Respeta el orden izquierda-derecha que ya tenía el
   dibujo: nunca cruza a una persona por sobre otra. */
export function organizarGenograma(genograma) {
  const personas = genograma.personas;
  if (personas.length === 0) return genograma;
  const Y_FILA = 170;
  const Y_INICIO = 90;
  const SEP_MINIMA = 130;

  /* Nivel de cada persona: los hijos un nivel bajo su origen;
     las parejas comparten el nivel más alto de ambas. */
  const niveles = new Map();
  const calcularNivel = (id, enCurso) => {
    if (niveles.has(id)) return niveles.get(id);
    if (enCurso.has(id)) return 0;
    enCurso.add(id);
    let nivel = 0;
    for (const v of genograma.vinculos) {
      if (!esDescendencia(v.tipo) || v.a !== id) continue;
      const parejaV = genograma.vinculos.find((w) => w.id === v.de && !esDescendencia(w.tipo));
      const miembros = parejaV ? [parejaV.de, parejaV.a] : v.de ? [v.de] : [];
      for (const miembro of miembros) {
        nivel = Math.max(nivel, calcularNivel(miembro, enCurso) + 1);
      }
    }
    enCurso.delete(id);
    niveles.set(id, nivel);
    return nivel;
  };
  personas.forEach((p) => calcularNivel(p.id, new Set()));
  for (const v of genograma.vinculos) {
    if (esDescendencia(v.tipo)) continue;
    const nivel = Math.max(niveles.get(v.de) ?? 0, niveles.get(v.a) ?? 0);
    niveles.set(v.de, nivel);
    niveles.set(v.a, nivel);
  }

  const pos = new Map(personas.map((p) => [p.id, { x: p.x, y: p.y }]));
  const maxNivel = Math.max(...niveles.values());

  const centrarHijos = (miembrosOrigen, hijosIds, nivelHijos) => {
    const hijos = [...new Set(hijosIds)].filter((id) => niveles.get(id) === nivelHijos);
    if (hijos.length === 0) return;
    const centros = miembrosOrigen.map((id) => pos.get(id)?.x).filter((x) => x != null);
    if (centros.length === 0) return;
    const centro = centros.reduce((a, b) => a + b, 0) / centros.length;
    const orden = [...hijos].sort((a, b) => pos.get(a).x - pos.get(b).x);
    const inicio = centro - ((orden.length - 1) * SEP_MINIMA) / 2;
    orden.forEach((id, i) => {
      const actual = pos.get(id);
      pos.set(id, { x: Math.round((inicio + i * SEP_MINIMA) / 5) * 5, y: actual.y });
    });
  };

  for (let nivel = 0; nivel <= maxNivel; nivel++) {
    // Altura común de la fila.
    for (const p of personas) {
      if (niveles.get(p.id) === nivel) pos.get(p.id).y = Y_INICIO + nivel * Y_FILA;
    }
    // Hijos centrados bajo parejas de este nivel (línea canónica)…
    for (const v of genograma.vinculos) {
      if (esDescendencia(v.tipo)) continue;
      if ((niveles.get(v.de) ?? 0) !== nivel || (niveles.get(v.a) ?? 0) !== nivel) continue;
      const hijos = genograma.vinculos.filter((w) => esDescendencia(w.tipo) && w.de === v.id).map((w) => w.a);
      centrarHijos([v.de, v.a], hijos, nivel + 1);
    }
    // …y bajo personas de este nivel con descendencia directa.
    // Si el progenitor forma pareja (una sola), los hijos se
    // centran entre ambos, como marca la pauta.
    const gruposOrigen = new Map();
    for (const w of genograma.vinculos) {
      if (!esDescendencia(w.tipo) || w.de == null) continue;
      if (niveles.get(w.a) !== nivel + 1 || niveles.get(w.de) !== nivel) continue;
      let clave = `p:${w.de}`;
      let miembros = [w.de];
      const parejas = genograma.vinculos.filter(
        (c) => !esDescendencia(c.tipo) && (c.de === w.de || c.a === w.de)
      );
      if (parejas.length === 1) {
        clave = `v:${parejas[0].id}`;
        miembros = [parejas[0].de, parejas[0].a];
      }
      const grupo = gruposOrigen.get(clave) ?? { miembros, hijos: [] };
      grupo.hijos.push(w.a);
      gruposOrigen.set(clave, grupo);
    }
    for (const { miembros, hijos } of gruposOrigen.values()) {
      centrarHijos(miembros, hijos, nivel + 1);
    }
  }

  return {
    ...genograma,
    personas: personas.map((p) => ({ ...p, x: pos.get(p.id).x, y: pos.get(p.id).y })),
  };
}

/* ============================================================
   GEOMETRÍA DE POLILÍNEAS (para las relaciones de calidad,
   que se pueden doblar para no montarse sobre otras líneas)
   ============================================================ */

function largoDePolilinea(puntos) {
  let total = 0;
  for (let i = 1; i < puntos.length; i++) {
    total += Math.hypot(puntos[i].x - puntos[i - 1].x, puntos[i].y - puntos[i - 1].y);
  }
  return total;
}

/* Punto y tangente unitaria de una polilínea a distancia `d`
   del inicio, midiendo por longitud de arco. */
function puntoEnPolilinea(puntos, d) {
  let restante = Math.max(0, d);
  for (let i = 1; i < puntos.length; i++) {
    const a = puntos[i - 1];
    const b = puntos[i];
    const tramo = Math.hypot(b.x - a.x, b.y - a.y);
    if (tramo === 0) continue;
    const t = Math.min(1, restante / tramo);
    const punto = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    if (restante <= tramo || i === puntos.length - 1) {
      return { ...punto, ux: (b.x - a.x) / tramo, uy: (b.y - a.y) / tramo };
    }
    restante -= tramo;
  }
  const ultimo = puntos[puntos.length - 1] ?? { x: 0, y: 0 };
  const penultimo = puntos[puntos.length - 2] ?? ultimo;
  const tramo = Math.hypot(ultimo.x - penultimo.x, ultimo.y - penultimo.y) || 1;
  return { x: ultimo.x, y: ultimo.y, ux: (ultimo.x - penultimo.x) / tramo, uy: (ultimo.y - penultimo.y) / tramo };
}

/* Muestreo uniforme de una polilínea (por longitud de arco). */
function muestrearPolilinea(puntos, muestras = 26) {
  const total = largoDePolilinea(puntos) || 1;
  const salida = [];
  for (let i = 0; i < muestras; i++) {
    const p = puntoEnPolilinea(puntos, (total * i) / (muestras - 1));
    salida.push({ x: p.x, y: p.y });
  }
  return salida;
}

/* Perpendicular local de cada punto de una polilínea abierta
   (para las líneas paralelas de cercana y fusión). */
function normalesDePolilinea(puntos) {
  return puntos.map((_, i) => {
    const a = puntos[Math.max(0, i - 1)];
    const b = puntos[Math.min(puntos.length - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: -dy / len, y: dx / len };
  });
}

/* Zigzag siguiendo una polilínea (recta o doblada): tramos
   alternados a ambos lados de la línea. Devuelve [[x, y], …]. */
export function zigzagDePolilinea(puntos, amplitud = 4.5, tramo = 12) {
  if (puntos.length < 2) return [];
  const total = largoDePolilinea(puntos) || 1;
  const tramos = Math.max(2, Math.round(total / tramo));
  const salida = [];
  for (let i = 0; i <= tramos; i++) {
    const p = puntoEnPolilinea(puntos, (total * i) / tramos);
    const desvio = i === 0 || i === tramos ? 0 : i % 2 === 1 ? amplitud : -amplitud;
    salida.push([p.x + -p.uy * desvio, p.y + p.ux * desvio]);
  }
  return salida;
}

/* Corte (relación rota) sobre una polilínea: dos tramos con un
   hueco al medio (por longitud de arco) y la perpendicular en
   cada extremo del hueco. */
function corteDePolilinea(puntos, hueco = 6) {
  const total = largoDePolilinea(puntos) || 1;
  const h = Math.min(hueco, total * 0.3);
  const p1 = puntoEnPolilinea(puntos, total / 2 - h);
  const p2 = puntoEnPolilinea(puntos, total / 2 + h);
  const muestras = muestrearPolilinea(puntos);
  const d1 = total / 2 - h;
  const d2 = total / 2 + h;
  let acumulado = 0;
  const izquierdo = [];
  const derecho = [];
  for (let i = 0; i < muestras.length; i++) {
    if (i > 0) {
      acumulado += Math.hypot(muestras[i].x - muestras[i - 1].x, muestras[i].y - muestras[i - 1].y);
    }
    if (acumulado < d1) izquierdo.push(muestras[i]);
    if (acumulado > d2) derecho.push(muestras[i]);
  }
  izquierdo.push({ x: p1.x, y: p1.y });
  derecho.unshift({ x: p2.x, y: p2.y });
  return {
    segmentos: [izquierdo, derecho],
    ticks: [
      { x: p1.x, y: p1.y },
      { x: p2.x, y: p2.y },
    ],
    direccion: { x: -p1.uy, y: p1.ux },
  };
}

/* Geometría de una relación de calidad. Los extremos quedan
   siempre sobre el borde de las dos figuras; la línea se dobla
   por el punto medio corrido `desvio` unidades a un lado
   (goma elástica sujeta en sus extremos), de modo que el
   usuario puede arrastrarla para que no se monte sobre otras
   líneas. Sin desvío propio, una relación sobre la línea de
   pareja de su par nace desviada junto a ella (desvio 11).
   Devuelve además, según el tipo, el trazado ya preparado:
   `lineas` (cercana/fusión), `zigzag` (conflicto) o
   `segmentos`/`ticks`/`direccion` (corte). */
export function geometriaDeRelacion(genograma, relacion) {
  const p1 = personaDe(genograma, relacion.de);
  const p2 = personaDe(genograma, relacion.a);
  if (!p1 || !p2) return null;
  const hayPareja = genograma.vinculos.some(
    (v) =>
      !esDescendencia(v.tipo) &&
      ((v.de === relacion.de && v.a === relacion.a) || (v.de === relacion.a && v.a === relacion.de))
  );
  const desvio = Number.isFinite(relacion.desvio) ? relacion.desvio : hayPareja ? 11 : 0;
  const [inicio, fin] = puntosEntre(p1, p2);
  const dx = fin.x - inicio.x;
  const dy = fin.y - inicio.y;
  const len = Math.hypot(dx, dy) || 1;
  const normal = { x: -dy / len, y: dx / len };
  const medio = {
    x: (inicio.x + fin.x) / 2 + normal.x * desvio,
    y: (inicio.y + fin.y) / 2 + normal.y * desvio,
  };
  const puntos = muestrearPolilinea([inicio, medio, fin]);
  const resultado = { inicio, fin, medio, normal, desvio, puntos };
  if (relacion.tipo === "cercana" || relacion.tipo === "fusion") {
    const desvios = relacion.tipo === "cercana" ? [-2.6, 2.6] : [-4.6, 0, 4.6];
    const normales = normalesDePolilinea(puntos);
    resultado.lineas = desvios.map((d) =>
      puntos.map((p, i) => ({ x: p.x + normales[i].x * d, y: p.y + normales[i].y * d }))
    );
  } else if (relacion.tipo === "conflicto") {
    resultado.zigzag = zigzagDePolilinea(puntos);
  } else if (relacion.tipo === "corte") {
    Object.assign(resultado, corteDePolilinea(puntos));
  }
  return resultado;
}
