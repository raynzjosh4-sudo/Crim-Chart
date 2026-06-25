import { useState, useEffect } from 'react';

/**
 * A custom hook that returns a boolean indicating whether a video should start playing.
 * It waits for a specified delay (e.g. 5 seconds) after becoming active before returning true.
 * If the component becomes inactive before the delay finishes, the timer is cleared.
 * 
 * @param isActive Whether the video is currently considered active/visible
 * @param delayMs The time to wait before auto-playing (in milliseconds)
 * @returns { shouldPlay: boolean, forcePlay: () => void }
 */
export function useDelayedAutoPlay(isActive: boolean, delayMs: number = 5000) {
  const [shouldPlay, setShouldPlay] = useState(false);

  useEffect(() => {
    // If it's not active, reset the state and don't play
    if (!isActive) {
      setShouldPlay(false);
      return;
    }

    // If it is active, wait for the delay
    const timer = setTimeout(() => {
      setShouldPlay(true);
    }, delayMs);

    // Cleanup timer if the component becomes inactive or unmounts before delay finishes
    return () => clearTimeout(timer);
  }, [isActive, delayMs]);

  const forcePlay = () => setShouldPlay(true);

  return { shouldPlay, forcePlay };
}
