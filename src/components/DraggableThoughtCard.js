import { useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { Tag } from './Tag';
import { Radii, Shadows } from '../theme';
import { formatRelativeTime } from '../utils/date';

// A bureau card that can be long-pressed (300 ms) and dragged to a DrawerCard.
// dragX / dragY are Reanimated shared values owned by AtelierScreen.
// The gesture writes to them on the UI thread so the FloatingCard animation
// is always 60 fps, independent of the JS thread.
export function DraggableThoughtCard({
  thought,
  isDragging,
  dragX,
  dragY,
  onDragStart, // (thoughtId: string) => void
  onDragMove,  // (absX: number, absY: number) => void
  onDragEnd,   // (absX: number, absY: number) => void
}) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  // Keep a ref to the latest callbacks so the gesture (created once via useMemo)
  // always invokes the current handler without being recreated during drag.
  const startRef = useRef(onDragStart);
  startRef.current = onDragStart;
  const moveRef = useRef(onDragMove);
  moveRef.current = onDragMove;
  const endRef = useRef(onDragEnd);
  endRef.current = onDragEnd;

  const callStart   = useCallback((id) => startRef.current(id),   []);
  const callMove    = useCallback((x, y) => moveRef.current(x, y), []);
  const callEnd     = useCallback((x, y) => endRef.current(x, y), []);
  const callHaptic  = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, []);

  // Created once — deps are all stable references.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const gesture = useMemo(() =>
    Gesture.Pan()
      .activateAfterLongPress(300)
      .onStart((e) => {
        dragX.value = e.absoluteX;
        dragY.value = e.absoluteY;
        runOnJS(callHaptic)();
        runOnJS(callStart)(thought.id);
      })
      .onUpdate((e) => {
        dragX.value = e.absoluteX;
        dragY.value = e.absoluteY;
        runOnJS(callMove)(e.absoluteX, e.absoluteY);
      })
      .onEnd((e) => {
        runOnJS(callEnd)(e.absoluteX, e.absoluteY);
      }),
  []);

  return (
    <GestureDetector gesture={gesture}>
      <View style={[s.card, isDragging && s.placeholder]}>
        {/* Grip dots */}
        <View style={[s.grip, isDragging && s.gripDimmed]}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={[s.dot, { backgroundColor: colors.sepia }]} />
          ))}
        </View>

        {/* Card body: ghost lines while dragging, real content otherwise */}
        {isDragging ? (
          <View style={s.body}>
            <View style={s.ghostLine} />
            <View style={[s.ghostLine, { width: '55%' }]} />
          </View>
        ) : (
          <View style={s.body}>
            <Text style={s.text} numberOfLines={4}>{thought.text}</Text>
            <View style={s.footer}>
              <Tag label={thought.tag} />
              <Text style={s.time}>{formatRelativeTime(thought.createdAt)}</Text>
            </View>
          </View>
        )}
      </View>
    </GestureDetector>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.paper,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: Radii.card,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      ...Shadows.soft,
    },
    placeholder: {
      opacity: 0.35,
      backgroundColor: colors.paper2,
    },
    grip: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: 14,
      gap: 3,
      marginTop: 3,
      opacity: 0.35,
    },
    gripDimmed: { opacity: 0.1 },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
    },
    body: { flex: 1 },
    text: {
      fontFamily: 'Lora_400Regular',
      fontSize: 15,
      lineHeight: 22,
      color: colors.sepia,
      marginBottom: 10,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    time: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 11,
      color: colors.sepia,
      opacity: 0.5,
    },
    ghostLine: {
      height: 11,
      backgroundColor: colors.line,
      borderRadius: 6,
      marginBottom: 8,
      width: '85%',
    },
  });
}
