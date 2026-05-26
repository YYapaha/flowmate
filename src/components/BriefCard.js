import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Radii, Shadows, Spacing } from '../theme';

function makeStyles(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.petrol,
      borderRadius: Radii.card,
      padding: Spacing.lg,
      gap: 12,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.line,
      ...Shadows.soft,
    },
    mark: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 10,
      letterSpacing: 1.8,
      textTransform: 'uppercase',
      color: colors.sepia,
      opacity: 0.65,
    },
    text: {
      fontFamily: 'Lora_400Regular_Italic',
      fontSize: 16,
      color: colors.sepia,
      lineHeight: 24,
    },
    btn: {
      alignSelf: 'flex-end',
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      borderRadius: Radii.pill,
      borderWidth: 1,
      borderColor: `${colors.sepia}44`,
    },
    btnLabel: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 13,
      color: colors.sepia,
      letterSpacing: 0.4,
    },
  });
}

export function BriefCard({ brief, onDismiss }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (!brief) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.mark}>✦ Flowmate</Text>
      <Text style={styles.text}>{brief}</Text>
      <Pressable onPress={onDismiss} style={styles.btn}>
        <Text style={styles.btnLabel}>OK</Text>
      </Pressable>
    </View>
  );
}
