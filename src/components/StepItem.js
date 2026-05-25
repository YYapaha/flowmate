import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Colors, Radii, Spacing } from '../theme';

export function StepItem({ label, done, onToggle }) {
  return (
    <Pressable onPress={onToggle} style={styles.row}>
      <View style={[styles.box, done && styles.boxDone]}>
        {done && <Text style={styles.check}>✓</Text>}
      </View>
      <Text style={[styles.label, done && styles.labelDone]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: Radii.icon,
    borderWidth: 1.5,
    borderColor: Colors.mustard,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  boxDone: {
    backgroundColor: Colors.mustard,
    borderColor: Colors.mustard,
  },
  check: {
    fontSize: 11,
    color: Colors.paper,
    fontFamily: 'DMSans_500Medium',
  },
  label: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Colors.sepia,
    lineHeight: 20,
  },
  labelDone: {
    textDecorationLine: 'line-through',
    opacity: 0.45,
  },
});
