import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { useNavigation } from '@react-navigation/native';
import { MoreVertical } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CrimChartFooter } from './CrimChartFooter';

interface MainfeedcardProps {
  data: CrimChartUserModel;
  isFeedView?: boolean;
}

export const Mainfeedcard: React.FC<MainfeedcardProps> = ({ data, isFeedView = true }) => {
  const navigation = useNavigation();
  const [isActive, setIsActive] = useState(Boolean(data.isActive));
  const [currentPoints, setCurrentPoints] = useState(data.channelCount ?? 0);

  const onChartTap = () => {
    setIsActive(!isActive);
    setCurrentPoints(isActive ? currentPoints - 1 : currentPoints + 1);
    // navigation.navigate('ChannelPage'); // TODO
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile', { userId: data.id })}
          activeOpacity={0.8}
        >
          <Image source={{ uri: data.profileImageUrl ?? '' }} style={styles.avatar} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.displayName}>{data.displayName}</Text>
          {data.bio ? (
            <Text style={styles.bio} numberOfLines={1}>👑 {data.bio}</Text>
          ) : null}
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <MoreVertical color="rgba(255,255,255,0.6)" size={20} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <TouchableOpacity
        activeOpacity={isFeedView ? 0.9 : 1}
        onPress={() => {
          if (isFeedView) {
            // navigation.navigate('CommonChartDetailsPage', { chart: data }); // TODO
          }
        }}
      >
        <View style={styles.contentWrapper}>
          <Image
            source={{ uri: data.profileImageUrl ?? '' }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        </View>
      </TouchableOpacity>

      {/* Footer */}
      <CrimChartFooter
        username={data.displayName}
        chartName={data.displayName}
        mutualCount={data.followersCount}
        isCharted={isActive}
        chartPoints={currentPoints}
        onChartTap={onChartTap}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1A1A1A' },
  headerInfo: { flex: 1 },
  displayName: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  bio: { color: '#FACD11', fontSize: 11, fontWeight: '600', marginTop: 2 },
  moreBtn: { padding: 4 },
  contentWrapper: { width: '100%', aspectRatio: 0.8, backgroundColor: '#1A1A1A' },
});

