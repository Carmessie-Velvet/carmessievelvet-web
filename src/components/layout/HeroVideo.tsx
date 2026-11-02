"use client";

import { useEffect, useRef, useState } from "react";
import { useHeroVideoPlayback } from "@/lib/use-hero-video-playback";

interface HeroVideoProps {
  desktopSrc?: string | null;
  mobileSrc?: string | null;
  /** Clases del `<video>` — mismas que las de la imagen de abajo (ej. su opacidad), para que no cambie el tono al entrar. */
  className?: string;
}

/**
 * Video opcional en bucle que se reproduce **encima** de la imagen del hero o
 * del banner (`Hero.videoUrl`/`videoMobileUrl`, uno por pantalla — ver
 * "Video opcional" en el `CLAUDE.md`). Es una mejora, no un reemplazo: la
 * imagen siempre está renderizada debajo (es el poster mientras el video
 * carga, el elemento LCP de la página, y el respaldo si el video no puede o
 * no debe reproducirse), así que este componente no pinta nada hasta que
 * sabe que sí corresponde y el video ya está corriendo.
 *
 * Se queda en la imagen sola cuando: esta pantalla no tiene video, el
 * visitante pidió movimiento reducido o ahorro de datos, el navegador no
 * puede decodificar el archivo, o el autoplay se bloquea. No se pide ni un
 * byte del video durante el HTML inicial ni antes de que la sección esté
 * cerca de la pantalla (el banner vive bajo el pliegue).
 */
export function HeroVideo({ desktopSrc, mobileSrc, className }: HeroVideoProps) {
  const playback = useHeroVideoPlayback();
  const src = playback === "desktop" ? desktopSrc : playback === "mobile" ? mobileSrc : null;

  if (!src) return null;
  // `key` = el archivo: al rotar/redimensionar a la otra pantalla remonta con
  // estado limpio (vuelve a la imagen hasta que ese otro video corra).
  return <VideoLayer key={src} src={src} className={className} />;
}

function VideoLayer({ src, className }: { src: string; className?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Se monta el <video> (y empieza a descargar) solo cuando la sección está
  // cerca de la pantalla; después se pausa/reanuda al salir/entrar de ella.
  const [near, setNear] = useState(false);
  // El wrapper se desvanece hasta que el video de verdad está reproduciendo
  // (`playing`), así el cambio imagen → video no muestra un cuadro negro ni un
  // reproductor a medias, y si nunca arranca la imagen no se tapa.
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  if (failed) return null;

  return (
    <div
      ref={wrapperRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
        playing ? "opacity-100" : "opacity-0"
      }`}
    >
      {near && (
        <video
          ref={videoRef}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          onPlaying={() => setPlaying(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover ${className ?? ""}`}
        />
      )}
    </div>
  );
}
