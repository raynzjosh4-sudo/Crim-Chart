import { NativeDB } from '@/core/db/NativeDB';
import { create } from 'zustand';

interface InteractionState {
  // Sets of user interactions per context (global or box)
  // Key is either `postId` (global) or `${boxId}_${postId}` (box context)
  likes: Record<string, boolean>;
  likesCount: Record<string, number>;
  viewsCount: Record<string, number>;
  downloadsCount: Record<string, number>;

  // Mapping of postId -> list of boxIds it has been tagged in
  tags: Record<string, string[]>;

  // Comment Interactions
  commentLikes: Record<string, boolean>;
  commentLikesCount: Record<string, number>;

  // Actions to seed initial state
  seedPost: (postId: string, initialLikesCount: number, initialViewsCount: number, initialIsLiked: boolean, initialDownloadsCount?: number, boxId?: string) => void;
  seedTag: (postId: string, boxId: string, isTagged: boolean) => void;

  // Actions to interact
  toggleLike: (postId: string, boxId?: string) => void;
  incrementView: (postId: string, boxId?: string, channelId?: string) => void;
  incrementDownload: (postId: string, boxId?: string, channelId?: string) => void;
  toggleTag: (postId: string, boxId: string) => void;

  // Actions for Comments
  seedCommentInteraction: (commentId: string, initialLikesCount: number, initialIsLiked: boolean) => void;
  toggleCommentLike: (commentId: string) => void;
  syncPostInteractions: (postIds: string[], boxId?: string) => Promise<void>;
}

export const useInteractionStore = create<InteractionState>((set) => ({
  likes: {},
  likesCount: {},
  viewsCount: {},
  downloadsCount: {},
  tags: {},
  commentLikes: {},
  commentLikesCount: {},

  seedPost: (postId, initialLikesCount, initialViewsCount, initialIsLiked, initialDownloadsCount, boxId) =>
    set((state) => {
      const key = boxId ? `${boxId}_${postId}` : postId;
      // Only seed if not already present in the store (preserves optimistic updates)
      if (state.likesCount[key] !== undefined) return state;
      return {
        likes: { ...state.likes, [key]: initialIsLiked },
        likesCount: { ...state.likesCount, [key]: initialLikesCount },
        viewsCount: { ...state.viewsCount, [key]: initialViewsCount },
        downloadsCount: { ...state.downloadsCount, [key]: initialDownloadsCount || 0 },
      };
    }),

  seedTag: (postId, boxId, isTagged) =>
    set((state) => {
      const currentTags = state.tags[postId] || [];
      const hasTag = currentTags.includes(boxId);

      if (isTagged && !hasTag) {
        return { tags: { ...state.tags, [postId]: [...currentTags, boxId] } };
      } else if (!isTagged && hasTag) {
        // We typically don't untag via this UI, but we handle the seed logic anyway
        return state;
      }
      return state;
    }),

  seedCommentInteraction: (commentId, initialLikesCount, initialIsLiked) =>
    set((state) => {
      // Only seed if not already present in the store (preserves optimistic updates)
      if (state.commentLikesCount[commentId] !== undefined) return state;
      return {
        commentLikes: { ...state.commentLikes, [commentId]: initialIsLiked },
        commentLikesCount: { ...state.commentLikesCount, [commentId]: initialLikesCount },
      };
    }),

  toggleLike: (postId, boxId) => {
    const key = boxId ? `${boxId}_${postId}` : postId;

    set((state) => {
      const isLiked = state.likes[key] || false;
      const count = state.likesCount[key] || 0;
      const newIsLiked = !isLiked;
      const newCount = newIsLiked ? count + 1 : Math.max(0, count - 1);

      // If we are in a box context and the user likes, we should ALSO optimistically like the global post if they haven't.
      const globalIsLiked = state.likes[postId] || false;
      let newGlobalLikes = state.likesCount[postId] || 0;
      let newGlobalIsLiked = globalIsLiked;

      console.log(`[InteractionStore] Toggling like for post ${postId}. Box Context: ${boxId || 'None'}`);
      console.log(`[InteractionStore] Previous State -> isLiked: ${isLiked}, count: ${count}`);

      if (boxId && newIsLiked && !globalIsLiked) {
        newGlobalIsLiked = true;
        newGlobalLikes += 1;
        console.log(`[InteractionStore] Optimistically liking global post too. Global count: ${newGlobalLikes}`);
      } else if (boxId && !newIsLiked && globalIsLiked) {
        newGlobalIsLiked = false;
        newGlobalLikes = Math.max(0, newGlobalLikes - 1);
        console.log(`[InteractionStore] Optimistically unliking global post too. Global count: ${newGlobalLikes}`);
      }

      // Sync to backend via RPC (fire-and-forget for speed, but ideally we await this in the component, or just trust the backend)
      console.log(`[InteractionStore] 🔄 Sending toggle_like RPC to Supabase. postId=${postId}, boxId=${boxId || null}`);
      import('@/core/supabase/supabaseConfig').then(({ supabase }) => {
        supabase.rpc('toggle_like', { p_post_id: postId, p_box_id: boxId || null })
          .then(({ data, error }) => {
            if (error) {
              console.error("[InteractionStore] ❌ Failed to toggle_like in DB:", error);
            } else {
              console.log("[InteractionStore] ✅ DB RPC toggle_like returned:", data);
            }
          });
      });

      // Also fire-and-forget sync to SQLite for offline availability (only for global discovery feed if no boxId is provided)
      if (!boxId) {
        NativeDB.updatePostInteraction(postId, { likesCount: newCount });
      }

      return {
        likes: { ...state.likes, [key]: newIsLiked, [postId]: newGlobalIsLiked },
        likesCount: { ...state.likesCount, [key]: newCount, [postId]: newGlobalLikes },
      };
    });
  },

  incrementView: (postId, boxId, channelId) => {
    // Optimistically update the view count so it reflects immediately in the UI
    set((state) => {
      const key = boxId ? `${boxId}_${postId}` : postId;
      return {
        viewsCount: { ...state.viewsCount, [key]: (state.viewsCount[key] || 0) + 1 },
      };
    });

    // Sync to backend via RPC
    import('@/core/supabase/supabaseConfig').then(({ supabase }) => {
      let tableType = 'posts';
      if (boxId) tableType = 'box_items';
      else if (channelId) tableType = 'channel_posts';

      supabase.rpc('increment_view', {
        p_post_id: postId,
        p_table_type: tableType,
        p_box_id: boxId || null
      }).then(({ data, error }) => {
        console.log(`[InteractionStore] 👁️ increment_view RPC fired for post ${postId}. Error:`, error);
      });

      // Also record the reaction in box_item_reactions if inside a box
      if (boxId) {
        supabase.rpc('record_box_item_reaction', {
          p_post_id: postId,
          p_box_id: boxId,
          p_reaction_type: 'view'
        }).then(({ error }) => {
          if (error) console.error('[InteractionStore] Failed to record view reaction:', error);
        });
      }
    });
  },

  incrementDownload: (postId, boxId, channelId) =>
    set((state) => {
      // Logic: if boxId is provided, we increment both the global count and the box count
      // if channelId is provided, we might just increment global and channel (but channelId might just be handled via global for now since we just pass it)
      const key = boxId ? `${boxId}_${postId}` : postId;
      const count = state.downloadsCount[key] || 0;
      const newCount = count + 1;

      // Optimistically increment global downloads if we're in a box
      const globalCount = state.downloadsCount[postId] || 0;
      let newGlobalCount = globalCount;
      if (boxId) {
        newGlobalCount += 1;
      }

      // Sync to backend
      import('@/core/supabase/supabaseConfig').then(({ supabase }) => {
        let tableType = 'posts';
        if (boxId) tableType = 'box_items';
        else if (channelId) tableType = 'channel_posts';

        supabase.rpc('increment_download', {
          p_post_id: postId,
          p_table_type: tableType,
          p_box_id: boxId || null
        }).then(({ error }) => {
          if (error) console.error("Failed to increment_download in DB:", error);
        });
      });

      // Fire-and-forget sync to SQLite
      if (!boxId) {
        NativeDB.updatePostInteraction(postId, { downloadsCount: newCount });
      }

      return {
        downloadsCount: {
          ...state.downloadsCount,
          [key]: newCount,
          ...(boxId ? { [postId]: newGlobalCount } : {})
        },
      };
    }),

  toggleTag: (postId, boxId) =>
    set((state) => {
      const currentTags = state.tags[postId] || [];
      const isTagged = currentTags.includes(boxId);

      if (isTagged) {
        // Untag
        return {
          tags: { ...state.tags, [postId]: currentTags.filter(id => id !== boxId) },
        };
      } else {
        // Tag
        return {
          tags: { ...state.tags, [postId]: [...currentTags, boxId] },
        };
      }
    }),

  syncPostInteractions: async (postIds: string[], boxId?: string) => {
    if (!postIds || postIds.length === 0) return;

    // Dynamic import to avoid circular dependency
    const { supabase } = await import('@/core/supabase/supabaseConfig');
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      // 1. Fetch Global Likes
      console.log(`[InteractionStore] 🔄 Syncing interactions for ${postIds.length} posts. userId: ${userId}`);
      console.log(`[InteractionStore] 📌 Post IDs being synced:`, postIds);
      const { data: likedData, error: likedError } = await supabase
        .from('post_likes')
        .select('post_id')
        .in('post_id', postIds)
        .eq('user_id', userId);

      if (likedError) console.error("[InteractionStore] ❌ syncPostInteractions post_likes error:", likedError);

      const globalLikedSet = new Set(likedData?.map(d => d.post_id) || []);
      console.log(`[InteractionStore] 📊 Global Likes found:`, Array.from(globalLikedSet));

      // 2. Fetch Box Tags (is it in this specific box?)
      let taggedData: any[] = [];
      if (boxId) {
        const { data } = await supabase
          .from('box_items')
          .select('post_id, box_id')
          .in('post_id', postIds)
          .eq('box_id', boxId);
        if (data) taggedData = data;
      }

      // 3. Fetch Box Item Likes (if a box context is provided)
      let boxLikedSet = new Set<string>();
      if (boxId) {
        const { data: boxItemsData } = await supabase
          .from('box_items')
          .select('id, post_id')
          .in('post_id', postIds)
          .eq('box_id', boxId);

        if (boxItemsData && boxItemsData.length > 0) {
          const boxItemIds = boxItemsData.map(b => b.id);
          const { data: boxLikedData } = await supabase
            .from('box_item_likes')
            .select('box_item_id')
            .in('box_item_id', boxItemIds)
            .eq('user_id', userId);

          const likedBoxItemIds = new Set(boxLikedData?.map(d => d.box_item_id) || []);
          boxItemsData.forEach(item => {
            if (likedBoxItemIds.has(item.id)) {
              boxLikedSet.add(item.post_id);
            }
          });
          console.log(`[InteractionStore] 📊 Box Item Likes found:`, Array.from(boxLikedSet));
        }
      }

      // 4. Batch update state
      set((state) => {
        const newLikes = { ...state.likes };
        const newTags = { ...state.tags };

        postIds.forEach(postId => {
          // Update global like status
          newLikes[postId] = globalLikedSet.has(postId);

          // Update box-specific like status
          if (boxId) {
            const key = `${boxId}_${postId}`;
            if (boxLikedSet.has(postId)) {
              newLikes[key] = true;
            } else {
              // Delete it so it correctly falls back to the global like if needed
              delete newLikes[key];
            }
          }
        });

        // Populate tags
        if (taggedData) {
          const tagMap: Record<string, string[]> = {};
          taggedData.forEach(d => {
            if (!tagMap[d.post_id]) tagMap[d.post_id] = [];
            tagMap[d.post_id].push(d.box_id);
          });

          postIds.forEach(postId => {
            newTags[postId] = tagMap[postId] || [];
          });
        }

        return {
          likes: newLikes,
          tags: newTags
        };
      });
    } catch (e) {
      console.error("[InteractionStore] ❌ syncPostInteractions failed:", e);
    }
  },

  toggleCommentLike: (commentId) =>
    set((state) => {
      const isLiked = state.commentLikes[commentId] || false;
      const count = state.commentLikesCount[commentId] || 0;
      const newIsLiked = !isLiked;
      const newCount = newIsLiked ? count + 1 : Math.max(0, count - 1);

      // Async RPC call
      import('@/core/supabase/supabaseConfig').then(({ supabase }) => {
        supabase.rpc('toggle_comment_like', { p_comment_id: commentId })
          .then(({ error }) => {
            if (error) console.error("[InteractionStore] ❌ Failed to toggle comment like:", error);
          });
      });

      return {
        commentLikes: { ...state.commentLikes, [commentId]: newIsLiked },
        commentLikesCount: { ...state.commentLikesCount, [commentId]: newCount },
      };
    }),
}));
