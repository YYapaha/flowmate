import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Shadows } from '../theme';

export function Fab({ onPress }) {
  const scale = useSharedValue(0);

  useEffect(() => {
    // Pop in on mount
    scale.value = withSpring(1, { damping: 12, stiffness: 180 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = async () => {
    scale.value = withSpring(0.88, { damping: 8, stiffness: 350 });
    setTimeout(() => { scale.value = withSpring(1, { damping: 8, stiffness: 350 }); }, 140);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  return (
    <Animated.View style={[styles.fab, animStyle]}>
      <Pressable onPress={handlePress} style={styles.inner}>
        <Animated.Text style={styles.plus}>+</Animated.Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.mustard,
    ...Shadows.fab,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  plus: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 30,
    color: Colors.paper,
    lineHeight: 36,
    marginTop: -1,
  },
});
