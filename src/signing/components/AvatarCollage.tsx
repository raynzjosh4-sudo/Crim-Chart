import { Image, StyleSheet, View } from 'react-native';

export function AvatarCollage() {
  return (
    <View style={styles.canvas}>
      {/* Big — top left */}
      <View style={[styles.circle, styles.big, styles.p1]}>
        <Image source={require('@/assets/loginshorts/Screenshot 2026-06-25 173855.png')} style={styles.img} />
      </View>

      {/* Medium — top right, pressed against Big */}
      <View style={[styles.circle, styles.med, styles.p2]}>
        <Image source={require('@/assets/loginshorts/Screenshot 2026-06-25 174213.png')} style={styles.img} />
      </View>

      {/* Small — bottom center, nestled between the two above */}
      <View style={[styles.circle, styles.sm, styles.p3]}>
        <Image source={require('@/assets/loginshorts/HLc_CZYXgAAUSJL.jpg')} style={styles.img} />
      </View>

      {/* Extra Small — bottom left, nestled under Big */}
      <View style={[styles.circle, styles.xs, styles.p4]}>
        <Image source={require('@/assets/loginshorts/HLmlMIYWMAAdqQW.jpg')} style={styles.img} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: 440,
    height: 360,
    position: 'relative' as any,
  },
  circle: {
    position: 'absolute' as any,
    borderRadius: 9999,
    overflow: 'hidden' as any,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  big: { width: 240, height: 240 },
  med: { width: 190, height: 190 },
  sm:  { width: 130, height: 130 },
  xs:  { width: 90, height: 90 },
  img: { width: '100%' as any, height: '100%' as any },

  p1: { top: 0,   left: 0   },   // Big
  p2: { top: 25,  left: 228 },   // Medium
  p3: { top: 179, left: 176 },   // Small
  p4: { top: 210, left: 60  },   // Extra Small
});

