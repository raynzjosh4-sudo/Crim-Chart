import React from 'react';
import { ChannelModel } from '@/channel/models/ChannelModel';
import { ChartedInChannel } from './ChartedInChannel';
import { MadeInChannel } from './MadeInChannel';

interface ChartChannelListItemProps {
  channel: ChannelModel;
  isChartedIn: boolean;
  isSubChannel?: boolean;
  index?: number;
}

export const ChartChannelListItem: React.FC<ChartChannelListItemProps> = ({
  channel,
  isChartedIn,
  isSubChannel = false,
  index,
}) => {
  if (isChartedIn) {
    return (
      <ChartedInChannel
        channel={channel}
        isSubChannel={isSubChannel}
        index={index}
      />
    );
  } else {
    return (
      <MadeInChannel
        channel={channel}
        isSubChannel={isSubChannel}
        index={index}
      />
    );
  }
};
