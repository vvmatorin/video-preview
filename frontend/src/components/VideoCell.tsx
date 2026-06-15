import { memo, useEffect, useRef } from "react";
import { useLazyVideo } from "../hooks/useLazyVideo";
import { useAppStore } from "../store";
import type { Video } from "../types";

interface Props {
  video: Video;
  rowIndex: number;
  muted: boolean;
}

export const VideoCell = memo(function VideoCell({ video, rowIndex, muted }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { containerRef, visibility } = useLazyVideo();
  const isRowPlaying = useAppStore((s) => s.playingRows.has(rowIndex));
  const prevRowPlaying = useRef(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (isRowPlaying && visibility === "visible") {
      if (!prevRowPlaying.current) {
        vid.currentTime = 0;
      }
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
    prevRowPlaying.current = isRowPlaying;
  }, [isRowPlaying, visibility]);

  useEffect(() => {
    const vid = videoRef.current;
    if (vid) vid.muted = muted;
  }, [muted]);

  const videoSrc = `/api/video?path=${encodeURIComponent(video.path)}`;

  return (
    <div
      ref={containerRef}
      className="relative group rounded-lg overflow-hidden bg-black"
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "auto 832px 1216px",
        contain: "content",
      }}
    >
      {visibility !== "offscreen" ? (
        <video
          ref={videoRef}
          src={videoSrc}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          className="w-full aspect-[832/1216] object-contain"
        />
      ) : (
        <div className="w-full aspect-[832/1216]" />
      )}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-zinc-300 truncate block">
          {video.name}
        </span>
      </div>
    </div>
  );
});
