import React, { useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { ChatMessage } from '@src/api/types';
import { ChatMessageItem } from './ChatMessage';
import { colors, spacing, typography } from '@src/theme';

interface ChatListProps {
  messages: ChatMessage[];
  currentUserId: string;
  isLoading: boolean;
}

export const ChatList = ({
  messages,
  currentUserId,
  isLoading,
}: ChatListProps) => {
  const flatListRef = useRef<FlatList>(null);

  // 새 메시지가 오면 스크롤
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const renderItem = useCallback(({ item, index }: { item: ChatMessage; index: number }) => {
    const isOwnMessage = item.userId === currentUserId;
    // 연속 메시지 그룹화: 이전 메시지와 같은 사용자면 아바타 숨김
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar = !previousMessage || previousMessage.userId !== item.userId;

    return (
      <ChatMessageItem
        message={item}
        isOwnMessage={isOwnMessage}
        showAvatar={showAvatar}
      />
    );
  }, [currentUserId, messages]);

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>아직 메시지가 없습니다</Text>
        <Text style={styles.emptySubText}>첫 번째 메시지를 보내보세요!</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.list}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={10}
      onContentSizeChange={() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }}
      keyboardShouldPersistTaps="handled"
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
