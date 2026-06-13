"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Expand, Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function VideoPlayer({ src }: { src?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const progress = useMemo(() => (duration ? (currentTime / duration) * 100 : 0), [currentTime, duration]);

  const togglePlay = async () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      await video.play();
      setIsPlaying(true);
      return;
    }

    video.pause();
    setIsPlaying(false);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await containerRef.current.requestFullscreen();
  };

  if (!src) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-[2rem] border border-dashed text-sm text-muted-foreground">
        Video önizlemesi henüz hazır değil.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="group relative overflow-hidden rounded-[2rem] border bg-black">
      <video
        ref={videoRef}
        className="aspect-video w-full bg-black object-cover"
        preload="metadata"
        src={src}
        onClick={() => void togglePlay()}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent p-4 text-white">
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-secondary transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button type="button" size="icon" variant="ghost" className="text-white hover:bg-white/10" onClick={() => void togglePlay()}>
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={(event) => {
                const nextTime = Number(event.target.value);
                setCurrentTime(nextTime);

                if (videoRef.current) {
                  videoRef.current.currentTime = nextTime;
                }
              }}
              className="w-40 accent-secondary md:w-64"
            />

            <span className="text-xs text-white/80">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <Button type="button" size="icon" variant="ghost" className="text-white hover:bg-white/10" onClick={() => void toggleFullscreen()}>
            <Expand className="h-5 w-5" />
            <span className="sr-only">{isFullscreen ? "Tam ekrandan çık" : "Tam ekran"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
