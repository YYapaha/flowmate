import { useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { MonthCalendar } from '../components/MonthCalendar';
import { useThoughts } from '../hooks/useThoughts';
import { Card } from '../components/Card';
import { AddReminderModal } from '../components/AddReminderModal';
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
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { thoughts, addManualReminder, archiveThought, updateSteps } = useThoughts();
  const [selectedDay, setSelectedDay] = useState(todayISO());
  const [modalVisible, setModalVisible] = useState(false);

  const markedDates = useMemo(() => {
    const marks = {};
    thoughts.forEach(t => {
      const date = t.reminder?.date;
      if (!t.reminder?.hasDate || !date) return;
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

  const dayThoughts = useMemo(() => {
    if (!selectedDay) return [];
    return thoughts.filter(t => t.reminder?.date === selectedDay && !t.archived);
  }, [thoughts, selectedDay]);

  const handleDayPress = useCallback((day) => { setSelectedDay(day.dateString); }, []);

  const handleAddReminder = useCallback(({ title, date, time, description }) => {
    addManualReminder(title, date, time, description);
  }, [addManualReminder]);

  const renderCard = useCallback(
    ({ item }) => (
      <Card thought={item} onArchive={archiveThought} onUpdateSteps={updateSteps} />
    ),
    [archiveThought, updateSteps],
  );

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
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabLabel}>+</Text>
      </Pressable>
      <AddReminderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddReminder}
      />
    </SafeAreaView>
  );
}
