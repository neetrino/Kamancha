"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/audio/sayat-nova-ashxarhums-ax-chim-qashi.mp3";
const STORAGE_KEY = "kamancha-bg-music-enabled";
const DEFAULT_VOLUME = 0.35;

export type BackgroundMusicLabels = {
  enable: string;
  disable: string;
  active: string;
  muted: string;
};

type BackgroundMusicProps = {
  labels: BackgroundMusicLabels;
};

function readStoredEnabled(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return true;
    }
    return raw === "true";
  } catch {
    return true;
  }
}

function writeStoredEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

/**
 * Storefront ambient track with loop + Active/Muted toggle.
 * Browsers may block autoplay until the first user gesture.
 */
export function BackgroundMusic({ labels }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wantEnabledRef = useRef(true);
  const [enabled, setEnabled] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = DEFAULT_VOLUME;
    audioRef.current = audio;

    const initialEnabled = readStoredEnabled();
    wantEnabledRef.current = initialEnabled;
    setEnabled(initialEnabled);
    setReady(true);

    const detachGestureRetry = (): void => {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };

    function onFirstGesture(): void {
      if (!wantEnabledRef.current || !audioRef.current) {
        return;
      }
      void audioRef.current.play().then(detachGestureRetry).catch(() => {
        // Still blocked; keep waiting for another gesture.
      });
    }

    const tryPlay = (): void => {
      if (!wantEnabledRef.current || !audioRef.current) {
        return;
      }
      void audioRef.current.play().catch(() => {
        window.addEventListener("pointerdown", onFirstGesture);
        window.addEventListener("keydown", onFirstGesture);
      });
    };

    if (initialEnabled) {
      tryPlay();
    }

    return () => {
      detachGestureRetry();
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  function toggleMusic(): void {
    const next = !enabled;
    wantEnabledRef.current = next;
    setEnabled(next);
    writeStoredEnabled(next);

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (next) {
      void audio.play().catch(() => {
        // Still blocked; next gesture or second click usually succeeds.
      });
      return;
    }

    audio.pause();
  }

  if (!ready) {
    return null;
  }

  const label = enabled ? labels.disable : labels.enable;
  const status = enabled ? labels.active : labels.muted;

  return (
    <button
      type="button"
      onClick={toggleMusic}
      aria-pressed={enabled}
      aria-label={label}
      title={label}
      className="pointer-events-auto fixed right-4 z-[70] inline-flex items-center gap-2 rounded-full border border-white/20 bg-brand-forest/85 px-3.5 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 bottom-[calc(var(--mobile-bottom-nav-clearance)+0.5rem)] xl:bottom-6"
    >
      {enabled ? (
        <Volume2 className="size-4 shrink-0" aria-hidden />
      ) : (
        <VolumeX className="size-4 shrink-0" aria-hidden />
      )}
      <span>{status}</span>
    </button>
  );
}
