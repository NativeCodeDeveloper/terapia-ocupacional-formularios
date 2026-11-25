"use client";

import { useEffect, useRef } from "react";

/* Video de portada (superhéroe) entre el navbar y el carrusel: siempre
   en reproducción, en loop infinito y sin audio en ningún caso — el
   archivo se exporta sin pista de audio y además se fuerza el silencio.
   Si iOS bloquea el autoplay, se reintenta al primer toque o al volver
   a la pestaña. */
export default function VideoPortada() {
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

    video.addEventListener("volumechange", silenciar);
    video.addEventListener("pause", alPausar);
    document.addEventListener("visibilitychange", alVolver);
    document.addEventListener("touchstart", alInteractuar, { passive: true });
    document.addEventListener("click", alInteractuar);

    reproducir();

    return () => {
      video.removeEventListener("volumechange", silenciar);
      video.removeEventListener("pause", alPausar);
      document.removeEventListener("visibilitychange", alVolver);
      document.removeEventListener("touchstart", alInteractuar);
      document.removeEventListener("click", alInteractuar);
    };
  }, []);

  return (
    <video
      ref={ref}
      className="mx-auto w-full max-w-4xl"
      src="/videos/portada-superheroe.mp4"
      poster="/videos/portada-superheroe.jpg"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
