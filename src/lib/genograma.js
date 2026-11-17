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
export const NODO = { lado: 32, radio: 16 };

/* Leyenda impresa bajo el diagrama del informe. */
export const LEYENDA_GENOGRAMA =
  "Cuadrado: hombre · Círculo: mujer · Rombo: otro · X: fallecido · Doble borde: usuario/a evaluado/a · Óvalo punteado: convivencia (quiénes viven juntos)";

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

/* Posición de cuadrícula por defecto: filas de cinco figuras,
   con espacio para las etiquetas. */
function posicionDeCuadricula(indice) {
  return { x: 96 + (indice % 5) * 150, y: 96 + Math.floor(indice / 5) * 130 };
}

export function nuevaPersona(genograma, sexo = "hombre", posicion = null) {
  const persona = {
    id: nuevoId("p"),
    nombre: "",
    sexo: SEXOS.some((s) => s.valor === sexo) ? sexo : "hombre",
    edad: "",
    fallecido: false,
    causaMuerte: "",
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
    /* Varios progenitores para un mismo hijo (hijo de José y
       de María): solo se evita el duplicado exacto. */
    if (genograma.vinculos.some((v) => v.tipo === "hijo" && v.de === de && v.a === a)) return genograma;
    const nueva = { id: nuevoId("v"), tipo, de, a };
    return { ...genograma, vinculos: [...genograma.vinculos, nueva] };
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
    const observacion = [p.patologias?.trim(), estado, p.ocupacion?.trim(), p.nota?.trim()].filter(Boolean).join(" · ");
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
  let minY = Math.min(...ys) - 42;
  let maxX = Math.max(...xs) + 72;
  let maxY = Math.max(...ys) + 68;
  for (const grupo of genograma.grupos ?? []) {
    const geo = geometriaDeGrupo(genograma, grupo);
    if (!geo) continue;
    minX = Math.min(minX, geo.cx - geo.rx - 8);
    minY = Math.min(minY, geo.cy - geo.ry - 8);
    maxX = Math.max(maxX, geo.cx + geo.rx + 8);
    maxY = Math.max(maxY, geo.cy + geo.ry + 8);
  }
  return { minX, minY, ancho: maxX - minX, alto: maxY - minY };
}

/* Óvalo punteado que rodea a los integrantes de un círculo de
   convivencia. Devuelve null con menos de dos miembros. */
export function geometriaDeGrupo(genograma, grupo) {
  const miembros = (grupo.integrantes ?? [])
    .map((id) => personaDe(genograma, id))
    .filter(Boolean);
  if (miembros.length < 2) return null;
  const xs = miembros.map((p) => p.x);
  const ys = miembros.map((p) => p.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const rx = Math.max((Math.max(...xs) - Math.min(...xs)) / 2 + NODO.radio + 36, 100);
  const ry = Math.max((Math.max(...ys) - Math.min(...ys)) / 2 + NODO.radio + 42, 80);
  return { cx, cy, rx, ry, etiqueta: grupo.nombre?.trim() || ETIQUETA_CONVIVENCIA };
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
   línea horizontal y de ahí cae una línea por hijo, de modo
   que las líneas de hermanos no se superpongan. Un hijo con
   varios progenitores recibe una caída por progenitor, con
   puntos de llegada repartidos sobre su borde superior.
   Devuelve { id, clave, recorrido } — `id` es el vínculo al
   que pertenece la ruta (para selección) y `clave` identifica
   cada tramo dibujado. */
export function rutasDeDescendencia(genograma) {
  const rutas = [];
  const hijos = genograma.vinculos.filter((v) => v.tipo === "hijo");
  if (hijos.length === 0) return rutas;

  /* Punto de origen de cada vínculo: punto medio de la línea
     de pareja o borde inferior del progenitor. */
  const origenDe = new Map();
  for (const v of hijos) {
    let origen = null;
    const vinculoPareja = genograma.vinculos.find((w) => w.id === v.de && w.tipo !== "hijo");
    if (vinculoPareja) {
      const pareja = geometriaDePareja(genograma, vinculoPareja);
      origen = pareja ? pareja.medio : null;
    } else {
      const progenitor = personaDe(genograma, v.de);
      origen = progenitor ? { x: progenitor.x, y: progenitor.y + NODO.radio } : null;
    }
    origenDe.set(v.id, origen);
  }

  /* Un hijo con varios progenitores reparte los puntos de
     llegada sobre su techo, de izquierda a derecha según el
     lado de cada origen. */
  const origenesPorHijo = new Map();
  for (const v of hijos) {
    if (!origenDe.get(v.id)) continue;
    const lista = origenesPorHijo.get(v.a) ?? [];
    lista.push(v);
    origenesPorHijo.set(v.a, lista);
  }
  const desvioDe = new Map();
  for (const lista of origenesPorHijo.values()) {
    lista
      .slice()
      .sort((a, b) => origenDe.get(a.id).x - origenDe.get(b.id).x)
      .forEach((v, i, orden) => desvioDe.set(v.id, (i - (orden.length - 1) / 2) * 12));
  }

  /* Agrupa los hijos por origen para compartir tallo y guía. */
  const porOrigen = new Map();
  for (const v of hijos) {
    if (!origenDe.get(v.id)) continue;
    const lista = porOrigen.get(v.de) ?? [];
    lista.push(v);
    porOrigen.set(v.de, lista);
  }

  for (const lista of porOrigen.values()) {
    const origen = origenDe.get(lista[0].id);
    const conTecho = [];
    for (const v of lista) {
      const hijo = personaDe(genograma, v.a);
      if (!hijo) continue;
      const llegada = { x: hijo.x + (desvioDe.get(v.id) ?? 0), y: hijo.y - NODO.radio };
      if (llegada.y <= origen.y + 6) {
        /* Hijo al nivel del origen o encima: línea directa
           borde a borde, sin tallo ni guía. */
        rutas.push({
          id: v.id,
          clave: v.id,
          recorrido: [origen, puntoBorde(hijo, origen.x - hijo.x, origen.y - hijo.y)],
        });
      } else {
        conTecho.push({ v, llegada });
      }
    }
    if (conTecho.length === 0) continue;

    if (conTecho.length === 1) {
      const { v, llegada } = conTecho[0];
      const yCodo = (origen.y + llegada.y) / 2;
      rutas.push({
        id: v.id,
        clave: v.id,
        recorrido: [origen, { x: origen.x, y: yCodo }, { x: llegada.x, y: yCodo }, llegada],
      });
      continue;
    }

    const yBus = Math.min(...conTecho.map(({ llegada }) => llegada.y)) - 16;
    if (yBus <= origen.y + 12) {
      // Sin espacio para la guía compartida: codos individuales.
      for (const { v, llegada } of conTecho) {
        const yCodo = (origen.y + llegada.y) / 2;
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
    const claveGuia = `${lista[0].id}-guia`;
    const izquierda = conTecho.filter(({ llegada }) => llegada.x < origen.x - 0.5);
    const derecha = conTecho.filter(({ llegada }) => llegada.x > origen.x + 0.5);
    if (izquierda.length > 0 || derecha.length > 0) {
      if (izquierda.length > 0) {
        const xLejano = Math.min(...izquierda.map(({ llegada }) => llegada.x));
        rutas.push({ id: lista[0].id, clave: claveGuia, recorrido: [origen, { x: origen.x, y: yBus }, { x: xLejano, y: yBus }] });
      }
      if (derecha.length > 0) {
        const xLejano = Math.max(...derecha.map(({ llegada }) => llegada.x));
        rutas.push({
          id: lista[0].id,
          clave: izquierda.length > 0 ? `${claveGuia}-d` : claveGuia,
          recorrido: [origen, { x: origen.x, y: yBus }, { x: xLejano, y: yBus }],
        });
      }
    } else {
      rutas.push({ id: lista[0].id, clave: claveGuia, recorrido: [origen, { x: origen.x, y: yBus }] });
    }
    for (const { v, llegada } of conTecho) {
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
