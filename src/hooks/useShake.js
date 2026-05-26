import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';

const SHAKE_THRESHOLD = 2.8;
const COOLDOWN_MS = 1200;

export function useShake(onShake) {
  const lastFired = useRef(0);
  const callbackRef = useRef(onShake);

  useEffect(() => { callbackRef.current = onShake; }, [onShake]);

  useEffect(() => {
    // Accelerometer unavailable on web
    if (Platform.OS === 'web') return;

    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      if (magnitude > SHAKE_THRESHOLD) {
        const now = Date.now();
        if (now - lastFired.current > COOLDOWN_MS) {
          lastFired.current = now;
          callbackRef.current?.();
        }
      }
    });
    return () => sub.remove();
  }, []);
}
