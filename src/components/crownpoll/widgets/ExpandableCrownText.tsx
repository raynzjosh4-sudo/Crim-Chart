import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextStyle } from 'react-native';

interface ExpandableCrownTextProps {
  text: string;
  style?: TextStyle;
}

export const ExpandableCrownText: React.FC<ExpandableCrownTextProps> = ({ text, style }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const handleTextLayout = useCallback((e: any) => {
    setIsOverflowing(e.nativeEvent.lines.length > 2);
  }, []);

  return (
    <View style={styles.container}>
      <Text
        style={[styles.text, style]}
        numberOfLines={isExpanded ? undefined : 2}
        onTextLayout={handleTextLayout}
      >
        {text}
      </Text>
      
      {(isOverflowing || isExpanded) && (
        <View style={styles.actionRow}>
          {!isExpanded && isOverflowing && (
            <TouchableOpacity onPress={() => setIsExpanded(true)}>
              <Text style={[styles.actionText, { color: style?.color ? `${String(style.color)}80` : '#888' }]}>
                more
              </Text>
            </TouchableOpacity>
          )}
          
          {isExpanded && (
            <TouchableOpacity onPress={() => setIsExpanded(false)}>
              <Text style={[styles.actionText, { color: style?.color ? `${String(style.color)}80` : '#888' }]}>
                less
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  text: {
    fontSize: 14,
    color: '#000',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 12,
  },
});
