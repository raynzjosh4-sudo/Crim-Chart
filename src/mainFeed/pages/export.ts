// Re-export VideoFeedPage from its actual location
export { VideoFeedPage } from '@/video/pages/VideoFeedPage';
export { MainFeedPage } from './MainFeedPage';

// Stubs for pages not yet ported
export { FirstPostMainPage } from '@/posting/pages/FirstPostMainPage';
export const ChannelsPage: React.FC<any> = () => null;
export const ProfilePage: React.FC<any> = () => null;

import React from 'react';
