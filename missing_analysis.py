import json

with open('dart_files_utf8.txt', 'r', encoding='utf-8') as f:
    dart_raw = [line.strip().replace('\\', '/') for line in f if line.strip()]
with open('ts_files_utf8.txt', 'r', encoding='utf-8') as f:
    ts_raw = [line.strip().replace('\\', '/') for line in f if line.strip()]

d_rel = [p.split('dev/crown/lib/')[1] for p in dart_raw if 'dev/crown/lib/' in p and not p.endswith('.g.dart')]
t_rel = [p.split('dev/crimchart/src/')[1] for p in ts_raw if 'dev/crimchart/src/' in p]

t_lower = [p.lower() for p in t_rel]

missing = []
for dart in d_rel:
    fname = dart.split('/')[-1].replace('.dart','').replace('_','').lower()
    found = any(fname in t.replace('_','').lower().replace('-','') for t in t_lower)
    if not found:
        missing.append(dart)

by_dir = {}
for m in missing:
    parts = m.split('/')
    group = '/'.join(parts[:2]) if len(parts) > 1 else parts[0]
    by_dir.setdefault(group, []).append(m)

for k, v in sorted(by_dir.items()):
    print(f'\n[{k}]')
    for f in v:
        print(f'  - {f}')

print(f'\nTOTAL MISSING: {len(missing)}')
