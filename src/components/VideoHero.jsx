"use client";

import { useEffect, useRef } from "react";

/* Video del hero: debe estar siempre reproduciéndose, en escritorio y
   móvil. iOS bloquea el autoplay en modo de bajo consumo, por eso se
   reintenta al primer toque y al volver a la pestaña. */
export default function VideoHero() {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reproducir = () => {
      video.muted = true;
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

    video.addEventListener("pause", alPausar);
    document.addEventListener("visibilitychange", alVolver);
    document.addEventListener("touchstart", alInteractuar, { passive: true });
    document.addEventListener("click", alInteractuar);

    reproducir();

    return () => {
      video.removeEventListener("pause", alPausar);
      document.removeEventListener("visibilitychange", alVolver);
      document.removeEventListener("touchstart", alInteractuar);
      document.removeEventListener("click", alInteractuar);
    };
  }, []);

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover object-[53%_50%]"
      src="/videos/hero-superheroe.mp4"
      poster="/videos/hero-superheroe.jpg"
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
