import os, re

files = [
    'src/settings/subsettings/ActivityStatusPage.tsx',
    'src/settings/subsettings/CommentControlsPage.tsx',
    'src/settings/subsettings/ContactsSyncingPage.tsx',
    'src/settings/subsettings/DataSaverPage.tsx',
    'src/settings/subsettings/FollowInvitePage.tsx',
    'src/settings/subsettings/HiddenWordsPage.tsx',
]

for f in files:
    if os.path.exists(f):
        content = open(f, encoding='utf-8').read()
        content = re.sub(r'checked=\{([^}]+)\}', r'value={\1}', content)
        content = re.sub(r'onChange=\{([^}]+)\}', r'onValueChange={\1}', content)
        open(f, 'w', encoding='utf-8').write(content)
        print("Fixed", f)
