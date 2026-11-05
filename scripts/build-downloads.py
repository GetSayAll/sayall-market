#!/usr/bin/env python3
"""Build the ten public profiles and a reproducible, version-named download ZIP.

附件文件名带集合版本号（仓库根 `VERSION`），避免用户下载后无法区分新旧版本。
"""
import hashlib
import json
from pathlib import Path
import re
import sys
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parent.parent
NAMES = ["codex", "claude-code-desktop", "workbuddy", "wechat", "jianying", "douyin", "chrome", "netease-music"]
VERSION = (ROOT / "VERSION").read_text(encoding="utf-8").strip()
if re.fullmatch(r"\d+\.\d+\.\d+", VERSION) is None:
    raise SystemExit(f"Invalid VERSION file: {VERSION!r}")


def build(output):
    files = {}
    for name in NAMES:
        source_name = f"{name}-ten-key-mac.sayall"
        filename = f"{name}-ten-key-v{VERSION}.sayall"
        files[filename] = (ROOT / "examples/profiles" / source_name).read_bytes()
    files[f"full-keyboard-access-v{VERSION}.sayall"] = (ROOT / "examples/profiles/full-keyboard-access-mac.sayall").read_bytes()
    files[f"wps-presentation-mac-v{VERSION}.sayall"] = (ROOT / "examples/profiles/wps-presentation-mac.sayall").read_bytes()
    for name, data in files.items():
        document = json.loads(data)
        if len(data) > 4 * 1024 * 1024 or document["format"] != "sayall-transfer" or document["schemaVersion"] != "1.0" or document["type"] != "buttonProfile" or document["exportPurpose"] != "share":
            raise ValueError(f"Invalid download profile: {name}")
        if document.get("extensions", {}).get("app.sayall:platform", {}).get("platform") != "macOS":
            raise ValueError(f"Missing macOS platform: {name}")
    files["导入说明.html"] = (ROOT / "docs/download-bundle.html").read_bytes()
    files["LICENSE"] = (ROOT / "LICENSE").read_bytes()
    files["SHA256SUMS"] = "".join(f"{hashlib.sha256(data).hexdigest()}  {name}\n" for name, data in sorted(files.items())).encode()
    output.mkdir(parents=True, exist_ok=False)
    for name, data in files.items():
        (output / name).write_bytes(data)
    archive = output / f"sayall-key-profiles-v{VERSION}.zip"
    with ZipFile(archive, "x") as bundle:
        for name, data in sorted(files.items()):
            info = ZipInfo(name, (2026, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            bundle.writestr(info, data)
    with ZipFile(archive) as bundle:
        if set(bundle.namelist()) != set(files) or any(bundle.read(name) != data for name, data in files.items()):
            raise ValueError("ZIP verification failed")
    print(f"Verified {len(NAMES) + 2} profiles: {archive}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python3 scripts/build-downloads.py /absolute/new-output-directory")
    build(Path(sys.argv[1]).resolve())
