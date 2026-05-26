import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

import { Jost_400Regular, Jost_500Medium, Jost_600SemiBold } from '@expo-google-fonts/jost';
import { Lora_400Regular, Lora_400Regular_Italic } from '@expo-google-fonts/lora';
import { DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';

import { ThoughtProvider } from './src/context/ThoughtContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation';

SplashScreen.preventAutoHideAsync();

/** Inner component — can call useTheme() safely inside ThemeProvider. */
function AppRoot() {
  const { colors, isDark } = useTheme();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.paper }}>
      <SafeAreaProvider>
        <ThoughtProvider>
          <AppNavigator />
        </ThoughtProvider>
        <StatusBar
          style={isDark ? 'light' : 'dark'}
          backgroundColor={colors.paper}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Jost_400Regular,
    Jost_500Medium,
    Jost_600SemiBold,
    Lora_400Regular,
    Lora_400Regular_Italic,
    DMSans_400Regular,
    DMSans_500Medium,
    JetBrainsMono_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <AppRoot />
    </ThemeProvider>
  );
}
