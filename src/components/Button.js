import { useMemo } from 'react';
import { Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { Radii } from '../theme';

function getVariants(colors) {
  return {
    primary:   { bg: colors.mustard, color: colors.paper,  border: null },
    secondary: { bg: colors.sepia,   color: colors.paper2, border: null },
    ghost:     { bg: 'transparent',  color: colors.sepia,  border: colors.sepia },
    accent:    { bg: colors.terra,   color: colors.paper,  border: null },
  };
}

export function Button({ label, variant = 'primary', onPress, loading = false, style }) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const variants = useMemo(() => getVariants(colors), [colors]);
  const v = variants[variant] ?? variants.primary;

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
