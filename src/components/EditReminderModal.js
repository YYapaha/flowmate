/**
 * EditReminderModal — modale de modification d'un rappel existant.
 * Pré-remplit les champs avec les valeurs actuelles du rappel.
 * Animation slide-up identique à AddReminderModal.
 *
 * Props :
 *   visible  — boolean
 *   thought  — pensée en cours d'édition (.reminder, .isManualReminder, .text)
 *   onClose  — function()
 *   onSave   — function({ title, date, time, duration, description? })
 */
import { useMemo, useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  Modal, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { Radii, Shadows, Spacing } from '../theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function parseDuration(str) {
  const n = parseInt(str.trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function isoToDisplay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function durationToDisplay(minutes) {
  if (!minutes || minutes <= 0) return '';
  return String(minutes);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    fieldHint: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      color: colors.sepia,
      opacity: 0.4,
      marginTop: 4,
    },
    fieldError: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      color: colors.terra,
      marginTop: 4,
    },
  });
}

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({ label, error, hint, children, styles }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
      {!error && hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

// ─── EditReminderModal ────────────────────────────────────────────────────────

export function EditReminderModal({ visible, thought, onClose, onSave }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const reminder = thought?.reminder;

  const [title,    setTitle]   = useState('');
  const [dateRaw,  setDate]    = useState('');
  const [timeRaw,  setTime]    = useState('');
  const [durRaw,   setDur]     = useState('');
  const [desc,     setDesc]    = useState('');
  const [errors,   setErrors]  = useState({});

  // Pré-remplissage à chaque ouverture
  useEffect(() => {
    if (visible && thought) {
      setTitle(reminder?.title || thought.text || '');
      setDate(isoToDisplay(reminder?.date || ''));
      setTime(reminder?.time || '');
      setDur(durationToDisplay(reminder?.duration));
      setDesc(thought.isManualReminder && thought.text !== (reminder?.title || thought.text)
        ? thought.text
        : '');
      setErrors({});
    }
  }, [visible, thought, reminder]);

  // Animation slide-up
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
    if (timeRaw && !parseTime(timeRaw)) e.time = 'Format attendu : HH:MM ou 14h';
    if (durRaw && !parseDuration(durRaw)) e.duration = 'Entrer un nombre de minutes (ex : 30)';
    setErrors(e);
    return Object.keys(e).length === 0 ? { dateParsed } : null;
  };

  const handleSave = () => {
    const valid = validate();
    if (!valid) return;
    onSave({
      title:       title.trim(),
      date:        valid.dateParsed,
      time:        timeRaw ? parseTime(timeRaw) : null,
      duration:    durRaw  ? parseDuration(durRaw) : 60,
      description: thought?.isManualReminder ? desc.trim() : undefined,
    });
    onClose();
  };

  if (!visible || !thought) return null;

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
            <Text style={styles.heading}>Modifier le rappel</Text>

            <Field label="Titre *" error={errors.title} styles={styles}>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="Titre du rappel"
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

            <Field
              label="Durée (min)"
              error={errors.duration}
              hint="Optionnel — en minutes. Ex : 30, 60, 90"
              styles={styles}
            >
              <TextInput
                style={[styles.input, errors.duration && styles.inputError]}
                placeholder="60"
                placeholderTextColor={`${colors.sepia}60`}
                value={durRaw}
                onChangeText={setDur}
                keyboardType="number-pad"
              />
            </Field>

            {thought?.isManualReminder && (
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
            )}

            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [styles.btnCancel, pressed && { opacity: 0.6 }]}
                onPress={onClose}
              >
                <Text style={styles.btnCancelLabel}>Annuler</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.btnSubmit, pressed && { opacity: 0.85 }]}
                onPress={handleSave}
              >
                <Text style={styles.btnSubmitLabel}>Enregistrer</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
