import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { Colors, Radii, Shadows } from '../theme';

export function KebabMenu({ onExpand, onArchive }) {
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

const styles = StyleSheet.create({
  trigger: { padding: 6, alignItems: 'center', gap: 3 },
  dot: { width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: Colors.sepia, opacity: 0.45 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(62,58,53,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: Colors.paper,
    borderRadius: Radii.card,
    minWidth: 170,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.soft,
  },
  item: { paddingVertical: 12, paddingHorizontal: 20 },
  itemText: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: Colors.sepia },
  sep: { height: 1, backgroundColor: Colors.line, marginHorizontal: 12 },
});
