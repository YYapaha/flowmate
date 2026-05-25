import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={Typography.h2}>Accueil</Text>
      <Text style={[Typography.body, styles.sub]}>Tes pensées apparaîtront ici.</Text>
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
