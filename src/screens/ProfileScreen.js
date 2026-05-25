import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={Typography.h2}>Profil</Text>
      <Text style={[Typography.body, styles.sub]}>
        Streaks et rétrospective hebdomadaire.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  sub: {
    marginTop: Spacing.sm,
    opacity: 0.65,
  },
});
