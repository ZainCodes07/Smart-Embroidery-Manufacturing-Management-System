
from pathlib import Path
import re

models_dir = Path("embroidery/models")

model_names = [
    "Designs",
    "Machines",
    "Materialissuelines",
    "Materialissues",
    "Materialreceiptlines",
    "Materialreceipts",
    "Materials",
    "Productiondetails",
    "Productionshifts",
    "Suppliers",
]

pattern = re.compile(
    r"(models\.(?:ForeignKey|OneToOneField|ManyToManyField)"
    r"\(\s*)("
    + "|".join(model_names)
    + r")(\s*,)"
)

for file in models_dir.glob("*.py"):
    if file.name == "__init__.py":
        continue

    content = file.read_text(encoding="utf-8")
    updated = pattern.sub(
        lambda match: (
            match.group(1)
            + "'embroidery."
            + match.group(2)
            + "'"
            + match.group(3)
        ),
        content,
    )

    if updated != content:
        file.write_text(updated, encoding="utf-8")
        print("Updated:", file.name)

print("Finished fixing model references.")
