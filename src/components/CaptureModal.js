import { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { loadDraft, saveDraft } from '../utils/storage';
import { Button } from './Button';
import { Colors, Radii, Shadows, Spacing } from '../theme';

export function CaptureModal({ visible, onClose, onCapture }) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  // Restore draft each time modal opens
  useEffect(() => {
    if (!visible) return;
    loadDraft().then(draft => { if (draft) setText(draft); });
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [visible]);

  const handleChange = (value) => {
    setText(value);
    saveDraft(value);
  };

  const handleCapture = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveDraft('');
    setText('');
    onCapture(trimmed);
    onClose();
  };

  const handleCancel = () => {
    onClose();
    // Keep the draft so text isn't lost on accidental cancel
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.prompt}>
            Note ce qui te traverse.{'\n'}On trie plus tard.
          </Text>
          <TextInput
            ref={inputRef}
            style={[styles.input, focused && styles.inputFocused]}
            value={text}
            onChangeText={handleChange}
            placeholder="…"
            placeholderTextColor={`${Colors.sepia}44`}
            multiline
            textAlignVertical="top"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <View style={styles.actions}>
            <Button
              label="Capturer"
              variant="primary"
              onPress={handleCapture}
              style={styles.btnFlex}
            />
            <Button
              label="Annuler"
              variant="ghost"
              onPress={handleCancel}
              style={styles.btnFlex}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(62,58,53,0.28)',
  },
  sheet: {
    backgroundColor: Colors.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingTop: 16,
    paddingBottom: Spacing.xxl,
    gap: 20,
    ...Shadows.soft,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: Radii.pill,
    backgroundColor: Colors.line2,
    marginBottom: 4,
  },
  prompt: {
    fontFamily: 'Jost_500Medium',
    fontSize: 19,
    color: Colors.sepia,
    opacity: 0.55,
    textAlign: 'center',
    lineHeight: 27,
  },
  input: {
    fontFamily: 'Lora_400Regular',
    fontSize: 18,
    color: Colors.sepia,
    borderBottomWidth: 2,
    borderBottomColor: Colors.line2,
    paddingVertical: 10,
    paddingHorizontal: 2,
    minHeight: 100,
    lineHeight: 27,
  },
  inputFocused: {
    borderBottomColor: Colors.mustard,
  },
  actions: { flexDirection: 'row', gap: 12 },
  btnFlex: { flex: 1 },
});
