
from pathlib import Path
import re

source = Path("generated_models.py")
models_dir = Path("embroidery/models")

if not source.exists():
    raise FileNotFoundError("generated_models.py not found")

content = source.read_text(encoding="utf-16")
matches = list(re.finditer(
    r"(?m)^class (\w+)\(models\.Model\):",
    content
))

if not matches:
    raise ValueError("No model classes found")

models_dir.mkdir(parents=True, exist_ok=True)

# Avoid conflict with Django's default models.py
old_models = Path("embroidery/models.py")
if old_models.exists():
    backup = Path("embroidery/models_old.py")
    if backup.exists():
        raise FileExistsError(
            "models_old.py already exists; rename it manually first"
        )
    old_models.rename(backup)

imports = []

for i, match in enumerate(matches):
    name = match.group(1)
    start = match.start()
    end = matches[i + 1].start() if i + 1 < len(matches) else len(content)

    block = content[start:end].strip()

    filename = re.sub(
        r"(?<!^)(?=[A-Z])", "_", name
    ).lower() + ".py"

    (models_dir / filename).write_text(
        "from django.db import models\n\n" + block + "\n",
        encoding="utf-8"
    )

    imports.append(f"from .{filename[:-3]} import {name}")

(models_dir / "__init__.py").write_text(
    "\n".join(imports) + "\n",
    encoding="utf-8"
)

print(f"Created {len(matches)} separate model files:")
for match in matches:
    print("-", match.group(1))
