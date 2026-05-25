import { Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Radii } from '../theme';

const VARIANTS = {
  primary:   { bg: Colors.mustard, color: Colors.paper, border: null },
  secondary: { bg: Colors.sepia,   color: Colors.paper, border: null },
  ghost:     { bg: 'transparent',  color: Colors.sepia, border: Colors.sepia },
  accent:    { bg: Colors.terra,   color: Colors.paper, border: null },
};

export function Button({ label, variant = 'primary', onPress, loading = false, style }) {
  const scale = useSharedValue(1);
  const v = VARIANTS[variant] ?? VARIANTS.primary;

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = async () => {
    scale.value = withSpring(0.96, { damping: 10, stiffness: 400 });
    setTimeout(() => { scale.value = withSpring(1, { damping: 10, stiffness: 400 }); }, 130);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable onPress={handlePress} style={style}>
      <Animated.View
        style={[
          styles.base,
          { backgroundColor: v.bg },
          v.border && { borderWidth: 1.5, borderColor: v.border },
          animStyle,
        ]}
      >
        {loading
          ? <ActivityIndicator color={v.color} size="small" />
          : <Text style={[styles.label, { color: v.color }]}>{label}</Text>
        }
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: Radii.btn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    letterSpacing: 0.15,
  },
});
