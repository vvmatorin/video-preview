import { useEffect } from "react";
import { Toolbar } from "./components/Toolbar";
import { VideoRow } from "./components/VideoRow";
import { useAppStore } from "./store";

export default function App() {
  const experiments = useAppStore((s) => s.experiments);
  const videosPerRow = useAppStore((s) => s.videosPerRow);
  const addExperiment = useAppStore((s) => s.addExperiment);
  const removeExperiment = useAppStore((s) => s.removeExperiment);
  const toggleExperimentMute = useAppStore((s) => s.toggleExperimentMute);

  useEffect(() => {
    fetch("/api/init")
      .then((r) => r.json())
      .then((data: { paths: string[] }) => {
        for (const p of data.paths) {
          addExperiment("", p).catch(console.error);
        }
      })
      .catch(() => {});
  }, [addExperiment]);

  const maxVideos = Math.max(0, ...experiments.map((e) => e.videos.length));
  const rowCount = Math.ceil(maxVideos / videosPerRow) || 0;

  if (experiments.length === 0) {
    return (
      <>
        <Toolbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-53px)]">
          <div className="text-center space-y-4 max-w-md mx-auto px-4">
            <div className="text-6xl text-zinc-700">&#9654;</div>
            <h1 className="text-xl font-semibold text-zinc-300">
              No experiments loaded
            </h1>
            <p className="text-sm text-zinc-500">
              Click <strong>Add Experiment</strong> to load a directory of MP4
              videos, or start the server with directory paths as arguments.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toolbar />

      {/* Column headers */}
      <div
        className="sticky top-[49px] z-10 bg-zinc-950 border-b border-zinc-800 grid"
        style={{
          gridTemplateColumns: `40px repeat(${experiments.length}, minmax(0, 1fr))`,
        }}
      >
        <div />
        {experiments.map((exp, i) => (
          <div
            key={exp.id}
            className={`flex items-center gap-2 px-2 py-2 ${i > 0 ? "border-l border-zinc-800/50" : ""}`}
          >
            <h2
              className="text-sm font-semibold text-zinc-200 truncate"
              title={exp.dirPath}
            >
              {exp.name}
            </h2>
            <span className="text-xs text-zinc-500 shrink-0">
              [{exp.videos.length}]
            </span>
            <div className="flex-1" />
            <button
              onClick={() => toggleExperimentMute(exp.id)}
              className={`flex items-center justify-center w-6 h-6 rounded transition-colors shrink-0 ${
                exp.muted
                  ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  : "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
              }`}
              title={exp.muted ? "Unmute" : "Mute"}
            >
              {exp.muted ? (
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
            </button>
            <button
              onClick={() => removeExperiment(exp.id)}
              className="flex items-center justify-center w-6 h-6 rounded bg-red-800 text-white hover:bg-red-700 transition-colors shrink-0"
              title="Remove experiment"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="4" y1="4" x2="12" y2="12" />
                <line x1="12" y1="4" x2="4" y2="12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Video rows */}
      {Array.from({ length: rowCount }, (_, i) => (
        <VideoRow
          key={i}
          rowIndex={i}
          experiments={experiments}
          videosPerRow={videosPerRow}
        />
      ))}
    </>
  );
}
