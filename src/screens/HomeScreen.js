import { useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useThoughts } from '../hooks/useThoughts';
import { useShake } from '../hooks/useShake';
import { useDailyBrief } from '../hooks/useDailyBrief';
import { Card } from '../components/Card';
import { Fab } from '../components/Fab';
import { CaptureModal } from '../components/CaptureModal';
import { ProgressBar } from '../components/ProgressBar';
import { BriefCard } from '../components/BriefCard';
import { Spacing } from '../theme';

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.paper },
    list: { padding: Spacing.md, paddingBottom: 100 },
    header: { marginBottom: Spacing.lg, gap: 5 },
    title: {
      fontFamily: 'Jost_600SemiBold',
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.3,
      color: colors.sepia,
    },
    sub: {
      fontFamily: 'Lora_400Regular_Italic',
      fontSize: 15,
      color: colors.sepia,
      opacity: 0.6,
    },
    progressWrap: { marginTop: Spacing.sm },
    briefWrap: { marginTop: Spacing.md },
    empty: { alignItems: 'center', paddingTop: 48 },
    emptyText: {
      fontFamily: 'Lora_400Regular_Italic',
      fontSize: 16,
      color: colors.sepia,
      opacity: 0.45,
      textAlign: 'center',
      maxWidth: 260,
      lineHeight: 25,
    },
  });
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { thoughts, addThought, archiveThought, updateSteps } = useThoughts();
  const [modalVisible, setModalVisible] = useState(false);
  const { brief, visible: briefVisible, dismiss: dismissBrief } = useDailyBrief(thoughts);

  const openModal = useCallback(() => setModalVisible(true), []);
  useShake(openModal);

  const handleCapture = useCallback((text) => { addThought(text); }, [addThought]);

  const active   = thoughts.filter(t => !t.archived);
  const archived = thoughts.filter(t => t.archived);
  const progress = thoughts.length > 0 ? (archived.length / thoughts.length) * 100 : 0;

  const renderItem = useCallback(
    ({ item }) => (
      <Card thought={item} onArchive={archiveThought} onUpdateSteps={updateSteps} />
    ),
    [archiveThought, updateSteps],
  );

  const ListHeader = (
    <View style={styles.header}>
      <Text style={styles.title}>Pensées du jour</Text>
      <Text style={styles.sub}>
        {active.length === 0
          ? 'Rien pour l\'instant.'
          : `${active.length} pensée${active.length > 1 ? 's' : ''}${archived.length > 0 ? ` · ${archived.length} rangée${archived.length > 1 ? 's' : ''}` : ''}`}
      </Text>
      {briefVisible && (
        <View style={styles.briefWrap}>
          <BriefCard brief={brief} onDismiss={dismissBrief} />
        </View>
      )}
      {thoughts.length > 0 && (
        <View style={styles.progressWrap}>
          <ProgressBar
            value={progress}
            label="Rangées"
            valueLabel={`${archived.length} / ${thoughts.length}`}
          />
        </View>
      )}
    </View>
  );

  const ListEmpty = (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>
        Secoue le téléphone ou touche + pour poser une pensée.
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
