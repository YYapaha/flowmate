import { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useThoughts } from '../hooks/useThoughts';
import { Tag } from '../components/Tag';
import { DrawerCard } from '../components/DrawerCard';
import { DrawerModal } from '../components/DrawerModal';
import { RangerModal } from '../components/RangerModal';
import { Radii, Spacing, Shadows } from '../theme';
import { formatRelativeTime } from '../utils/date';

// ─── Bureau thought card ───────────────────────────────────────────────────────
function BureauCard({ thought, onGripLongPress, colors }) {
  const s = bureauStyles(colors);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onGripLongPress(thought);
  }, [thought, onGripLongPress]);

  return (
    <View style={s.card}>
      {/* Grip — long press to move to a drawer */}
      <Pressable
        onLongPress={handleLongPress}
        delayLongPress={350}
        hitSlop={12}
      >
        {({ pressed }) => (
          <View style={[s.grip, { opacity: pressed ? 0.85 : 0.35 }]}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={[s.dot, { backgroundColor: colors.sepia }]} />
            ))}
          </View>
        )}
      </Pressable>

      <View style={s.body}>
        <Text style={s.text} numberOfLines={4}>{thought.text}</Text>
        <View style={s.footer}>
          <Tag label={thought.tag} />
          <Text style={s.time}>{formatRelativeTime(thought.createdAt)}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── AtelierScreen ────────────────────────────────────────────────────────────
export default function AtelierScreen() {
  const { colors } = useTheme();
  const {
    thoughts, drawers, loaded,
    createDrawer, updateDrawer, deleteDrawer,
    moveThoughtToDrawer, moveThoughtToBureau,
  } = useThoughts();

  const s = makeStyles(colors);

  // ── State ──────────────────────────────────────────────────────────────────
  const [openDrawerId,   setOpenDrawerId]   = useState(null);
  const [drawerModal,    setDrawerModal]    = useState({ visible: false, drawer: null });
  const [rangerModal,    setRangerModal]    = useState({ visible: false, thought: null });

  // ── Derived data ───────────────────────────────────────────────────────────
  const activeThoughts = useMemo(
    () => thoughts.filter(t => !t.archived),
    [thoughts],
  );

  const bureauThoughts = useMemo(
    () => activeThoughts.filter(t => !t.drawerId),
    [activeThoughts],
  );

  const thoughtsByDrawer = useMemo(() => {
    const map = {};
    drawers.forEach(d => { map[d.id] = []; });
    activeThoughts.forEach(t => {
      if (t.drawerId && map[t.drawerId]) map[t.drawerId].push(t);
    });
    return map;
  }, [activeThoughts, drawers]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleToggleDrawer = useCallback((id) => {
    setOpenDrawerId(prev => (prev === id ? null : id));
  }, []);

  const handleRanger = useCallback((thought) => {
    setRangerModal({ visible: true, thought });
  }, []);

  const handleRangerSelect = useCallback((drawerId) => {
    moveThoughtToDrawer(rangerModal.thought.id, drawerId);
    setRangerModal({ visible: false, thought: null });
  }, [rangerModal.thought, moveThoughtToDrawer]);

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

  // ── Two-column grid helper ─────────────────────────────────────────────────
  const drawerRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < drawers.length; i += 2) rows.push(drawers.slice(i, i + 2));
    return rows;
  }, [drawers]);

  if (!loaded) return null;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.paper }]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={s.header}>
          <Text style={s.eyebrow}>Atelier</Text>
          <Text style={s.title}>Range tes pensées.</Text>
          <Text style={s.sub}>
            Déplace une note du Bureau vers un tiroir. Ce qui reste ici y reste tant que tu veux.
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
              <BureauCard
                key={t.id}
                thought={t}
                onGripLongPress={handleRanger}
                colors={colors}
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
                <View key={drawer.id} style={s.drawerCell}>
                  <DrawerCard
                    drawer={drawer}
                    thoughts={thoughtsByDrawer[drawer.id] ?? []}
                    isOpen={openDrawerId === drawer.id}
                    onToggle={() => handleToggleDrawer(drawer.id)}
                    onEdit={() => setDrawerModal({ visible: true, drawer })}
                    onDelete={() => handleDeleteDrawer(drawer.id)}
                    onMoveBack={moveThoughtToBureau}
                  />
                </View>
              ))}
              {/* Placeholder if odd number of drawers */}
              {row.length === 1 && <View style={s.drawerCell} />}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <RangerModal
        visible={rangerModal.visible}
        thought={rangerModal.thought}
        drawers={drawers}
        onSelect={handleRangerSelect}
        onCancel={() => setRangerModal({ visible: false, thought: null })}
      />

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
      borderRadius: 22,
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

// ─── Bureau card styles (separate fn for clarity) ─────────────────────────────
function bureauStyles(colors) {
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
    grip: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: 14,
      gap: 3,
      marginTop: 3,
      opacity: 0.35,
    },
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
  });
}
