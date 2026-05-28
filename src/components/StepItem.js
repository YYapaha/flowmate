import { useMemo } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Radii, Spacing } from '../theme';

function makeStyles(colors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingVertical: 4,
      minHeight: 44,
    },
    box: {
      width: 18,
      height: 18,
      borderRadius: Radii.icon,
      borderWidth: 1.5,
      borderColor: colors.mustard,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    boxDone: {
      backgroundColor: colors.mustard,
      borderColor: colors.mustard,
    },
    check: {
      fontSize: 11,
      color: colors.paper,
      fontFamily: 'DMSans_500Medium',
    },
    label: {
      flex: 1,
      fontFamily: 'DMSans_400Regular',
      fontSize: 13,
      color: colors.sepia,
      lineHeight: 20,
    },
    labelDone: {
      textDecorationLine: 'line-through',
      opacity: 0.45,
    },
  });
}

export function StepItem({ label, done, onToggle }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Pressable onPress={onToggle} style={styles.row}>
      <View style={[styles.box, done && styles.boxDone]}>
        {done && <Text style={styles.check}>✓</Text>}
      </View>
      <Text style={[styles.label, done && styles.labelDone]}>{label}</Text>
    </Pressable>
  );
}
