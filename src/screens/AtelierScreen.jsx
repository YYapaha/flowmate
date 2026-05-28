import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useThoughts } from '../hooks/useThoughts';
import { Tag } from '../components/Tag';
import { DraggableThoughtCard } from '../components/DraggableThoughtCard';
import { DrawerCard } from '../components/DrawerCard';
import { DrawerModal } from '../components/DrawerModal';
import { Radii, Spacing, Shadows } from '../theme';

// Width of the floating drag card — matches bureau card width (screen − content padding)
const SCREEN_W = Dimensions.get('window').width;
const FLOAT_W  = SCREEN_W - Spacing.lg * 2 - 28; // 28 = bureau inner padding × 2

// ─── Floating drag card (rendered above everything) ───────────────────────────
function FloatingCard({ thought, dragX, dragY, safeTop }) {
  const { colors } = useTheme();
  const s = useMemo(() => floatStyles(colors), [colors]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dragX.value - FLOAT_W / 2 },
      // absoluteY is from screen top; subtract safe area to get position within SafeAreaView
      { translateY: dragY.value - safeTop.value - 55 },
      { scale: 1.05 },
    ],
  }));

  return (
    <Animated.View style={[s.card, animStyle]} pointerEvents="none">
      <View style={s.grip}>
        {[...Array(6)].map((_, i) => (
          <View key={i} style={[s.dot, { backgroundColor: colors.sepia }]} />
        ))}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.text} numberOfLines={3}>{thought.text}</Text>
        <Tag label={thought.tag} />
      </View>
    </Animated.View>
  );
}

// ─── AtelierScreen ────────────────────────────────────────────────────────────
export default function AtelierScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    thoughts, drawers, loaded,
    createDrawer, updateDrawer, deleteDrawer,
    moveThoughtToDrawer, moveThoughtToBureau,
  } = useThoughts();

  const s = makeStyles(colors);

  // ── Drag state ────────────────────────────────────────────────────────────
  // Shared values updated on UI thread during pan (smooth 60 fps animation)
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  // Safe area top offset for FloatingCard positioning
  const safeTop = useSharedValue(insets.top);
  useEffect(() => { safeTop.value = insets.top; }, [insets.top]);

  // JS state: currently dragged thought (null = no drag in progress)
  const [dragging, setDragging] = useState(null);
  // JS state: drawer currently hovered by the drag finger
  const [hoveredDrawerId, setHoveredDrawerId] = useState(null);

  // Refs so stable callbacks can always access current values
  const draggingRef        = useRef(null);
  const drawerRefs         = useRef({});   // { drawerId: View ref }
  const drawerLayoutsRef   = useRef({});   // { drawerId: { x, y, width, height } }
  const bureauThoughtsRef  = useRef([]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const activeThoughts = useMemo(
    () => thoughts.filter(t => !t.archived),
    [thoughts],
  );

  const bureauThoughts = useMemo(
    () => activeThoughts.filter(t => !t.drawerId),
    [activeThoughts],
  );

  // Keep ref in sync (used by stable drag handlers)
  bureauThoughtsRef.current = bureauThoughts;

  const thoughtsByDrawer = useMemo(() => {
    const map = {};
    drawers.forEach(d => { map[d.id] = []; });
    activeThoughts.forEach(t => {
      if (t.drawerId && map[t.drawerId]) map[t.drawerId].push(t);
    });
    return map;
  }, [activeThoughts, drawers]);

  // ── Drawer grid helper ────────────────────────────────────────────────────
  const drawerRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < drawers.length; i += 2) rows.push(drawers.slice(i, i + 2));
    return rows;
  }, [drawers]);

  // ── Drawer state ──────────────────────────────────────────────────────────
  const [openDrawerId, setOpenDrawerId]  = useState(null);
  const [drawerModal,  setDrawerModal]   = useState({ visible: false, drawer: null });

  const handleToggleDrawer = useCallback((id) => {
    setOpenDrawerId(prev => (prev === id ? null : id));
  }, []);

  const handleSaveDrawer = useCallback(({ name, tag }) => {
    if (drawerModal.drawer) {
      updateDrawer(drawerModal.drawer.id, { name, tag });
    } else {
      createDrawer(name, tag);
    }
    setDrawerModal({ visible: false, drawer: null });
  }, [drawerModal.drawer, createDrawer, updateDrawer]);

  const handleDeleteDrawer = useCallback((drawerId) => {
    deleteDrawer(drawerId);
    if (openDrawerId === drawerId) setOpenDrawerId(null);
  }, [deleteDrawer, openDrawerId]);

  // ── Drag handlers (stable — use refs internally) ──────────────────────────

  // Called from DraggableThoughtCard gesture (via runOnJS) when long press fires.
  // Measures all drawer positions, then activates the drag.
  const handleDragStart = useCallback((thoughtId) => {
    const thought = bureauThoughtsRef.current.find(t => t.id === thoughtId);
    if (!thought) return;

    const drawerIds = Object.keys(drawerRefs.current);
    const layouts   = {};
    let pending     = drawerIds.length;

    const activate = () => {
      drawerLayoutsRef.current = layouts;
      draggingRef.current      = thought;
      setDragging(thought);
    };

    if (pending === 0) { activate(); return; }

    drawerIds.forEach(drawerId => {
      const ref = drawerRefs.current[drawerId];
      if (!ref) { if (--pending === 0) activate(); return; }
      ref.measureInWindow((x, y, w, h) => {
        layouts[drawerId] = { x, y, width: w, height: h };
        if (--pending === 0) activate();
      });
    });
  }, []);

  // Called on every pan update — checks which drawer (if any) the finger is over.
  const handleDragMove = useCallback((absX, absY) => {
    const layouts = drawerLayoutsRef.current;
    let hovered = null;
    for (const [id, l] of Object.entries(layouts)) {
      if (absX >= l.x && absX <= l.x + l.width &&
          absY >= l.y && absY <= l.y + l.height) {
        hovered = id;
        break;
      }
    }
    setHoveredDrawerId(prev => (prev === hovered ? prev : hovered));
  }, []);

  // Called when the finger is released.
  const handleDragEnd = useCallback((absX, absY) => {
    const thought = draggingRef.current;
    if (thought) {
      const layouts = drawerLayoutsRef.current;
      let targetDrawerId = null;
      for (const [id, l] of Object.entries(layouts)) {
        if (absX >= l.x && absX <= l.x + l.width &&
            absY >= l.y && absY <= l.y + l.height) {
          targetDrawerId = id;
          break;
        }
      }
      if (targetDrawerId) {
        moveThoughtToDrawer(thought.id, targetDrawerId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    }
    draggingRef.current = null;
    setDragging(null);
    setHoveredDrawerId(null);
  }, [moveThoughtToDrawer]);

  if (!loaded) return null;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.paper }]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!dragging}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={s.header}>
          <Text style={s.eyebrow}>Atelier</Text>
          <Text style={s.title}>Range tes pensées.</Text>
          <Text style={s.sub}>
            Maintiens le grip d'une note et glisse-la dans un tiroir.
          </Text>
        </View>

        {/* ── Bureau ──────────────────────────────────────────────────── */}
        <View style={s.sectionHead}>
          <View style={s.sectionTitleRow}>
            <Text style={s.sectionTitle}>Bureau</Text>
            <View style={s.countPill}>
              <Text style={s.countPillText}>{bureauThoughts.length}</Text>
            </View>
          </View>
          <Text style={s.sectionHint}>Notes non classées.</Text>
        </View>

        <View style={[s.bureau, { backgroundColor: colors.paper2, borderColor: colors.line }]}>
          {bureauThoughts.length === 0 ? (
            <View style={[s.bureauEmpty, { borderColor: colors.line2 }]}>
              <Text style={[s.bureauEmptyText, { color: colors.sepia }]}>
                Bureau vide. Tout est rangé.
              </Text>
            </View>
          ) : (
            bureauThoughts.map(t => (
              <DraggableThoughtCard
                key={t.id}
                thought={t}
                isDragging={dragging?.id === t.id}
                dragX={dragX}
                dragY={dragY}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
              />
            ))
          )}
        </View>

        {/* ── Tiroirs ─────────────────────────────────────────────────── */}
        <View style={s.sectionHead}>
          <View style={s.sectionTitleRow}>
            <Text style={s.sectionTitle}>Tiroirs</Text>
            <View style={s.countPill}>
              <Text style={s.countPillText}>{drawers.length}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[s.addBtn, { borderColor: colors.line2 }]}
            onPress={() => setDrawerModal({ visible: true, drawer: null })}
            activeOpacity={0.7}
          >
            <Text style={[s.addBtnText, { color: colors.sepia }]}>+ Nouveau tiroir</Text>
          </TouchableOpacity>
        </View>

        <View style={s.drawersGrid}>
          {drawerRows.map((row, rowIdx) => (
            <View key={rowIdx} style={s.drawerRow}>
              {row.map(drawer => (
                <View
                  key={drawer.id}
                  style={s.drawerCell}
                  ref={(r) => {
                    if (r) drawerRefs.current[drawer.id] = r;
                    else delete drawerRefs.current[drawer.id];
                  }}
                >
                  <DrawerCard
                    drawer={drawer}
                    thoughts={thoughtsByDrawer[drawer.id] ?? []}
                    isOpen={openDrawerId === drawer.id}
                    isDropTarget={hoveredDrawerId === drawer.id}
                    onToggle={() => handleToggleDrawer(drawer.id)}
                    onEdit={() => setDrawerModal({ visible: true, drawer })}
                    onDelete={() => handleDeleteDrawer(drawer.id)}
                    onMoveBack={moveThoughtToBureau}
                  />
                </View>
              ))}
              {row.length === 1 && <View style={s.drawerCell} />}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── Floating drag card (above everything, follows the finger) ── */}
      {dragging && (
        <FloatingCard
          thought={dragging}
          dragX={dragX}
          dragY={dragY}
          safeTop={safeTop}
        />
      )}

      {/* ── Drawer edit modal ──────────────────────────────────────────── */}
      <DrawerModal
        visible={drawerModal.visible}
        drawer={drawerModal.drawer}
        onSave={handleSaveDrawer}
        onCancel={() => setDrawerModal({ visible: false, drawer: null })}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(colors) {
  return StyleSheet.create({
    root: { flex: 1 },
    scroll: { flex: 1 },
    content: { padding: Spacing.lg, paddingBottom: 80 },

    header: { marginBottom: 36 },
    eyebrow: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 11,
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      color: colors.terra,
      marginBottom: 8,
    },
    title: {
      fontFamily: 'Jost_600SemiBold',
      fontSize: 32,
      letterSpacing: -0.5,
      color: colors.sepia,
      marginBottom: 6,
    },
    sub: {
      fontFamily: 'Lora_400Regular',
      fontSize: 15,
      lineHeight: 23,
      color: colors.sepia,
      opacity: 0.65,
    },

    sectionHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    sectionTitle: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 12,
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      color: colors.sepia,
    },
    countPill: {
      backgroundColor: colors.paper2,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: Radii.pill,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    countPillText: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 11,
      color: colors.sepia,
      opacity: 0.6,
    },
    sectionHint: {
      fontFamily: 'Lora_400Regular_Italic',
      fontSize: 13,
      color: colors.sepia,
      opacity: 0.55,
    },

    // Bureau
    bureau: {
      borderRadius: Radii.card,
      borderWidth: 1,
      padding: 14,
      gap: 10,
      marginBottom: 36,
    },
    bureauEmpty: {
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderRadius: Radii.card,
      padding: 36,
      alignItems: 'center',
    },
    bureauEmptyText: {
      fontFamily: 'Lora_400Regular_Italic',
      fontSize: 15,
      opacity: 0.5,
    },

    // Drawers grid
    drawersGrid: { gap: 14 },
    drawerRow: {
      flexDirection: 'row',
      gap: 14,
      alignItems: 'flex-start',
    },
    drawerCell: { flex: 1 },

    // Add button
    addBtn: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: Radii.pill,
      borderWidth: 1,
    },
    addBtnText: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 13,
    },
  });
}

// ─── FloatingCard styles ──────────────────────────────────────────────────────

function floatStyles(colors) {
  return StyleSheet.create({
    card: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: FLOAT_W,
      backgroundColor: colors.paper,
      borderWidth: 1.5,
      borderColor: colors.mustard,
      borderRadius: Radii.card,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      ...Shadows.soft,
      zIndex: 1000,
    },
    grip: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: 14,
      gap: 3,
      marginTop: 3,
      opacity: 0.6,
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
    },
    text: {
      fontFamily: 'Lora_400Regular',
      fontSize: 15,
      lineHeight: 22,
      color: colors.sepia,
      marginBottom: 8,
    },
  });
}
