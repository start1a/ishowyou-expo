import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, sizes } from '@src/theme';
import { scaleWidth, scaleHeight } from '@src/DeviceScale';
import { VideoListIcon, SendIcon } from '@src/components/Icons';

interface ChatInputProps {
  onSend: (message: string) => void;
  onVideoListPress: () => void;
  disabled?: boolean;
}

export const ChatInput = ({
  onSend,
  onVideoListPress,
  disabled = false,
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const insets = useSafeAreaInsets();

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || spacing.sm }]}>
      <TouchableOpacity
        style={styles.videoButton}
        onPress={onVideoListPress}
        disabled={disabled}
      >
        <VideoListIcon size={24} color={colors.textSecondary} />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder="메시지 입력..."
        placeholderTextColor={colors.textMuted}
        editable={!disabled}
        returnKeyType="send"
        onSubmitEditing={handleSend}
      />

      <TouchableOpacity
        style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!message.trim() || disabled}
      >
        <SendIcon
          size={20}
          color={message.trim() ? colors.textOnPrimary : colors.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    backgroundColor: colors.backgroundElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  videoButton: {
    width: scaleWidth(44),
    height: scaleHeight(44),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: sizes.radiusSm,
  },
  input: {
    flex: 1,
    height: scaleHeight(40),
    backgroundColor: colors.backgroundCard,
    borderRadius: sizes.radiusMd,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
  },
  sendButton: {
    width: scaleWidth(40),
    height: scaleHeight(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: sizes.radiusMd,
  },
  sendButtonDisabled: {
    backgroundColor: colors.backgroundCard,
  },
});
