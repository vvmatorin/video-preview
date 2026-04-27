import { useState, useRef, useEffect } from "react";
import { useAppStore } from "../store";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddExperimentModal({ open, onClose }: Props) {
  const addExperiment = useAppStore((s) => s.addExperiment);
  const [dirPath, setDirPath] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDirPath("");
      setName("");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirPath.trim()) return;

    setLoading(true);
    setError("");
    try {
      await addExperiment(name.trim(), dirPath.trim());
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load directory");
    } finally {
      setLoading(false);
    }
  };

  const handleBrowse = async () => {
    try {
      const res = await fetch("/api/pick-directory");
      if (!res.ok) throw new Error("Failed to open directory picker");
      const data: { path: string | null } = await res.json();
      if (data.path) {
        setDirPath(data.path);
      }
    } catch {
      setError("Failed to open directory picker");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 space-y-4"
      >
        <h2 className="text-lg font-semibold text-zinc-100">
          Add Experiment
        </h2>

        <div className="space-y-1">
          <label className="text-sm text-zinc-400">Directory Path</label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={dirPath}
              onChange={(e) => setDirPath(e.target.value)}
              placeholder="/path/to/experiment/videos"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-0"
            />
            <button
              type="button"
              onClick={handleBrowse}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg transition-colors shrink-0"
              title="Browse directories"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="text-zinc-300"
              >
                <path d="M1 3.5A1.5 1.5 0 012.5 2h3.379a1.5 1.5 0 011.06.44L8.063 3.56A1.5 1.5 0 009.122 4H13.5A1.5 1.5 0 0115 5.5v7a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 011 12.5v-9z" />
              </svg>
              Browse
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-zinc-400">
            Name <span className="text-zinc-600">(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Auto-detected from folder name"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !dirPath.trim()}
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-lg transition-colors"
          >
            {loading ? "Scanning..." : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
