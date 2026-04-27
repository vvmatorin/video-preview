from __future__ import annotations

import argparse
import mimetypes
import subprocess
import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import FileResponse, Response

app = FastAPI()

_init_paths: list[str] = []

FRONTEND_DIST = Path(__file__).parent / "frontend" / "dist"


@app.get("/api/scan")
async def scan_directory(path: str = Query(...)):
    dir_path = Path(path).expanduser().resolve()
    if not dir_path.is_dir():
        raise HTTPException(status_code=400, detail=f"Not a directory: {path}")

    videos = sorted(
        (
            {"name": f.name, "path": str(f)}
            for f in dir_path.iterdir()
            if f.is_file() and f.suffix.lower() == ".mp4"
        ),
        key=lambda v: v["name"],
    )
    return {"path": str(dir_path), "videos": videos}


@app.get("/api/video")
async def serve_video(request: Request, path: str = Query(...)):
    file_path = Path(path).expanduser().resolve()
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail=f"File not found: {path}")
    if file_path.suffix.lower() != ".mp4":
        raise HTTPException(status_code=400, detail="Only .mp4 files are supported")

    file_size = file_path.stat().st_size
    content_type = mimetypes.guess_type(str(file_path))[0] or "video/mp4"

    range_header = request.headers.get("range")
    if range_header:
        return _range_response(file_path, file_size, content_type, range_header)

    return FileResponse(path=str(file_path), media_type=content_type)


def _range_response(
    file_path: Path, file_size: int, content_type: str, range_header: str
) -> Response:
    try:
        units, range_spec = range_header.strip().split("=", 1)
        if units != "bytes":
            raise ValueError
        start_str, end_str = range_spec.split("-", 1)
        start = int(start_str) if start_str else 0
        end = int(end_str) if end_str else file_size - 1
    except (ValueError, IndexError):
        raise HTTPException(status_code=416, detail="Invalid range header")

    if start >= file_size or end >= file_size or start > end:
        raise HTTPException(
            status_code=416,
            headers={"Content-Range": f"bytes */{file_size}"},
            detail="Range not satisfiable",
        )

    length = end - start + 1
    with open(file_path, "rb") as f:
        f.seek(start)
        data = f.read(length)

    return Response(
        content=data,
        status_code=206,
        media_type=content_type,
        headers={
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(length),
        },
    )


@app.get("/api/pick-directory")
async def pick_directory():
    script = (
        "import tkinter as tk\n"
        "from tkinter import filedialog\n"
        "root = tk.Tk()\n"
        "root.withdraw()\n"
        "root.attributes('-topmost', True)\n"
        "path = filedialog.askdirectory()\n"
        "print(path)\n"
    )
    result = subprocess.run(
        [sys.executable, "-c", script],
        capture_output=True,
        text=True,
        timeout=120,
    )
    selected = result.stdout.strip()
    if not selected:
        return {"path": None}
    return {"path": selected}


@app.get("/api/init")
async def get_init():
    return {"paths": _init_paths}


@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if not FRONTEND_DIST.is_dir():
        raise HTTPException(
            status_code=404,
            detail="Frontend not built. Run: cd frontend && npm install && npm run build")
    file = FRONTEND_DIST / full_path
    if file.is_file():
        media_type = mimetypes.guess_type(str(file))[0]
        return FileResponse(str(file), media_type=media_type)
    return FileResponse(str(FRONTEND_DIST / "index.html"), media_type="text/html")


def cli():
    parser = argparse.ArgumentParser(description="Video Preview App")
    parser.add_argument("paths", nargs="*", help="Experiment directories to pre-load")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--dev", action="store_true", help="Enable auto-reload")
    args = parser.parse_args()

    _init_paths.extend(args.paths)

    print(f"The service is running at: ")
    print(f"→ http://{args.host}:{args.port}")

    import uvicorn
    uvicorn.run(
        "main:app",
        host=args.host,
        port=args.port,
        reload=args.dev,
        log_level="warning",
        access_log=False,
    )


if __name__ == "__main__":
    cli()
