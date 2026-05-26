import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  Modal, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { Colors, Radii, Shadows, Spacing } from '../theme';

function parseLocalDate(str) {
  // Accepts "DD/MM/YYYY" or "YYYY-MM-DD"
  const slash = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) return `${slash[3]}-${slash[2].padStart(2, '0')}-${slash[1].padStart(2, '0')}`;
  const iso = str.match(/^\d{4}-\d{2}-\d{2}$/);
  if (iso) return str;
  return null;
}

function parseTime(str) {
  const m = str.trim().match(/^(\d{1,2})[h:](\d{2})?$/i);
  if (!m) return null;
  const h = m[1].padStart(2, '0');
  const min = (m[2] ?? '00').padStart(2, '0');
  return `${h}:${min}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isoToDisplay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function AddReminderModal({ visible, onClose, onSubmit }) {
  const [title, setTitle]   = useState('');
  const [dateRaw, setDate]  = useState(isoToDisplay(todayISO()));
  const [timeRaw, setTime]  = useState('');
  const [desc, setDesc]     = useState('');
  const [errors, setErrors] = useState({});

  // Reset on open
  useEffect(() => {
    if (visible) {
      setTitle(''); setDate(isoToDisplay(todayISO())); setTime(''); setDesc(''); setErrors({});
    }
  }, [visible]);

  // Slide-up animation
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
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.heading}>Nouveau rappel</Text>

            <Field label="Titre *" error={errors.title}>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="Ex : réunion projet, médecin…"
                placeholderTextColor={`${Colors.sepia}60`}
                value={title}
                onChangeText={setTitle}
                returnKeyType="next"
                autoFocus
              />
            </Field>

            <View style={styles.row}>
              <View style={{ flex: 1.3 }}>
                <Field label="Date *" error={errors.date}>
                  <TextInput
                    style={[styles.input, errors.date && styles.inputError]}
                    placeholder="JJ/MM/AAAA"
                    placeholderTextColor={`${Colors.sepia}60`}
                    value={dateRaw}
                    onChangeText={setDate}
                    keyboardType="numeric"
                  />
                </Field>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Field label="Heure" error={errors.time}>
                  <TextInput
                    style={[styles.input, errors.time && styles.inputError]}
                    placeholder="14:00"
                    placeholderTextColor={`${Colors.sepia}60`}
                    value={timeRaw}
                    onChangeText={setTime}
                    keyboardType="numeric"
                  />
                </Field>
              </View>
            </View>

            <Field label="Description (optionnel)">
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Contexte, notes…"
                placeholderTextColor={`${Colors.sepia}60`}
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

function Field({ label, error, children }) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(62,58,53,0.45)',
  },
  sheet: {
    backgroundColor: Colors.paper,
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
    backgroundColor: Colors.line2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  heading: {
    fontFamily: 'Jost_600SemiBold',
    fontSize: 22,
    color: Colors.sepia,
    marginBottom: Spacing.lg,
  },
  row: { flexDirection: 'row' },
  input: {
    backgroundColor: Colors.paper2,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radii.btn,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontFamily: 'Lora_400Regular',
    fontSize: 15,
    color: Colors.sepia,
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  inputError: { borderColor: Colors.terra },
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
    borderColor: Colors.line2,
    alignItems: 'center',
  },
  btnCancelLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: Colors.sepia,
    opacity: 0.6,
  },
  btnSubmit: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: Radii.btn,
    backgroundColor: Colors.mustard,
    alignItems: 'center',
  },
  btnSubmitLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: Colors.paper,
    letterSpacing: 0.3,
  },
});

const fieldStyles = StyleSheet.create({
  wrap:  { marginBottom: Spacing.md },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.sepia,
    opacity: 0.5,
    marginBottom: 6,
  },
  error: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Colors.terra,
    marginTop: 4,
  },
});
