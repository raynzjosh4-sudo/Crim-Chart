import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { StoreItem } from '../../data/dummyStoreBoxData';
import { LikeAction } from '@/channel/CRimChartMassageBubble/comment_action/like/LikeAction';
import { CommentActionWidget } from '@/channel/CRimChartMassageBubble/comments/CommentActionWidget';
import UserAvatar from '@/components/avatar/UserAvatar';

interface Props {
  item: StoreItem;
}

const { width } = Dimensions.get('window');

export function StoreItemTile({ item }: Props) {
  return (
    <View style={styles.container}>
      {/* Seller Header */}
      <View style={styles.header}>
        <UserAvatar 
          userId={item.seller.id}
          fallbackUrl={item.seller.avatarUrl}
          name={item.seller.name}
          size={36}
        />
        <View style={styles.headerText}>
          <Text style={styles.sellerName}>{item.seller.name}</Text>
          <Text style={styles.conditionTextHeader}>{item.condition}</Text>
        </View>
      </View>

      {/* Image */}
      <Image source={{ uri: item.mediaUrl }} style={styles.image} contentFit="cover" />

      {/* Info & Action Section */}
      <View style={styles.infoContainer}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.priceText}>{item.currency}{item.price.toLocaleString()}</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        
        {/* Interaction Bar */}
        <View style={styles.actionBar}>
          <LikeAction initialLikesCount={item.likes} initialIsLiked={false} />
          <CommentActionWidget commentsCount={item.commentsCount} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  headerText: {
    marginLeft: 10,
  },
  sellerName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  conditionTextHeader: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  image: {
    width: width,
    height: width, // Square full width
  },
  infoContainer: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 12,
  },
  priceText: {
    color: '#4ADE80',
    fontSize: 20,
    fontWeight: '900',
  },
  description: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
