import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
interface SyncedLyricsProps {
  lyrics?: string;
  position: number;
  duration: number;
}

// Helper to safely chop text into lines that fit the screen (approx 40 chars)
const getChoppedLines = (text: string) => {
  const rawLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const chopped: string[] = [];
  rawLines.forEach(line => {
    const words = line.split(/\s+/);
    let currentChunk = '';
    for (const word of words) {
      if ((currentChunk + ' ' + word).length <= 38) {
        currentChunk += (currentChunk ? ' ' : '') + word;
      } else {
        if (currentChunk) chopped.push(currentChunk);
        currentChunk = word;
      }
    }
    if (currentChunk) chopped.push(currentChunk);
  });
  return chopped;
};
export const SyncedLyrics: React.FC<SyncedLyricsProps> = ({
  lyrics,
  position,
  duration
}) => {
  const styles = useStyles(colors => ({
    lyricsContainer: {
      alignItems: 'center',
      marginTop: 30,
      paddingHorizontal: 30,
      height: 100,
      // Fixed height to prevent layout jumps
      justifyContent: 'center'
    },
    lyricLineFaded: {
      color: 'rgba(255,255,255,0.3)',
      fontSize: 15,
      marginBottom: 10,
      textAlign: 'center'
    },
    lyricLineActive: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '600',
      marginBottom: 10,
      textAlign: 'center'
    }
  }));
  const lines = React.useMemo(() => {
    if (!lyrics) return [];
    return getChoppedLines(lyrics);
  }, [lyrics]);
  if (!lyrics || lines.length === 0) {
    return <View style={styles.lyricsContainer}>
        <Text style={styles.lyricLineFaded}>No lyrics available.</Text>
      </View>;
  }

  // Sync lyrics to audio position across the entire duration
  const safeDuration = duration > 0 ? duration : 1;
  let activeIndex = Math.floor(position / safeDuration * lines.length);
  if (activeIndex >= lines.length) activeIndex = lines.length - 1;
  if (activeIndex < 0) activeIndex = 0;

  // We want to show 3 lines, with the active line in the middle if possible
  let startIndex = activeIndex - 1;
  if (startIndex < 0) startIndex = 0;
  if (lines.length >= 3 && startIndex > lines.length - 3) {
    startIndex = lines.length - 3;
  }
  const displayLines = lines.slice(startIndex, startIndex + 3);
  return <View style={styles.lyricsContainer}>
      {displayLines.map((line, idx) => {
      const actualIndex = startIndex + idx;
      const isActive = actualIndex === activeIndex;
      return <Text key={actualIndex} style={isActive ? styles.lyricLineActive : styles.lyricLineFaded} numberOfLines={1} ellipsizeMode="tail">
            {line}
          </Text>;
    })}
    </View>;
};