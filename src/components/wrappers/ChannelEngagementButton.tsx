import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

export enum EngagementUiState {
  Creator,
  OpenNotJoined,
  RestrictedNotRequested,
  Requested,
  FullyJoined,
  Processing,
}

interface ChannelEngagementButtonProps {
  uiState: EngagementUiState;
  onTap: () => void;
}

export const ChannelEngagementButton: React.FC<ChannelEngagementButtonProps> = ({ uiState, onTap }) => {
  const { colors } = useTheme();
  
  if (uiState === EngagementUiState.Creator) return null;

  const isFollowed = uiState === EngagementUiState.FullyJoined;

  const getButtonText = () => {
    switch (uiState) {
      case EngagementUiState.OpenNotJoined: return 'Follow';
      case EngagementUiState.RestrictedNotRequested: return 'Request';
      case EngagementUiState.Requested: return 'Requested';
      case EngagementUiState.FullyJoined: return 'Following';
      default: return '';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={uiState === EngagementUiState.Processing}
      onPress={(e) => {
        e?.stopPropagation?.();
        onTap();
      }}
      style={[
        styles.container,
        {
          backgroundColor: isFollowed ? 'rgba(255,255,255,0.1)' : '#202020',
          borderColor: isFollowed ? 'rgba(255,255,255,0.05)' : '#333333',
        }
      ]}
    >
      {uiState === EngagementUiState.Processing ? (
        <ActivityIndicator size="small" color="white" style={{ width: 14, height: 14 }} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: isFollowed ? 'rgba(255,255,255,0.7)' : '#FACD11' }
          ]}
        >
          {getButtonText()}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.1,
  },
});
