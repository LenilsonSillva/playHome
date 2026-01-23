import { useCallback, useRef } from "react";

type AudioMap = Record<string, string>;

export function useIOSAudioUnlock(
  audioSources: AudioMap,
  silentWavSrc: string,
) {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const unlocked = useRef(false);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);

  const initAudio = useCallback(() => {
    if (unlocked.current) return;

    // 🔇 1. WAV silencioso (unlock real)
    const silent = new Audio(silentWavSrc);
    silent.preload = "auto";
    silent.volume = 0;
    silent.muted = false;

    silent
      .play()
      .then(() => {
        silent.pause();
        silent.currentTime = 0;

        silentAudioRef.current = silent;

        // 🔊 2. Agora cria os áudios reais
        Object.entries(audioSources).forEach(([key, src]) => {
          const audio = new Audio(src);
          audio.preload = "auto";

          audio.setAttribute("playsinline", "true");
          audio.setAttribute("webkit-playsinline", "true");

          audioRefs.current[key] = audio;
        });

        unlocked.current = true;
      })
      .catch(() => {});
  }, [audioSources, silentWavSrc]);

  const playSound = useCallback((key: string) => {
    if (!unlocked.current) return;

    const audio = audioRefs.current[key];
    if (!audio) return;

    audio.currentTime = 0;
    audio.volume = 1;
    audio.muted = false;

    audio.play().catch(() => {});
  }, []);

  return { initAudio, playSound };
}
