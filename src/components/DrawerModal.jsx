import { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Pressable,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Radii, Spacing, Shadows } from '../theme';
import { DRAWER_TAG_META } from './DrawerCard';

const TAG_OPTIONS = [
  { tag: 'travail',    label: 'Travail' },
  { tag: 'idée',       label: 'Idée' },
  { tag: 'achat',      label: 'Courses' },
  { tag: 'santé',      label: 'Santé' },
  { tag: 'tâche',      label: 'Tâche' },
  { tag: 'rappel',     label: 'Rappel' },
  { tag: 'rendez-vous', label: 'Rendez-vous' },
  { tag: 'émotion',    label: 'Émotion' },
  { tag: 'autre',      label: 'Autre' },
];

export function DrawerModal({ visible, drawer, onSave, onCancel }) {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const isEdit = !!drawer;

  const [name, setName] = useState('');
  const [tag,  setTag]  = useState('travail');

  useEffect(() => {
    if (visible) {
      setName(drawer?.name ?? '');
      setTag(drawer?.tag  ?? 'travail');
    }
  }, [visible, drawer]);

  const canSave = name.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <Pressable style={s.veil} onPress={onCancel}>
        <Pressable style={s.sheet} onPress={() => {}}>
          <View style={s.grip} />

          <Text style={s.title}>
            {isEdit ? 'Modifier le tiroir' : 'Nouveau tiroir'}
          </Text>

          <Text style={s.label}>Nom</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="ex : Taf, Projets, Loisirs…"
            placeholderTextColor={colors.sepia + '55'}
            autoFocus
            returnKeyType="done"
          />

          <Text style={[s.label, { marginTop: Spacing.md }]}>Catégorie</Text>
          <Text style={s.hint}>
            Utilisée par l'IA pour suggérer le bon tiroir lors de la capture.
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.tagRow}
          >
            {TAG_OPTIONS.map(opt => {
              const meta    = DRAWER_TAG_META[opt.tag] ?? DRAWER_TAG_META['autre'];
              const selected = tag === opt.tag;
              return (
                <TouchableOpacity
                  key={opt.tag}
                  onPress={() => setTag(opt.tag)}
                  style={[
                    s.tagChip,
                    { backgroundColor: selected ? meta.bg : colors.paper2,
                      borderColor:      selected ? meta.fg + '88' : colors.line },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[s.tagChipText, { color: selected ? meta.fg : colors.sepia }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={s.actions}>
            <TouchableOpacity style={s.btnCancel} onPress={onCancel} activeOpacity={0.7}>
              <Text style={[s.btnText, { color: colors.sepia, opacity: 0.65 }]}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btnSave, !canSave && s.btnDisabled]}
              onPress={() => canSave && onSave({ name: name.trim(), tag })}
              activeOpacity={canSave ? 0.7 : 1}
            >
              <Text style={s.btnText}>{isEdit ? 'Enregistrer' : 'Créer'}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    veil: {
      flex: 1,
      backgroundColor: 'rgba(62,58,53,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.paper,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: Spacing.lg,
      paddingBottom: Spacing.xl,
      ...Shadows.soft,
    },
    grip: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.line2,
      alignSelf: 'center',
      marginBottom: Spacing.md,
    },
    title: {
      fontFamily: 'Jost_500Medium',
      fontSize: 20,
      color: colors.sepia,
      marginBottom: Spacing.md,
    },
    label: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 12,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      color: colors.sepia,
      opacity: 0.6,
      marginBottom: 8,
    },
    hint: {
      fontFamily: 'Lora_400Regular_Italic',
      fontSize: 13,
      color: colors.sepia,
      opacity: 0.55,
      marginBottom: 10,
      marginTop: -4,
    },
    input: {
      fontFamily: 'Jost_400Regular',
      fontSize: 17,
      color: colors.sepia,
      backgroundColor: colors.paper2,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: Radii.btn,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    tagRow: {
      gap: 8,
      paddingVertical: 4,
    },
    tagChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: Radii.pill,
      borderWidth: 1.5,
      minHeight: 44,
      justifyContent: 'center',
    },
    tagChipText: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 14,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: Spacing.lg,
    },
    btnCancel: {
      flex: 1,
      padding: 14,
      borderRadius: Radii.btn,
      borderWidth: 1,
      borderColor: colors.line2,
      alignItems: 'center',
    },
    btnSave: {
      flex: 2,
      padding: 14,
      borderRadius: Radii.btn,
      backgroundColor: colors.sepia,
      alignItems: 'center',
    },
    btnDisabled: {
      opacity: 0.35,
    },
    btnText: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 15,
      color: colors.paper,
    },
  });
}
