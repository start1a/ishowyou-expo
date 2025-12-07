import React, { memo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { ChatMessage as ChatMessageType } from '@src/api/types';
import { colors, spacing, sizes, typography } from '@src/theme';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage: boolean;
  showAvatar: boolean;
}

export const ChatMessageItem = memo(({
  message,
  isOwnMessage,
  showAvatar,
}: ChatMessageProps) => {
  return (
    <View style={[
      styles.container,
      isOwnMessage ? styles.ownContainer : styles.otherContainer
    ]}>
      {/* 상대방 메시지: 아바타 */}
      {!isOwnMessage && (
        <View style={styles.avatarContainer}>
          {showAvatar ? (
            message.photoURL ? (
              <Image source={{ uri: message.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {message.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )
          ) : (
            <View style={styles.avatarSpacer} />
          )}
        </View>
      )}

      <View style={[
        styles.contentWrapper,
        isOwnMessage ? styles.ownContentWrapper : styles.otherContentWrapper
      ]}>
        {/* 상대방 메시지: 이름 표시 */}
        {!isOwnMessage && showAvatar && (
          <Text style={styles.displayName}>{message.displayName}</Text>
        )}

        <View style={[
          styles.bubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {message.content}
          </Text>
        </View>

        <Text style={[
          styles.timestamp,
          isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp
        ]}>
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
});

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = hours % 12 || 12;
  return `${period} ${displayHours}:${minutes}`;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  ownContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: spacing.sm,
    alignSelf: 'flex-start',
  },
  avatar: {
    width: sizes.avatarSm,
    height: sizes.avatarSm,
    borderRadius: sizes.avatarSm / 2,
  },
  avatarPlaceholder: {
    width: sizes.avatarSm,
    height: sizes.avatarSm,
    borderRadius: sizes.avatarSm / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.caption,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  avatarSpacer: {
    width: sizes.avatarSm,
  },
  contentWrapper: {
    maxWidth: '70%',
  },
  ownContentWrapper: {
    alignItems: 'flex-end',
  },
  otherContentWrapper: {
    alignItems: 'flex-start',
  },
  displayName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
    marginLeft: spacing.xs,
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: sizes.radiusMd,
  },
  ownBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: sizes.radiusXs,
  },
  otherBubble: {
    backgroundColor: colors.surfaceCard,
    borderBottomLeftRadius: sizes.radiusXs,
  },
  messageText: {
    ...typography.body,
    lineHeight: 20,
  },
  ownMessageText: {
    color: colors.textOnPrimary,
  },
  otherMessageText: {
    color: colors.textPrimary,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 10,
  },
  ownTimestamp: {
    marginRight: spacing.xs,
  },
  otherTimestamp: {
    marginLeft: spacing.xs,
  },
});
