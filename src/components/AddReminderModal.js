import { useMemo, useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  Modal, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { Radii, Shadows, Spacing } from '../theme';

function parseLocalDate(str) {
  const slash = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) return `${slash[3]}-${slash[2].padStart(2, '0')}-${slash[1].padStart(2, '0')}`;
  const iso = str.match(/^\d{4}-\d{2}-\d{2}$/);
  if (iso) return str;
  return null;
}

function parseTime(str) {
  const m = str.trim().match(/^(\d{1,2})[h:](\d{2})?$/i);
  if (!m) return null;
  return `${m[1].padStart(2, '0')}:${(m[2] ?? '00').padStart(2, '0')}`;
}

function todayISO() { return new Date().toISOString().slice(0, 10); }

function isoToDisplay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, justifyContent: 'flex-end' },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
      backgroundColor: colors.paper,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: Spacing.lg,
      paddingBottom: 36,
      paddingTop: Spacing.sm,
      ...Shadows.soft,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.line2,
      alignSelf: 'center',
      marginBottom: Spacing.md,
    },
    heading: {
      fontFamily: 'Jost_600SemiBold',
      fontSize: 22,
      color: colors.sepia,
      marginBottom: Spacing.lg,
    },
    row: { flexDirection: 'row' },
    input: {
      backgroundColor: colors.paper2,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: Radii.btn,
      paddingHorizontal: Spacing.md,
      paddingVertical: 10,
      fontFamily: 'Lora_400Regular',
      fontSize: 15,
      color: colors.sepia,
    },
    inputMultiline: {
      minHeight: 72,
      textAlignVertical: 'top',
      paddingTop: 10,
    },
    inputError: { borderColor: colors.terra },
    actions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: Spacing.lg,
    },
    btnCancel: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: Radii.btn,
      borderWidth: 1,
      borderColor: colors.line2,
      alignItems: 'center',
    },
    btnCancelLabel: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 15,
      color: colors.sepia,
      opacity: 0.6,
    },
    btnSubmit: {
      flex: 2,
      paddingVertical: 13,
      borderRadius: Radii.btn,
      backgroundColor: colors.mustard,
      alignItems: 'center',
    },
    btnSubmitLabel: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 15,
      color: colors.paper,
      letterSpacing: 0.3,
    },
    // Field sub-styles
    fieldWrap:  { marginBottom: Spacing.md },
    fieldLabel: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 11,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      color: colors.sepia,
      opacity: 0.5,
      marginBottom: 6,
    },
    fieldError: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      color: colors.terra,
      marginTop: 4,
    },
  });
}

export function AddReminderModal({ visible, onClose, onSubmit }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [title, setTitle]   = useState('');
  const [dateRaw, setDate]  = useState(isoToDisplay(todayISO()));
  const [timeRaw, setTime]  = useState('');
  const [desc, setDesc]     = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible) {
      setTitle(''); setDate(isoToDisplay(todayISO())); setTime(''); setDesc(''); setErrors({});
    }
  }, [visible]);

  const translateY = useSharedValue(300);
  const opacity    = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value    = withTiming(1, { duration: 180 });
      translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
    } else {
      opacity.value    = withTiming(0, { duration: 150 });
      translateY.value = withTiming(300, { duration: 200 });
    }
  }, [visible, opacity, translateY]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const sheetStyle    = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Le titre est requis.';
    const dateParsed = parseLocalDate(dateRaw);
    if (!dateParsed) e.date = 'Format attendu : JJ/MM/AAAA';
    if (timeRaw && !parseTime(timeRaw)) e.time = 'Format attendu : HH:MM ou HHh';
    setErrors(e);
    return Object.keys(e).length === 0 ? { dateParsed } : null;
  };

  const handleSubmit = () => {
    const valid = validate();
    if (!valid) return;
    onSubmit({
      title: title.trim(),
      date:  valid.dateParsed,
      time:  timeRaw ? parseTime(timeRaw) : null,
      description: desc.trim(),
    });
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.heading}>Nouveau rappel</Text>

            <Field label="Titre *" error={errors.title} styles={styles}>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="Ex : réunion projet, médecin…"
                placeholderTextColor={`${colors.sepia}60`}
                value={title}
                onChangeText={setTitle}
                returnKeyType="next"
                autoFocus
              />
            </Field>

            <View style={styles.row}>
              <View style={{ flex: 1.3 }}>
                <Field label="Date *" error={errors.date} styles={styles}>
                  <TextInput
                    style={[styles.input, errors.date && styles.inputError]}
                    placeholder="JJ/MM/AAAA"
                    placeholderTextColor={`${colors.sepia}60`}
                    value={dateRaw}
                    onChangeText={setDate}
                    keyboardType="numeric"
                  />
                </Field>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Field label="Heure" error={errors.time} styles={styles}>
                  <TextInput
                    style={[styles.input, errors.time && styles.inputError]}
                    placeholder="14:00"
                    placeholderTextColor={`${colors.sepia}60`}
                    value={timeRaw}
                    onChangeText={setTime}
                    keyboardType="numeric"
                  />
                </Field>
              </View>
            </View>

            <Field label="Description (optionnel)" styles={styles}>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Contexte, notes…"
                placeholderTextColor={`${colors.sepia}60`}
                value={desc}
                onChangeText={setDesc}
                multiline
                numberOfLines={3}
              />
            </Field>

            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [styles.btnCancel, pressed && { opacity: 0.6 }]}
                onPress={onClose}
              >
                <Text style={styles.btnCancelLabel}>Annuler</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.btnSubmit, pressed && { opacity: 0.85 }]}
                onPress={handleSubmit}
              >
                <Text style={styles.btnSubmitLabel}>Ajouter</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({ label, error, children, styles }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}
