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
  { valor: "hijo", etiqueta: "Hijo/a de", grupo: "descendencia" },
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

/* Leyenda impresa bajo el diagrama del informe. */
export const LEYENDA_GENOGRAMA =
  "Cuadrado: hombre · Círculo: mujer · Rombo: otro · X: fallecido · Doble borde: usuario/a evaluado/a · Contorno punteado: convivencia (quiénes viven juntos) · Línea verde: relación cercana o de fusión · Línea roja: relación distante, de conflicto o corte · Lista sobre la figura: patologías principales";

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

export function nuevaPersona(genograma, sexo = "hombre", posicion = null) {
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
    if (v.tipo !== "hijo") {
      if (v.de === id) otroDe.set(v.id, v.a);
      else if (v.a === id) otroDe.set(v.id, v.de);
    }
  }
  return {
    ...genograma,
    personas: genograma.personas.filter((p) => p.id !== id),
    vinculos: genograma.vinculos
      .filter((v) => v.de !== id && v.a !== id)
      .map((v) => (v.tipo === "hijo" && otroDe.has(v.de) ? { ...v, de: otroDe.get(v.de) } : v)),
    relaciones: genograma.relaciones.filter((r) => r.de !== id && r.a !== id),
    grupos: (genograma.grupos ?? [])
      .map((g) => ({ ...g, integrantes: g.integrantes.filter((i) => i !== id) }))
      .filter((g) => g.integrantes.length >= 2),
  };
}

/* ============================================================
   CÍRCULOS DE CONVIVENCIA (quiénes viven juntos)
   Cada grupo se dibuja como un óvalo punteado que rodea a sus
   integrantes en el diagrama. Exige al menos dos personas.
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

/* Agrega un vínculo o una relación. Reglas mínimas para
   mantener el diagrama legible:
   - exige que ambas personas existan («hijo» admite que `de`
     sea el ID del vínculo de pareja);
   - un hijo admite varios orígenes (p. ej., hijo del padre y
     de la madre); solo se evita duplicar el mismo origen;
   - una relación nueva reemplaza la anterior del mismo par;
   - no duplica el mismo par en un vínculo de pareja. */
export function conexionAgregada(genograma, tipo, de, a) {
  const personaA = genograma.personas.find((p) => p.id === a);
  if (!personaA || de === a) return genograma;
  const esHijo = tipo === "hijo";
  const esRelacion = TIPOS_RELACION.some((t) => t.valor === tipo);
  const origenValido = esHijo
    ? genograma.personas.some((p) => p.id === de) || genograma.vinculos.some((v) => v.id === de)
    : genograma.personas.some((p) => p.id === de);
  if (!origenValido) return genograma;

  if (esHijo) {
    /* Un hijo puede quedar conectado a varias personas a la vez
       (hijo del padre y de la madre, aunque formen pareja):
       cada conexión es una línea propia; solo se evita duplicar
       exactamente el mismo origen. */
    if (genograma.vinculos.some((v) => v.tipo === "hijo" && v.de === de && v.a === a)) return genograma;
    return { ...genograma, vinculos: [...genograma.vinculos, { id: nuevoId("v"), tipo, de, a }] };
  }
  if (esRelacion) {
    const nueva = { id: nuevoId("r"), tipo, de, a };
    return {
      ...genograma,
      relaciones: [...genograma.relaciones.filter((r) => parDe(r) !== parDe(nueva)), nueva],
    };
  }
  if (!TIPOS_VINCULO.some((t) => t.valor === tipo)) return genograma;
  const nueva = { id: nuevoId("v"), tipo, de, a };
  if (genograma.vinculos.some((v) => v.tipo !== "hijo" && parDe(v) === parDe(nueva))) return genograma;
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
    siguiente.vinculos = siguiente.vinculos.filter((v) => !(v.tipo === "hijo" && v.de === id));
  }
  return siguiente;
}

export function cambiarTipoConexion(genograma, id, tipo) {
  const vinculo = genograma.vinculos.find((v) => v.id === id);
  if (vinculo) return { ...genograma, vinculos: genograma.vinculos.map((v) => (v.id === id ? { ...v, tipo } : v)) };
  return { ...genograma, relaciones: genograma.relaciones.map((r) => (r.id === id ? { ...r, tipo } : r)) };
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
      de: typeof v.de === "string" && (ids.has(v.de) || (v.tipo === "hijo" && idsDeVinculo.has(v.de))) ? v.de : null,
      a: typeof v.a === "string" && ids.has(v.a) ? v.a : null,
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
    .map((r) => ({ id: texto(r.id) || nuevoId("r"), tipo: r.tipo, de: r.de, a: r.a }));
  return {
    version: 1,
    personas,
    vinculos,
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

export function etiquetaConexionesDe(genograma, persona) {
  const partes = [];
  for (const v of genograma.vinculos) {
    if (v.tipo !== "hijo" && (v.de === persona.id || v.a === persona.id)) {
      const otro = v.de === persona.id ? v.a : v.de;
      partes.push(`Pareja (${ETIQUETA_VINCULO[v.tipo]?.toLowerCase() ?? v.tipo}) de ${nombreDe(genograma, otro)}`);
      // Hijos que descienden de esta línea de pareja: la persona
      // es padre/madre de cada uno de ellos.
      for (const h of genograma.vinculos) {
        if (h.tipo === "hijo" && h.de === v.id) {
          partes.push(`Padre/Madre de ${nombreDe(genograma, h.a)}`);
        }
      }
    }
    if (v.tipo === "hijo" && v.a === persona.id) {
      const origen = genograma.vinculos.find((x) => x.id === v.de);
      if (origen && origen.tipo !== "hijo") {
        partes.push(`Hijo/a de ${nombreDe(genograma, origen.de)} y ${nombreDe(genograma, origen.a)}`);
      } else if (origen) {
        partes.push(`Hijo/a de ${nombreDe(genograma, origen.de)}`);
      } else if (v.de) {
        partes.push(`Hijo/a de ${nombreDe(genograma, v.de)}`);
      }
    }
    if (v.tipo === "hijo" && v.de === persona.id) {
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
   espacio de las etiquetas (nombre y hasta tres líneas de
   patologías debajo, marca de usuario encima), su ancho
   horizontal y los óvalos de convivencia. Devuelve null sin
   personas. */
export function limitesDiagrama(genograma) {
  if (!genograma?.personas?.length) return null;
  const xs = genograma.personas.map((p) => p.x);
  const ys = genograma.personas.map((p) => p.y);
  let minX = Math.min(...xs) - 72;
  let minY = Math.min(...ys) - NODO.radio - 17;
  let maxX = Math.max(...xs) + 72;
  let maxY = Math.max(...ys) + 82;
  /* Las abreviaturas de patologías suben sobre la figura (una
     línea por patología, más la marca de usuario si aplica). */
  for (const p of genograma.personas) {
    const alto = listaDeAbreviaturas(p).length * 11 + (p.indicado ? 11 : 0);
    if (alto > 0) minY = Math.min(minY, p.y - NODO.radio - 7 - alto - 10);
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

/* Contorno punteado del círculo de convivencia: abraza a sus
   integrantes con un margen fijo, de modo que alguien colocado
   cerca pero fuera del hogar queda fuera del contorno. Devuelve
   { puntos, etiqueta, minX, minY, maxX, maxY } o null con
   menos de dos miembros. */
export function geometriaDeGrupo(genograma, grupo) {
  const miembros = (grupo.integrantes ?? [])
    .map((id) => personaDe(genograma, id))
    .filter(Boolean);
  if (miembros.length < 2) return null;
  const puntos = contornoDePuntos(
    miembros.map((p) => ({ x: p.x, y: p.y })),
    NODO.radio + 20
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

/* Punto del borde de la figura en la dirección del vector
   (dx, dy) desde el centro. */
export function puntoBorde(persona, dx, dy) {
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  if (persona.sexo === "mujer") return { x: persona.x + ux * NODO.radio, y: persona.y + uy * NODO.radio };
  if (persona.sexo === "otro") {
    const t = NODO.radio / (Math.abs(ux) + Math.abs(uy));
    return { x: persona.x + ux * t, y: persona.y + uy * t };
  }
  const t = NODO.radio / Math.max(Math.abs(ux), Math.abs(uy), 1e-9);
  return { x: persona.x + ux * t, y: persona.y + uy * t };
}

function puntosEntre(a, b) {
  return [puntoBorde(a, b.x - a.x, b.y - a.y), puntoBorde(b, a.x - b.x, a.y - b.y)];
}

/* Geometría de un vínculo de pareja: segmento [inicio, fin] y
   marcas (barra de separación o de divorcio). */
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
          posiciones:
            vinculo.tipo === "divorcio"
              ? [{ x: medio.x - ux * 6, y: medio.y - uy * 6 }, { x: medio.x + ux * 6, y: medio.y + uy * 6 }]
              : [{ x: medio.x, y: medio.y }],
          direccion: { x: -uy, y: ux },
        }
      : null;
  return { inicio, fin, medio, discontinua: vinculo.tipo === "convivencia", barras };
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
  const hijos = genograma.vinculos.filter((v) => v.tipo === "hijo");
  if (hijos.length === 0) return rutas;

  /* Origen efectivo de cada vínculo y clave de agrupación: los
     vínculos dirigidos a los dos miembros de una pareja
     comparten clave y se dibujan como una sola línea. */
  const infoDe = new Map();
  for (const v of hijos) {
    const vinculoParejaDirecto = genograma.vinculos.find((w) => w.id === v.de && w.tipo !== "hijo");
    if (vinculoParejaDirecto) {
      const pareja = geometriaDePareja(genograma, vinculoParejaDirecto);
      if (pareja) infoDe.set(v.id, { origen: pareja.medio, clave: `v:${vinculoParejaDirecto.id}` });
      continue;
    }
    const progenitor = personaDe(genograma, v.de);
    if (!progenitor) continue;
    /* Cada progenitor tiene su propia línea, aunque formen
       pareja entre sí: las caídas se separan al dibujar. */
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
        /* Hijo al nivel del origen o encima: línea directa
           borde a borde, sin tallo ni guía. */
        rutas.push({
          id: v.id,
          clave: v.id,
          recorrido: [origen, puntoBorde(hijo, origen.x - hijo.x, origen.y - hijo.y)],
        });
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
    for (const { v, llegada } of unicos) {
      rutas.push({ id: v.id, clave: `${v.id}-caida`, recorrido: [{ x: llegada.x, y: yBus }, llegada] });
    }
  }
  return rutas;
}

/* Geometría de una relación de calidad: segmento y estilo.
   `normal` es la perpendicular unitaria para las líneas
   paralelas (cercana/fusión). Si el par ya tiene un vínculo
   de pareja, la relación se desplaza a una línea paralela
   junto a ella para no dibujarse encima. */
export function geometriaDeRelacion(genograma, relacion) {
  const p1 = personaDe(genograma, relacion.de);
  const p2 = personaDe(genograma, relacion.a);
  if (!p1 || !p2) return null;
  const [inicio, fin] = puntosEntre(p1, p2);
  const dx = fin.x - inicio.x;
  const dy = fin.y - inicio.y;
  const len = Math.hypot(dx, dy) || 1;
  const normal = { x: -dy / len, y: dx / len };
  const hayPareja = genograma.vinculos.some(
    (v) =>
      v.tipo !== "hijo" &&
      ((v.de === relacion.de && v.a === relacion.a) || (v.de === relacion.a && v.a === relacion.de))
  );
  if (!hayPareja) return { inicio, fin, normal };
  return {
    inicio: { x: inicio.x + normal.x * 11, y: inicio.y + normal.y * 11 },
    fin: { x: fin.x + normal.x * 11, y: fin.y + normal.y * 11 },
    normal,
  };
}

/* Puntos del zigzag de una relación de conflicto. */
export function puntosDeZigzag(inicio, fin, amplitud = 4.5, tramo = 12) {
  const dx = fin.x - inicio.x;
  const dy = fin.y - inicio.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const tramos = Math.max(2, Math.round(len / tramo));
  const puntos = [];
  for (let i = 0; i <= tramos; i++) {
    const t = i / tramos;
    const desvio = i === 0 || i === tramos ? 0 : i % 2 === 1 ? amplitud : -amplitud;
    puntos.push([inicio.x + ux * len * t + nx * desvio, inicio.y + uy * len * t + ny * desvio]);
  }
  return puntos;
}
