import { useState } from 'react';
import { Linking } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

export const useMediaPermissions = () => {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [needsSettings, setNeedsSettings] = useState(false);

  const requestMediaPermission = async () => {
    const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      setNeedsSettings(!canAskAgain);
      setShowPermissionDialog(true);
      return false;
    }
    return true;
  };

  const handlePermissionConfirm = () => {
    setShowPermissionDialog(false);
    if (needsSettings) {
      Linking.openSettings();
    }
  };

  return {
    showPermissionDialog,
    setShowPermissionDialog,
    needsSettings,
    handlePermissionConfirm,
    requestMediaPermission,
  };
};
