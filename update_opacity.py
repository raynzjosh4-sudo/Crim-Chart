import os
import re

src_dir = r"c:\Users\user\Desktop\dev\crimchart\src"

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    def repl(match):
        tag = match.group(0)
        if 'activeOpacity' not in tag:
            # Insert activeOpacity={1} right after <TouchableOpacity
            return tag.replace('<TouchableOpacity', '<TouchableOpacity activeOpacity={1}', 1)
        return tag

    # Match `<TouchableOpacity` followed by any chars except `>` until `>`
    new_content = re.sub(r'<TouchableOpacity[^>]*>', repl, content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

modified_count = 0
for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            if update_file(os.path.join(root, file)):
                modified_count += 1

print(f"Modified {modified_count} files.")
