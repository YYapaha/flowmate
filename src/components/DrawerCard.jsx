import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { lightPalette, Radii, Spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { formatRelativeTime } from '../utils/date';

// ─── Tag → visual mapping (exported for RangerModal + DrawerModal) ────────────
export const DRAWER_TAG_META = {
  travail:      { bg: '#C8D4DF', darkBg: '#1F2A32', fg: '#2D4154' },
  idée:         { bg: '#E8D49F', darkBg: '#2A2000', fg: '#6A4A05' },
  achat:        { bg: '#D9E0D5', darkBg: '#1E2620', fg: '#3A4A36' },
  santé:        { bg: '#ECC4AC', darkBg: '#3A1A0A', fg: '#6E3614' },
  tâche:        { bg: '#D9E0D5', darkBg: '#1E2620', fg: '#3A4A36' },
  rappel:       { bg: '#C8D4DF', darkBg: '#1F2A32', fg: '#2D4154' },
  'rendez-vous':{ bg: '#C8D4DF', darkBg: '#1F2A32', fg: '#2D4154' },
  émotion:      { bg: '#ECC4AC', darkBg: '#3A1A0A', fg: '#6E3614' },
  routine:      { bg: '#D9E0D5', darkBg: '#1E2620', fg: '#3A4A36' },
  autre:        { bg: '#D9E0D5', darkBg: '#1E2620', fg: '#3A4A36' },
};

// ─── Chevron icon (pure View) ─────────────────────────────────────────────────
function Chevron({ color }) {
  return (
    <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: 9, height: 9,
        borderBottomWidth: 2, borderRightWidth: 2,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        marginTop: -4,
      }} />
    </View>
  );
}

// ─── Thought row inside drawer ────────────────────────────────────────────────
function DrawerThoughtRow({ thought, colors, onMoveBack }) {
  const s = rowStyles(colors);
  return (
    <View style={s.row}>
      <Text style={s.text} numberOfLines={3}>{thought.text}</Text>
      <View style={s.rowRight}>
        <Text style={s.when}>{formatRelativeTime(thought.createdAt)}</Text>
        <TouchableOpacity onPress={() => onMoveBack(thought.id)} hitSlop={8}>
          <Text style={s.back}>↩</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── DrawerCard ───────────────────────────────────────────────────────────────
export function DrawerCard({ drawer, thoughts, isOpen, onToggle, onEdit, onDelete, onMoveBack, isDropTarget = false }) {
  const { colors, isDark } = useTheme();
  const s = makeStyles(colors);

  const meta     = DRAWER_TAG_META[drawer.tag] ?? DRAWER_TAG_META['autre'];
  const faceBg   = isDark ? meta.darkBg : meta.bg;
  const count    = thoughts.length;

  // ── Animation ──────────────────────────────────────────────────────────────
  const [measuredH, setMeasuredH] = useState(0);
  const animH        = useSharedValue(0);
  const chevronRot   = useSharedValue(0);
  const highlightAnim = useSharedValue(0);

  useEffect(() => {
    if (isOpen && measuredH > 0) {
      animH.value      = withSpring(measuredH, { damping: 22, stiffness: 200 });
      chevronRot.value = withSpring(180,        { damping: 22, stiffness: 200 });
    } else if (!isOpen) {
      animH.value      = withSpring(0,   { damping: 22, stiffness: 200 });
      chevronRot.value = withSpring(0,   { damping: 22, stiffness: 200 });
    }
  }, [isOpen, measuredH]);

  useEffect(() => {
    highlightAnim.value = withSpring(isDropTarget ? 1 : 0, { damping: 20, stiffness: 300 });
  }, [isDropTarget]);

  // When content changes while open (thought added/removed), update height
  useEffect(() => {
    if (isOpen && measuredH > 0) {
      animH.value = withSpring(measuredH, { damping: 22, stiffness: 200 });
    }
  }, [measuredH]);

  const animStyle = useAnimatedStyle(() => ({
    height: animH.value,
    overflow: 'hidden',
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRot.value}deg` }],
  }));

  const highlightStyle = useAnimatedStyle(() => ({
    opacity: highlightAnim.value,
  }));

  // ── Kebab actions ──────────────────────────────────────────────────────────
  const handleKebab = useCallback(() => {
    Alert.alert(drawer.name, '', [
      { text: 'Modifier',  onPress: onEdit },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: () => {
          if (count > 0) {
            Alert.alert(
              'Supprimer ce tiroir ?',
              `Les ${count} pensée${count > 1 ? 's' : ''} seront remises dans le Bureau.`,
              [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: onDelete },
              ],
            );
          } else {
            onDelete();
          }
        },
      },
      { text: 'Annuler', style: 'cancel' },
    ]);
  }, [drawer.name, count, onEdit, onDelete]);

  // ── Inner content (rendered absolutely for measurement) ────────────────────
  const InnerContent = useCallback(() => (
    <View style={s.content}>
      {count === 0 ? (
        <View style={s.emptyBox}>
          <Text style={s.emptyText}>Glisser une note ici.</Text>
        </View>
      ) : (
        thoughts.map(t => (
          <DrawerThoughtRow
            key={t.id}
            thought={t}
            colors={colors}
            onMoveBack={onMoveBack}
          />
        ))
      )}
    </View>
  ), [thoughts, count, colors, onMoveBack]);

  return (
    <View style={s.wrap}>
      {/* ── Facade ─────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[s.face, { backgroundColor: faceBg }]}
        onPress={onToggle}
        activeOpacity={0.85}
      >
        {/* Drop-target highlight overlay */}
        <Animated.View
          style={[StyleSheet.absoluteFillObject, s.dropHighlight, highlightStyle]}
          pointerEvents="none"
        />
        {/* Handle bar */}
        <View style={[s.handle, { backgroundColor: colors.sepia }]} />

        <View style={s.faceInner}>
          {/* Nom pleine largeur */}
          <Text style={[s.drawerLabel, { color: colors.sepia }]} numberOfLines={1}>Tiroir</Text>
          <Text style={[s.drawerName, { color: colors.sepia }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{drawer.name}</Text>

          {/* Contrôles alignés à droite */}
          <View style={s.faceRight}>
            <View style={[s.countBadge, { backgroundColor: 'rgba(250,248,245,0.55)' }]}>
              <Text style={[s.countText, { color: colors.sepia }]}>{count}</Text>
            </View>
            <Animated.View style={chevronStyle}>
              <Chevron color={colors.sepia} />
            </Animated.View>
            <TouchableOpacity
              onPress={handleKebab}
              hitSlop={10}
              style={s.kebab}
            >
              <Text style={[s.kebabDot, { color: colors.sepia }]}>⋯</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* ── Hidden measure layer ────────────────────────────────────────── */}
      <View
        pointerEvents="none"
        style={s.measureLayer}
        onLayout={e => {
          const h = e.nativeEvent.layout.height;
          if (h > 0) setMeasuredH(h);
        }}
      >
        <InnerContent />
      </View>

      {/* ── Animated visible content ────────────────────────────────────── */}
      <Animated.View style={[s.animWrap, animStyle]}>
        <InnerContent />
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(colors) {
  return StyleSheet.create({
    wrap: {
      borderRadius: Radii.card,
      overflow: 'visible',
      marginBottom: 0,
    },
    face: {
      borderRadius: Radii.card,
      paddingTop: 28,
      paddingHorizontal: 18,
      paddingBottom: 18,
      borderWidth: 1,
      borderColor: colors.line2,
      overflow: 'hidden',
    },
    dropHighlight: {
      borderRadius: Radii.card,
      borderWidth: 2,
      borderColor: lightPalette.mustard,
      backgroundColor: 'rgba(212, 160, 23, 0.07)',
    },
    handle: {
      width: 44,
      height: 5,
      borderRadius: 3,
      opacity: 0.55,
      alignSelf: 'center',
      position: 'absolute',
      top: 10,
    },
    faceInner: {
      flexDirection: 'column',
      gap: 8,
    },
    drawerLabel: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 10,
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      opacity: 0.65,
      marginBottom: 3,
    },
    drawerName: {
      fontFamily: 'Jost_500Medium',
      fontSize: 20,
      letterSpacing: -0.2,
    },
    faceRight: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-end',
      gap: 8,
    },
    countBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: Radii.pill,
    },
    countText: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 13,
      fontWeight: '600',
    },
    kebab: {
      paddingHorizontal: 4,
    },
    kebabDot: {
      fontSize: 18,
      opacity: 0.55,
    },
    // Measure layer
    measureLayer: {
      position: 'absolute',
      opacity: 0,
      width: '100%',
      zIndex: -1,
    },
    animWrap: {
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      backgroundColor: colors.paper,
      overflow: 'hidden',
      marginTop: -8,
    },
    content: {
      padding: 14,
      paddingTop: 18,
      gap: 8,
    },
    emptyBox: {
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: colors.line2,
      borderRadius: Radii.card,
      padding: 20,
      alignItems: 'center',
    },
    emptyText: {
      fontFamily: 'Lora_400Regular_Italic',
      fontSize: 14,
      color: colors.sepia,
      opacity: 0.5,
    },
  });
}

function rowStyles(colors) {
  return StyleSheet.create({
    row: {
      backgroundColor: colors.paper2,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: Radii.btn,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    text: {
      flex: 1,
      fontFamily: 'Lora_400Regular',
      fontSize: 14,
      lineHeight: 21,
      color: colors.sepia,
    },
    rowRight: {
      alignItems: 'flex-end',
      gap: 6,
      flexShrink: 0,
    },
    when: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 11,
      color: colors.sepia,
      opacity: 0.5,
    },
    back: {
      fontSize: 16,
      color: colors.sepia,
      opacity: 0.45,
    },
  });
}
