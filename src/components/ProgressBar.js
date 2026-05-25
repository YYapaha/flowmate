import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radii } from '../theme';

export function ProgressBar({ value = 0, label, valueLabel }) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <View style={styles.wrap}>
      {(label || valueLabel) && (
        <View style={styles.meta}>
          {label    && <Text style={styles.label}>{label}</Text>}
          {valueLabel && <Text style={styles.val}>{valueLabel}</Text>}
        </View>
      )}
      <View style={styles.track}>
        <LinearGradient
          colors={[Colors.teak, Colors.honey]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${pct}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 7 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  label: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: Colors.sepia },
  val:   { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: Colors.sepia, opacity: 0.6 },
  track: { height: 8, backgroundColor: Colors.line, borderRadius: Radii.pill, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: Radii.pill },
});
