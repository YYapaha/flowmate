import { useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity, FlatList, StyleSheet,
  Pressable,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Radii, Spacing, Shadows } from '../theme';
import { DRAWER_TAG_META } from './DrawerCard';

export function RangerModal({ visible, thought, drawers, onSelect, onCancel }) {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  if (!thought) return null;

  // Drawer whose tag matches the thought's tag appears first
  const sorted = [...drawers].sort((a, b) => {
    const aMatch = a.tag === thought.tag ? -1 : 0;
    const bMatch = b.tag === thought.tag ? -1 : 0;
    return aMatch - bMatch;
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <Pressable style={s.veil} onPress={onCancel}>
        <Pressable style={s.sheet} onPress={() => {}}>
          <View style={s.grip} />
          <Text style={s.title}>Ranger cette pensée</Text>
          <Text style={s.preview} numberOfLines={2}>
            « {thought.text} »
          </Text>

          <FlatList
            data={sorted}
            keyExtractor={d => d.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item: drawer }) => {
              const meta    = DRAWER_TAG_META[drawer.tag] ?? DRAWER_TAG_META['autre'];
              const isMatch = drawer.tag === thought.tag;
              return (
                <TouchableOpacity
                  style={[s.row, isMatch && s.rowMatch]}
                  onPress={() => onSelect(drawer.id)}
                  activeOpacity={0.7}
                >
                  <View style={[s.swatch, { backgroundColor: meta.bg }]} />
                  <Text style={s.drawerName}>{drawer.name}</Text>
                  {isMatch && (
                    <View style={[s.matchPill, { backgroundColor: meta.bg }]}>
                      <Text style={[s.matchPillText, { color: meta.fg }]}>suggéré</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />

          <TouchableOpacity style={s.cancel} onPress={onCancel}>
            <Text style={s.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    veil: {
      flex: 1,
      backgroundColor: 'rgba(62,58,53,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.paper,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: Spacing.lg,
      paddingBottom: Spacing.xl,
      ...Shadows.fab,
    },
    grip: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.line2,
      alignSelf: 'center',
      marginBottom: Spacing.md,
    },
    title: {
      fontFamily: 'Jost_500Medium',
      fontSize: 20,
      color: colors.sepia,
      marginBottom: 4,
    },
    preview: {
      fontFamily: 'Lora_400Regular_Italic',
      fontSize: 14,
      color: colors.sepia,
      opacity: 0.65,
      marginBottom: Spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.paper2,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: Radii.btn,
      padding: 14,
    },
    rowMatch: {
      borderColor: colors.mustard,
    },
    swatch: {
      width: 18,
      height: 18,
      borderRadius: 6,
    },
    drawerName: {
      flex: 1,
      fontFamily: 'DMSans_500Medium',
      fontSize: 15,
      color: colors.sepia,
    },
    matchPill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: Radii.pill,
    },
    matchPillText: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 11,
      letterSpacing: 0.3,
    },
    cancel: {
      marginTop: Spacing.sm,
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelText: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 14,
      color: colors.sepia,
      opacity: 0.6,
    },
  });
}
