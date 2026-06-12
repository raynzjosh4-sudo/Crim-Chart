import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ShimmerEffect } from './ShimmerEffect';

export const MemberShimmer: React.FC = () => {
  const baseColor = 'rgba(255,255,255,0.15)'; // Equivalent to onSurface with opacity

  const SectionHeader = () => (
    <View style={[styles.sectionHeader, { backgroundColor: baseColor }]} />
  );

  const MemberItemShimmer = () => (
    <View style={styles.memberItem}>
      <View style={[styles.avatar, { backgroundColor: baseColor }]} />
      <View style={styles.memberInfo}>
        <View style={[styles.memberName, { backgroundColor: baseColor }]} />
        <View style={[styles.memberRole, { backgroundColor: baseColor }]} />
      </View>
      <View style={[styles.actionButton, { backgroundColor: baseColor }]} />
    </View>
  );

  return (
    <ShimmerEffect>
      <View style={styles.container}>
        {/* --- Status Section --- */}
        <View style={styles.statusHeaderPadding}>
          <SectionHeader />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          style={styles.scrollContainer}
        >
          {[1, 2, 3, 4].map((key) => (
            <View
              key={key}
              style={[styles.statusCard, { backgroundColor: baseColor }]}
            />
          ))}
        </ScrollView>

        {/* --- Members Section Header --- */}
        <View style={styles.membersHeader}>
          <SectionHeader />
          <View style={[styles.membersCount, { backgroundColor: baseColor }]} />
        </View>

        {/* --- Member Items --- */}
        <View style={styles.membersList}>
          {[1, 2, 3, 4, 5].map((key) => (
            <MemberItemShimmer key={key} />
          ))}
        </View>
      </View>
    </ShimmerEffect>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statusHeaderPadding: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    width: 100,
    height: 24,
    borderRadius: 4,
  },
  scrollContainer: {
    height: 160,
    maxHeight: 160,
  },
  horizontalList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  statusCard: {
    width: 100,
    height: '100%',
    borderRadius: 16,
  },
  membersHeader: {
    paddingHorizontal: 16,
    marginTop: 32,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  membersCount: {
    width: 60,
    height: 20,
    borderRadius: 4,
  },
  membersList: {
    paddingHorizontal: 16,
    width: '100%',
  },
  memberItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  memberName: {
    width: 120,
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  memberRole: {
    width: 80,
    height: 12,
    borderRadius: 4,
  },
  actionButton: {
    width: 64,
    height: 30,
    borderRadius: 15,
  },
});
