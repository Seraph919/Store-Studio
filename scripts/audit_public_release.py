#!/usr/bin/env python3
"""Basic release hygiene checks. Not a substitute for checking Git history or binary assets."""
import re
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BLOCKED_PARTS = {'node_modules', '.git', 'target', 'dist', '__pycache__', '.idea'}
SENSITIVE_PATH_NAMES = {'.env', 'id_rsa', 'id_ed25519', 'credentials.json', 'secrets.json'}
BLOCKED_CONTENT = {
    'private machine path': re.compile(r'file:///home/|/home/[^ /]+/(?:dev|projects)/|/Users/[^/]+/'),
    'hard-coded hosted R2 media URL': re.compile(r'https?://[\w.-]+\.r2\.dev/uploads/'),
    'private key header': re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----'),
}
PRIVATE_TERMS = [part.strip() for part in os.environ.get('PRIVATE_TERMS', '').split(',') if part.strip()]
EMAIL = re.compile(r'(?i)(?<![\w.+-])[\w.+-]+@([a-z0-9.-]+\.[a-z]{2,})')
SAFE_DOMAINS = {'example.com', 'example.org', 'example.net', 'example.test', 'test.example'}
failures = []
checked = 0

for file in sorted(ROOT.rglob('*')):
    if not file.is_file():
        continue
    relative = file.relative_to(ROOT)
    if set(relative.parts) & BLOCKED_PARTS:
        failures.append(f'Generated or hidden build content: {relative}')
        continue
    if file.name in SENSITIVE_PATH_NAMES or (file.name.startswith('.env.') and file.name != '.env.example'):
        failures.append(f'Private configuration file: {relative}')
        continue
    if file.suffix.lower() in {'.pem', '.p12', '.pfx', '.jks', '.sqlite', '.db', '.jar', '.class'}:
        failures.append(f'Potentially sensitive/generated file: {relative}')
        continue
    try:
        data = file.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue  # Inspect images and other binaries separately.
    checked += 1
    if relative != Path('scripts/audit_public_release.py'):
        for label, regex in BLOCKED_CONTENT.items():
            if regex.search(data):
                failures.append(f'{label}: {relative}')
        for term in PRIVATE_TERMS:
            if term.casefold() in data.casefold():
                failures.append(f'Configured private term found: {relative}')
    for match in EMAIL.finditer(data):
        if match.group(1).lower() not in SAFE_DOMAINS:
            failures.append(f'Non-example email domain: {relative}')
            break

if failures:
    print(f'FAIL: {len(failures)} publication-hygiene findings in {checked} text files.')
    for item in failures:
        print(' -', item)
    sys.exit(1)
print(f'PASS: checked {checked} text files. No non-example email domains, private configs or build outputs found.')
print('Still required: pass PRIVATE_TERMS for your identifiers; inspect Git history, screenshots, binary metadata, and asset rights.')
