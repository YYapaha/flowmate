import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

export default function BodyDoublingScreen() {
  return (
    <View style={styles.container}>
      <Text style={Typography.h2}>Body Doubling</Text>
      <Text style={[Typography.body, styles.sub]}>
        Travaillez en silence ensemble.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  sub: {
    marginTop: Spacing.sm,
    opacity: 0.75,
  },
});
