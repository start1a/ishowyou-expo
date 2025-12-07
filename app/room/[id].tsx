import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Drawer } from 'react-native-drawer-layout';
import { useAuth } from '@src/contexts/AuthContext';
import { useRoom } from '@src/hooks/useRoomApi';
import { useMember } from '@src/hooks/useMemberApi';
import { useRoomSession } from '@src/hooks/useRoomSession';
import { useVideoSync } from '@src/hooks/useVideoSync';
import { useMessages } from '@src/hooks/useMessages';
import { ItemRoomMember } from '@src/components/Member';
import { VideoPlayerComponent } from '@src/components/VideoPlayer';
import { PortraitProgressBar } from '@src/components/ProgressBar';
import { ChatInput, ChatList, VideoListBottomSheet } from '@src/components/Chat';
import { RoomService } from '@src/api';
import { useOrientationContext } from '@src/contexts/OrientationContext';
import { usePlayerSize } from '@src/hooks/usePlayerSize';
import { scaleHeight, scaleWidth } from '@src/DeviceScale';
import { VIDEO_LIST } from '@src/constants/videoData';
import { colors, spacing, sizes, typography } from '@src/theme';
import { IconBack, IconExitRoom } from '@src/assets/icons';

const RoomDetailScreen = () => {

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { room, loading, error, refetch } = useRoom(id || '');

  // 실제 로그인된 사용자 ID 사용
  const currentUserId = user?.uid;

  // 방 멤버 관리 훅
  const { members, isConnected, joinRoom, leaveRoom } = useRoomSession(id || '', currentUserId);
  const { isLandscape } = useOrientationContext();

  // 채팅 메시지 훅
  const { messages, isLoading: messagesLoading, sendMessage } = useMessages(
    id || '',
    currentUserId,
    user ? { displayName: user.displayName || '익명', photoURL: user.photoURL } : undefined
  );
  const insets = useSafeAreaInsets();
  const { playerHeight } = usePlayerSize();

  const [currentUserRole, setCurrentUserRole] = useState<'owner' | 'admin' | 'member'>('member');

  // 비디오 플레이어 상태
  const [selectedVideo, setSelectedVideo] = useState(VIDEO_LIST[0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // 방장 여부 확인
  const isOwner = currentUserRole === 'owner';

  // 동기화 훅
  const {
    isSyncControlEnabled,
    toggleSyncControl,
    isSyncFollowEnabled,
    toggleSyncFollow,
    syncState,
    updateSyncImmediately,
  } = useVideoSync({
    roomId: id || '',
    isOwner,
    currentTime,
    isPlaying,
    videoId: selectedVideo.videoId,
    onSyncVideoChange: (videoId) => {
      // 동기화된 영상으로 변경
      const video = VIDEO_LIST.find(v => v.videoId === videoId);
      if (video) {
        setSelectedVideo(video);
      }
    },
  });

  // 동기화 토글 핸들러 (방장/멤버에 따라 다른 함수 호출)
  const handleSyncToggle = useCallback(() => {
    if (isOwner) {
      toggleSyncControl();
    } else {
      toggleSyncFollow();
    }
  }, [isOwner, toggleSyncControl, toggleSyncFollow]);

  // 현재 동기화 활성화 상태
  const isSyncEnabled = isOwner ? isSyncControlEnabled : isSyncFollowEnabled;

  // 영상 목록 바텀시트 상태
  const [isVideoListVisible, setIsVideoListVisible] = useState(false);

  // 드로어 상태
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const WIDTH_PLAY_HEAD = scaleWidth(15);

  const { updateMemberRole, removeMember } = useMember();

  const handleRoleChange = async (member: any) => {
    if (!isAdmin || member.userId === currentUserId) return;

    const newRole = member.role === 'admin' ? 'member' : 'admin';
    const result = await updateMemberRole(id || '', member.userId, newRole);

    if (result) {
      Alert.alert('성공', `${member.displayName}님의 권한이 변경되었습니다.`);
    }
  };

  const handleRemoveMember = async (member: any) => {
    if (!isAdmin || member.userId === currentUserId || member.role === 'owner') return;

    Alert.alert(
      '멤버 추방',
      `${member.displayName}님을 방에서 추방하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '추방',
          style: 'destructive',
          onPress: async () => {
            const success = await removeMember(id || '', member.userId);
            if (success) {
              Alert.alert('성공', `${member.displayName}님이 방에서 추방되었습니다.`);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (room && !isConnected && currentUserId) {
      // 역할 결정: 방장 > 기존 멤버 역할 > 일반 멤버
      let role: 'owner' | 'admin' | 'member' = 'member';

      if (room.ownerId === currentUserId) {
        role = 'owner';
      } else {
        const currentMember = room.members?.[currentUserId];
        if (currentMember) {
          role = currentMember.role;
        }
      }

      setCurrentUserRole(role);

      // 방에 참여
      joinRoom({
        displayName: user?.displayName || '익명',
        photoURL: user?.photoURL || undefined,
        role
      }).catch((error: Error) => {
        console.error('방 참여 실패:', error);
      });
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (isConnected) {
        leaveRoom().catch((error: Error) => {
          console.error('방 정리 실패:', error);
        });
      }
    };
  }, [room, currentUserId, isConnected, user]);

  const handleLeaveRoom = () => {
    Alert.alert(
      '방 나가기',
      '정말로 방을 나가시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '나가기',
          style: 'destructive',
          onPress: async () => {
            try {
              // 방에서 나가기 (useRoomSession이 Firebase에서 멤버 제거)
              await leaveRoom();
              router.back();
            } catch (error) {
              Alert.alert('오류', '방 나가기에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteRoom = () => {
    Alert.alert(
      '방 삭제',
      '정말로 방을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await RoomService.deleteRoom(id || '');
              if (response.success) {
                Alert.alert('완료', '방이 삭제되었습니다.', [
                  { text: '확인', onPress: () => router.back() }
                ]);
              } else {
                Alert.alert('오류', response.error || '방 삭제에 실패했습니다.');
              }
            } catch (error) {
              Alert.alert('오류', '네트워크 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>방 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>오류: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>방을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const isAdmin = currentUserRole === 'owner' || currentUserRole === 'admin';

  // 풀스크린 모드일 때는 비디오 플레이어만 표시
  if (isLandscape) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
        <StatusBar backgroundColor={colors.backgroundDark} barStyle="light-content" />
        
        <VideoPlayerComponent
          videoId={selectedVideo.videoId}
          onTimeUpdate={(current, total) => {
            setCurrentTime(current);
            setDuration(total);
          }}
          isPlaying={isPlaying}
          onPlayStateChange={setIsPlaying}
          isSyncEnabled={isSyncEnabled}
          isOwner={isOwner}
          onSyncToggle={handleSyncToggle}
          syncTime={syncState?.currentTime}
          syncIsPlaying={syncState?.isPlaying}
          onSyncUpdate={updateSyncImmediately}
        />

        <KeyboardAvoidingView
          style={{
            flex: 1,
            backgroundColor: colors.backgroundCard,
            paddingEnd: insets.right,
            paddingBottom: insets.bottom,
            paddingTop: insets.top,
          }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ChatList
            messages={messages}
            currentUserId={currentUserId || ''}
            isLoading={messagesLoading}
          />
          <ChatInput
            onSend={sendMessage}
            onVideoListPress={() => setIsVideoListVisible(true)}
          />
          <VideoListBottomSheet
            visible={isVideoListVisible}
            onClose={() => setIsVideoListVisible(false)}
            videos={VIDEO_LIST}
            onVideoSelect={setSelectedVideo}
            currentVideoId={selectedVideo.videoId}
          />
        </KeyboardAvoidingView>
      </View>
    );
  }

  // 드로어 콘텐츠 (방 정보)
  const renderDrawerContent = () => (
    <View style={styles.drawerContainer}>
      <View style={[styles.drawerHeader, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.drawerTitle}>방 정보</Text>
        <TouchableOpacity onPress={() => setIsDrawerOpen(false)}>
          <Text style={styles.drawerCloseButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={members}
        renderItem={({ item }) => (
          <ItemRoomMember
            member={item}
            currentUserId={currentUserId || ''}
            isAdmin={isAdmin}
            onRoleChange={handleRoleChange}
            onRemoveMember={handleRemoveMember}
          />
        )}
        keyExtractor={(item) => item.userId}
        ListHeaderComponent={() => (
          <View style={styles.roomInfoHeader}>
            <Text style={styles.roomName}>{room?.name}</Text>
            {room?.description && (
              <Text style={styles.roomDescription}>{room.description}</Text>
            )}
            <Text style={styles.memberCount}>
              {members.length} 명 참여 중
            </Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.drawerFooter}>
            <TouchableOpacity
              style={styles.leaveButton}
              onPress={handleLeaveRoom}
            >
              <IconExitRoom width={18} height={18} color={colors.textSecondary} />
              <Text style={styles.leaveButtonText}>나가기</Text>
            </TouchableOpacity>

            {currentUserRole === 'owner' && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteRoom}
              >
                <Text style={styles.deleteButtonText}>방 삭제</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      />
    </View>
  );

  // 세로 모드
  return (
    <Drawer
      open={isDrawerOpen}
      onOpen={() => setIsDrawerOpen(true)}
      onClose={() => setIsDrawerOpen(false)}
      renderDrawerContent={renderDrawerContent}
      drawerStyle={styles.drawer}
      drawerPosition="right"
    >
      <View style={{ flex: 1 }}>
        <StatusBar backgroundColor={colors.backgroundDark} barStyle="light-content" />
        {/* 헤더 */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <IconBack width={24} height={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{room?.name}</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsDrawerOpen(true)}
          >
            <Text style={styles.memberBadge}>{members.length}</Text>
          </TouchableOpacity>
        </View>

        <View style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <VideoPlayerComponent
            videoId={selectedVideo.videoId}
            onTimeUpdate={(current, total) => {
              setCurrentTime(current);
              setDuration(total);
            }}
            isPlaying={isPlaying}
            onPlayStateChange={setIsPlaying}
            isSyncEnabled={isSyncEnabled}
            isOwner={isOwner}
            onSyncToggle={handleSyncToggle}
            syncTime={syncState?.currentTime}
            syncIsPlaying={syncState?.isPlaying}
            onSyncUpdate={updateSyncImmediately}
          />

          {/* 채팅 영역 */}
          <KeyboardAvoidingView
            style={styles.chatContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={insets.top + scaleHeight(24)}
          >
            <ChatList
              messages={messages}
              currentUserId={currentUserId || ''}
              isLoading={messagesLoading}
            />
            <ChatInput
              onSend={sendMessage}
              onVideoListPress={() => setIsVideoListVisible(true)}
            />
          </KeyboardAvoidingView>

          {/* 영상 목록 바텀시트 */}
          <VideoListBottomSheet
            visible={isVideoListVisible}
            onClose={() => setIsVideoListVisible(false)}
            videos={VIDEO_LIST}
            onVideoSelect={setSelectedVideo}
            currentVideoId={selectedVideo.videoId}
          />

          <PortraitProgressBar
            currentTime={currentTime}
            duration={duration}
            playHeadWidth={WIDTH_PLAY_HEAD}
            playerHeight={playerHeight}
            style={{ bottom: insets.bottom }}
          />
        </View>
      </View>
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  // 드로어 스타일
  drawer: {
    backgroundColor: colors.backgroundCard,
    width: '80%',
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundElevated,
  },
  drawerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  drawerCloseButton: {
    fontSize: 20,
    color: colors.textSecondary,
    padding: spacing.sm,
  },
  drawerFooter: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  // 채팅 스타일
  chatContainer: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
  },
  videoSection: {
    backgroundColor: colors.backgroundDark,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  // 헤더 스타일
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.backgroundElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '300',
  },
  headerTitle: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  memberBadge: {
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    overflow: 'hidden',
    fontWeight: '600',
  },
  roomInfoHeader: {
    backgroundColor: colors.backgroundCard,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  roomName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  roomDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  memberCount: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: sizes.radiusMd,
  },
  leaveButtonText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  deleteButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: sizes.radiusMd,
    flex: 1,
    alignItems: 'center',
    maxWidth: 120,
  },
  deleteButtonText: {
    ...typography.buttonSmall,
    color: colors.textOnPrimary,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.backgroundDark,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: sizes.radiusMd,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
});


export default RoomDetailScreen;
