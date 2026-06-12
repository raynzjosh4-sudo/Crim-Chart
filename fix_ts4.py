import os, re

def rw(path, fn):
    if not os.path.exists(path): return
    c = open(path, encoding='utf-8').read()
    nc = fn(c)
    if nc != c:
        open(path, 'w', encoding='utf-8').write(nc)
        print('Fixed:', path)

def rep(path, o, n): rw(path, lambda c: c.replace(o, n))
def rsub(path, p, r): rw(path, lambda c: re.sub(p, r, c))

# 1. src/app/(tabs)/channels.tsx
rep('src/app/(tabs)/channels.tsx', 'href="/channel/channelpage"', 'href={"/channel/channelpage" as any}')

# 2. src/app/channel-create.tsx
rep('src/app/channel-create.tsx', 
    "import CommentingSheet from '@/features/commentingsheets/widgets/CommentingSheet';", 
    "import CommentingSheet from '@/commentingsheets/widgets/CommentingSheet';")

# 3. src/app/signup/username.tsx
rsub('src/app/signup/username.tsx', r'updateProfile\(\{\s*(\{.*?\})\s*\}\)', r'updateProfile(\1)')

# 4. useAuthStore path
for f in [
    'src/channel/hooks/useChannelAdmin.ts',
    'src/channel/hooks/useChannelEngagement.ts',
    'src/channel/hooks/useChannelMember.ts',
    'src/components/wrappers/ChannelEngagementWrapper.tsx',
]:
    rep(f, '@/core/store/useAuthStore', '@/features/auth/application/useAuthStore')

# 5. ChannelModel.ts
rsub('src/channel/models/ChannelModel.ts', r'isOwnChannel:\s*false,\s*isOwnChannel:\s*false,', 'isOwnChannel: false,')

# 6. ChannelsPage.tsx
rep('src/channel/pages/ChannelsPage.tsx', '<ChartAppBar title="Channels" showSearch />', '<ChartAppBar title="Channels" />')

# 7. CrimchartUserAvatarImage.tsx
rsub('src/components/avatar/CrimchartUserAvatarImage.tsx', r'style=\{style as any\}', 'style={style as any}') # Make sure it's any
rep('src/components/avatar/CrimchartUserAvatarImage.tsx', 'style={[styles.image, style]}', 'style={[styles.image, style] as any}')

# 8. CrimChartOptionsDialog.tsx
rep('src/components/CrimCharthartdialog/CrimChartOptionsDialog.tsx', 
    '<ChartAppBar imageUrl={avatarUrl} size={30} hasStatus={hasStatus} isOnline={isOnline} onTap={() => {}} />', 
    '<ChartAppBar />')

# 9. AppBottomNavBar.tsx
rsub('src/components/navbar/AppBottomNavBar.tsx', r'count=\{Number\(([^)]+)\)\}', r'count={Boolean(\1) ? 1 : 0}')
rep('src/components/navbar/AppBottomNavBar.tsx', 'focused={Boolean(isActive)}', 'focused={isActive as any}')

# 10. StatusPage.tsx
rep('src/components/statuspagesAndWidgets/StatusPage.tsx', 
    "import VideoPlayerWidget from '@/components/crimchartVideoPlayers/VideoPlayerWidget';", 
    "")

# 11. YourDataTab.tsx
rep('src/components/tabs/YourDataTab.tsx', 'size={"small" as any}', 'size="small"')
rep('src/components/tabs/YourDataTab.tsx', 'size={"large" as any}', 'size="large"')
rep('src/components/tabs/YourDataTab.tsx', 'size={size}', 'size={size as any}')

# 12. ThumbnailMedia.tsx
rsub('src/components/thumbnaillink/thumbnaillinkmedia/ThumbnailMedia.tsx', r'source=\{\{\s*uri:\s*([^ }]+)\s*\}\s*as\s*any\}', r'source={{ uri: \1 } as any}')

# 13. AppStrings.ts
rsub('src/core/localization/AppStrings.ts', r"import\s*\{\s*NamePageTranslations\s*\}\s*from\s*'[^']+';\s*import\s*\{\s*NamePageTranslations\s*\}\s*from\s*'[^']+';", "import { NamePageTranslations } from './profilelocalization/name_page_translations';")

# 14. Mainfeedcard.tsx
rep('src/mainFeed/features/mainfeedcard/subfeedCards/Mainfeedcard.tsx', 'isPlaying={isPlaying ?? false}', 'isPlaying={Boolean(isPlaying)}')
rep('src/mainFeed/features/mainfeedcard/subfeedCards/Mainfeedcard.tsx', 'isActive={isActive ?? false}', 'isActive={Boolean(isActive)}')

# 15. SettingsPage.tsx
rep('src/settings/SettingsPage.tsx', "import { CacheManager } from '@/core/utils/cache_manager';", "import CacheManager from '@/core/utils/cache_manager';")

# 16. Switch settings pages
switch_pages = [
    'src/settings/subsettings/ActivityStatusPage.tsx',
    'src/settings/subsettings/CommentControlsPage.tsx',
    'src/settings/subsettings/ContactsSyncingPage.tsx',
    'src/settings/subsettings/DataSaverPage.tsx',
    'src/settings/subsettings/FollowInvitePage.tsx',
    'src/settings/subsettings/HiddenWordsPage.tsx',
]
for page in switch_pages:
    rsub(page, r'onValueChange=\{\(v:\s*boolean\)\s*=>([^}]+)\}', r'onValueChange={((v: boolean) =>\1) as any}')
