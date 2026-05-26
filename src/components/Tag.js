import { Text, StyleSheet } from 'react-native';
import { Colors, Radii } from '../theme';

const TAG_MAP = {
  'idée':        { bg: Colors.tagMustardBg, fg: Colors.tagMustardFg },
  'tâche':       { bg: Colors.tagSageBg,    fg: Colors.tagSageFg },
  'émotion':     { bg: Colors.tagTerraBg,   fg: Colors.tagTerraFg },
  'rappel':      { bg: Colors.tagPetrolBg,  fg: Colors.tagPetrolFg },
  'rendez-vous': { bg: Colors.tagSageBg,    fg: Colors.tagSageFg },
  'projet':      { bg: Colors.tagPetrolBg,  fg: Colors.tagPetrolFg },
  // new Sprint 3 categories
  'routine':     { bg: Colors.tagSageBg,    fg: Colors.tagSageFg },
  'achat':       { bg: Colors.tagMustardBg, fg: Colors.tagMustardFg },
  'santé':       { bg: Colors.tagTerraBg,   fg: Colors.tagTerraFg },
  'travail':     { bg: Colors.tagPetrolBg,  fg: Colors.tagPetrolFg },
  // defaults
  'autre':       { bg: Colors.tagSageBg,    fg: Colors.tagSageFg },
  'en cours':    { bg: Colors.line,         fg: Colors.sepia },
};

export function Tag({ label = 'autre' }) {
  const { bg, fg } = TAG_MAP[label] ?? TAG_MAP['autre'];
  return (
    <Text style={[styles.tag, { backgroundColor: bg, color: fg }]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  tag: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    letterSpacing: 0.3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
});
