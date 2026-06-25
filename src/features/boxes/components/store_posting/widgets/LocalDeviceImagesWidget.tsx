import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { ImagePlus } from 'lucide-react-native';
import { PhoneMusicWidget } from '@/features/boxes/components/music_posting/widgets/PhoneMusicWidget';
import { useLocalImages } from '@/features/boxes/application/useLocalImages';
import { PermissionDialog } from '@/components/ui/PermissionDialog';
import { StoreItemTile } from '@/features/boxes/components/details/StoreItemTile';

interface LocalDeviceImagesWidgetProps {
  isExpanded: boolean;
  onToggle: () => void;
  onImageSelect?: (imageUri: string) => void;
}

export function LocalDeviceImagesWidget({ isExpanded, onToggle, onImageSelect }: LocalDeviceImagesWidgetProps) {
  const {
    localImages,
    isLoading,
    hasMoreLocalImages,
    loadLocalImages,
    showPermissionDialog,
    setShowPermissionDialog,
    needsSettings,
    handlePermissionConfirm,
  } = useLocalImages();

  useEffect(() => {
    if (isExpanded && localImages.length === 0) {
      loadLocalImages();
    }
  }, [isExpanded, localImages.length]);

  return (
    <View style={styles.container}>
      <PhoneMusicWidget isExpanded={isExpanded} onPress={onToggle} />

      {isExpanded && (
        <View style={styles.listContainer}>
          {localImages.length > 0 ? (
            localImages.map((item) => (
              <TouchableOpacity 
                key={item.id}
                activeOpacity={0.8}
                onPress={() => onImageSelect && onImageSelect(item.mediaUrl)}
              >
                <StoreItemTile item={item} />
              </TouchableOpacity>
            ))
          ) : isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#4ADE80" size="small" />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No photos found on device.</Text>
            </View>
          )}

          {hasMoreLocalImages && localImages.length > 0 && (
            <View style={{ marginTop: 8, marginBottom: 16 }}>
              <PhoneMusicWidget 
                isExpanded={false}
                onPress={() => {
                  if (!isLoading) {
                    loadLocalImages();
                  }
                }} 
              />
            </View>
          )}
        </View>
      )}

      {showPermissionDialog && (
        <PermissionDialog
          visible={showPermissionDialog}
          title={needsSettings ? "Settings Required" : "Permission Required"}
          description={needsSettings 
            ? "We need access to your photos to show them in the local feed. Please enable this in your device settings."
            : "We need access to your photos to show them in the local feed."}
          confirmText={needsSettings ? "Open Settings" : "Continue"}
          icon={<ImagePlus size={24} color="#FFC400" />}
          onConfirm={handlePermissionConfirm}
          onCancel={() => setShowPermissionDialog(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 24,
  },
  listContainer: {
    paddingHorizontal: 0,
    marginTop: -8, // Pull up slightly since PhoneMusicWidget has its own padding
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
});
