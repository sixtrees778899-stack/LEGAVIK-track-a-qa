#!/usr/bin/env python3
"""Apply the verified Apple Pages spelling workaround to LEGAVIK DOCX files."""

from __future__ import annotations

import argparse
from pathlib import Path
import re
import tempfile
import zipfile


WORD_JOINER = "\u2060"
VISIBLE_BRAND = "LEGAVIK"
PAGES_SAFE_BRAND = WORD_JOINER.join(VISIBLE_BRAND)
PLAIN_BRAND = re.compile(r"(?<![A-Z])LEGAVIK(?![A-Z])")


def update_docx(path: Path) -> tuple[int, int]:
    with zipfile.ZipFile(path) as source:
        infos = source.infolist()
        entries = {info.filename: source.read(info.filename) for info in infos}

    replacements = 0
    remaining_plain = 0
    for name, payload in tuple(entries.items()):
        if not name.startswith("word/") or not name.endswith(".xml"):
            continue
        xml = payload.decode("utf-8")
        xml, count = PLAIN_BRAND.subn(PAGES_SAFE_BRAND, xml)
        replacements += count
        remaining_plain += len(PLAIN_BRAND.findall(xml))
        entries[name] = xml.encode("utf-8")

    with tempfile.NamedTemporaryFile(dir=path.parent, suffix=".docx", delete=False) as handle:
        temporary = Path(handle.name)
    try:
        with zipfile.ZipFile(temporary, "w") as output:
            for info in infos:
                output.writestr(info, entries[info.filename])
        temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)
    return replacements, remaining_plain


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", nargs="+", type=Path)
    args = parser.parse_args()
    for path in args.paths:
        changed, remaining = update_docx(path)
        print(f"{path}\treplaced={changed}\tplain_remaining={remaining}")


if __name__ == "__main__":
    main()
