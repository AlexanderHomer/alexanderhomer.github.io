#!/usr/bin/env python3
"""Convert filled consent PDFs into template JSON.

Usage:
  python consent_pdf_to_json.py --input-dir path/to/pdfs --output-file output.json

Requires:
  pip install pypdf
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict, Iterable, List, Optional

try:
    from pypdf import PdfReader
except ImportError as exc:  # pragma: no cover - runtime dependency
    raise SystemExit(
        "Missing dependency: pypdf. Install with `pip install pypdf`."
    ) from exc


TEMPLATE_KEYS = [
    "procedure-line-1",
    "procedure-line-2",
    "procedure-line-3",
    "site",
    "side",
    "primary-doctor",
    "secondary-doctor",
    "conditions-line-1",
    "conditions-line-2",
    "conditions-line-3",
    "risks-line-1",
    "risks-line-2",
    "risks-line-3",
    "additional-risks",
    "alternatives",
    "physician-extenders",
    "physician-extenders-2",
]

PDF_FIELD_MAP: Dict[str, List[str]] = {
    "procedure-line-1": ["Procedure", "Procedures Line 1"],
    "procedure-line-2": ["Procedures Line 2"],
    "procedure-line-3": ["Procedures Line 3"],
    "site": ["Site"],
    "primary-doctor": [
        "Primary Doctor",
        "Autherized Doctor",
        "Attending Physician/Primary Operator",
    ],
    "secondary-doctor": ["Secondary Doctor"],
    "conditions-line-1": ["Conditions Line 1"],
    "conditions-line-2": ["Conditions Line 2"],
    "conditions-line-3": ["Conditions Line 3"],
    "risks-line-1": ["Risks Line 1"],
    "risks-line-2": ["Risks Line 2"],
    "risks-line-3": ["Risks Line 3"],
    "additional-risks": ["Additional Risks"],
    "alternatives": ["Alternatives"],
    "physician-extenders": ["Documentation Line 1"],
    "physician-extenders-2": ["Documentation Line 2"],
}

SIDE_FIELDS = ["Left", "Right", "Bilateral"]


def _field_value(field: Dict) -> str:
    value = field.get("/V")
    if value is None:
        value = field.get("/AS")
    if value is None:
        return ""
    if isinstance(value, bytes):
        return value.decode(errors="ignore")
    return str(value)


def _checkbox_checked(value: str) -> bool:
    if not value:
        return False
    normalized = value.strip().lstrip("/")
    return normalized.lower() not in {"off", "no", "false", "0"}


def _first_value(field_map: Dict[str, Dict], names: Iterable[str]) -> str:
    for name in names:
        field = field_map.get(name)
        if not field:
            continue
        value = _field_value(field).strip()
        if value:
            return value
    return ""


def _extract_side(field_map: Dict[str, Dict]) -> str:
    for name in SIDE_FIELDS:
        field = field_map.get(name)
        if not field:
            continue
        value = _field_value(field)
        if _checkbox_checked(value):
            return name
    return ""


def _label_from_path(path: Path) -> str:
    label = path.stem.replace("_", " ").replace("-", " ").strip()
    return label.title() if label else path.stem


def _split_procedure(procedure_text: str, max_chars: int = 100) -> tuple[str, str, str]:
    """Split a procedure into up to 3 lines, each max_chars long."""
    if not procedure_text:
        return "", "", ""

    procedure_text = procedure_text.strip()

    # If it fits in one line, return it
    if len(procedure_text) <= max_chars:
        return procedure_text, "", ""

    # Split into words
    words = procedure_text.split()
    lines = ["", "", ""]
    line_idx = 0

    for word in words:
        if line_idx >= 3:
            # Cap at 3 lines
            break

        test_line = (lines[line_idx] + " " + word).strip()

        if len(test_line) <= max_chars:
            lines[line_idx] = test_line
        else:
            # Move to next line
            if line_idx < 2:
                line_idx += 1
                lines[line_idx] = word
            else:
                # Truncate if it doesn't fit in 3 lines
                lines[line_idx] = (lines[line_idx] + " " + word).strip()[:max_chars]

    return lines[0], lines[1], lines[2]


def extract_template(pdf_path: Path) -> Dict:
    reader = PdfReader(str(pdf_path))
    fields = reader.get_fields() or {}

    template_fields = {key: "" for key in TEMPLATE_KEYS}

    for template_key, pdf_names in PDF_FIELD_MAP.items():
        template_fields[template_key] = _first_value(fields, pdf_names)

    template_fields["side"] = _extract_side(fields)

    # Handle procedure field splitting if procedure-line-2 and procedure-line-3 are empty
    if template_fields["procedure-line-1"] and not template_fields["procedure-line-2"]:
        line1, line2, line3 = _split_procedure(template_fields["procedure-line-1"])
        template_fields["procedure-line-1"] = line1
        template_fields["procedure-line-2"] = line2
        template_fields["procedure-line-3"] = line3

    return {
        "label": _label_from_path(pdf_path),
        "fields": template_fields,
    }


def iter_pdfs(input_dir: Path) -> Iterable[Path]:
    for path in sorted(input_dir.iterdir()):
        if path.is_file() and path.suffix.lower() == ".pdf":
            yield path


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert filled consent PDFs into template JSON.")
    parser.add_argument(
        "--input-dir",
        required=True,
        help="Directory containing filled consent PDFs.",
    )
    parser.add_argument(
        "--output-file",
        required=True,
        help="Path to write the JSON output.",
    )
    args = parser.parse_args()

    input_dir = Path(args.input_dir)
    output_file = Path(args.output_file)

    if not input_dir.exists() or not input_dir.is_dir():
        raise SystemExit(f"Input directory not found: {input_dir}")

    templates = [extract_template(pdf_path) for pdf_path in iter_pdfs(input_dir)]

    output_file.parent.mkdir(parents=True, exist_ok=True)
    with output_file.open("w", encoding="utf-8") as handle:
        json.dump(templates, handle, indent=2, ensure_ascii=False)
        handle.write("\n")


if __name__ == "__main__":
    main()
