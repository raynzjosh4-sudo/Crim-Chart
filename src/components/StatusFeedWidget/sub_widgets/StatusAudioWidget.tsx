import React from 'react';
import { View } from 'react-native';
import { ChannelAudioPostWidget } from '@/channel/ChannelComponents/ChnnelMainPostCard/postCardFiles/ChannelAudioPostWidget';

export interface StatusAudioWidgetProps {
  audioUrl: string;
  thumbnailUrl?: string;
  metadata?: any;
  statusId: string;
}

export const StatusAudioWidget: React.FC<StatusAudioWidgetProps> = ({ 
  audioUrl, 
  thumbnailUrl, 
  metadata, 
  statusId 
}) => {
  return (
    <View style={{ width: '100%' }}>
      <ChannelAudioPostWidget 
        audioUrl={audioUrl} 
        thumbnailUrl={thumbnailUrl} 
        metadata={metadata} 
        postId={statusId} 
        downloadsCount={0}
      />
    </View>
  );
};
