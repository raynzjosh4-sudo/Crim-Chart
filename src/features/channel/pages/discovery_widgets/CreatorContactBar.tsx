import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { User, MessageSquare, UserPlus, CheckCircle2 } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

interface CreatorContactBarProps {
  creatorName: string;
  creatorImageUrl?: string;
  onMessageTap?: () => void;
  onFollowTap?: () => void;
  isOwnChannel?: boolean;
}

export const CreatorContactBar: React.FC<CreatorContactBarProps> = ({
  creatorName,
  creatorImageUrl,
  onMessageTap,
  onFollowTap,
  isOwnChannel = false,
}) => {
  return (
    <View style={styles.container}>
      {creatorImageUrl ? (
        <Image source={{ uri: creatorImageUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.fallbackAvatar]}>
          <User color="rgba(255,255,255,0.5)" size={24} />
        </View>
      )}

      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.nameText} numberOfLines={1}>
            {creatorName}
          </Text>
          <CheckCircle2 size={14} color="#1DA1F2" fill="#1DA1F2" />
        </View>
        <Text style={styles.roleText}>Channel Creator</Text>

        {!isOwnChannel && (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={onMessageTap}>
              <MessageSquare size={16} color={colors.primary} />
              <Text style={[styles.buttonText, styles.primaryButtonText]}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={onFollowTap}>
              <UserPlus size={16} color="#FFF" />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Follow</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  fallbackAvatar: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nameText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  roleText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  primaryButton: {
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButtonText: {
    color: colors.primary,
  },
  secondaryButtonText: {
    color: '#FFF',
  },
});
