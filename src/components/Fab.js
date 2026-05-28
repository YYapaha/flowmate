import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Shadows } from '../theme';

export function Fab({ onPress }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(0);

  useEffect(() => {
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
    <Animated.View style={[
      styles.fab,
      { backgroundColor: colors.mustard, bottom: Math.max(24, insets.bottom + 16) },
      animStyle,
    ]}>
      <Pressable onPress={handlePress} style={styles.inner}>
        <Animated.Text style={[styles.plus, { color: colors.paper }]}>+</Animated.Text>
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
    lineHeight: 36,
    marginTop: -1,
  },
});
