import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Modal, SafeAreaView } from 'react-native';
import { supabase } from '@/core/supabase/supabaseConfig';
import { StatusViewer, StatusGroup } from '@/channel/pages/widgets2/status/StatusViewer';
import { useProfileCacheStore } from '@/core/store/useProfileCacheStore';

interface UserStatusViewerProps {
  userId?: string;
  channelId?: string;
  type?: 'user' | 'channel';
  userName?: string;
  userAvatarUrl?: string;
  visible: boolean;
  onClose: () => void;
}

export const UserStatusViewer: React.FC<UserStatusViewerProps> = ({ userId, channelId, type = 'user', userName, userAvatarUrl, visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [statusGroups, setStatusGroups] = useState<StatusGroup[]>([]);

  useEffect(() => {
    const activeId = type === 'channel' ? channelId : userId;
    if (visible && activeId) {
      const fetchStatuses = async () => {
        setLoading(true);
        try {
          const tableName = type === 'channel' ? 'channel_statuses' : 'statuses';
          const columnId = type === 'channel' ? 'channel_id' : 'author_id';

          let query = supabase
            .from(tableName)
            .select('*')
            .eq(columnId, activeId);

          if (type === 'channel') {
             query = query.gte('expires_at', new Date().toISOString());
          }

          const { data, error } = await query.order('created_at', { ascending: true });

          if (error) {
            console.error('Error fetching statuses:', error);
            setStatusGroups([]);
            return;
          }

          if (data && data.length > 0) {
            const group: StatusGroup = {
              id: activeId,
              channelName: userName || data[0].username || (type === 'channel' ? 'Channel' : 'User'),
              avatarUrl: userAvatarUrl || data[0].profile_image_url || 'https://via.placeholder.com/60',
              media: data.map((item: any) => ({
                id: item.id,
                authorId: item.author_id || item.user_id || activeId,
                url: item.video_url || (item.image_urls && item.image_urls[0]) || item.thumbnail_url || '',
                type: item.is_video ? 'video' : 'image',
                caption: item.caption || '',
                thumbnail: item.thumbnail_url || (item.image_urls && item.image_urls[0]) || ''
              }))
            };
            setStatusGroups([group]);
            
            // Immediately mark it as read in the profile cache so the avatar ring updates everywhere
            if (type === 'user' && activeId) {
              useProfileCacheStore.getState().updateProfile(activeId, { isStatusRead: true });
            }
          } else {
            setStatusGroups([]);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };

      fetchStatuses();
    } else {
      // Reset state when hiding
      setStatusGroups([]);
      setLoading(false);
    }
  }, [visible, userId, channelId, type, userName, userAvatarUrl]);

  return (
    <>
      {visible && (
        <StatusViewer
          visible={visible}
          onClose={onClose}
          statusGroups={statusGroups}
          initialGroupIndex={0}
          isLoadingData={loading}
          skeletonUser={{ name: userName || '', avatar: userAvatarUrl || '' }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({});
