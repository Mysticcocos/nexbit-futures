#!/bin/sh
set -eu
# Packs /workspace/src (and friends) into nexbit.zip. Uses Python — `zip` is not in this image.
python3 - << 'PY'
import shutil, zipfile
from pathlib import Path

root = Path("/workspace")
stage = Path("/tmp/nexbit-src")
if stage.exists():
    shutil.rmtree(stage)
dest = stage / "nexbit"
dest.mkdir(parents=True)

for d in ["src", "migrations", "scripts", "server"]:
    shutil.copytree(root / d, dest / d, ignore=shutil.ignore_patterns("*.test.mjs", "*.map", ".DS_Store"))

pub = dest / "public"
pub.mkdir()
for p in (root / "public").iterdir():
    if p.name == "nexbit.zip":
        continue
    if p.is_dir():
        shutil.copytree(p, pub / p.name)
    else:
        shutil.copy2(p, pub / p.name)

for f in [
    "package.json", "package-lock.json", "vite.config.ts", "tsconfig.json",
    "eslint.config.mjs", "startup.sh", "DEPLOY.md", "README.md", "SOURCE.md",
    "netlify.toml",
]:
    src = root / f
    if src.exists():
        shutil.copy2(src, dest / f)

grok = dest / ".grok"
grok.mkdir()
shutil.copy2(root / ".grok" / "app-env.json", grok / "app-env.json")

tmp = Path("/tmp/nexbit.zip")
if tmp.exists():
    tmp.unlink()
with zipfile.ZipFile(tmp, "w", compression=zipfile.ZIP_DEFLATED) as zf:
    for path in dest.rglob("*"):
        if path.is_file():
            zf.write(path, path.relative_to(stage).as_posix())

(root / "artifacts").mkdir(exist_ok=True)
for p in [root / "nexbit.zip", root / "public" / "nexbit.zip", root / "artifacts" / "nexbit.zip"]:
    shutil.copy2(tmp, p)
    print(p, p.stat().st_size)
PY
