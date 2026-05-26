import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { Colors, Spacing } from '../theme';

const TOTAL = 25 * 60;

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function BodyDoublingScreen() {
  const [remaining, setRemaining] = useState(TOTAL);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  const handleToggle = () => {
    if (remaining === 0) {
      setRemaining(TOTAL);
      setRunning(true);
    } else {
      setRunning(r => !r);
    }
  };

  const done = remaining === 0;
  const progress = ((TOTAL - remaining) / TOTAL) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>Concentration · 25 min</Text>
        <Text style={styles.timer}>{fmt(remaining)}</Text>

        <View style={styles.progressWrap}>
          <ProgressBar
            value={progress}
            label={done ? 'Terminé' : running ? 'En cours' : 'En pause'}
            valueLabel={done ? '' : fmt(remaining)}
          />
        </View>

        <Button
          label={done ? 'Recommencer' : running ? 'Pause' : 'Démarrer'}
          variant="primary"
          onPress={handleToggle}
          style={styles.btn}
        />

        <Text style={styles.hint}>
          {done
            ? 'Bien. Prends une pause.'
            : running
              ? "L'app attend. Travaille."
              : 'Reprends quand tu veux.'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.sage },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    gap: 24,
  },
  eyebrow: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Colors.terra,
  },
  timer: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 64,
    color: Colors.sepia,
    letterSpacing: -2,
  },
  progressWrap: { width: '100%' },
  btn: { width: '100%' },
  hint: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 15,
    color: Colors.sepia,
    opacity: 0.6,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
});
