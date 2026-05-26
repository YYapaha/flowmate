import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radii, Shadows, Spacing } from '../theme';

const SECTIONS = [
  {
    eyebrow: "Capturer",
    title: "Comment capturer une pensée",
    body: "Secoue le téléphone ou appuie sur le bouton + en bas à droite. Une fenêtre s’ouvre : écris ce qui te passe par la tête, sans filtre. Valide, c’est enregistré.",
  },
  {
    eyebrow: "Archiver",
    title: "Comment archiver une pensée",
    body: "Glisse une carte vers la gauche jusqu’au bout pour l’archiver. Tu peux aussi appuyer sur les trois points en haut à droite de la carte, puis choisir « Archiver ».",
  },
  {
    eyebrow: "Intelligence artificielle",
    title: "Comment l’IA te vient en aide",
    body: "Chaque pensée est automatiquement classée (idée, tâche, émotion…). Chaque matin, un bref résumé de tes pensées récentes s’affiche en haut. Pour les tâches, un bouton « Décomposer » permet à l’IA de découper le travail en petites étapes.",
  },
  {
    eyebrow: "Mode tempête",
    title: "C’est quoi le mode tempête ?",
    body: "Lors des journées difficiles, le mode tempête réduit l’interface à l’essentiel. Active-le depuis l’onglet Profil. L’objectif : moins de bruit, plus de clarté.",
  },
];

function TipCard({ eyebrow, title, body }) {
  return (
    <View style={tipStyles.card}>
      <Text style={tipStyles.eyebrow}>{eyebrow}</Text>
      <Text style={tipStyles.title}>{title}</Text>
      <Text style={tipStyles.body}>{body}</Text>
    </View>
  );
}

export default function GuideScreen({ navigation }) {
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
          {"Flowmate t'aide à externaliser tes pensées pour alléger ta charge mentale.\nVoici comment tirer le meilleur de l'application."}
        </Text>

        {SECTIONS.map((s) => (
          <TipCard key={s.eyebrow} {...s} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
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
    color: Colors.sepia,
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radii.btn,
    backgroundColor: Colors.paper2,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  closeBtnLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Colors.sepia,
    opacity: 0.7,
  },
  content: {
    padding: Spacing.lg,
    gap: 16,
    paddingBottom: 48,
  },
  intro: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 15,
    lineHeight: 24,
    color: Colors.sepia,
    opacity: 0.65,
    marginBottom: Spacing.sm,
  },
});

const tipStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.tagSageBg,
    borderRadius: Radii.card,
    padding: Spacing.lg,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.sage,
    ...Shadows.soft,
  },
  eyebrow: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Colors.tagSageFg,
    opacity: 0.7,
  },
  title: {
    fontFamily: 'Jost_600SemiBold',
    fontSize: 17,
    lineHeight: 22,
    color: Colors.tagSageFg,
  },
  body: {
    fontFamily: 'Lora_400Regular',
    fontSize: 15,
    lineHeight: 24,
    color: Colors.tagSageFg,
    opacity: 0.85,
  },
});
