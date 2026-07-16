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
import { useDesktopNowPlayingStore } from './useDesktopNowPlayingStore';

interface GlobalAudioPlayerState {
  currentTrackId: string | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  currentTrackMeta: { id: string; title: string; artist: string; coverUrl: string; audioUrl?: string; downloadsCount?: number } | null;

  // Actions
  playTrack: (trackId: string, audioUrl: string, meta?: { title: string; artist: string; coverUrl: string; downloadsCount?: number }) => Promise<void>;
  pauseCurrent: () => Promise<void>;
  resumeCurrent: () => Promise<void>;
  toggleTrack: (trackId: string, audioUrl: string, meta?: { title: string; artist: string; coverUrl: string }) => Promise<void>;
  stopAll: () => Promise<void>;
  seekTo: (positionMillis: number) => Promise<void>;
}

// Keep the sound object outside of Zustand to avoid non-serializable state warning
let _sound: Audio.Sound | null = null;
let _currentUrl: string | null = null;
let _playRequestId = 0;

export const useGlobalAudioPlayer = create<GlobalAudioPlayerState>((set, get) => ({
  currentTrackId: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  currentTrackMeta: null,

  playTrack: async (trackId: string, audioUrl: string, meta?: { title: string; artist: string; coverUrl: string; downloadsCount?: number }) => {
    // Close the main player if a feed preview is started
    useDesktopNowPlayingStore.getState().closeModal();
    const { currentTrackId: prevTrackId } = get();
    
    // Immediately set track ID and meta so UI updates instantly and scrolling away can cancel it
    set({ 
      currentTrackId: trackId, 
      currentTrackMeta: meta ? { id: trackId, audioUrl, ...meta } : get().currentTrackMeta 
    });

    const requestId = ++_playRequestId;

    try {
      // If the same track is already loaded, just play it
      if (prevTrackId === trackId && _sound && _currentUrl === audioUrl) {
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

      // Initially do NOT play, so we can check if it was aborted before playing
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { isLooping: true, shouldPlay: false }
      );

      if (requestId !== _playRequestId) {
        // A pause, stop, or a different play was requested while we were loading!
        await newSound.unloadAsync().catch(() => {});
        return;
      }

      _sound = newSound;
      _currentUrl = audioUrl;

      // Now safe to play
      await _sound.playAsync();

      set({ isPlaying: true });

      // Set status callback to detect when sound finishes and track progress
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          set({ isPlaying: false });
        } else {
          set({
            position: status.positionMillis,
            duration: status.durationMillis || 0,
            isPlaying: status.isPlaying,
          });
        }
      });
    } catch (e: any) {
      // Ignore abort errors as they are expected when pause() interrupts play()
      if (e?.name === 'AbortError' || e?.message?.includes('AbortError')) {
        return;
      }
      console.warn('[GlobalAudioPlayer] playTrack error:', e);
      set({ isPlaying: false });
    }
  },

  pauseCurrent: async () => {
    ++_playRequestId; // Abort any pending loads
    try {
      if (_sound) {
        await _sound.pauseAsync().catch((e) => {
          if (!e.message?.includes('not loaded')) {
            throw e;
          }
        });
      }
      set({ isPlaying: false });
    } catch (e) {
      console.warn('[GlobalAudioPlayer] pauseCurrent error:', e);
    }
  },

  resumeCurrent: async () => {
    try {
      if (_sound) {
        await _sound.playAsync().catch((e) => {
          if (!e.message?.includes('not loaded')) {
            throw e;
          }
        });
        set({ isPlaying: true });
      }
    } catch (e) {
      console.warn('[GlobalAudioPlayer] resumeCurrent error:', e);
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
    ++_playRequestId;
    const soundToStop = _sound;
    _sound = null;
    _currentUrl = null;
    set({ currentTrackId: null, isPlaying: false, currentTrackMeta: null, position: 0, duration: 0 });

    if (soundToStop) {
      try {
        await soundToStop.stopAsync();
      } catch (_) {}
      try {
        await soundToStop.unloadAsync();
      } catch (_) {}
    }
  },

  seekTo: async (positionMillis: number) => {
    if (_sound) {
      await _sound.setPositionAsync(positionMillis);
      set({ position: positionMillis });
    }
  },
}));
