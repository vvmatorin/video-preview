import { create } from "zustand";
import type { Experiment } from "./types";

interface AppState {
  experiments: Experiment[];
  videosPerRow: number;
  playingRows: Set<number>;
  globalMuted: boolean;

  addExperiment: (name: string, dirPath: string) => Promise<void>;
  removeExperiment: (id: string) => void;
  setVideosPerRow: (n: number) => void;
  toggleRowPlay: (rowIndex: number) => void;
  toggleMute: () => void;
}

let nextId = 1;

export const useAppStore = create<AppState>((set) => ({
  experiments: [],
  videosPerRow: 1,
  playingRows: new Set<number>(),
  globalMuted: true,

  addExperiment: async (name, dirPath) => {
    const res = await fetch(`/api/scan?path=${encodeURIComponent(dirPath)}`);
    if (!res.ok) {
      let message = `Server error (${res.status})`;
      try {
        const err = await res.json();
        message = err.detail || message;
      } catch {}
      throw new Error(message);
    }
    const data: { path: string; videos: { name: string; path: string }[] } =
      await res.json();

    const experiment: Experiment = {
      id: `exp-${nextId++}`,
      name: name || data.path.split("/").pop() || "Experiment",
      dirPath: data.path,
      videos: data.videos.map((v) => ({
        id: `vid-${nextId++}`,
        name: v.name,
        path: v.path,
      })),
    };

    set((s) => ({
      experiments: [...s.experiments, experiment],
      playingRows: new Set(),
    }));
  },

  removeExperiment: (id) =>
    set((s) => ({
      experiments: s.experiments.filter((e) => e.id !== id),
    })),

  setVideosPerRow: (n) =>
    set({ videosPerRow: Math.max(1, Math.min(10, n)), playingRows: new Set() }),

  toggleRowPlay: (rowIndex) =>
    set((s) => {
      if (s.playingRows.has(rowIndex)) return { playingRows: new Set() };
      return { playingRows: new Set([rowIndex]) };
    }),

  toggleMute: () => set((s) => ({ globalMuted: !s.globalMuted })),
}));
