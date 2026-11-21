"use client";

import { useEffect, useRef } from "react";

/* Demo del genograma: al doble de velocidad y sin audio en ningún caso
   (el archivo no tiene pista de audio; además se fuerza el silencio). */
export default function VideoGenograma() {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const silenciar = () => {
      video.muted = true;
      video.volume = 0;
    };
    video.addEventListener("volumechange", silenciar);
    silenciar();
    return () => video.removeEventListener("volumechange", silenciar);
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
      controls
      preload="metadata"
      aria-label="Demostración del genograma familiar"
      onLoadedMetadata={() => {
        if (ref.current) ref.current.playbackRate = 2;
      }}
    />
  );
}
