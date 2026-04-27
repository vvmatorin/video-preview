import { memo } from "react";
import { useAppStore } from "../store";
import { VideoCell } from "./VideoCell";
import type { Experiment } from "../types";

interface Props {
  rowIndex: number;
  experiments: Experiment[];
  videosPerRow: number;
}

export const VideoRow = memo(function VideoRow({
  rowIndex,
  experiments,
  videosPerRow,
}: Props) {
  const isPlaying = useAppStore((s) => s.playingRows.has(rowIndex));
  const toggleRowPlay = useAppStore((s) => s.toggleRowPlay);

  const startIdx = rowIndex * videosPerRow;

  return (
    <div
      className="grid border-b border-zinc-800/50"
      style={{
        gridTemplateColumns: `40px repeat(${experiments.length}, minmax(0, 1fr))`,
      }}
    >
      <div className="flex items-start justify-center pt-3 sticky left-0">
        <button
          onClick={() => toggleRowPlay(rowIndex)}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
            isPlaying
              ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
          }`}
          title={isPlaying ? "Pause row" : "Play row"}
        >
          {isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="2" width="4" height="12" rx="1" />
              <rect x="9" y="2" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2l10 6-10 6V2z" />
            </svg>
          )}
        </button>
      </div>

      {experiments.map((exp, expIdx) => {
        const rowVideos = exp.videos.slice(startIdx, startIdx + videosPerRow);
        if (rowVideos.length === 0 && experiments.length > 1) {
          return <div key={exp.id} className={`p-2 min-h-16 ${expIdx > 0 ? "border-l border-zinc-800/50" : ""}`} />;
        }
        return (
          <div
            key={exp.id}
            className={`grid gap-2 p-2 ${expIdx > 0 ? "border-l border-zinc-800/50" : ""}`}
            style={{
              gridTemplateColumns: `repeat(${videosPerRow}, minmax(0, 1fr))`,
            }}
          >
            {rowVideos.map((video) => (
              <VideoCell
                key={video.id}
                video={video}
                rowIndex={rowIndex}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
});
