import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import { Colors, Radii, Shadows } from '../theme';
import HomeScreen from '../screens/HomeScreen';
import BodyDoublingScreen from '../screens/BodyDoublingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GuideScreen from '../screens/GuideScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function IconHome({ focused }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <View style={[styles.iconDot, focused && styles.iconDotActive]} />
    </View>
  );
}

function IconBody({ focused }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <View style={[styles.iconCircle, focused && styles.iconCircleActive]} />
    </View>
  );
}

function IconProfile({ focused }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <View style={[styles.iconLine, focused && styles.iconLineActive]} />
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: Colors.mustard,
        tabBarInactiveTintColor: Colors.sepia,
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <IconHome focused={focused} /> }}
      />
      <Tab.Screen
        name="Focus"
        component={BodyDoublingScreen}
        options={{ tabBarIcon: ({ focused }) => <IconBody focused={focused} /> }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <IconProfile focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
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

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.paper,
    borderTopColor: Colors.line,
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 12,
    paddingTop: 8,
    ...Shadows.soft,
  },
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
    borderColor: Colors.sepia,
    opacity: 0.45,
  },
  iconDotActive: {
    borderColor: Colors.mustard,
    backgroundColor: Colors.tagMustardBg,
    opacity: 1,
  },
  iconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.sepia,
    opacity: 0.45,
  },
  iconCircleActive: {
    borderColor: Colors.mustard,
    backgroundColor: Colors.tagMustardBg,
    opacity: 1,
  },
  iconLine: {
    width: 20,
    height: 14,
    borderRadius: Radii.btn,
    borderWidth: 2,
    borderColor: Colors.sepia,
    opacity: 0.45,
  },
  iconLineActive: {
    borderColor: Colors.mustard,
    backgroundColor: Colors.tagMustardBg,
    opacity: 1,
  },
});
