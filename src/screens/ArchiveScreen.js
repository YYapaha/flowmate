import { useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Alert, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, runOnJS, Easing,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { useThoughts } from '../hooks/useThoughts';
import { Tag } from '../components/Tag';
import { Radii, Shadows, Spacing } from '../theme';
import { formatRelativeTime } from '../utils/date';

// ─── ArchiveCard ──────────────────────────────────────────────────────────────

function ArchiveCard({ thought, onRestore, onDelete }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeCardStyles(colors), [colors]);

  const opacity    = useSharedValue(1);
  const translateX = useSharedValue(0);

  /**
   * Animate out then call the provided callback.
   * direction: +1 = slide right (restore), -1 = slide left (delete)
   */
  const animateOut = useCallback((direction, callback) => {
    opacity.value    = withTiming(0, { duration: 220, easing: Easing.out(Easing.ease) });
    translateX.value = withTiming(
      direction * 280,
      { duration: 300, easing: Easing.in(Easing.ease) },
      (finished) => { if (finished) runOnJS(callback)(); },
    );
  }, [opacity, translateX]);

  const handleRestore = useCallback(() => {
    animateOut(1, onRestore);
  }, [animateOut, onRestore]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Supprimer définitivement',
      'Cette pensée sera effacée. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => animateOut(-1, onDelete),
        },
      ],
    );
  }, [animateOut, onDelete]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const label = thought.archivedAt
    ? formatRelativeTime(thought.archivedAt)
    : formatRelativeTime(thought.createdAt);

  return (
    <Animated.View style={[styles.card, animStyle]}>
      {/* Header */}
      <View style={styles.header}>
        <Tag label={thought.tag} />
        <Text style={styles.time}>archivée {label}</Text>
      </View>

      {/* Body */}
      <Text style={styles.body} numberOfLines={4}>{thought.text}</Text>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={handleRestore}
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionPressed]}
          hitSlop={12}
        >
          <Text style={[styles.actionLabel, styles.restoreLabel]}>↩ Restaurer</Text>
        </Pressable>
        <View style={styles.actionSep} />
        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionPressed]}
          hitSlop={12}
        >
          <Text style={[styles.actionLabel, styles.deleteLabel]}>Supprimer</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function makeCardStyles(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.paper2,
      borderRadius: Radii.card,
      padding: Spacing.lg,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.line,
      gap: 10,
      ...Shadows.soft,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    time: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 11,
      color: colors.sepia,
      opacity: 0.45,
      letterSpacing: 0.2,
    },
    body: {
      fontFamily: 'Lora_400Regular',
      fontSize: 16,
      lineHeight: 25,
      color: colors.sepia,
      opacity: 0.8,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 4,
      borderTopWidth: 1,
      borderTopColor: colors.line,
      gap: 0,
    },
    actionBtn: {
      paddingVertical: 6,
      paddingHorizontal: 4,
    },
    actionPressed: { opacity: 0.45 },
    actionLabel: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 13,
      letterSpacing: 0.2,
    },
    restoreLabel: { color: colors.mustard },
    deleteLabel:  { color: colors.terra },
    actionSep: {
      width: 1,
      height: 14,
      backgroundColor: colors.line2,
      marginHorizontal: Spacing.md,
    },
  });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.paper },
    header: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.sm,
      marginBottom: 4,
      gap: 3,
    },
    title: {
      fontFamily: 'Jost_600SemiBold',
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.3,
      color: colors.sepia,
      marginTop: Spacing.sm,
    },
    count: {
      fontFamily: 'Lora_400Regular_Italic',
      fontSize: 15,
      color: colors.sepia,
      opacity: 0.55,
    },
    list: { padding: Spacing.md, paddingBottom: 40 },
    empty: { alignItems: 'center', paddingTop: 72, gap: 8 },
    emptyIcon: {
      width: 48,
      height: 48,
      borderRadius: Radii.card,
      borderWidth: 2,
      borderColor: colors.line2,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    emptyText: {
      fontFamily: 'Lora_400Regular',
      fontSize: 15,
      color: colors.sepia,
      opacity: 0.45,
      textAlign: 'center',
    },
    emptyHint: {
      fontFamily: 'Lora_400Regular_Italic',
      fontSize: 13,
      color: colors.sepia,
      opacity: 0.3,
      textAlign: 'center',
      maxWidth: '70%',
      lineHeight: 20,
    },
  });
}

export default function ArchiveScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { thoughts, unarchiveThought, deleteThought } = useThoughts();

  const archived = useMemo(() =>
    thoughts
      .filter(t => t.archived)
      .sort((a, b) => {
        const dA = a.archivedAt ?? a.createdAt;
        const dB = b.archivedAt ?? b.createdAt;
        return dB.localeCompare(dA); // décroissant
      }),
    [thoughts],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <ArchiveCard
        thought={item}
        onRestore={() => unarchiveThought(item.id)}
        onDelete={()  => deleteThought(item.id)}
      />
    ),
    [unarchiveThought, deleteThought],
  );

  const ListHeader = (
    <View style={styles.header}>
      <Text style={styles.title}>Archives</Text>
      <Text style={styles.count}>
        {archived.length === 0
          ? 'Aucune pensée archivée'
          : `${archived.length} pensée${archived.length > 1 ? 's' : ''} archivée${archived.length > 1 ? 's' : ''}`}
      </Text>
    </View>
  );

  const ListEmpty = (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Text style={{ fontSize: 22, opacity: 0.3 }}>□</Text>
      </View>
      <Text style={styles.emptyText}>Rien ici pour l'instant.</Text>
      <Text style={styles.emptyHint}>
        Les pensées archivées apparaissent ici. Tu peux les restaurer ou les effacer.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={archived}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.list}
        initialNumToRender={12}
      />
    </SafeAreaView>
  );
}
