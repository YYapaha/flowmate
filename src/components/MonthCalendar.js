/**
 * MonthCalendar — composant calendrier maison, sans dépendance externe.
 * API proche de react-native-calendars pour faciliter une migration future.
 */
import { useMemo, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Radii, Spacing } from '../theme';

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const DAYS_FR = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isoFromYMD(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function buildGrid(year, month) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function makeStyles(colors) {
  return StyleSheet.create({
    wrap: {
      backgroundColor: colors.paper,
      borderRadius: Radii.card,
      borderWidth: 1,
      borderColor: colors.line,
      padding: Spacing.md,
      paddingBottom: Spacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.sm,
    },
    arrow: { width: 32, alignItems: 'center' },
    arrowLabel: {
      fontSize: 22,
      color: colors.mustard,
      fontFamily: 'DMSans_500Medium',
      lineHeight: 26,
    },
    monthTitle: {
      fontFamily: 'Jost_600SemiBold',
      fontSize: 17,
      color: colors.sepia,
    },
    weekRow: { flexDirection: 'row', marginBottom: 4 },
    weekLabel: {
      flex: 1,
      textAlign: 'center',
      fontFamily: 'DMSans_500Medium',
      fontSize: 11,
      color: colors.sepia,
      opacity: 0.4,
      letterSpacing: 0.5,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    cell: {
      width: `${100 / 7}%`,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radii.btn,
      gap: 2,
    },
    cellSelected: { backgroundColor: colors.mustard },
    cellToday:    { backgroundColor: colors.tagMustardBg },
    cellPressed:  { opacity: 0.65 },
    dayText: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 14,
      color: colors.sepia,
    },
    dayTextSelected: { color: colors.paper, fontFamily: 'DMSans_500Medium' },
    dayTextToday:    { color: colors.mustard, fontFamily: 'DMSans_500Medium' },
    dot:      { width: 4, height: 4, borderRadius: 2 },
    dotEmpty: { width: 4, height: 4 },
  });
}

export function MonthCalendar({ markedDates = {}, selectedDay, onDayPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const today = todayISO();
  const [year, setYear]   = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);

  const grid = useMemo(() => buildGrid(year, month), [year, month]);

  const prevMonth = useCallback(() => {
    setMonth(m => { if (m === 1) { setYear(y => y - 1); return 12; } return m - 1; });
  }, []);
  const nextMonth = useCallback(() => {
    setMonth(m => { if (m === 12) { setYear(y => y + 1); return 1; } return m + 1; });
  }, []);

  return (
    <View style={styles.wrap}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={prevMonth} hitSlop={12} style={styles.arrow}>
          <Text style={styles.arrowLabel}>‹</Text>
        </Pressable>
        <Text style={styles.monthTitle}>{MONTHS_FR[month - 1]} {year}</Text>
        <Pressable onPress={nextMonth} hitSlop={12} style={styles.arrow}>
          <Text style={styles.arrowLabel}>›</Text>
        </Pressable>
      </View>

      {/* Day-of-week labels */}
      <View style={styles.weekRow}>
        {DAYS_FR.map((d, i) => (
          <Text key={i} style={styles.weekLabel}>{d}</Text>
        ))}
      </View>

      {/* Date grid */}
      <View style={styles.grid}>
        {grid.map((day, idx) => {
          if (!day) return <View key={`e-${idx}`} style={styles.cell} />;
          const iso        = isoFromYMD(year, month, day);
          const isToday    = iso === today;
          const isSelected = iso === selectedDay;
          const marked     = !!markedDates[iso]?.marked;
          const dotColor   = markedDates[iso]?.dotColor ?? colors.mustard;

          return (
            <Pressable
              key={iso}
              style={({ pressed }) => [
                styles.cell,
                isSelected && styles.cellSelected,
                isToday && !isSelected && styles.cellToday,
                pressed && styles.cellPressed,
              ]}
              onPress={() => onDayPress?.({ dateString: iso })}
            >
              <Text style={[
                styles.dayText,
                isSelected && styles.dayTextSelected,
                isToday && !isSelected && styles.dayTextToday,
              ]}>
                {day}
              </Text>
              {marked
                ? <View style={[styles.dot, { backgroundColor: isSelected ? colors.paper : dotColor }]} />
                : <View style={styles.dotEmpty} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
