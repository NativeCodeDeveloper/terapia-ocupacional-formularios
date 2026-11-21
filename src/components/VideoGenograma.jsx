"use client";

import { useEffect, useRef } from "react";

/* Demo del genograma: siempre en reproducción (sin controles, para que
   nadie pueda pausarla), sin audio en ningún caso — el archivo no tiene
   pista de audio y además se fuerza el silencio — y al doble de
   velocidad. Si iOS bloquea el autoplay, se reintenta al primer toque. */
export default function VideoGenograma() {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const silenciar = () => {
      video.muted = true;
      video.volume = 0;
    };

    const reproducir = () => {
      silenciar();
      /* defaultPlaybackRate evita que el navegador reinicie la velocidad
         en cada vuelta del loop; playbackRate la aplica al instante. */
      video.defaultPlaybackRate = 2;
      video.playbackRate = 2;
      const intento = video.play();
      if (intento) intento.catch(() => {});
    };

    const alPausar = () => reproducir();
    const alVolver = () => {
      if (!document.hidden && video.paused) reproducir();
    };
    const alInteractuar = () => {
      if (video.paused) reproducir();
    };
    const alCargar = () => reproducir();
    /* Chrome ignora la velocidad asignada antes de tener metadatos,
       por eso se vuelve a aplicar cuando la reproducción arranca. */
    const alArrancar = () => {
      video.defaultPlaybackRate = 2;
      if (video.playbackRate !== 2) video.playbackRate = 2;
    };

    video.addEventListener("volumechange", silenciar);
    video.addEventListener("pause", alPausar);
    video.addEventListener("loadedmetadata", alCargar);
    video.addEventListener("playing", alArrancar);
    document.addEventListener("visibilitychange", alVolver);
    document.addEventListener("touchstart", alInteractuar, { passive: true });
    document.addEventListener("click", alInteractuar);

    silenciar();
    const intento = video.play();
    if (intento) intento.catch(() => {});

    return () => {
      video.removeEventListener("volumechange", silenciar);
      video.removeEventListener("pause", alPausar);
      video.removeEventListener("loadedmetadata", alCargar);
      video.removeEventListener("playing", alArrancar);
      document.removeEventListener("visibilitychange", alVolver);
      document.removeEventListener("touchstart", alInteractuar);
      document.removeEventListener("click", alInteractuar);
    };
  }, []);

  return (
    <video
      ref={ref}
      className="w-full"
      src="/videos/genograma-demo.mov"
      poster="/videos/genograma-demo.jpg"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-label="Demostración del genograma familiar"
    />
  );
}
