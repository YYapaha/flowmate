import { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Tag } from './Tag';
import { KebabMenu } from './KebabMenu';
import { Colors, Radii, Shadows, Spacing } from '../theme';
import { formatRelativeTime } from '../utils/date';

const SWIPE_THRESHOLD = -90;

export function Card({ thought, onArchive }) {
  const [expanded, setExpanded] = useState(false);
  const translateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  const doArchive = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onArchive(thought.id);
  }, [onArchive, thought.id]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-8, 8])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = e.translationX;
        cardOpacity.value = Math.max(0.35, 1 + e.translationX / 160);
      }
    })
    .onEnd((e) => {
      if (e.translationX < SWIPE_THRESHOLD) {
        translateX.value = withTiming(-600, { duration: 240 });
        cardOpacity.value = withTiming(0, { duration: 240 }, (finished) => {
          if (finished) runOnJS(doArchive)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 14, stiffness: 200 });
        cardOpacity.value = withSpring(1);
      }
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: cardOpacity.value,
  }));

  const isLong = thought.text.length > 110;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animStyle]}>
        {/* Header row */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Tag label={thought.tag} />
            <Text style={styles.time}>{formatRelativeTime(thought.createdAt)}</Text>
          </View>
          <KebabMenu
            onExpand={() => setExpanded(v => !v)}
            onArchive={doArchive}
          />
        </View>

        {/* Body */}
        <Text style={styles.body} numberOfLines={expanded ? undefined : 3}>
          {thought.text}
        </Text>

        {/* Expand / collapse link */}
        {isLong && (
          <Text style={styles.expandLink} onPress={() => setExpanded(v => !v)}>
            {expanded ? 'Réduire' : 'Développer'}
          </Text>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.paper2,
    borderRadius: Radii.card,
    padding: Spacing.lg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 10,
    ...Shadows.soft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  time: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.sepia,
    opacity: 0.5,
    letterSpacing: 0.2,
  },
  body: {
    fontFamily: 'Lora_400Regular',
    fontSize: 16,
    lineHeight: 25,
    color: Colors.sepia,
  },
  expandLink: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Colors.terra,
    marginTop: -4,
  },
});
