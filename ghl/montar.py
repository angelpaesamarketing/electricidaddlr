#!/usr/bin/env python3
"""Monta los bloques listos para pegar en GoHighLevel.

Lee ghl/src/*.html, sustituye cada {{IMG:ruta}} por la imagen de assets/img/
incrustada en base64 y escribe el resultado en ghl/dist/.

    python3 ghl/montar.py
"""
import base64
import pathlib
import re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
IMG = RAIZ / "assets" / "img"
TIPOS = {".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml"}


def incrusta(m):
    ruta = IMG / m.group(1)
    datos = base64.b64encode(ruta.read_bytes()).decode("ascii")
    return f"data:{TIPOS[ruta.suffix]};base64,{datos}"


def main():
    destino = RAIZ / "ghl" / "dist"
    destino.mkdir(exist_ok=True)
    for origen in sorted((RAIZ / "ghl" / "src").glob("*.html")):
        html = re.sub(r"\{\{IMG:([^}]+)\}\}", incrusta, origen.read_text(encoding="utf-8"))
        (destino / origen.name).write_text(html, encoding="utf-8")
        print(f"{origen.name}: {len(html) / 1024:.0f} KB")


if __name__ == "__main__":
    main()
