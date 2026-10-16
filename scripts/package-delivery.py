"""Empacota apenas arquivos versionados e o build estático, sem credenciais/cache."""
from pathlib import Path
import subprocess
import zipfile
import hashlib
import json

root = Path(__file__).resolve().parent.parent
tracked = subprocess.check_output(['git', 'ls-files', '-z'], cwd=root).decode('utf-8').split('\0')
files = [root / path for path in tracked if path and (root / path).is_file()]
files += [path for path in (root / 'dist').rglob('*') if path.is_file()]
for path in files:
    rel = path.relative_to(root)
    if any(part in ['.git', '.vercel', 'node_modules', '.codex', '.aws'] for part in rel.parts) or path.name.startswith('.env'):
        raise RuntimeError(f'Arquivo fora do escopo da entrega: {rel}')
output = root / 'entrega/ECO-TI-entrega.zip'
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as package:
    for path in sorted(set(files)):
        package.write(path, path.relative_to(root).as_posix())
checksum = hashlib.sha256(output.read_bytes()).hexdigest()
(root / 'entrega/ECO-TI-entrega.sha256').write_text(f'{checksum}  ECO-TI-entrega.zip\n', encoding='utf-8')
print(f'Pacote: {output.name}; {len(set(files))} arquivos; {output.stat().st_size} bytes; SHA-256 {checksum}')
