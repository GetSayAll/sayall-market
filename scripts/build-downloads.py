#!/usr/bin/env python3
"""Build the nine public trial profiles and a reproducible download ZIP."""
import hashlib
import json
from pathlib import Path
import sys
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parent.parent
RELEASE = "v0.1.0-preview.3"
NAMES = ["codex", "claude-code-desktop", "workbuddy", "wechat", "jianying", "douyin", "chrome", "netease-music"]


def build(output):
    files = {}
    for name in NAMES:
        filename = f"{name}-ten-key.candidate.sayall"
        files[filename] = (ROOT / "examples/profiles" / filename).read_bytes()
    files["full-keyboard-access.sayall"] = (ROOT / "examples/profiles/full-keyboard-access.candidate.sayall").read_bytes()
    for name, data in files.items():
        document = json.loads(data)
        if len(data) > 4 * 1024 * 1024 or document["format"] != "sayall-transfer" or document["schemaVersion"] != "1.0" or document["type"] != "buttonProfile" or document["exportPurpose"] != "share":
            raise ValueError(f"Invalid download profile: {name}")
    files["导入说明.html"] = (ROOT / "docs/download-bundle.html").read_bytes()
    files["LICENSE"] = (ROOT / "LICENSE").read_bytes()
    files["SHA256SUMS"] = "".join(f"{hashlib.sha256(data).hexdigest()}  {name}\n" for name, data in sorted(files.items())).encode()
    output.mkdir(parents=True, exist_ok=False)
    for name, data in files.items():
        (output / name).write_bytes(data)
    archive = output / f"sayall-key-profiles-{RELEASE}.zip"
    with ZipFile(archive, "x") as bundle:
        for name, data in sorted(files.items()):
            info = ZipInfo(name, (2026, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            bundle.writestr(info, data)
    with ZipFile(archive) as bundle:
        if set(bundle.namelist()) != set(files) or any(bundle.read(name) != data for name, data in files.items()):
            raise ValueError("ZIP verification failed")
    print(f"Verified {len(NAMES) + 1} profiles: {archive}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python3 scripts/build-downloads.py /absolute/new-output-directory")
    build(Path(sys.argv[1]).resolve())
