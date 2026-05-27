import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Radii, Shadows } from '../theme';
import HomeScreen from '../screens/HomeScreen';
import BodyDoublingScreen from '../screens/BodyDoublingScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ArchiveScreen from '../screens/ArchiveScreen';
import AtelierScreen from '../screens/AtelierScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GuideScreen from '../screens/GuideScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Tab icons (geometric, mid-century style) ─────────────────────────────

function IconHome({ focused, colors }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <View style={[
        styles.iconDot,
        { borderColor: focused ? colors.mustard : colors.sepia, opacity: focused ? 1 : 0.45 },
        focused && { backgroundColor: colors.tagMustardBg },
      ]} />
    </View>
  );
}

function IconBody({ focused, colors }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <View style={[
        styles.iconCircle,
        { borderColor: focused ? colors.mustard : colors.sepia, opacity: focused ? 1 : 0.45 },
        focused && { backgroundColor: colors.tagMustardBg },
      ]} />
    </View>
  );
}

function IconCalendar({ focused, colors }) {
  const color = focused ? colors.mustard : colors.sepia;
  const op    = focused ? 1 : 0.45;
  const bg    = focused ? colors.tagMustardBg : 'transparent';
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <View style={[styles.calOuter, { borderColor: color, opacity: op, backgroundColor: bg }]}>
        <View style={[styles.calHeader, { backgroundColor: color }]} />
        <View style={styles.calDots}>
          <View style={[styles.calDot, { backgroundColor: color }]} />
          <View style={[styles.calDot, { backgroundColor: color }]} />
          <View style={[styles.calDot, { backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

function IconArchive({ focused, colors }) {
  const color = focused ? colors.mustard : colors.sepia;
  const op    = focused ? 1 : 0.45;
  const bg    = focused ? colors.tagMustardBg : 'transparent';
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      {/* Boîte archive : couvercle + corps */}
      <View style={{ alignItems: 'center', opacity: op }}>
        {/* Couvercle */}
        <View style={[styles.archiveLid, { borderColor: color, backgroundColor: focused ? color : 'transparent' }]} />
        {/* Corps */}
        <View style={[styles.archiveBody, { borderColor: color, backgroundColor: bg }]}>
          {/* Trait horizontal intérieur */}
          <View style={[styles.archiveLine, { backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

function IconAtelier({ focused, colors }) {
  const color = focused ? colors.mustard : colors.sepia;
  const op    = focused ? 1 : 0.45;
  const bg    = focused ? colors.tagMustardBg : 'transparent';
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <View style={{ alignItems: 'center', opacity: op, gap: 2 }}>
        {/* Three drawer fronts stacked */}
        {[8, 7, 6].map((w, i) => (
          <View
            key={i}
            style={{
              width: w * 2,
              height: 4,
              borderRadius: 1.5,
              borderWidth: 1.5,
              borderColor: color,
              backgroundColor: i === 0 ? bg : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Tiny handle dot */}
            <View style={{ width: 3, height: 1.5, borderRadius: 1, backgroundColor: color, opacity: 0.7 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

function IconProfile({ focused, colors }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <View style={[
        styles.iconLine,
        { borderColor: focused ? colors.mustard : colors.sepia, opacity: focused ? 1 : 0.45 },
        focused && { backgroundColor: colors.tagMustardBg },
      ]} />
    </View>
  );
}

// ─── Navigators ───────────────────────────────────────────────────────────

function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
          ...Shadows.soft,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: colors.mustard,
        tabBarInactiveTintColor: colors.sepia,
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <IconHome focused={focused} colors={colors} /> }}
      />
      <Tab.Screen
        name="Focus"
        component={BodyDoublingScreen}
        options={{ tabBarIcon: ({ focused }) => <IconBody focused={focused} colors={colors} /> }}
      />
      <Tab.Screen
        name="Calendrier"
        component={CalendarScreen}
        options={{ tabBarIcon: ({ focused }) => <IconCalendar focused={focused} colors={colors} /> }}
      />
      <Tab.Screen
        name="Archives"
        component={ArchiveScreen}
        options={{ tabBarIcon: ({ focused }) => <IconArchive focused={focused} colors={colors} /> }}
      />
      <Tab.Screen
        name="Atelier"
        component={AtelierScreen}
        options={{ tabBarIcon: ({ focused }) => <IconAtelier focused={focused} colors={colors} /> }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <IconProfile focused={focused} colors={colors} /> }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { colors, isDark } = useTheme();

  // Build a React Navigation theme so the navigator background matches
  const navTheme = isDark
    ? { ...DarkTheme,    colors: { ...DarkTheme.colors,    background: colors.paper, card: colors.paper } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.paper, card: colors.paper } };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="Guide"
          component={GuideScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ─── Static styles (no color dependency) ──────────────────────────────────

const styles = StyleSheet.create({
  tabLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {},
  iconDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
  iconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  iconLine: {
    width: 20,
    height: 14,
    borderRadius: Radii.btn,
    borderWidth: 2,
  },
  // Archive icon
  archiveLid: {
    width: 20,
    height: 4,
    borderRadius: 2,
    borderWidth: 1.5,
    marginBottom: 1,
  },
  archiveBody: {
    width: 18,
    height: 12,
    borderRadius: 2,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  archiveLine: {
    width: 8,
    height: 1.5,
    borderRadius: 1,
    opacity: 0.7,
  },
  calOuter: {
    width: 18,
    height: 17,
    borderRadius: 3,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  calHeader: {
    height: 5,
    width: '100%',
  },
  calDots: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 2,
    paddingTop: 3,
  },
  calDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.8,
  },
});
