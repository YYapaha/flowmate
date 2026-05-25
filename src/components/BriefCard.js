import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Radii, Shadows, Spacing } from '../theme';

export function BriefCard({ brief, onDismiss }) {
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.petrol,
    borderRadius: Radii.card,
    padding: Spacing.lg,
    gap: 12,
    marginBottom: Spacing.md,
    ...Shadows.soft,
  },
  mark: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: Colors.paper,
    opacity: 0.65,
  },
  text: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 16,
    color: Colors.paper,
    lineHeight: 24,
  },
  btn: {
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: `${Colors.paper}44`,
  },
  btnLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Colors.paper,
    letterSpacing: 0.4,
  },
});
