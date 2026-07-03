import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useDesktopBoxStore } from '@/features/boxes/application/useDesktopBoxStore';
import { MusicBoxDetailPage } from '@/features/boxes/pages/details/MusicBoxDetailPage';
import { MovieBoxDetailPage } from '@/features/boxes/pages/details/MovieBoxDetailPage';

export const DesktopBoxDetailPane = () => {
  const { activeBoxId, activeBoxType, closeBox } = useDesktopBoxStore();

  if (!activeBoxId || !activeBoxType) {
    return null;
  }

  const renderContent = () => {
    switch (activeBoxType) {
      case 'music':
      case 'audio':
        return <MusicBoxDetailPage id={activeBoxId} onClose={closeBox} />;
      case 'video':
      case 'movie':
        return <MovieBoxDetailPage id={activeBoxId} onClose={closeBox} />;
      default:
        // Fallback for types not yet extracted or supported (like store)
        return (
          <View style={styles.unsupportedContainer}>
            <Text style={styles.unsupportedText}>
              Preview for {activeBoxType} boxes is not supported yet.
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unsupportedText: {
    color: '#FFF',
    fontSize: 16,
  }
});
