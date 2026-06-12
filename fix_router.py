import os
import re

def walk(d):
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith('.tsx') or f.endswith('.ts'):
                yield os.path.join(root, f)

for p in walk('C:/Users/user/Desktop/dev/crimchart/src'):
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    # replace router.push(`/path`) with router.push(`/path` as any)
    new_content = re.sub(r'router\.push\((`[^`]+`)\)', r'router.push(\1 as any)', new_content)
    # replace router.push("/path") with router.push("/path" as any)
    new_content = re.sub(r'router\.push\(("[^"]+")\)', r'router.push(\1 as any)', new_content)
    # replace router.push('/path') with router.push('/path' as any)
    new_content = re.sub(r"router\.push\((('[^']+'))\)", r"router.push(\1 as any)", new_content)
    
    if new_content != content:
        with open(p, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Fixed router.push in", p)
