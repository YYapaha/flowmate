import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useThoughts } from '../hooks/useThoughts';
import { Radii, Shadows, Spacing } from '../theme';
import appConfig from '../../app.json';

const APP_VERSION = appConfig.expo.version;

const THEME_OPTIONS = [
  { value: 'system', label: 'Système' },
  { value: 'light',  label: 'Clair'   },
  { value: 'dark',   label: 'Sombre'  },
];

function makeStyles(colors, screenWidth) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.paper },
    inner: { padding: Spacing.lg, gap: 24, paddingBottom: 40 },
    title: {
      fontFamily: 'Jost_600SemiBold',
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.3,
      color: colors.sepia,
      marginTop: Spacing.sm,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    statCard: {
      width: screenWidth < 400 ? '100%' : '47%',
      backgroundColor: colors.paper2,
      borderRadius: Radii.card,
      padding: Spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.line,
      gap: 4,
      ...Shadows.soft,
    },
    statValue: {
      fontFamily: 'Jost_600SemiBold',
      fontSize: 32,
      color: colors.sepia,
      lineHeight: 38,
    },
    statLabel: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 11,
      color: colors.sepia,
      opacity: 0.55,
      letterSpacing: 0.4,
    },
    section: {
      backgroundColor: colors.paper2,
      borderRadius: Radii.card,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.line,
      ...Shadows.soft,
    },
    sectionLabel: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 11,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      color: colors.sepia,
      opacity: 0.45,
      marginBottom: Spacing.md,
    },
    // Theme picker
    themeRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    themeBtn: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: Radii.btn,
      borderWidth: 1.5,
      borderColor: colors.line2,
      alignItems: 'center',
    },
    themeBtnActive: {
      borderColor: colors.mustard,
      backgroundColor: colors.tagMustardBg,
    },
    themeBtnLabel: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 12,
      color: colors.sepia,
      opacity: 0.6,
    },
    themeBtnLabelActive: {
      color: colors.mustard,
      opacity: 1,
    },
    // Storm mode
    stormRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: Spacing.sm,
    },
    stormLabel: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 15,
      color: colors.sepia,
    },
    stormHint: {
      fontFamily: 'Lora_400Regular_Italic',
      fontSize: 12,
      color: colors.sepia,
      opacity: 0.5,
      marginTop: 2,
    },
    // Guide button
    guideBtn: { paddingVertical: Spacing.sm },
    guideBtnPressed: { opacity: 0.5 },
    guideBtnLabel: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 15,
      color: colors.mustard,
      letterSpacing: 0.2,
    },
    version: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      color: colors.sepia,
      opacity: 0.35,
      textAlign: 'center',
      letterSpacing: 0.4,
    },
  });
}

export default function ProfileScreen({ navigation }) {
  const { colors, mode, setMode, stormMode, setStormMode } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(colors, width), [colors, width]);
  const { thoughts } = useThoughts();

  const total      = thoughts.length;
  const archived   = thoughts.filter(t => t.archived).length;
  const active     = total - archived;
  const decomposed = thoughts.filter(t => t.steps && t.steps.length > 0).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profil</Text>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Capturées',   value: total      },
            { label: 'Rangées',     value: archived   },
            { label: 'À trier',     value: active     },
            { label: 'Décomposées', value: decomposed },
          ].map(({ label, value }) => (
            <View key={label} style={styles.statCard}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Storm mode */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Focus</Text>
          <View style={styles.stormRow}>
            <View>
              <Text style={styles.stormLabel}>⚡ Mode tempête</Text>
              <Text style={styles.stormHint}>Cache tout, garde seulement la capture.</Text>
            </View>
            <Switch
              value={stormMode}
              onValueChange={setStormMode}
              trackColor={{ false: colors.line2, true: colors.mustard }}
              thumbColor={colors.paper}
            />
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Apparence</Text>
          <Text style={styles.rowLabel}>Thème</Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                style={[styles.themeBtn, mode === opt.value && styles.themeBtnActive]}
                onPress={() => setMode(opt.value)}
              >
                <Text style={[
                  styles.themeBtnLabel,
                  mode === opt.value && styles.themeBtnLabelActive,
                ]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Help */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Aide</Text>
          <Pressable
            style={({ pressed }) => [styles.guideBtn, pressed && styles.guideBtnPressed]}
            onPress={() => navigation.navigate('Guide')}
          >
            <Text style={styles.guideBtnLabel}>Guide d'utilisation →</Text>
          </Pressable>
        </View>

        <Text style={styles.version}>Flowmate v{APP_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
