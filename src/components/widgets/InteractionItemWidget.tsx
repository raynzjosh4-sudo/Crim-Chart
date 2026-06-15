import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tag, Heart, Music, Eye, Share, Activity, Star } from 'lucide-react-native';

interface InteractionItemWidgetProps {
  interactionType: string;
  timestamp: string; // ISO string or relative time
  details?: string;  // e.g. "Tagged a track", "Liked a post"
}

export const InteractionItemWidget: React.FC<InteractionItemWidgetProps> = ({ 
  interactionType, 
  timestamp, 
  details 
}) => {
  
  // Helper to map type to colors/icons
  const getInteractionConfig = (type: string) => {
    switch(type.toLowerCase()) {
      case 'tag':
        return { icon: <Tag size={20} color="#FFF" />, bgColor: '#FF9800', title: 'Tag' };
      case 'like':
        return { icon: <Heart size={20} color="#FFF" />, bgColor: '#F44336', title: 'Like' };
      case 'post':
        return { icon: <Music size={20} color="#FFF" />, bgColor: '#4CAF50', title: 'Post' };
      case 'view':
        return { icon: <Eye size={20} color="#FFF" />, bgColor: '#2196F3', title: 'View' };
      case 'share':
        return { icon: <Share size={20} color="#FFF" />, bgColor: '#9C27B0', title: 'Share' };
      case 'favorite':
        return { icon: <Star size={20} color="#FFF" />, bgColor: '#FFC107', title: 'Favorite' };
      default:
        return { icon: <Activity size={20} color="#FFF" />, bgColor: '#607D8B', title: 'Interaction' };
    }
  };

  const config = getInteractionConfig(interactionType);

  // Format date helper (super simple for now)
  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
        {config.icon}
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.titleText}>{details || config.title}</Text>
        <Text style={styles.timeText}>{formatDate(timestamp)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  }
});
