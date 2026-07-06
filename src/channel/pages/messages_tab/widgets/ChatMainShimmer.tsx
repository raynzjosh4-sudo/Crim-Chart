import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { ShimmerEffect } from '../../widgets2/shimmer/ShimmerEffect';
export const ChatMainShimmer: React.FC = () => {
  const baseColor = 'rgba(255,255,255,0.05)';
  const AvatarRow = () => <View style={styles.avatarRow}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[1, 2, 3, 4, 5].map(key => <View key={key} style={styles.avatarItem}>
            <View style={[styles.avatarCircle, {
          backgroundColor: baseColor
        }]} />
            <View style={[styles.avatarText, {
          backgroundColor: baseColor
        }]} />
          </View>)}
      </ScrollView>
    </View>;
  const TextMessage = () => <View style={styles.messageRow}>
      <View style={[styles.messageAvatar, {
      backgroundColor: baseColor
    }]} />
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <View style={[styles.messageName, {
          backgroundColor: baseColor
        }]} />
          <View style={[styles.messageTime, {
          backgroundColor: baseColor
        }]} />
        </View>
        <View style={[styles.messageLine1, {
        backgroundColor: baseColor
      }]} />
        <View style={[styles.messageLine2, {
        backgroundColor: baseColor
      }]} />
      </View>
    </View>;
  const ImageMessage = () => <View style={styles.messageRow}>
      <View style={{
      width: 40,
      marginRight: 12
    }} />
      <View style={styles.imageGrid}>
        <View style={[styles.imageBlock, {
        backgroundColor: baseColor
      }]} />
        <View style={[styles.imageBlock, {
        backgroundColor: baseColor
      }]} />
      </View>
    </View>;
  const InputBar = () => {
    const styles = useStyles(colors => ({
      container: {
        flex: 1,
        backgroundColor: colors.background
      },
      avatarRow: {
        height: 100,
        paddingVertical: 10
      },
      avatarItem: {
        paddingHorizontal: 12,
        alignItems: 'center'
      },
      avatarCircle: {
        width: 55,
        height: 55,
        borderRadius: 27.5
      },
      avatarText: {
        width: 40,
        height: 8,
        borderRadius: 4,
        marginTop: 8
      },
      divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)'
      },
      chatList: {
        flex: 1
      },
      messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-start'
      },
      messageAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12
      },
      messageContent: {
        flex: 1
      },
      messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
      },
      messageName: {
        width: 80,
        height: 10,
        borderRadius: 4
      },
      messageTime: {
        width: 40,
        height: 8,
        borderRadius: 4
      },
      messageLine1: {
        width: '100%',
        height: 12,
        borderRadius: 4,
        marginBottom: 6
      },
      messageLine2: {
        width: 200,
        height: 12,
        borderRadius: 4
      },
      imageGrid: {
        flex: 1,
        flexDirection: 'row',
        gap: 8
      },
      imageBlock: {
        flex: 1,
        height: 200,
        borderRadius: 12
      },
      inputBar: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center'
      },
      inputIcon: {
        width: 40,
        height: 40,
        borderRadius: 8
      },
      inputField: {
        flex: 1,
        height: 45,
        borderRadius: 25,
        marginHorizontal: 12
      },
      inputCircle: {
        width: 40,
        height: 40,
        borderRadius: 20
      }
    }));
    return <View style={styles.inputBar}>
      <View style={[styles.inputIcon, {
        backgroundColor: baseColor
      }]} />
      <View style={[styles.inputField, {
        backgroundColor: baseColor
      }]} />
      <View style={[styles.inputCircle, {
        backgroundColor: baseColor
      }]} />
    </View>;
  };
  return <SafeAreaView style={styles.container}>
      <ShimmerEffect style={{
      flex: 1
    }}>
        <AvatarRow />
        <View style={styles.divider} />

        <ScrollView style={styles.chatList} contentContainerStyle={{
        padding: 16
      }}>
          <TextMessage />
          <View style={{
          height: 24
        }} />
          <TextMessage />
          <View style={{
          height: 24
        }} />
          <ImageMessage />
        </ScrollView>

        <InputBar />
      </ShimmerEffect>
    </SafeAreaView>;
};