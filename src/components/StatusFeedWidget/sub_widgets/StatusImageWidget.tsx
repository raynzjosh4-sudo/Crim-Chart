import React from 'react';
import { View } from 'react-native';
import { ChannelImagePostWidget } from '@/channel/ChannelComponents/ChnnelMainPostCard/postCardFiles/ChannelImagePostWidget';

export interface StatusImageWidgetProps {
  images: string[];
}

export const StatusImageWidget: React.FC<StatusImageWidgetProps> = ({ images }) => {
  if (!images || images.length === 0) return null;
  
  return (
    <View style={{ width: '100%' }}>
      <ChannelImagePostWidget images={images} />
    </View>
  );
};
