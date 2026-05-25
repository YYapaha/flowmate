import { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThoughts } from '../hooks/useThoughts';
import { Colors, Radii, Shadows, Spacing } from '../theme';

const STORM_KEY = '@flowmate:stormMode';

function StatCard({ label, value }) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { thoughts } = useThoughts();
  const [stormMode, setStormMode] = useState(false);

  const total    = thoughts.length;
  const archived = thoughts.filter(t => t.archived).length;
  const active   = total - archived;

  const toggleStorm = async (val) => {
    setStormMode(val);
    try { await AsyncStorage.setItem(STORM_KEY, JSON.stringify(val)); } catch {}
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.inner}>
        <Text style={styles.title}>Profil</Text>

        <View style={styles.statsRow}>
          <StatCard label="Capturées" value={total} />
          <StatCard label="Rangées"   value={archived} />
          <StatCard label="En attente" value={active} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Options</Text>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Mode tempête</Text>
              <Text style={styles.rowSub}>
                Réduit l'interface au strict minimum lors des journées difficiles.
              </Text>
            </View>
            <Switch
              value={stormMode}
              onValueChange={toggleStorm}
              trackColor={{ false: Colors.line, true: Colors.mustard }}
              thumbColor={Colors.paper}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.paper },
  inner: { flex: 1, padding: Spacing.lg, gap: 28 },
  title: {
    fontFamily: 'Jost_600SemiBold',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
    color: Colors.sepia,
    marginTop: Spacing.sm,
  },
  statsRow: { flexDirection: 'row', gap: 12 },
  section: {
    backgroundColor: Colors.paper2,
    borderRadius: Radii.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.soft,
  },
  sectionLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.sepia,
    opacity: 0.45,
    marginBottom: Spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowText: { flex: 1, gap: 3 },
  rowLabel: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: Colors.sepia },
  rowSub: {
    fontFamily: 'Lora_400Regular',
    fontSize: 13,
    color: Colors.sepia,
    opacity: 0.6,
    lineHeight: 18,
  },
});

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.paper2,
    borderRadius: Radii.card,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 4,
    ...Shadows.soft,
  },
  value: {
    fontFamily: 'Jost_600SemiBold',
    fontSize: 32,
    color: Colors.sepia,
    lineHeight: 38,
  },
  label: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.sepia,
    opacity: 0.55,
    letterSpacing: 0.4,
  },
});
