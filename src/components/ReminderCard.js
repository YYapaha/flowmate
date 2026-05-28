/**
 * ReminderCard — carte de rappel affichée dans CalendarScreen.
 * Met en évidence l'heure (« 14:00 · Titre »), sans geste de swipe.
 * Menu kebab : Modifier / Supprimer.
 */
import { useMemo, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Alert, Pressable,
  Modal, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Tag } from './Tag';
import { Radii, Shadows, Spacing } from '../theme';

// ─── Kebab menu interne (Modifier / Supprimer) ────────────────────────────────

function ReminderMenu({ visible, onClose, onEdit, onDelete }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => makeMenuStyles(colors, width), [colors, width]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.menu}>
          <TouchableOpacity style={styles.item} onPress={() => { onClose(); onEdit(); }}>
            <Text style={styles.itemText}>Modifier</Text>
          </TouchableOpacity>
          <View style={styles.sep} />
          <TouchableOpacity style={styles.item} onPress={() => { onClose(); onDelete(); }}>
            <Text style={[styles.itemText, styles.itemDestructive]}>Supprimer</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function makeMenuStyles(colors, screenWidth) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.28)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    menu: {
      backgroundColor: colors.paper,
      borderRadius: Radii.card,
      minWidth: 180,
      maxWidth: screenWidth - 32,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: colors.line,
      ...Shadows.soft,
    },
    item: { paddingVertical: 13, paddingHorizontal: 20 },
    itemText: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 14,
      color: colors.sepia,
    },
    itemDestructive: { color: colors.terra },
    sep: { height: 1, backgroundColor: colors.line, marginHorizontal: 12 },
  });
}

// ─── Dot (3 points verticaux) ─────────────────────────────────────────────────

function ThreeDots({ color }) {
  return (
    <View style={{ alignItems: 'center', gap: 3, padding: 12, minWidth: 44, minHeight: 44, justifyContent: 'center' }}>
      <View style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: color, opacity: 0.45 }} />
      <View style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: color, opacity: 0.45 }} />
      <View style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: color, opacity: 0.45 }} />
    </View>
  );
}

// ─── ReminderCard ─────────────────────────────────────────────────────────────

function makeCardStyles(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.paper2,
      borderRadius: Radii.card,
      padding: Spacing.lg,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.line,
      gap: 8,
      ...Shadows.soft,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    // Heure + titre sur la même ligne, proéminent
    timeTitle: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'baseline',
      flexWrap: 'wrap',
      gap: 0,
    },
    time: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 17,
      color: colors.mustardText,
      letterSpacing: 0.3,
    },
    timeSep: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 15,
      color: colors.sepia,
      opacity: 0.35,
      marginHorizontal: 6,
    },
    titleText: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 15,
      color: colors.sepia,
      flexShrink: 1,
    },
    noTime: {
      fontFamily: 'Lora_400Regular_Italic',
      fontSize: 13,
      color: colors.sepia,
      opacity: 0.4,
    },
    description: {
      fontFamily: 'Lora_400Regular',
      fontSize: 14,
      color: colors.sepia,
      opacity: 0.7,
      lineHeight: 21,
    },
    duration: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 11,
      color: colors.sepia,
      opacity: 0.4,
      letterSpacing: 0.2,
    },
    menuBtn: {
      marginLeft: 6,
    },
  });
}

export function ReminderCard({ thought, onEdit, onDelete }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeCardStyles(colors), [colors]);
  const [menuOpen, setMenuOpen] = useState(false);

  const reminder = thought.reminder;
  const title    = reminder?.title || thought.text;
  const hasTime  = !!reminder?.time;

  // Formate la durée (en minutes → "1h", "30 min", etc.)
  const durationLabel = useMemo(() => {
    const d = reminder?.duration;
    if (!d || d <= 0) return null;
    if (d < 60) return `${d} min`;
    const h = Math.floor(d / 60);
    const m = d % 60;
    return m ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
  }, [reminder?.duration]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Supprimer ce rappel',
      thought.isManualReminder
        ? 'Ce rappel sera définitivement supprimé.'
        : 'Le rappel sera supprimé. La pensée associée restera dans le flux principal.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: onDelete },
      ],
    );
  }, [thought.isManualReminder, onDelete]);

  return (
    <>
      <View style={styles.card}>
        {/* Ligne Tag + menu */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Tag label={thought.tag} />
          </View>
          <Pressable
            style={styles.menuBtn}
            onPress={() => setMenuOpen(true)}
            hitSlop={10}
          >
            <ThreeDots color={colors.sepia} />
          </Pressable>
        </View>

        {/* Heure · Titre */}
        <View style={styles.timeTitle}>
          {hasTime ? (
            <>
              <Text style={styles.time}>{reminder.time}</Text>
              <Text style={styles.timeSep}>·</Text>
              <Text style={styles.titleText} numberOfLines={2}>{title}</Text>
            </>
          ) : (
            <>
              <Text style={styles.titleText} numberOfLines={2}>{title}</Text>
              <Text style={[styles.noTime, { marginLeft: 8 }]}>sans heure</Text>
            </>
          )}
        </View>

        {/* Description (si le texte de la pensée diffère du titre) */}
        {thought.text !== title && (
          <Text style={styles.description} numberOfLines={3}>{thought.text}</Text>
        )}

        {/* Durée */}
        {durationLabel && <Text style={styles.duration}>{durationLabel}</Text>}
      </View>

      <ReminderMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onEdit={onEdit}
        onDelete={handleDelete}
      />
    </>
  );
}
