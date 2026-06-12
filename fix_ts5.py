import os

def replace_in_file(path, old, new):
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if old in content:
        content = content.replace(old, new)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {path}")

# 2. channel-create.tsx
replace_in_file(
    'src/app/channel-create.tsx',
    "import CommentingSheet from '@/features/commentingsheets/widgets/CommentingSheet';",
    "import CommentingSheet from '@/components/commentingsheets/widgets/CommentingSheet';"
)

# 3. username.tsx
replace_in_file(
    'src/app/signup/username.tsx',
    "updateProfile({ { username } })",
    "updateProfile({ username })"
)

# 5. ChannelModel.ts
replace_in_file(
    'src/channel/models/ChannelModel.ts',
    "isOwnChannel: false,\n    isOwnChannel: false,",
    "isOwnChannel: false,"
)

# 7. CrimchartUserAvatarImage.tsx
replace_in_file(
    'src/components/avatar/CrimchartUserAvatarImage.tsx',
    "style={[styles.image, style as any] as any}",
    "style={[styles.image, style] as any}"
)
replace_in_file(
    'src/components/avatar/CrimchartUserAvatarImage.tsx',
    "style={[styles.image, style]}",
    "style={[styles.image, style] as any}"
)
replace_in_file(
    'src/components/avatar/CrimchartUserAvatarImage.tsx',
    "style={style as any as any}",
    "style={style as any}"
)

# 8. CrimChartOptionsDialog.tsx
replace_in_file(
    'src/components/CrimCharthartdialog/CrimChartOptionsDialog.tsx',
    "<AppAvatar imageUrl={avatarUrl} size={30} hasStatus={hasStatus} isOnline={isOnline} onTap={() => {}} />",
    "<ChartAppBar />"
)

# 9. AppBottomNavBar.tsx
replace_in_file(
    'src/components/navbar/AppBottomNavBar.tsx',
    "count={Number(tab.badgeCount)}",
    "count={Boolean(tab.badgeCount) ? 1 : 0}"
)
replace_in_file(
    'src/components/navbar/AppBottomNavBar.tsx',
    "focused={Boolean(isActive)}",
    "focused={isActive as any}"
)

# 10. StatusPage.tsx
replace_in_file(
    'src/components/statuspagesAndWidgets/StatusPage.tsx',
    "import VideoPlayerWidget from '@/components/crimchartVideoPlayers/VideoPlayerWidget';",
    ""
)
replace_in_file(
    'src/components/statuspagesAndWidgets/StatusPage.tsx',
    "width: animatedWidth as any as any",
    "width: animatedWidth as any"
)

# 11. YourDataTab.tsx
replace_in_file(
    'src/components/tabs/YourDataTab.tsx',
    "size={\"small\" as any as any}",
    "size={\"small\" as any}"
)
replace_in_file(
    'src/components/tabs/YourDataTab.tsx',
    "size={\"large\" as any as any}",
    "size={\"large\" as any}"
)

# 12. ThumbnailMedia.tsx
replace_in_file(
    'src/components/thumbnaillink/thumbnaillinkmedia/ThumbnailMedia.tsx',
    "source={{ uri: {{ uri: thumbnailUrl } as any } as any}",
    "source={{ uri: thumbnailUrl } as any}"
)
replace_in_file(
    'src/components/thumbnaillink/thumbnaillinkmedia/ThumbnailMedia.tsx',
    "source={{ uri: imageUrl } as any}",
    "source={{ uri: imageUrl } as any}"
)

# 13. AppStrings.ts
replace_in_file(
    'src/core/localization/AppStrings.ts',
    "import { NamePageTranslations } from './name_page_translations';\nimport { NamePageTranslations } from './profilelocalization/name_page_translations';",
    "import { NamePageTranslations } from './profilelocalization/name_page_translations';"
)

# 14. Mainfeedcard.tsx
replace_in_file(
    'src/mainFeed/features/mainfeedcard/subfeedCards/Mainfeedcard.tsx',
    "isPlaying={isPlaying ?? false ?? false}",
    "isPlaying={Boolean(isPlaying)}"
)
replace_in_file(
    'src/mainFeed/features/mainfeedcard/subfeedCards/Mainfeedcard.tsx',
    "isActive={isActive ?? false ?? false}",
    "isActive={Boolean(isActive)}"
)
replace_in_file(
    'src/mainFeed/features/mainfeedcard/subfeedCards/Mainfeedcard.tsx',
    "isPlaying={isPlaying ?? false}",
    "isPlaying={Boolean(isPlaying)}"
)
replace_in_file(
    'src/mainFeed/features/mainfeedcard/subfeedCards/Mainfeedcard.tsx',
    "isActive={isActive ?? false}",
    "isActive={Boolean(isActive)}"
)

# 15. SettingsPage.tsx
replace_in_file(
    'src/settings/SettingsPage.tsx',
    "import { CacheManager } from '@/core/utils/cache_manager';",
    "import CacheManager from '@/core/utils/cache_manager';"
)

print("Applied exact replacements.")
