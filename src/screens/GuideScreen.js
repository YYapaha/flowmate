import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Radii, Shadows, Spacing } from '../theme';

const SECTIONS = [
  {
    eyebrow: "Capturer",
    title: "Comment capturer une pensée",
    body: "Secoue le téléphone ou appuie sur le bouton + en bas à droite. Une fenêtre s'ouvre : écris ce qui te passe par la tête, sans filtre. Valide, c'est enregistré.",
  },
  {
    eyebrow: "Archiver",
    title: "Comment archiver une pensée",
    body: "Glisse une carte vers la gauche jusqu'au bout pour l'archiver. Tu peux aussi appuyer sur les trois points en haut à droite de la carte, puis choisir « Archiver ».",
  },
  {
    eyebrow: "Intelligence artificielle",
    title: "Comment l'IA te vient en aide",
    body: "Chaque pensée est automatiquement classée (idée, tâche, émotion…). Chaque matin, un bref résumé de tes pensées récentes s'affiche en haut. Pour les tâches, un bouton « Décomposer » permet à l'IA de découper le travail en petites étapes.",
  },
  {
    eyebrow: "Mode tempête",
    title: "C'est quoi le mode tempête ?",
    body: "Lors des journées difficiles, le mode tempête réduit l'interface à l'essentiel. Active-le depuis l'onglet Profil. L'objectif : moins de bruit, plus de clarté.",
  },
];

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.paper },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm,
    },
    heading: {
      fontFamily: 'Jost_600SemiBold',
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.3,
      color: colors.sepia,
    },
    closeBtn: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: Radii.btn,
      backgroundColor: colors.paper2,
      borderWidth: 1,
      borderColor: colors.line,
    },
    closeBtnLabel: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 13,
      color: colors.sepia,
      opacity: 0.7,
    },
    content: { padding: Spacing.lg, gap: 16, paddingBottom: 48 },
    intro: {
      fontFamily: 'Lora_400Regular_Italic',
      fontSize: 15,
      lineHeight: 24,
      color: colors.sepia,
      opacity: 0.65,
      marginBottom: Spacing.sm,
    },
    // Tip card
    card: {
      backgroundColor: colors.tagSageBg,
      borderRadius: Radii.card,
      padding: Spacing.lg,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.sage,
      ...Shadows.soft,
    },
    eyebrow: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 10,
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      color: colors.tagSageFg,
      opacity: 0.7,
    },
    cardTitle: {
      fontFamily: 'Jost_600SemiBold',
      fontSize: 17,
      lineHeight: 22,
      color: colors.tagSageFg,
    },
    cardBody: {
      fontFamily: 'Lora_400Regular',
      fontSize: 15,
      lineHeight: 24,
      color: colors.tagSageFg,
      opacity: 0.85,
    },
  });
}

export default function GuideScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Guide</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.5 }]}
          hitSlop={12}
        >
          <Text style={styles.closeBtnLabel}>Fermer</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          {"Un endroit pour poser ce qui tourne dans ta tête.\nVoici comment ça marche."}
        </Text>

        {SECTIONS.map((s) => (
          <View key={s.eyebrow} style={styles.card}>
            <Text style={styles.eyebrow}>{s.eyebrow}</Text>
            <Text style={styles.cardTitle}>{s.title}</Text>
            <Text style={styles.cardBody}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
