# Channel Module — Full Gap Analysis

A complete audit comparing `crown/lib/channel` (Dart source of truth) with `crimchart/src/channel` (TypeScript target). Items are grouped by feature area. A ✅ means it exists in crimchart, ❌ means it must be created.

---

## 1. ChannelComponents / Post Cards
**Status: Mostly done**

| Crown file | Crimchart file | Status |
|---|---|---|
| `ChnnelMainPostCard/channel_post_card.dart` | `ChannelPostCard.tsx` | ✅ |
| `ChnnelMainPostCard/regular_post_card.dart` | `RegularPostCard.tsx` | ✅ |
| `ChnnelMainPostCard/channel_and_feed_post_model.dart` | `ChannelAndFeedPostModel.tsx` | ✅ |
| `postCardFiles/avatar_with_status.dart` | `AvatarWithStatus.tsx` | ✅ |
| `postCardFiles/tagger_row.dart` | `TaggerRow.tsx` | ✅ |
| `postCardFiles/post_content.dart` | `PostContent.tsx` | ✅ |
| `postCardFiles/channel_image_post_widget.dart` | `ChannelImagePostWidget.tsx` | ✅ |
| `postCardFiles/channel_video_post_widget.dart` | `ChannelVideoPostWidget.tsx` | ✅ |

---

## 2. CRimChartMassageBubble (Comment + Like System)
**Status: Skeleton only — most files are missing**

| Crown file | Crimchart file | Status |
|---|---|---|
| `comments/comment.dart` | — | ❌ `CommentBubble.tsx` |
| `comments/comment_action.dart` | `CommentActionWidget.tsx` | ✅ (partial) |
| `comment_action/like/like.dart` | `LikeAction.tsx` | ✅ (partial) |
| `crimChartMassageBubblePainer/CRimChartMassageBubblePainer.dart` | — | ❌ `MessageBubblePainter.tsx` |
| `media/audio_media.dart` | — | ❌ `CommentAudioMedia.tsx` |
| `media/comment_media.dart` | — | ❌ `CommentMedia.tsx` |
| `media/comment_media_type.dart` | — | ❌ `CommentMediaType.ts` |
| `media/image_grid_media.dart` | — | ❌ `CommentImageGrid.tsx` |
| `media/video_media.dart` | — | ❌ `CommentVideoMedia.tsx` |
| `text/comment_text.dart` | — | ❌ `CommentText.tsx` |

---

## 3. Tag System
**Status: Complete ✅**

All tag files have been ported: `TagOverlay`, `TagDiscoveryPage`, `TagCard`, `TagCarousel`, `TagListTile`, `TagShimmer`, `TagNoInternet`, `tagService`.

---

## 4. MainChannelPage (Channels List / Tab)
**Status: Partial — key widgets missing**

| Crown file | Crimchart file | Status |
|---|---|---|
| `channels_page.dart` | `ChannelsPage.tsx` | ✅ |
| `channel_filters_controller.dart` | — | ❌ `useChannelFilters.ts` |
| `channels_tab_view.dart` | — | ❌ `ChannelsTabView.tsx` |
| `widgets/active_channel_circle.dart` | — | ❌ `ActiveChannelCircle.tsx` |
| `widgets/channel_follow_button.dart` | `ChannelFollowButton.tsx` | ✅ |
| `widgets/channel_list_tile.dart` | `ChannelListTile.tsx` | ✅ |
| `widgets/channel_search_bar.dart` | `ChannelSearchBar.tsx` | ✅ |
| `widgets/channel_state_illustration.dart` | — | ❌ `ChannelStateIllustration.tsx` |
| `widgets/create_channel_circle.dart` | — | ❌ `CreateChannelCircle.tsx` |
| `widgets/scaling_avatar_carousel.dart` | — | ❌ `ScalingAvatarCarousel.tsx` |
| `widgets/suggested_channels_footer.dart` | — | ❌ `SuggestedChannelsFooter.tsx` |
| `widgets/top_horizontal_widgets/user_status_moments.dart` | — | ❌ `UserStatusMoments.tsx` |
| `sectionHeaders/channel_status_moments.dart` | — | ❌ `ChannelStatusMoments.tsx` |
| `sectionHeaders/inbox_section_header.dart` | — | ❌ `InboxSectionHeader.tsx` |
| `sectionHeaders/forChannels/channel_section_header.dart` | — | ❌ `ChannelSectionHeader.tsx` |

---

## 5. Channel Settings
**Status: Missing entirely**

| Crown file | Crimchart file | Status |
|---|---|---|
| `channelsettings/channel_settings_main.dart` | `ChannelSettingsPage.tsx` | ✅ (exists but thin) |
| `channelsettings/widgets/allmember/charters_horizontal_list.dart` | — | ❌ `ChartersHorizontalList.tsx` |
| `channelsettings/widgets/allmember/charters_list_tile.dart` | — | ❌ `ChartersListTile.tsx` |
| `channelsettings/widgets/allmember/members_horizontal_list.dart` | — | ❌ `MembersHorizontalList.tsx` |
| `channelsettings/widgets/allmember/member_list_tile.dart` | — | ❌ `MemberListTile.tsx` |

---

## 6. SubChannel Page (Individual Channel / Thread)
**Status: Missing entirely**

| Crown file | Crimchart file | Status |
|---|---|---|
| `subChannelPage/channel_page.dart` | — | ❌ `SubChannelPage.tsx` |
| `subChannelPage/messages_page.dart` | — | ❌ `MessagesPage.tsx` |
| `subChannelPage/MainChannelTabs/messages_tab_view.dart` | — | ❌ `MessagesTabView.tsx` |
| `subChannelPage/MainChannelTabs/members_tab/members_tab_view.dart` | — | ❌ `MembersTabView.tsx` |
| `subChannelPage/MainChannelTabs/members_tab/widgets/channel_invitation_card.dart` | — | ❌ `ChannelInvitationCard.tsx` |
| `subChannelPage/MainChannelTabs/members_tab/widgets/member_list_item.dart` | — | ❌ `MemberListItem.tsx` |

---

## 7. Messages Tab (In-Channel Chat)
**Status: Missing entirely**

| Crown file | Crimchart file | Status |
|---|---|---|
| `messages_tab/bottom_sheets/select_media_bottom_sheet.dart` | — | ❌ `SelectMediaBottomSheet.tsx` |
| `messages_tab/bottom_sheets/user_profile_bottom_sheet.dart` | — | ❌ `UserProfileBottomSheet.tsx` |
| `messages_tab/dialogs/microphone_permission_dialog.dart` | — | ❌ `MicrophonePermissionDialog.tsx` |
| `messages_tab/models/massageModel.dart` | — | ❌ `MessageModel.ts` |
| `messages_tab/models/media_model.dart` | — | ❌ `MediaModel.ts` |
| `messages_tab/widgets/active_users_bar.dart` | — | ❌ `ActiveUsersBar.tsx` |
| `messages_tab/widgets/chartmain_shimmer.dart` | — | ❌ `ChatMainShimmer.tsx` |
| `messages_tab/widgets/chat_bubble.dart` | — | ❌ `ChatBubble.tsx` |
| `messages_tab/widgets/chat_bubble_shimmer.dart` | — | ❌ `ChatBubbleShimmer.tsx` |
| `messages_tab/widgets/chat_input_field.dart` | — | ❌ `ChatInputField.tsx` |
| `messages_tab/widgets/date_divider.dart` | — | ❌ `DateDivider.tsx` |
| `messages_tab/widgets/emoji_picker_panel.dart` | — | ❌ `EmojiPickerPanel.tsx` |
| `messages_tab/widgets/message_media_grid.dart` | — | ❌ `MessageMediaGrid.tsx` |
| `messages_tab/widgets/typing_bubble.dart` | — | ❌ `TypingBubble.tsx` |
| `messages_tab/widgets/voice_message_player.dart` | — | ❌ `VoiceMessagePlayer.tsx` |

---

## 8. Video Tab
**Status: Needs Refinement**

| Crown file | Crimchart file | Status |
|---|---|---|
| `video_tab/video_tab_view.dart` | `VideoTabView.tsx` | ✅ |
| `video_tab/models/video_model.dart` | `VideoModel.ts` | ✅ (Using global `VideoPost.ts`) |
| `video_tab/widgets/video_card.dart` | `VideoFeedCard.tsx` | ⚠️ Needs adjustments (see gaps below) |
| `video_tab/widgets/promotion_banner_card.dart` | `PromotionBannerCard.tsx` | ✅ |
| `video_tab/widgets/video_promotion_banner.dart` | `VideoPromotionBanner.tsx` | ✅ |

### VideoCard Gap Analysis (crimchartvideocard.dart vs VideoFeedCard.tsx)
1. **Right Action Column Icons**: 
   - Dart has: Avatar, Heart (Like), MessageCircle (Comment), Tag (Blue), Bookmark.
   - TS has: Avatar, Heart, MessageCircle, Share2 (incorrect), Crown (incorrect/extra), Bookmark.
2. **Video Seeker**:
   - Dart uses a real, draggable `Slider` bound to the video's stream position/duration. It thickens when seeking.
   - TS uses a static, hardcoded `fakeSeeker` view.
3. **Bottom Author Info Overlay**:
   - Dart shows a mini `UserAvatorImage` (28.w) next to the display name if it's a channel post, and the channel description below it.
   - TS shows a larger avatar with the name and a verified badge, which deviates from the specific Dart layout.

---

## 9. Widgets (General Channel Page Widgets)
**Status: Mostly missing**

| Crown file | Crimchart file | Status |
|---|---|---|
| `widgets/channel_gatekeeper.dart` | — | ❌ `ChannelGatekeeper.tsx` |
| `widgets/invite_card.dart` | — | ❌ `ChannelInviteCard.tsx` |
| `widgets/pagination_error_footer.dart` | — | ❌ `PaginationErrorFooter.tsx` |
| `widgets/channelinfosheet/channel_info_sheet.dart` | — | ❌ `ChannelInfoSheet.tsx` |
| `widgets/channelinfosheet/manifesto_grid_widget.dart` | — | ❌ `ManifestoGridWidget.tsx` |
| `widgets/channelinfosheet/sheetgrid/pinterest_grid_widget.dart` | — | ❌ `PinterestGridWidget.tsx` |
| `widgets/channelinfosheet/videoviewer/video_viewer_page.dart` | — | ❌ `VideoViewerPage.tsx` |

---

## 10. Widgets2 (Chart/Contestant System)
**Status: Skeleton only**

| Crown file | Crimchart file | Status |
|---|---|---|
| `widgets2/contestant_carousel.dart` | — | ❌ `ContestantCarousel.tsx` |
| `widgets2/pending_media_overlay.dart` | — | ❌ `PendingMediaOverlay.tsx` |
| `widgets2/channelname/channel_name.dart` | `ChannelName.tsx` | ✅ |
| `widgets2/chartcard/card/contestant_card.dart` | — | ❌ `ContestantCard.tsx` |
| `widgets2/chartcard/card/media/audio_media.dart` | — | ❌ `ChartAudioMedia.tsx` |
| `widgets2/chartcard/card/media/image_media.dart` | — | ❌ `ChartImageMedia.tsx` |
| `widgets2/chartcard/card/media/video_media.dart` | — | ❌ `ChartVideoMedia.tsx` |
| `widgets2/chartcard/chartbutton/bubble_overlay.dart` | — | ❌ `BubbleOverlay.tsx` |
| `widgets2/chartcard/chartbutton/contestant_add_button.dart` | — | ❌ `ContestantAddButton.tsx` |
| `widgets2/chartcard/charterstack/charter_stack.dart` | — | ❌ `CharterStack.tsx` |
| `widgets2/chartcard/charterstack/back_card.dart` | — | ❌ `BackCard.tsx` |
| `widgets2/chartcard/nextbutton/next_button.dart` | — | ❌ `NextButton.tsx` |
| `widgets2/chartmembers/member_count.dart` | `MemberCount.tsx` | ✅ |
| `widgets2/chartstarter/starter_name.dart` | `StarterName.tsx` | ✅ |
| `widgets2/chart_button/chart_button.dart` | — | ❌ `ChartButton.tsx` |
| `widgets2/chart_button/new_chart_sheet.dart` | — | ❌ `NewChartSheet.tsx` |
| `widgets2/flagsbottomsheet/flags_bottom_sheet.dart` | — | ❌ `FlagsBottomSheet.tsx` |
| `widgets2/imageveiwerwidget/image_grid.dart` | — | ❌ `ImageGrid.tsx` |
| `widgets2/manifestowidgets/manifesto_media_router.dart` | — | ❌ `ManifestoMediaRouter.tsx` |
| `widgets2/manifestowidgets/manifesto_single_image.dart` | — | ❌ `ManifestoSingleImage.tsx` |
| `widgets2/manifestowidgets/manifesto_double_image.dart` | — | ❌ `ManifestoDoubleImage.tsx` |
| `widgets2/manifestowidgets/manifesto_triple_image.dart` | — | ❌ `ManifestoTripleImage.tsx` |
| `widgets2/manifestowidgets/manifesto_quad_image.dart` | — | ❌ `ManifestoQuadImage.tsx` |
| `widgets2/manifestowidgets/manifesto_single_video.dart` | — | ❌ `ManifestoSingleVideo.tsx` |
| `widgets2/manifestowidgets/manifesto_double_video.dart` | — | ❌ `ManifestoDoubleVideo.tsx` |
| `widgets2/manifestowidgets/manifesto_quad_video.dart` | — | ❌ `ManifestoQuadVideo.tsx` |
| `widgets2/manifestowidgets/manifesto_music_audio.dart` | — | ❌ `ManifestoMusicAudio.tsx` |
| `widgets2/manifestowidgets/manifesto_voice_audio.dart` | — | ❌ `ManifestoVoiceAudio.tsx` |
| `widgets2/memberimage/channel_avatar.dart` | — | ❌ `ChannelAvatar.tsx` |
| `widgets2/memberimage/useravatorimage.dart` | — | ❌ `UserAvatarImage.tsx` |
| `widgets2/memberimage/ownerdatacardwidget.dart` | — | ❌ `OwnerDataCardWidget.tsx` |
| `widgets2/memberimage/userAvatorShimmer.dart` | — | ❌ `UserAvatarShimmer.tsx` |
| `widgets2/offline/offline_view.dart` | — | ❌ `OfflineView.tsx` |
| `widgets2/shimmer/membershimmer.dart` | — | ❌ `MemberShimmer.tsx` |
| `widgets2/shimmer/shimmer_effect.dart` | — | ❌ `ShimmerEffect.tsx` |
| `widgets2/shimmer/videotabshimmer.dart` | — | ❌ `VideoTabShimmer.tsx` |

---

## 11. CrimChartInBox (Inbox / Chat Models & Bubbles)
**Status: Missing entirely**

| Crown file | Crimchart file | Status |
|---|---|---|
| `CrimChartInBox/models/InboxMassageModel.dart` | — | ❌ `InboxMessageModel.ts` |
| `CrimChartInBox/models/inboxModel.dart` | — | ❌ `InboxModel.ts` |
| `CrimChartInBox/models/emoji_assets.dart` | — | ❌ `EmojiAssets.ts` |
| `CrimChartInBox/widgets/chart_bubble.dart` | — | ❌ `ChartBubble.tsx` |
| `CrimChartInBox/widgets/chart_list_item.dart` | — | ❌ `ChartListItem.tsx` |
| `CrimChartInBox/widgets/lottie_emoji_sheet.dart` | — | ❌ `LottieEmojiSheet.tsx` |
| `CrimChartInBox/widgets/poll_carousel.dart` | — | ❌ `PollCarousel.tsx` |
| `CrimChartInBox/widgets/quick_emoji_toolbar.dart` | — | ❌ `QuickEmojiToolbar.tsx` |
| `CrimChartInBox/widgets/bubbles/audio_bubble.dart` | — | ❌ `AudioBubble.tsx` |
| `CrimChartInBox/widgets/bubbles/image_bubble.dart` | — | ❌ `ImageBubble.tsx` |
| `CrimChartInBox/widgets/bubbles/text_bubble.dart` | — | ❌ `TextBubble.tsx` |
| `CrimChartInBox/widgets/bubbles/video_bubble.dart` | — | ❌ `VideoBubble.tsx` |

---

## 12. Discovery Widgets (Channel Detail Feed)
**Status: Missing entirely**

| Crown file | Crimchart file | Status |
|---|---|---|
| `discovery_widgets/dynamic_feed_view.dart` | — | ❌ `DynamicFeedView.tsx` |
| `discovery_widgets/channel_end_summary.dart` | — | ❌ `ChannelEndSummary.tsx` |
| `discovery_widgets/comment_bar.dart` | — | ❌ `CommentBar.tsx` |
| `discovery_widgets/creator_contact_bar.dart` | — | ❌ `CreatorContactBar.tsx` |
| `discovery_widgets/members_story_bar.dart` | — | ❌ `MembersStoryBar.tsx` |
| `discovery_widgets/people_you_may_know_section.dart` | — | ❌ `PeopleYouMayKnowSection.tsx` |
| `discovery_widgets/person_card.dart` | — | ❌ `PersonCard.tsx` |
| `discovery_widgets/PostVideoPlayer.dart` | — | ❌ `PostVideoPlayer.tsx` |

---

## 13. Chart / Poll System
**Status: Missing**

| Crown file | Crimchart file | Status |
|---|---|---|
| `chart/models/chart_chart.dart` | — | ❌ `ChartModel.ts` |
| `chart/widgets/chart_list_item.dart` | — | ❌ `ChartListItem.tsx` |
| `chart/widgets/poll_carousel.dart` | — | ❌ `PollCarousel.tsx` |

---

## 14. Inbox (Inbox Detail / Full Page)
**Status: Missing**

| Crown file | Crimchart file | Status |
|---|---|---|
| `Inbox/InboxDetailPage.dart` | — | ❌ `InboxDetailPage.tsx` |
| `Inbox/inbox_full_page.dart` | — | ❌ `InboxFullPage.tsx` |
| `Inbox/pages/chart_page.dart` | — | ❌ `ChartPage.tsx` (inbox sub-page) |

---

## 15. Data Layer
**Status: Mostly complete, one gap**

| Crown file | Crimchart file | Status |
|---|---|---|
| `data/repositories/channel_repository_impl.dart` | `ChannelRepositoryImpl.ts` | ✅ |
| `data/repositories/tag_repository_impl.dart` | `TagRemoteSource.ts` | ✅ |
| `data/repositories/moment_repository_impl.dart` | — | ❌ `MomentRepositoryImpl.ts` |
| `data/sources/channel_remote_source.dart` | `ChannelRemoteSource.ts` | ✅ |
| `data/sources/tag_remote_source.dart` | `TagRemoteSource.ts` | ✅ |

---

## 16. Domain Layer
**Status: Partial — missing SDUi and presence entities**

| Crown file | Crimchart file | Status |
|---|---|---|
| `domain/entities/channel_entity.dart` | `ChannelEntity.ts` | ✅ |
| `domain/entities/channel_presence_entity.dart` | — | ❌ `ChannelPresenceEntity.ts` |
| `domain/entities/channel_status_entity.dart` | — | ❌ `ChannelStatusEntity.ts` |
| `domain/entities/channel_moment_model.dart` | — | ❌ `ChannelMomentModel.ts` |
| `domain/sdui/component_registry.dart` | — | ❌ `ComponentRegistry.ts` |
| `domain/sdui/error_boundary.dart` | — | ❌ `SduiErrorBoundary.tsx` |
| `domain/sdui/feed_component.dart` | — | ❌ `FeedComponent.tsx` |
| `domain/sdui/fallback_components.dart` | — | ❌ `FallbackComponents.tsx` |

---

## Suggested Execution Order

> [!IMPORTANT]
> Given the scale of the missing work, it is recommended to implement in priority order below. Confirm which areas to tackle first.

1. **Widgets2 — MemberImage/Avatar** (`ChannelAvatar`, `UserAvatarImage`, `UserAvatarShimmer`) — foundational, depended on by many other widgets
2. **Shimmer effects** (`ShimmerEffect`, `MemberShimmer`, `VideoTabShimmer`) — needed by all loading states
3. **MainChannelPage widgets** (`ActiveChannelCircle`, `ScalingAvatarCarousel`, `SuggestedChannelsFooter`, `ChannelStateIllustration`)
4. **Messages Tab** — full chat experience inside a channel
5. **Discovery Widgets** — channel detail feed (DynamicFeedView, PostVideoPlayer, MembersStoryBar)
6. **SubChannelPage** — the full individual channel page with tabs
7. **Video Tab** — channel video feed
8. **Chart / Poll system** — contest/voting UI
9. **CrimChartInBox** — full inbox bubbles and models
10. **SDUi layer** — server-driven UI component registry
