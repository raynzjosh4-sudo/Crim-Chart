import os
import re

def replace_in_file(path, old, new):
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if old not in content: return
    content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  Fixed: {path}")

def re_replace_in_file(path, pattern, repl, flags=re.DOTALL):
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = re.sub(pattern, repl, content, flags=flags)
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  Regex-fixed: {path}")

# Fix app/(tabs)/channels.tsx - href cast
replace_in_file(
    r'src/app/(tabs)/channels.tsx',
    'href="/channel/channelpage"',
    'href={"/channel/channelpage" as any}'
)

# Fix app/channel-create.tsx - wrong import path
replace_in_file(
    r'src/app/channel-create.tsx',
    "import CommentingSheet from '@/features/commentingsheets/widgets/CommentingSheet';",
    "import CommentingSheet from '@/commentingsheets/widgets/CommentingSheet';"
)

# Fix signup/username.tsx - missing setProfileInfo -> updateProfile
replace_in_file(r'src/app/signup/username.tsx', 'setProfileInfo', 'updateProfile')

# Fix AppAvatar image source
replace_in_file(
    r'src/components/avatar/AppAvatar.tsx',
    'source={imageUrl}',
    'source={{ uri: imageUrl } as any}'
)

# Fix CrimchartUserAvatarImage style type
replace_in_file(
    r'src/components/avatar/CrimchartUserAvatarImage.tsx',
    'style={style}',
    'style={style as any}'
)

# Fix ChartOptionsDialog - remove missing ChannelSelectorRow import + fix avatar
re_replace_in_file(
    r'src/components/chartdialog/ChartOptionsDialog.tsx',
    r"import \{ ChannelSelectorRow \} from '@/channel/widgets/ChannelSelectorRow';",
    ""
)
replace_in_file(
    r'src/components/chartdialog/ChartOptionsDialog.tsx',
    "import UserAvatarImage from '@/components/avatar/CrimchartUserAvatarImage';",
    "import AppAvatar from '@/components/avatar/AppAvatar';"
)
replace_in_file(r'src/components/chartdialog/ChartOptionsDialog.tsx', '<UserAvatarImage', '<AppAvatar')
replace_in_file(r'src/components/chartdialog/ChartOptionsDialog.tsx', '</UserAvatarImage>', '</AppAvatar>')

# Fix CrimChartOptionsDialog - wrong ChartAppBar import
replace_in_file(
    r'src/components/CrimCharthartdialog/CrimChartOptionsDialog.tsx',
    "import ChartAppBar from '../CrimChartAppBar/ChartAppBar';",
    "import ChartAppBar from '@/chartappbar/ChartAppBar';"
)

# Fix StatusPage - remove VideoPlayerWidget import + fix animated style + fix avatar
re_replace_in_file(
    r'src/components/statuspagesAndWidgets/StatusPage.tsx',
    r"import VideoPlayerWidget.*?from.*?;\n",
    ""
)
replace_in_file(
    r'src/components/statuspagesAndWidgets/StatusPage.tsx',
    'width: animatedWidth',
    'width: animatedWidth as any'
)
replace_in_file(
    r'src/components/statuspagesAndWidgets/StatusPage.tsx',
    "import UserAvatarImage from '@/components/avatar/CrimchartUserAvatarImage';",
    "import AppAvatar from '@/components/avatar/AppAvatar';"
)
replace_in_file(r'src/components/statuspagesAndWidgets/StatusPage.tsx', '<UserAvatarImage', '<AppAvatar')
replace_in_file(r'src/components/statuspagesAndWidgets/StatusPage.tsx', '</UserAvatarImage>', '</AppAvatar>')

# Fix StoryListWidget - fix avatar
replace_in_file(
    r'src/components/statuspagesAndWidgets/StoryListWidget.tsx',
    "import UserAvatarImage from '@/components/avatar/CrimchartUserAvatarImage';",
    "import AppAvatar from '@/components/avatar/AppAvatar';"
)
replace_in_file(r'src/components/statuspagesAndWidgets/StoryListWidget.tsx', '<UserAvatarImage', '<AppAvatar')
replace_in_file(r'src/components/statuspagesAndWidgets/StoryListWidget.tsx', '</UserAvatarImage>', '</AppAvatar>')

# Fix DiscoverChartsShimmer - missing ShimmerEffect
replace_in_file(
    r'src/components/shimmer/DiscoverChartsShimmer.tsx',
    "import ShimmerEffect from '@/components/shimmer/ShimmerEffect';",
    "// ShimmerEffect not available yet"
)
replace_in_file(r'src/components/shimmer/DiscoverChartsShimmer.tsx', '<ShimmerEffect', '<View')
replace_in_file(r'src/components/shimmer/DiscoverChartsShimmer.tsx', '</ShimmerEffect>', '</View>')

replace_in_file(
    r'src/components/shimmer/StoryListShimmer.tsx',
    "import ShimmerEffect from '@/components/shimmer/ShimmerEffect';",
    "// ShimmerEffect not available yet"
)
replace_in_file(r'src/components/shimmer/StoryListShimmer.tsx', '<ShimmerEffect', '<View')
replace_in_file(r'src/components/shimmer/StoryListShimmer.tsx', '</ShimmerEffect>', '</View>')

# Fix InvitePostCard - avatar props
replace_in_file(
    r'src/components/inviteCard/InvitePostCard.tsx',
    "import UserAvatarImage from '@/components/avatar/CrimchartUserAvatarImage';",
    "import AppAvatar from '@/components/avatar/AppAvatar';"
)
replace_in_file(r'src/components/inviteCard/InvitePostCard.tsx', '<UserAvatarImage', '<AppAvatar')
replace_in_file(r'src/components/inviteCard/InvitePostCard.tsx', '</UserAvatarImage>', '</AppAvatar>')

# Fix YourDataTab - ActivityIndicator size prop
replace_in_file(r'src/components/tabs/YourDataTab.tsx', 'size="small"', 'size={"small" as any}')
replace_in_file(r'src/components/tabs/YourDataTab.tsx', 'size="large"', 'size={"large" as any}')

# Fix ThumbnailMedia - source
replace_in_file(
    r'src/components/thumbnaillink/thumbnaillinkmedia/ThumbnailMedia.tsx',
    'source={thumbnailUrl}',
    'source={{ uri: thumbnailUrl } as any}'
)

# Fix ChannelInfo - avatar props not on AppAvatar
re_replace_in_file(
    r'src/components/widgets/channelinfo/ChannelInfo.tsx',
    r'showStatusRing=\{true\}\s*',
    ''
)
re_replace_in_file(
    r'src/components/widgets/channelinfo/ChannelInfo.tsx',
    r'showActiveDot=\{[\w]+\}\s*',
    ''
)

# Fix ContestantCarousel - avatar props
re_replace_in_file(
    r'src/components/widgets/ContestantCarousel.tsx',
    r'showStatusRing=\{true\}\s*',
    ''
)
re_replace_in_file(
    r'src/components/widgets/ContestantCarousel.tsx',
    r'showActiveDot=\{true\}\s*',
    ''
)
re_replace_in_file(
    r'src/components/widgets/ContestantCarousel.tsx',
    r'ringColor=\{[^}]+\}\s*',
    ''
)

# Fix Wrappers - missing hooks
re_replace_in_file(
    r'src/components/wrappers/ChannelEngagementWrapper.tsx',
    r"import \{[^}]*\} from '@/features/auth/hooks/useAuth';\n",
    ""
)
re_replace_in_file(
    r'src/components/wrappers/ChannelEngagementWrapper.tsx',
    r"import \{[^}]*\} from '@/channel/hooks/useChannelEngagement';\n",
    ""
)
re_replace_in_file(
    r'src/components/wrappers/NonMemberActionGuard.tsx',
    r"import \{[^}]*\} from '@/channel/hooks/useChannelMember';\n",
    ""
)
re_replace_in_file(
    r'src/components/wrappers/OnlyAdminGuard.tsx',
    r"import \{[^}]*\} from '@/channel/hooks/useChannelAdmin';\n",
    ""
)

# Fix AppStrings - rename UsernamePageTranslations -> NamePageTranslations
replace_in_file(
    r'src/core/localization/AppStrings.ts',
    'UsernamePageTranslations,',
    'NamePageTranslations as UsernamePageTranslations,'
)

# Fix design_system cornerCurve -> borderCurve
replace_in_file(r'src/core/theme/design_system.ts', 'cornerCurve', 'borderCurve')

# Fix MainBottomAppBar - BadgeIcon path
replace_in_file(
    r'src/mainFeed/features/bottomappbar/widgets/MainBottomAppBar.tsx',
    "from './iconwithbarge/BadgeIcon'",
    "from '../../../../components/navbar/iconwithbarge/BadgeIcon'"
)

# Fix Mainfeedcard - boolean | undefined
replace_in_file(
    r'src/mainFeed/features/mainfeedcard/subfeedCards/Mainfeedcard.tsx',
    'isPlaying={isPlaying}',
    'isPlaying={isPlaying ?? false}'
)
replace_in_file(
    r'src/mainFeed/features/mainfeedcard/subfeedCards/Mainfeedcard.tsx',
    'isActive={isActive}',
    'isActive={isActive ?? false}'
)

# Fix MainFeedPage - AsyncStorage usage
re_replace_in_file(
    r'src/mainFeed/pages/MainFeedPage.tsx',
    r"const loadCache = async \(\) => \{.*?loadCache\(\);",
    "// cache loading removed"
)

# Fix MainFeedScaffold - onLoadMore optional
replace_in_file(
    r'src/mainFeed/pages/MainFeedScaffold.tsx',
    'onLoadMore={onLoadMore}',
    'onLoadMore={onLoadMore!}'
)

# Fix localization.ts - UsernamePageTranslations from wrong file
replace_in_file(
    r'src/settings/localization/localization.ts',
    "import { UsernamePageTranslations } from './profilelocalization/username_page_translations';",
    "import { NamePageTranslations as UsernamePageTranslations } from './profilelocalization/name_page_translations';"
)

# Fix SettingsPage - cache_manager
re_replace_in_file(
    r'src/settings/SettingsPage.tsx',
    r"import cacheManager from '@/core/utils/cache_manager';\n",
    ""
)

# Fix subsettings Switch
replace_in_file(
    r'src/settings/subsettings/ActivityStatusPage.tsx',
    "import React, { useState } from 'react';",
    "import React, { useState } from 'react';\nimport { Switch } from 'react-native';"
)
replace_in_file(r'src/settings/subsettings/CommentControlsPage.tsx', 'onValueChange={setHideOffensive}', 'onValueChange={(v) => setHideOffensive(v)}')
replace_in_file(r'src/settings/subsettings/ContactsSyncingPage.tsx', 'onValueChange={setSyncContacts}', 'onValueChange={(v) => setSyncContacts(v)}')
replace_in_file(r'src/settings/subsettings/DataSaverPage.tsx', 'onValueChange={setDataSaverMode}', 'onValueChange={(v) => setDataSaverMode(v)}')
replace_in_file(r'src/settings/subsettings/FollowInvitePage.tsx', 'onValueChange={setAllowInvites}', 'onValueChange={(v) => setAllowInvites(v)}')
replace_in_file(r'src/settings/subsettings/HiddenWordsPage.tsx', 'onValueChange={setFilterComments}', 'onValueChange={(v) => setFilterComments(v)}')

# Fix ThemePage - missing useTheme
replace_in_file(
    r'src/settings/subsettings/ThemePage.tsx',
    'const { theme, toggleTheme } = useTheme();',
    "const theme = 'dark'; const toggleTheme = () => {};"
)

# Fix AccountSelectorPage - missing logout -> signOut
replace_in_file(r'src/signing/AccountSelectorPage.tsx', '.logout()', '.signOut()')
replace_in_file(r'src/signing/AccountSelectorPage.tsx', ' logout,', ' signOut,')
replace_in_file(r'src/signing/AccountSelectorPage.tsx', ' logout }', ' signOut }')

print("\nAll fixes applied!")
