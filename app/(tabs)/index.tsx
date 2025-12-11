import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { CreateRoomForm } from '@src/components/Room';
import { MiniHeader } from '@src/components/common';
import { PublicRoomCard, CurrentRoomCard } from '@src/components/Home';
import { Room } from '@src/api/types';
import { useRooms } from '@src/hooks/useRoomApi';
import { useRecentRoomsContext } from '@src/contexts/RecentRoomsContext';
import { colors, spacing, typography, sizes } from '@src/theme';
import { IconAdd } from '@src/assets/icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const HomeScreen = () => {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // FAB 애니메이션
  const fabScale = useSharedValue(1);
  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  // 방 목록 데이터
  const { rooms, loading, error, refetch } = useRooms();

  // 현재 방 데이터 (전역 상태)
  const { currentRoom } = useRecentRoomsContext();

  const handleRoomSelect = (room: Room) => {
    router.push(`/room/${room.id}`);
  };

  const handleRoomCreated = (roomId: string) => {
    setShowCreateModal(false);
    router.push(`/room/${roomId}`);
  };

  const handleProfilePress = () => {
    router.push('/(tabs)/settings');
  };

  const handleFabPressIn = () => {
    fabScale.value = withTiming(0.95, { duration: 100 });
  };

  const handleFabPressOut = () => {
    fabScale.value = withTiming(1, { duration: 100 });
  };

  // 리스트 헤더 (현재 방 카드 + 섹션 타이틀)
  const ListHeader = () => (
    <View>
      {/* 현재 접속 중인 방 */}
      {currentRoom && (
        <CurrentRoomCard room={currentRoom} onPress={handleRoomSelect} />
      )}

      {/* 섹션 타이틀 */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionIcon}>🌐</Text>
          <Text style={styles.sectionTitle}>참여 가능한 방</Text>
        </View>
      </View>
    </View>
  );

  // 빈 상태
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🌙</Text>
      <Text style={styles.emptyTitle}>아직 생성된 방이 없습니다</Text>
      <Text style={styles.emptySubtitle}>우측 하단 버튼으로 방을 만들어보세요!</Text>
    </View>
  );

  // 에러 상태
  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>⚠️</Text>
      <Text style={styles.emptyTitle}>오류가 발생했습니다</Text>
      <Text style={styles.emptySubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={refetch}>
        <Text style={styles.retryButtonText}>다시 시도</Text>
      </TouchableOpacity>
    </View>
  );

  // 로딩 상태
  const renderLoadingState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.loadingText}>방 목록을 불러오는 중...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <MiniHeader onProfilePress={handleProfilePress} />

      {/* 메인 콘텐츠 */}
      <View style={styles.content}>
        {error ? (
          renderErrorState()
        ) : loading && rooms.length === 0 ? (
          renderLoadingState()
        ) : rooms.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={rooms}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <PublicRoomCard room={item} onPress={handleRoomSelect} />
              </View>
            )}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={ListHeader}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refetch}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>


      {/* 플로팅 버튼 (FAB) */}
      <AnimatedPressable
        style={[styles.fab, fabAnimatedStyle]}
        onPress={() => setShowCreateModal(true)}
        onPressIn={handleFabPressIn}
        onPressOut={handleFabPressOut}
      >
        <IconAdd width={28} height={28} color={colors.textOnPrimary} />
      </AnimatedPressable>

      {/* 방 만들기 모달 */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <CreateRoomForm
            onRoomCreated={handleRoomCreated}
            onCancel={() => setShowCreateModal(false)}
          />
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  cardWrapper: {
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: sizes.radiusMd,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
  },
});
