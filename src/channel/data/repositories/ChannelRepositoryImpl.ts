import { channelRemoteSource } from '@/channel/data/sources/ChannelRemoteSource';
import { ChannelModel } from '@/channel/models/ChannelModel';

export class ChannelRepositoryImpl {
  getChannels = (page: number) => channelRemoteSource.getChannels(page);
  getChannelById = (id: string) => channelRemoteSource.getChannelById(id);
  getChannelMembers = (id: string) => channelRemoteSource.getChannelMembers(id);
  joinChannel = (channelId: string, userId: string) => channelRemoteSource.joinChannel(channelId, userId);
  leaveChannel = (channelId: string, userId: string) => channelRemoteSource.leaveChannel(channelId, userId);
  searchChannels = (query: string) => channelRemoteSource.searchChannels(query);
}

export const channelRepository = new ChannelRepositoryImpl();
