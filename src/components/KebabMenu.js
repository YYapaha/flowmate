import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Radii, Shadows } from '../theme';

function makeStyles(colors) {
  return StyleSheet.create({
    trigger: { padding: 6, alignItems: 'center', gap: 3 },
    dot: { width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: colors.sepia, opacity: 0.45 },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.30)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    menu: {
      backgroundColor: colors.paper,
      borderRadius: Radii.card,
      minWidth: 170,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: colors.line,
      ...Shadows.soft,
    },
    item: { paddingVertical: 12, paddingHorizontal: 20 },
    itemText: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.sepia },
    sep: { height: 1, backgroundColor: colors.line, marginHorizontal: 12 },
  });
}

export function KebabMenu({ onExpand, onArchive }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [open, setOpen] = useState(false);

  const action = (fn) => () => { setOpen(false); fn?.(); };

  return (
    <View>
      <TouchableOpacity onPress={() => setOpen(true)} style={styles.trigger} hitSlop={10}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.menu}>
            <TouchableOpacity style={styles.item} onPress={action(onExpand)}>
              <Text style={styles.itemText}>Développer</Text>
            </TouchableOpacity>
            <View style={styles.sep} />
            <TouchableOpacity style={styles.item} onPress={action(onArchive)}>
              <Text style={styles.itemText}>Archiver</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
