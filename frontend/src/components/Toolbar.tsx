import { useState } from "react";
import { useAppStore } from "../store";
import { AddExperimentModal } from "./AddExperimentModal";

export function Toolbar() {
  const [modalOpen, setModalOpen] = useState(false);
  const globalMuted = useAppStore((s) => s.globalMuted);
  const videosPerRow = useAppStore((s) => s.videosPerRow);
  const toggleMute = useAppStore((s) => s.toggleMute);
  const setVideosPerRow = useAppStore((s) => s.setVideosPerRow);

  return (
    <>
      <header className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="2" x2="8" y2="14" />
              <line x1="2" y1="8" x2="14" y2="8" />
            </svg>
            Add Experiment
          </button>

          <div className="h-5 w-px bg-zinc-700" />

          <button
            onClick={toggleMute}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors shrink-0 ${
              globalMuted
                ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                : "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
            }`}
            title={globalMuted ? "Unmute all (M)" : "Mute all (M)"}
          >
            {globalMuted ? (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2L4 6H1v4h3l4 4V2z" />
                <line x1="12" y1="5" x2="15" y2="11" stroke="currentColor" strokeWidth="1.5" />
                <line x1="15" y1="5" x2="12" y2="11" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2L4 6H1v4h3l4 4V2z" />
                <path d="M11 5.5c.8.8 1.2 1.8 1.2 2.5s-.4 1.7-1.2 2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
            {globalMuted ? "Muted" : "Sound"}
          </button>

          <div className="h-5 w-px bg-zinc-700" />

          <div className="flex items-center gap-2 shrink-0">
            <label className="text-sm text-zinc-400 whitespace-nowrap">
              Per row
            </label>
            <input
              type="range"
              min={1}
              max={8}
              value={videosPerRow}
              onChange={(e) => setVideosPerRow(Number(e.target.value))}
              className="w-20 accent-indigo-500"
            />
            <span className="text-sm text-zinc-300 w-4 text-center tabular-nums">
              {videosPerRow}
            </span>
          </div>
        </div>
      </header>
      <AddExperimentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
