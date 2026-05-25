import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
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
import { StepItem } from './StepItem';
import { Colors, Radii, Shadows, Spacing } from '../theme';
import { formatRelativeTime } from '../utils/date';
import { decomposeThought } from '../services/api';

const SWIPE_THRESHOLD = -90;

export function Card({ thought, onArchive, onUpdateSteps }) {
  const [expanded, setExpanded] = useState(false);
  const [decomposing, setDecomposing] = useState(false);
  const [steps, setSteps] = useState(
    thought.steps ? thought.steps.map(s => (typeof s === 'string' ? { label: s, done: false } : s)) : null
  );

  const translateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  const doArchive = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onArchive(thought.id);
  }, [onArchive, thought.id]);

  const handleDecompose = useCallback(async () => {
    if (decomposing) return;
    setDecomposing(true);
    try {
      const raw = await decomposeThought(thought.text);
      const newSteps = raw.map(label => ({ label, done: false }));
      setSteps(newSteps);
      onUpdateSteps?.(thought.id, newSteps);
    } catch {
      // silent fail
    } finally {
      setDecomposing(false);
    }
  }, [decomposing, thought.text, thought.id, onUpdateSteps]);

  const toggleStep = useCallback((index) => {
    setSteps(prev => {
      const next = prev.map((s, i) => i === index ? { ...s, done: !s.done } : s);
      onUpdateSteps?.(thought.id, next);
      return next;
    });
  }, [thought.id, onUpdateSteps]);

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
  const isTache = thought.tag === 'tâche';

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

        {/* Steps list */}
        {steps && steps.length > 0 && (
          <View style={styles.steps}>
            {steps.map((s, i) => (
              <StepItem key={i} label={s.label} done={s.done} onToggle={() => toggleStep(i)} />
            ))}
          </View>
        )}

        {/* Décomposer button — only for tâche */}
        {isTache && !steps && (
          <Pressable onPress={handleDecompose} style={styles.decomposeBtn} disabled={decomposing}>
            {decomposing
              ? <ActivityIndicator size="small" color={Colors.mustard} />
              : <Text style={styles.decomposeBtnLabel}>Décomposer →</Text>
            }
          </Pressable>
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
  steps: {
    gap: 2,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  decomposeBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.mustard,
    minWidth: 44,
    alignItems: 'center',
  },
  decomposeBtnLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Colors.mustard,
    letterSpacing: 0.3,
  },
});
