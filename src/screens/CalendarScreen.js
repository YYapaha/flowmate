import { useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { MonthCalendar } from '../components/MonthCalendar';
import { useThoughts } from '../hooks/useThoughts';
import { ReminderCard } from '../components/ReminderCard';
import { AddReminderModal } from '../components/AddReminderModal';
import { EditReminderModal } from '../components/EditReminderModal';
import { Spacing } from '../theme';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDayFR(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                   'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

// Trie par heure ascendant, les rappels sans heure passent en dernier
function sortByTime(thoughts) {
  return [...thoughts].sort((a, b) => {
    const ta = a.reminder?.time ?? 'ZZ';
    const tb = b.reminder?.time ?? 'ZZ';
    return ta.localeCompare(tb);
  });
}

function makeStyles(colors) {
  return StyleSheet.create({
    container:  { flex: 1, backgroundColor: colors.paper },
    title: {
      fontFamily: 'Jost_600SemiBold',
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.3,
      color: colors.sepia,
      marginTop: Spacing.sm,
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.sm,
      marginBottom: 4,
    },
    list: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
    dayHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      paddingVertical: Spacing.sm,
      marginBottom: 4,
    },
    dayLabel: {
      fontFamily: 'Jost_600SemiBold',
      fontSize: 17,
      color: colors.sepia,
    },
    dayCount: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      color: colors.sepia,
      opacity: 0.5,
    },
    empty: { alignItems: 'center', paddingTop: 32, gap: 6 },
    emptyText: {
      fontFamily: 'Lora_400Regular',
      fontSize: 15,
      color: colors.sepia,
      opacity: 0.5,
    },
    emptyHint: {
      fontFamily: 'Lora_400Regular_Italic',
      fontSize: 13,
      color: colors.sepia,
      opacity: 0.35,
    },
    fab: {
      position: 'absolute',
      bottom: 28,
      right: 24,
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.mustard,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.mustard,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.38,
      shadowRadius: 16,
      elevation: 8,
    },
    fabLabel: {
      fontSize: 26,
      lineHeight: 30,
      color: colors.paper,
      fontFamily: 'DMSans_400Regular',
    },
  });
}

export default function CalendarScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const {
    thoughts,
    addManualReminder,
    deleteThought,
    clearReminder,
    editReminder,
  } = useThoughts();

  const [selectedDay,    setSelectedDay]    = useState(todayISO());
  const [addVisible,     setAddVisible]     = useState(false);
  const [editingThought, setEditingThought] = useState(null); // thought en cours d'édition

  // ── Dots du calendrier ────────────────────────────────────────────────────
  const markedDates = useMemo(() => {
    const marks = {};
    thoughts.forEach(t => {
      const date = t.reminder?.date;
      if (t.archived || !t.reminder?.hasDate || !date) return;
      marks[date] = { ...marks[date], marked: true, dotColor: colors.mustard };
    });
    if (selectedDay) {
      marks[selectedDay] = {
        ...marks[selectedDay],
        selected: true,
        selectedColor: colors.mustard,
        selectedTextColor: colors.paper,
      };
    }
    return marks;
  }, [thoughts, selectedDay, colors.mustard, colors.paper]);

  // ── Rappels du jour sélectionné, triés par heure ──────────────────────────
  const dayThoughts = useMemo(() => {
    if (!selectedDay) return [];
    const filtered = thoughts.filter(
      t => t.reminder?.date === selectedDay && !t.archived,
    );
    return sortByTime(filtered);
  }, [thoughts, selectedDay]);

  const handleDayPress = useCallback((day) => { setSelectedDay(day.dateString); }, []);

  // ── Ajout ─────────────────────────────────────────────────────────────────
  const handleAddReminder = useCallback(({ title, date, time, description }) => {
    addManualReminder(title, date, time, description);
  }, [addManualReminder]);

  // ── Suppression ───────────────────────────────────────────────────────────
  const handleDelete = useCallback((thought) => {
    if (thought.isManualReminder) {
      deleteThought(thought.id);
    } else {
      clearReminder(thought.id);
    }
  }, [deleteThought, clearReminder]);

  // ── Édition ───────────────────────────────────────────────────────────────
  const handleSaveEdit = useCallback(({ title, date, time, duration, description }) => {
    if (!editingThought) return;
    const newReminder = { title, date, time, duration };
    // Pour les rappels manuels, on met aussi à jour le texte (description ou titre)
    const newText = editingThought.isManualReminder
      ? (description || title)
      : undefined;
    editReminder(editingThought.id, newReminder, newText);
    setEditingThought(null);
  }, [editingThought, editReminder]);

  // ── Rendu de chaque carte ─────────────────────────────────────────────────
  const renderCard = useCallback(
    ({ item }) => (
      <ReminderCard
        thought={item}
        onEdit={() => setEditingThought(item)}
        onDelete={() => handleDelete(item)}
      />
    ),
    [handleDelete],
  );

  // ── Header et Empty state ─────────────────────────────────────────────────
  const ListHeader = (
    <View>
      <MonthCalendar
        markedDates={markedDates}
        selectedDay={selectedDay}
        onDayPress={handleDayPress}
      />
      <View style={styles.dayHeader}>
        <Text style={styles.dayLabel}>
          {selectedDay === todayISO() ? "Aujourd'hui" : formatDayFR(selectedDay)}
        </Text>
        {dayThoughts.length > 0 && (
          <Text style={styles.dayCount}>
            {dayThoughts.length} rappel{dayThoughts.length > 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </View>
  );

  const ListEmpty = (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>Rien ce jour-là.</Text>
      <Text style={styles.emptyHint}>{"Touche + si tu veux noter quelque chose."}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Calendrier</Text>
      <FlatList
        data={dayThoughts}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.list}
      />

      {/* FAB — nouveau rappel */}
      <Pressable
        style={({ pressed }) => [styles.fab, { bottom: Math.max(28, insets.bottom + 12) }, pressed && { opacity: 0.85 }]}
        onPress={() => setAddVisible(true)}
      >
        <Text style={styles.fabLabel}>+</Text>
      </Pressable>

      {/* Modale d'ajout */}
      <AddReminderModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onSubmit={handleAddReminder}
      />

      {/* Modale d'édition */}
      <EditReminderModal
        visible={!!editingThought}
        thought={editingThought}
        onClose={() => setEditingThought(null)}
        onSave={handleSaveEdit}
      />
    </SafeAreaView>
  );
}
