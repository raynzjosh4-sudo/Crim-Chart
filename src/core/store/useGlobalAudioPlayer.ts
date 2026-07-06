/**
 * GlobalAudioPlayer - a singleton audio player for the music feed.
 *
 * RULES:
 * 1. Only ONE sound can play at a time across the entire app.
 * 2. Navigating away from the music page MUST call stopAll().
 * 3. MusicListTile reads from this store to check if IT is the one playing.
 */

import { Audio } from 'expo-av';
import { create } from 'zustand';

interface GlobalAudioPlayerState {
  currentTrackId: string | null;
  isPlaying: boolean;
  currentTrackMeta: { id: string; title: string; artist: string; coverUrl: string } | null;

  // Actions
  playTrack: (trackId: string, audioUrl: string, meta?: { title: string; artist: string; coverUrl: string }) => Promise<void>;
  pauseCurrent: () => Promise<void>;
  resumeCurrent: () => Promise<void>;
  toggleTrack: (trackId: string, audioUrl: string, meta?: { title: string; artist: string; coverUrl: string }) => Promise<void>;
  stopAll: () => Promise<void>;
}

// Keep the sound object outside of Zustand to avoid non-serializable state warning
let _sound: Audio.Sound | null = null;
let _currentUrl: string | null = null;

export const useGlobalAudioPlayer = create<GlobalAudioPlayerState>((set, get) => ({
  currentTrackId: null,
  isPlaying: false,
  currentTrackMeta: null,

  playTrack: async (trackId: string, audioUrl: string, meta?: { title: string; artist: string; coverUrl: string }) => {
    const { currentTrackId } = get();

    try {
      // If the same track is already loaded, just play it
      if (currentTrackId === trackId && _sound && _currentUrl === audioUrl) {
        await _sound.playAsync();
        set({ isPlaying: true });
        return;
      }

      // Stop and unload any existing sound first
      if (_sound) {
        await _sound.stopAsync().catch(() => {});
        await _sound.unloadAsync().catch(() => {});
        _sound = null;
        _currentUrl = null;
      }

      // Set audio mode for background audio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { isLooping: true, shouldPlay: true }
      );

      _sound = newSound;
      _currentUrl = audioUrl;

      set({ currentTrackId: trackId, isPlaying: true, currentTrackMeta: meta ? { id: trackId, ...meta } : get().currentTrackMeta });

      // Set status callback to detect when sound finishes
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          set({ isPlaying: false });
        }
      });
    } catch (e) {
      console.error('[GlobalAudioPlayer] playTrack error:', e);
      set({ isPlaying: false });
    }
  },

  pauseCurrent: async () => {
    try {
      if (_sound) {
        await _sound.pauseAsync();
        set({ isPlaying: false });
      }
    } catch (e) {
      console.error('[GlobalAudioPlayer] pauseCurrent error:', e);
    }
  },

  resumeCurrent: async () => {
    try {
      if (_sound) {
        await _sound.playAsync();
        set({ isPlaying: true });
      }
    } catch (e) {
      console.error('[GlobalAudioPlayer] resumeCurrent error:', e);
    }
  },

  toggleTrack: async (trackId: string, audioUrl: string, meta?: { title: string; artist: string; coverUrl: string }) => {
    const { currentTrackId, isPlaying, playTrack, pauseCurrent, resumeCurrent } = get();

    if (currentTrackId === trackId) {
      // Same track - toggle play/pause
      if (isPlaying) {
        await pauseCurrent();
      } else {
        await resumeCurrent();
      }
    } else {
      // Different track - play new one
      await playTrack(trackId, audioUrl, meta);
    }
  },

  stopAll: async () => {
    const soundToStop = _sound;
    _sound = null;
    _currentUrl = null;
    set({ currentTrackId: null, isPlaying: false, currentTrackMeta: null });

    if (soundToStop) {
      try {
        await soundToStop.stopAsync();
      } catch (_) {}
      try {
        await soundToStop.unloadAsync();
      } catch (_) {}
    }
  },
}));
