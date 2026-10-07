"""Speed: large images embedded in the prototype become real files in public/prototype/ (cached once,
not repeated inside every page's HTML and code)."""
import base64, os, re


def extract_images(s: str, public_dir: str, min_kb: int = 4) -> str:
    os.makedirs(public_dir, exist_ok=True)
    def repl(m):
        name, mime, data = m.group(1), m.group(2), m.group(3)
        if len(data) < min_kb * 1024:
            return m.group(0)
        ext = {"webp": "webp", "png": "png", "jpeg": "jpg", "svg+xml": "svg"}[mime]
        fname = name.lower().replace("_", "-") + "." + ext
        open(os.path.join(public_dir, fname), "wb").write(base64.b64decode(data))
        return f'const {name} = "/prototype/{fname}";'
    return re.sub(r'const (\w+) = "data:image/(webp|png|jpeg|svg\+xml);base64,([A-Za-z0-9+/=]+)";', repl, s)
