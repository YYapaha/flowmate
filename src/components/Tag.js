import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Radii } from '../theme';

function getTagMap(colors) {
  return {
    'idée':        { bg: colors.tagMustardBg, fg: colors.tagMustardFg },
    'tâche':       { bg: colors.tagSageBg,    fg: colors.tagSageFg },
    'émotion':     { bg: colors.tagTerraBg,   fg: colors.tagTerraFg },
    'rappel':      { bg: colors.tagPetrolBg,  fg: colors.tagPetrolFg },
    'rendez-vous': { bg: colors.tagSageBg,    fg: colors.tagSageFg },
    'projet':      { bg: colors.tagPetrolBg,  fg: colors.tagPetrolFg },
    'routine':     { bg: colors.tagSageBg,    fg: colors.tagSageFg },
    'achat':       { bg: colors.tagMustardBg, fg: colors.tagMustardFg },
    'santé':       { bg: colors.tagTerraBg,   fg: colors.tagTerraFg },
    'travail':     { bg: colors.tagPetrolBg,  fg: colors.tagPetrolFg },
    'autre':       { bg: colors.tagSageBg,    fg: colors.tagSageFg },
    'en cours':    { bg: colors.line,         fg: colors.sepia },
  };
}

export function Tag({ label = 'autre' }) {
  const { colors } = useTheme();
  const tagMap = getTagMap(colors);
  const { bg, fg } = tagMap[label] ?? tagMap['autre'];

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
