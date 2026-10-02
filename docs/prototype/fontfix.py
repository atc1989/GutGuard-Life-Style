"""Point the prototype's font names at the next/font variables in app/layout.tsx."""
import re


def fix_fonts(s: str) -> str:
    s = re.sub(r"(?<!\)\,)'Fraunces'", "var(--font-fraunces),'Fraunces'", s)
    s = re.sub(r"(?<!\)\,)'Inter Tight'", "var(--font-inter-tight),'Inter Tight'", s)
    s = re.sub(r"(?<!\)\,)'IBM Plex Mono'", "var(--font-plex-mono),'IBM Plex Mono'", s)
    return s
