import { create } from 'zustand';
import { PostEntity } from '../domain/entities/PostEntity';
import { FeedRemoteSource } from '../data/sources/FeedRemoteSource';

interface FeedState {
  posts: PostEntity[];
  isLoading: boolean;
  isLoadingMore: boolean;
  errorMessage: string | null;
  currentPage: number;
  hasReachedEnd: boolean;

  loadFeed: () => Promise<void>;
  loadMore: () => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  clearError: () => void;
}

const PAGE_LIMIT = 10;

export const useFeedController = create<FeedState>((set, get) => ({
  posts: [],
  isLoading: false,
  isLoadingMore: false,
  errorMessage: null,
  currentPage: 1,
  hasReachedEnd: false,

  loadFeed: async () => {
    set({ isLoading: true, errorMessage: null, currentPage: 1 });

    try {
      const posts = await FeedRemoteSource.getFeed(1, PAGE_LIMIT);

      set({
        posts,
        isLoading: false,
        hasReachedEnd: posts.length < PAGE_LIMIT,
        currentPage: 1,
      });
    } catch (e: any) {
      set({ isLoading: false, errorMessage: e.message || 'Failed to load feed' });
    }
  },

  loadMore: async () => {
    const { isLoadingMore, hasReachedEnd, currentPage, posts } = get();
    if (isLoadingMore || hasReachedEnd) return;

    set({ isLoadingMore: true });
    const nextPage = currentPage + 1;

    try {
      const newPosts = await FeedRemoteSource.getFeed(nextPage, PAGE_LIMIT);

      set({
        posts: [...posts, ...newPosts],
        isLoadingMore: false,
        currentPage: nextPage,
        hasReachedEnd: newPosts.length < PAGE_LIMIT,
      });
    } catch (e: any) {
      set({ isLoadingMore: false, errorMessage: e.message || 'Failed to load more' });
    }
  },

  toggleLike: async (postId: string) => {
    const { posts } = get();
    const idx = posts.findIndex(p => p.id === postId);
    if (idx === -1) return;

    const post = posts[idx];
    const originalPost = { ...post } as PostEntity;

    // 1. Optimistic update
    const updatedPost = Object.assign(Object.create(Object.getPrototypeOf(post)), post);
    updatedPost.isLiked = !post.isLiked;
    updatedPost.likesCount = post.isLiked ? post.likesCount - 1 : post.likesCount + 1;

    const newPosts = [...posts];
    newPosts[idx] = updatedPost;
    set({ posts: newPosts });

    // 2. Call API (mock for now since like endpoint requires specific implementation, likely Supabase RPC or endpoint)
    try {
      // await FeedRemoteSource.toggleLike(postId);
      // Wait for real implementation or use Supabase directly
    } catch (e: any) {
      // Revert on error
      const revertedPosts = [...get().posts];
      revertedPosts[idx] = originalPost;
      set({ posts: revertedPosts, errorMessage: 'Failed to toggle like' });
    }
  },

  clearError: () => set({ errorMessage: null }),
}));
