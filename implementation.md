# Universal Social Interaction Architecture Guide

We have successfully built a highly resilient, offline-ready, and fully synchronized system for Likes, Tags, Views, Comments, and Downloads. 

The goal of this guide is to explain how to drop this functionality into **any page** (Discovery Feed, Channel Page, User Profile, etc.) using the exact same code, without duplicating logic.

## The Strategy

Instead of writing SQL queries, syncing logic, or state management in your UI components, you will exclusively use the **Wrapper Components** and the **Interaction Store**.

### 1. Pre-Fetching Data (The Sync Engine)
Whenever you fetch a list of posts from your backend (e.g., inside `FeedRemoteSource.ts` or a local `useEffect`), you must tell the Interaction Store to sync their states. This performs one hyper-efficient query to grab all likes and tags for those posts.

```typescript
import { useInteractionStore } from '@/core/store/useInteractionStore';

// After fetching your posts array from Supabase...
const posts = data.map(row => PostEntity.fromMap(row));

// Fire-and-forget sync (add boxId as the second argument if inside a box!)
useInteractionStore.getState().syncPostInteractions(posts.map(p => p.id));
```

### 2. View Tracking (VisibilityTrackerWrapper)
To ensure views are only counted when a user actually looks at the post on their screen, wrap your entire Feed Card in the `VisibilityTrackerWrapper`.

```tsx
import VisibilityTrackerWrapper from '@/components/cardButton/VisibilityTrackerWrapper';

<VisibilityTrackerWrapper 
  postId={item.id} 
  boxId={boxId} // Optional: Pass if inside a box
  channelId={channelId} // Optional: Pass if inside a channel
>
  <YourFeedCardComponent />
</VisibilityTrackerWrapper>
```
*Note: The wrapper automatically calls the backend RPC to increment the view and enforces the unique 1-view-per-user rule.*

### 3. Likes, Tags, and Counts (PostInteractionWrapper)
Instead of passing raw `item.likes` to your buttons, wrap your action buttons (or the whole card) in `PostInteractionWrapper`. This wrapper intercepts the raw data, connects to the live global store, and injects real-time state.

```tsx
import { PostInteractionWrapper } from '@/components/wrappers/PostInteractionWrapper';
import { useInteractionStore } from '@/core/store/useInteractionStore';

<PostInteractionWrapper
  postId={item.id}
  boxId={boxId} // Pass this if you want box-specific tags/likes
  initialLikesCount={item.likes}
  initialViewsCount={item.viewsCount}
  initialIsLiked={false}
>
  {(state) => (
    <View>
      {/* Liking */}
      <LikeButton 
        isLiked={state.isLiked} 
        count={state.likesCount}
        onPress={() => useInteractionStore.getState().toggleLike(item.id, boxId)} 
      />
      
      {/* Tagging */}
      <TagButton 
        isTagged={state.isTagged} 
        onPress={() => useInteractionStore.getState().toggleTag(item.id, boxId)} 
      />
    </View>
  )}
</PostInteractionWrapper>
```

### 4. Downloads (MediaDownloadWrapper)
For downloading media, wrap your download button in `MediaDownloadWrapper`. It handles file extraction and saving to the device gallery.

```tsx
import { MediaDownloadWrapper } from '@/components/wrappers/MediaDownloadWrapper';

<MediaDownloadWrapper
  mediaUrl={item.videoUrl || item.imageUrls[0]}
  title={item.caption}
  mediaType={item.isVideo ? 'video' : 'image'}
  onDownloadSuccess={() => useInteractionStore.getState().incrementDownload(item.id, boxId)}
>
  {({ download, isDownloading }) => (
    <DownloadButton 
      isDownloading={isDownloading} 
      onPress={download} 
    />
  )}
</MediaDownloadWrapper>
```

### 5. Comments (CommentSheet)
You don't need to rewrite the comment UI. Simply maintain a piece of state for whether the sheet is open, and drop `<CommentSheet />` at the bottom of your page or component.

```tsx
import { CommentSheet } from '@/components/comments/CommentSheet';

const [showComments, setShowComments] = useState(false);
const [activePostId, setActivePostId] = useState<string | null>(null);

// Inside your render:
<CommentButton onPress={() => {
  setActivePostId(item.id);
  setShowComments(true);
}} />

// At the root level of your screen:
{activePostId && (
  <CommentSheet
    postId={activePostId}
    visible={showComments}
    onClose={() => setShowComments(false)}
  />
)}
```

---

> [!TIP]
> **Summary Checklist for any new feed page:**
> 1. Call `syncPostInteractions()` on the fetched data.
> 2. Wrap cards in `VisibilityTrackerWrapper`.
> 3. Wrap interaction rows in `PostInteractionWrapper` and read from `state.*`.
> 4. Use `store.toggleLike` / `store.toggleTag` on clicks.
> 5. Drop a `<CommentSheet />` for comments.

## User Review Required
Does this modular strategy make sense to you? If approved, you can use this exact blueprint anytime you create a new feed page or list in the app, and it will automatically inherit the flawless, synced behavior we just built!
