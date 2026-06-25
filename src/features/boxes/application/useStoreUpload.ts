import { useState } from 'react';
import { supabase } from '@/core/supabase/client';
import { cloudMediaService } from '@/core/network/cloudMediaService';
import { StoreItem } from '../data/dummyStoreBoxData';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export function useStoreUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const currentUser = useAuthStore(state => state.user);

  const uploadStoreItemToBox = async (item: StoreItem, boxId: string): Promise<StoreItem | null> => {
    if (!currentUser) return null;
    
    setIsUploading(true);
    try {
      let uploadedMediaUrl = item.mediaUrl;

      // 1. Upload image to Cloudflare if it's a local file
      if (item.mediaUrl && (item.mediaUrl.startsWith('file://') || item.mediaUrl.startsWith('/'))) {
        uploadedMediaUrl = await cloudMediaService.uploadMedia(item.mediaUrl, 'posts_media', currentUser.id);
      }

      // 2. Insert into posts table
      const metadata = {
        title: item.title,
        price: item.price,
      };

      const postPayload = {
        author_id: currentUser.id,
        caption: item.description,
        privacy: 'public',
        allow_comments: true,
        image_urls: uploadedMediaUrl ? [uploadedMediaUrl] : [],
        type: 'store_item',
        metadata,
      };

      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert(postPayload)
        .select('id, author_id, created_at')
        .single();

      if (postError) throw postError;

      // 3. Tag the post to the box
      const { error: tagError } = await supabase.rpc('tag_post_to_box', {
        p_box_id: boxId,
        p_post_id: newPost.id,
      });

      if (tagError) throw tagError;

      // 4. Record the reaction to update chart points
      await supabase.rpc('record_box_item_reaction', {
        p_post_id: newPost.id,
        p_box_id: boxId,
        p_reaction_type: 'tag'
      });

      // 5. Construct the final StoreItem to be injected into the UI
      const finalItem: StoreItem = {
        id: newPost.id,
        title: metadata.title,
        description: item.description,
        price: metadata.price,
        mediaUrl: uploadedMediaUrl,
        seller: {
          id: currentUser.id,
          name: currentUser.displayName || currentUser.username || '',
          avatarUrl: currentUser.profileImageUrl || '',
        },
        likes: 0,
        commentsCount: 0,
        viewsCount: 0,
      };

      return finalItem;
    } catch (e: any) {
      console.error("[useStoreUpload] Upload failed:", e);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, uploadStoreItemToBox };
}
