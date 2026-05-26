import { useMemo, useState, useEffect, useRef } from 'react';
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
import { useTheme } from '../context/ThemeContext';
import { loadDraft, saveDraft } from '../utils/storage';
import { Button } from './Button';
import { Radii, Shadows, Spacing } from '../theme';

function makeStyles(colors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.38)',
    },
    sheet: {
      backgroundColor: colors.paper,
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
      backgroundColor: colors.line2,
      marginBottom: 4,
    },
    prompt: {
      fontFamily: 'Jost_500Medium',
      fontSize: 19,
      color: colors.sepia,
      opacity: 0.55,
      textAlign: 'center',
      lineHeight: 27,
    },
    input: {
      fontFamily: 'Lora_400Regular',
      fontSize: 18,
      color: colors.sepia,
      borderBottomWidth: 2,
      borderBottomColor: colors.line2,
      paddingVertical: 10,
      paddingHorizontal: 2,
      minHeight: 100,
      lineHeight: 27,
    },
    inputFocused: {
      borderBottomColor: colors.mustard,
    },
    actions: { flexDirection: 'row', gap: 12 },
    btnFlex: { flex: 1 },
  });
}

export function CaptureModal({ visible, onClose, onCapture }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

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

  const handleCancel = () => { onClose(); };

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
            placeholderTextColor={`${colors.sepia}44`}
            multiline
            textAlignVertical="top"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <View style={styles.actions}>
            <Button label="Capturer" variant="primary"  onPress={handleCapture} style={styles.btnFlex} />
            <Button label="Annuler"  variant="ghost"    onPress={handleCancel}  style={styles.btnFlex} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
