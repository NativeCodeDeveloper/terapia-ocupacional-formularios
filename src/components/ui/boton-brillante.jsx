"use client";

import { useId, useSyncExternalStore } from "react";

const CONSULTA_MOTION_REDUCIDO = "(prefers-reduced-motion: reduce)";

function prefiereMotionReducido() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.(CONSULTA_MOTION_REDUCIDO)?.matches ?? false;
}

function suscribirMotionReducido(callback) {
  if (typeof window === "undefined") return () => {};
  const consulta = window.matchMedia(CONSULTA_MOTION_REDUCIDO);
  consulta.addEventListener("change", callback);
  return () => consulta.removeEventListener("change", callback);
}

function snapshotServidor() {
  return false;
}

/* Botón con borde cónico giratorio, destello y brillo al pasar el
   cursor (efecto «shiny button»), adaptado del componente de referencia
   al proyecto: sin tipografía ni padding fijos — el tamaño y la
   tipografía vienen del className — y renderiza un enlace cuando se le
   pasa href. Colores por defecto = paleta de la marca. */
export default function BotonBrillante({
  label,
  href,
  className = "",
  fillColor = "#069494",
  labelColor = "#ffffff",
  accentColor = "#00acc1",
  accentSoftColor = "#7fe3e3",
  sweepDuration = 3,
  easeDuration = 0.8,
  arcWidth = 14,
  cornerRadius = 12,
  showSpeckle = true,
  showSheen = true,
  speckleOpacity = 0.4,
}) {
  const motionReducido = useSyncExternalStore(
    suscribirMotionReducido,
    prefiereMotionReducido,
    snapshotServidor,
  );
  const instancia = useId().replace(/[^a-zA-Z0-9]/g, "");
  const alcance = `brillo-${instancia}`;

  const css = `
    @property --angulo-${instancia} {
      syntax: "<angle>";
      initial-value: 0deg;
      inherits: false;
    }
    @property --angulo-extra-${instancia} {
      syntax: "<angle>";
      initial-value: 0deg;
      inherits: false;
    }
    @property --arco-${instancia} {
      syntax: "<percentage>";
      initial-value: ${arcWidth}%;
      inherits: false;
    }
    @property --destello-${instancia} {
      syntax: "<color>";
      initial-value: white;
      inherits: false;
    }

    .${alcance} {
      --base: ${fillColor};
      --inset: color-mix(in srgb, ${fillColor} 72%, black);
      --color-etiqueta: ${labelColor};
      --acento: ${accentColor};
      --acento-suave: ${accentSoftColor};
      --animacion: giro-angulo-${instancia} linear infinite;
      --duracion: ${sweepDuration}s;
      --transicion: ${easeDuration}s cubic-bezier(0.25, 1, 0.5, 1);

      isolation: isolate;
      position: relative;
      overflow: hidden;
      cursor: pointer;
      outline-offset: 4px;
      border: 1px solid transparent;
      border-radius: ${cornerRadius}px;
      color: var(--color-etiqueta);
      background:
        linear-gradient(var(--base), var(--base)) padding-box,
        conic-gradient(
          from calc(var(--angulo-${instancia}) - var(--angulo-extra-${instancia})),
          transparent,
          var(--acento) var(--arco-${instancia}),
          var(--destello-${instancia}) calc(var(--arco-${instancia}) * 2),
          var(--acento) calc(var(--arco-${instancia}) * 3),
          transparent calc(var(--arco-${instancia}) * 4)
        ) border-box;
      box-shadow: inset 0 0 0 1px var(--inset);
      transition: var(--transicion);
      transition-property:
        --angulo-extra-${instancia},
        --arco-${instancia},
        --destello-${instancia};
    }

    .${alcance}::before,
    .${alcance}::after,
    .${alcance} span::before {
      content: "";
      pointer-events: none;
      position: absolute;
      inset-inline-start: 50%;
      inset-block-start: 50%;
      translate: -50% -50%;
      z-index: -1;
    }

    .${alcance}:active {
      translate: 0 1px;
    }

    .${alcance}::before {
      --tamano: calc(100% - 6px);
      --posicion: 2px;
      --espacio: calc(var(--posicion) * 2);
      width: var(--tamano);
      height: var(--tamano);
      background: radial-gradient(
        circle at var(--posicion) var(--posicion),
        white calc(var(--posicion) / 4),
        transparent 0
      ) padding-box;
      background-size: var(--espacio) var(--espacio);
      background-repeat: space;
      mask-image: conic-gradient(
        from calc(var(--angulo-${instancia}) + 45deg),
        black,
        transparent 10% 90%,
        black
      );
      border-radius: inherit;
      opacity: ${showSpeckle ? speckleOpacity : 0};
      z-index: -1;
    }

    .${alcance}::after {
      --animacion: brillo-deslizante-${instancia} linear infinite;
      width: 100%;
      aspect-ratio: 1;
      background: linear-gradient(
        -50deg,
        transparent,
        var(--acento),
        transparent
      );
      mask-image: radial-gradient(circle at bottom, transparent 40%, black);
      opacity: ${showSheen ? 0.6 : 0};
    }

    .${alcance} span {
      z-index: 1;
    }

    .${alcance} span::before {
      --tamano: calc(100% + 1rem);
      width: var(--tamano);
      height: var(--tamano);
      box-shadow: inset 0 -1ex 2rem 4px var(--acento);
      opacity: 0;
      transition: opacity var(--transicion);
      animation: calc(var(--duracion) * 1.5) respirar-${instancia} linear infinite;
    }

    .${alcance},
    .${alcance}::before,
    .${alcance}::after {
      animation:
        var(--animacion) var(--duracion),
        var(--animacion) calc(var(--duracion) / 0.4) reverse paused;
      animation-composition: add;
    }

    .${alcance}:is(:hover, :focus-visible) {
      --arco-${instancia}: 20%;
      --angulo-extra-${instancia}: 95deg;
      --destello-${instancia}: var(--acento-suave);
    }

    .${alcance}:is(:hover, :focus-visible),
    .${alcance}:is(:hover, :focus-visible)::before,
    .${alcance}:is(:hover, :focus-visible)::after {
      animation-play-state: running;
    }

    .${alcance}:is(:hover, :focus-visible) span::before {
      opacity: 1;
    }

    @keyframes giro-angulo-${instancia} {
      to {
        --angulo-${instancia}: 360deg;
      }
    }

    @keyframes brillo-deslizante-${instancia} {
      to {
        rotate: 360deg;
      }
    }

    @keyframes respirar-${instancia} {
      from,
      to {
        scale: 1;
      }
      50% {
        scale: 1.2;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .${alcance},
      .${alcance}::before,
      .${alcance}::after,
      .${alcance} span::before {
        animation: none !important;
      }

      .${alcance}:is(:hover, :focus-visible),
      .${alcance}:is(:hover, :focus-visible)::before,
      .${alcance}:is(:hover, :focus-visible)::after {
        animation-play-state: paused !important;
      }

      .${alcance}:is(:hover, :focus-visible) span::before {
        opacity: 0;
      }

      .${alcance} {
        transition: none;
      }
    }
  `;

  const contenido = <span>{label}</span>;

  return (
    <>
      <style>{css}</style>
      {href ? (
        <a href={href} className={`${alcance} ${className}`} aria-label={label}>
          {contenido}
        </a>
      ) : (
        <button
          type="button"
          className={`${alcance} ${className}`}
          aria-label={label}
          data-motion-reducido={motionReducido ? "true" : undefined}
        >
          {contenido}
        </button>
      )}
    </>
  );
}
