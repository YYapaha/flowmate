import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThoughts } from '../hooks/useThoughts';
import { useShake } from '../hooks/useShake';
import { useDailyBrief } from '../hooks/useDailyBrief';
import { Card } from '../components/Card';
import { Fab } from '../components/Fab';
import { CaptureModal } from '../components/CaptureModal';
import { ProgressBar } from '../components/ProgressBar';
import { BriefCard } from '../components/BriefCard';
import { Colors, Spacing } from '../theme';

export default function HomeScreen() {
  const { thoughts, addThought, archiveThought, updateSteps } = useThoughts();
  const [modalVisible, setModalVisible] = useState(false);
  const { brief, visible: briefVisible, dismiss: dismissBrief } = useDailyBrief(thoughts);

  const openModal = useCallback(() => setModalVisible(true), []);
  useShake(openModal);

  // addThought now internally schedules classification via ThoughtContext
  const handleCapture = useCallback((text) => {
    addThought(text);
  }, [addThought]);

  const active   = thoughts.filter(t => !t.archived);
  const archived = thoughts.filter(t => t.archived);
  const progress = thoughts.length > 0 ? (archived.length / thoughts.length) * 100 : 0;

  const renderItem = useCallback(
    ({ item }) => (
      <Card
        thought={item}
        onArchive={archiveThought}
        onUpdateSteps={updateSteps}
      />
    ),
    [archiveThought, updateSteps],
  );

  const ListHeader = (
    <View style={styles.header}>
      <Text style={styles.title}>Pensées du jour</Text>
      <Text style={styles.sub}>
        {active.length === 0
          ? 'Aucune pensée pour l\'instant.'
          : `${active.length} pensée${active.length > 1 ? 's' : ''} en attente`}
      </Text>
      {thoughts.length > 0 && (
        <View style={styles.progressWrap}>
          <ProgressBar
            value={progress}
            label="Rangées"
            valueLabel={`${archived.length} / ${thoughts.length}`}
          />
        </View>
      )}
      {briefVisible && (
        <View style={styles.briefWrap}>
          <BriefCard brief={brief} onDismiss={dismissBrief} />
        </View>
      )}
    </View>
  );

  const ListEmpty = (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>
        Secoue le téléphone ou appuie sur + pour capturer une pensée.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={active}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.list}
        initialNumToRender={10}
      />
      <Fab onPress={openModal} />
      <CaptureModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCapture={handleCapture}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.paper },
  list: { padding: Spacing.md, paddingBottom: 100 },
  header: { marginBottom: Spacing.lg, gap: 5 },
  title: {
    fontFamily: 'Jost_600SemiBold',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
    color: Colors.sepia,
  },
  sub: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 15,
    color: Colors.sepia,
    opacity: 0.6,
  },
  progressWrap: { marginTop: Spacing.sm },
  briefWrap: { marginTop: Spacing.md },
  empty: { alignItems: 'center', paddingTop: 48 },
  emptyText: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 16,
    color: Colors.sepia,
    opacity: 0.45,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 25,
  },
});
