# video-preview

A local web app for side-by-side review of video model training outputs. Load experiment directories, compare videos in a synchronized grid, and scroll through hundreds of samples without lag.

## Features

- **Side-by-side experiments** — add multiple directories as columns and compare outputs frame-by-frame
- **Synchronized playback** — play/pause controls per row keep all experiments in sync
- **Lazy loading** — Handle 100+ videos per experiment without scroll lag
- **Global mute** — all videos muted by default, toggle with one click or the `M` key

## Quick Start (MacOS)

### Installation

The included install script handles Homebrew, Node.js, uv, and all dependencies automatically:

```bash
./install.sh
```

### Run

```bash
uv run python main.py [/path/to/exp_1] [/path/to/exp_2]
```

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `M` | Toggle mute |

## Project Structure

```
video-preview/
├── main.py              # FastAPI backend (video serving, directory scanning)
├── frontend/
│   ├── src/
│   │   ├── App.tsx      # Main layout and grid rendering
│   │   ├── store.ts     # Zustand state (experiments, playback, settings)
│   │   ├── components/  # Toolbar, VideoRow, VideoCell, AddExperimentModal
│   │   └── hooks/       # Shared IntersectionObserver for lazy loading
│   └── vite.config.ts   # Vite + Tailwind CSS build config
├── install.sh           # One-command macOS setup script
├── pyproject.toml       # Project metadata and Python dependencies
└── uv.lock              # Locked dependency versions
```
