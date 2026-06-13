import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Modal, SafeAreaView } from 'react-native';
import { supabase } from '@/core/supabase/supabaseConfig';
import { StatusViewer, StatusGroup } from '@/channel/pages/widgets2/status/StatusViewer';
import { useProfileCacheStore } from '@/core/store/useProfileCacheStore';

interface UserStatusViewerProps {
  userId: string;
  userName: string;
  userAvatarUrl: string;
  visible: boolean;
  onClose: () => void;
}

export const UserStatusViewer: React.FC<UserStatusViewerProps> = ({ userId, userName, userAvatarUrl, visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [statusGroups, setStatusGroups] = useState<StatusGroup[]>([]);

  useEffect(() => {
    if (visible && userId) {
      const fetchStatuses = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('statuses')
            .select('*')
            .eq('author_id', userId)
            .order('created_at', { ascending: true });

          if (error) {
            console.error('Error fetching user statuses:', error);
            setStatusGroups([]);
            return;
          }

          if (data && data.length > 0) {
            const group: StatusGroup = {
              id: userId,
              channelName: userName || data[0].username || 'User',
              avatarUrl: userAvatarUrl || data[0].profile_image_url || 'https://via.placeholder.com/60',
              media: data.map((item: any) => ({
                id: item.id,
                url: item.video_url || (item.image_urls && item.image_urls[0]) || item.thumbnail_url || '',
                type: item.is_video ? 'video' : 'image',
                caption: item.caption || '',
                thumbnail: item.thumbnail_url || (item.image_urls && item.image_urls[0]) || ''
              }))
            };
            setStatusGroups([group]);
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
  }, [visible, userId]);

  return (
    <>
      {visible && (
        <StatusViewer
          visible={visible}
          onClose={onClose}
          statusGroups={statusGroups}
          initialGroupIndex={0}
          isLoadingData={loading}
          skeletonUser={{ name: userName, avatar: userAvatarUrl }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({});
