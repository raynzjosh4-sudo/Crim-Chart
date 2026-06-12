import os
import re

def get_base_name(filename):
    # Remove extension
    name = os.path.splitext(filename)[0]
    # Convert snake_case or PascalCase to lowercase alphanumeric to normalize
    name = re.sub(r'[^a-zA-Z0-9]', '', name).lower()
    return name

dart_dir = r"C:\Users\user\Desktop\dev\crimchart\crown\lib"
react_dir = r"C:\Users\user\Desktop\dev\crimchart\src"

dart_files = []
for root, dirs, files in os.walk(dart_dir):
    for f in files:
        if f.endswith('.dart'):
            dart_files.append(os.path.join(root, f))

react_bases = set()
for root, dirs, files in os.walk(react_dir):
    for f in files:
        if f.endswith('.ts') or f.endswith('.tsx'):
            react_bases.add(get_base_name(f))

unported = []
for dart_file in dart_files:
    basename = os.path.basename(dart_file)
    norm_name = get_base_name(basename)
    
    # Check for direct match
    if norm_name not in react_bases:
        rel_path = os.path.relpath(dart_file, dart_dir)
        unported.append(rel_path)

with open('unported_files.txt', 'w', encoding='utf-8') as f:
    for u in unported:
        f.write(u + '\n')

print(f"Found {len(unported)} potentially unported files out of {len(dart_files)} total Dart files.")
