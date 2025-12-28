import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, StatusBar, Platform } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
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
import { VideoData } from '@src/types/VideoData';
import { RoomVideo, PlaybackSettings } from '@src/api/types';
import { VideoUtils } from '@src/utils/VideoUtils';
import { colors, spacing, sizes, typography } from '@src/theme';
import { IconBack, IconExitRoom, IconUser, IconX } from '@src/assets/icons';
import { YouTubeBrowser } from '@src/components/YouTubeBrowser';
import { Toast } from '@src/components/Toast';
import { ConfirmDialog } from '@src/components/ConfirmDialog';
import { useRecentRoomsContext } from '@src/contexts/RecentRoomsContext';
import { sendPushNotification } from '@src/utils/pushNotifications';
import { ref, get } from 'firebase/database';
import { database } from '@src/config/firebase';
import { useVideoPlaylist } from '@src/hooks/useVideoPlaylist';

import { RoomPortraitView } from '@src/components/Room/RoomPortraitView';
import { RoomLandscapeView } from '@src/components/Room/RoomLandscapeView';


// RoomVideo를 VideoData로 변환하는 헬퍼 함수
const roomVideoToVideoData = (roomVideo: RoomVideo): VideoData => ({
  id: roomVideo.videoId,
  title: roomVideo.title,
  videoId: roomVideo.videoId,
  thumbnail: roomVideo.thumbnail,
  duration: roomVideo.duration || 0,
  channelName: roomVideo.channelName || 'YouTube',
  uploadDate: new Date(roomVideo.addedAt).toISOString().split('T')[0],
});

const RoomDetailScreen = () => {

  const { id, sharedVideoId } = useLocalSearchParams<{ id: string; sharedVideoId?: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { room, loading, error, refetch } = useRoom(id || '');
  const { setCurrentRoom } = useRecentRoomsContext();

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

  // 비디오 플레이어 상태 (동기화 훅과의 연동을 위해 상위에 유지)
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // 재생 설정 상태
  const [playbackSettings, setPlaybackSettings] = useState<PlaybackSettings>({
    repeatMode: 'all',
    shuffle: false,
    setBy: '',
    updatedAt: Date.now()
  });

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
    videoId: '', // useVideoPlaylist에서 업데이트됨
    onSyncVideoChange: (videoId) => {
      // Logic handled via hook or selection
    },
    onSyncTimeChange: setCurrentTime,
    onSyncPlayStateChange: setIsPlaying,
  });

  const isSyncEnabled = isOwner ? isSyncControlEnabled : isSyncFollowEnabled;

  // 토스트 및 다이얼로그 상태는 부모에서 관리 (공통 컨트롤러 필요)
  const [toastState, setToastState] = useState<{
    visible: boolean;
    message: string;
    subtitle?: string;
    thumbnail?: string;
    type: 'success' | 'error' | 'info';
  }>({ visible: false, message: '', type: 'success' });

  const showToast = (message: string, thumbnail?: string, type: 'success' | 'error' | 'info' = 'success', subtitle?: string) => {
    setToastState({ visible: true, message, subtitle, thumbnail, type });
  };

  // 알림 발송 함수 (기존 로직 유지)
  const notifyMembersOfNewVideo = useCallback(async (videoTitle: string) => {
    if (!id || !members || members.length <= 1) return;
    try {
      const tokenPromises = members
        .filter(m => m.userId !== currentUserId)
        .map(async (member) => {
          const userRef = ref(database, `users/${member.userId}`);
          const snapshot = await get(userRef);
          return snapshot.exists() ? snapshot.val().pushToken : null;
        });
      const results = await Promise.all(tokenPromises);
      const tokens = results.filter(t => t);
      if (tokens.length > 0) {
        await sendPushNotification(tokens, '새 영상이 추가되었어요! 🎬', `${user?.displayName || '익명'}님이 '${videoTitle}' 영상을 추가했습니다.`, { url: `/room/${id}` });
      }
    } catch (error) {
      console.error('알림 발송 실패:', error);
    }
  }, [id, members, currentUserId, user]);

  // [REFACTORED] 영상 목록 및 재생 로직 추출
  const {
    videoList,
    isLoadingVideos,
    selectedVideo,
    setSelectedVideo,
    handleYouTubeVideoSelect,
    handleYouTubeMultipleVideoSelect,
    handleVideoDelete,
    handleVideoReorder,
    handleVideoEnded,
  } = useVideoPlaylist({
    roomId: id || '',
    currentUserId,
    sharedVideoId,
    playbackSettings,
    isOwner,
    isSyncEnabled,
    updateSyncImmediately,
    showToast,
    notifyMembersOfNewVideo,
    onIsPlayingChange: setIsPlaying,
  });

  // 나머지 상태들
  const [isVideoListVisible, setIsVideoListVisible] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isYouTubeBrowserVisible, setIsYouTubeBrowserVisible] = useState(false);
  const [isLeaveConfirmVisible, setIsLeaveConfirmVisible] = useState(false);
  const [removeMemberConfirm, setRemoveMemberConfirm] = useState<{ visible: boolean; member: any | null; }>({ visible: false, member: null });
  const [isDeleteRoomConfirmVisible, setIsDeleteRoomConfirmVisible] = useState(false);

  // 재생 설정 구독
  useEffect(() => {
    if (!id) return;
    return RoomService.subscribeToPlaybackSettings(id, (settings) => {
      if (settings) setPlaybackSettings(settings);
    });
  }, [id]);

  // 방 정보 상태 업데이트 (홈 화면 동기화용)
  useEffect(() => {
    if (room) {
      const updatedRoom = {
        ...room,
        videos: videoList.map(v => ({
          videoId: v.videoId, title: v.title, thumbnail: v.thumbnail, channelName: v.channelName,
          duration: v.duration, addedBy: '', addedAt: 0,
        })),
        videoState: selectedVideo ? {
          videoId: selectedVideo.videoId, currentTime: room.videoState?.currentTime ?? 0,
          isPlaying, updatedAt: room.videoState?.updatedAt ?? Date.now(), updatedBy: room.videoState?.updatedBy ?? '',
        } : room.videoState,
      };
      setCurrentRoom(updatedRoom);
    }
  }, [room, selectedVideo, isPlaying, videoList, setCurrentRoom]);

  const { updateMemberRole, removeMember } = useMember();

  const handleRoleChange = async (member: any) => {
    if (!isAdmin || member.userId === currentUserId) return;
    const newRole = member.role === 'admin' ? 'member' : 'admin';
    const result = await updateMemberRole(id || '', member.userId, newRole);
    if (result) showToast(`${member.displayName}님의 권한이 변경되었습니다.`, undefined, 'success');
  };

  const handleLeaveRoom = () => setIsLeaveConfirmVisible(true);
  const handleDeleteRoom = () => setIsDeleteRoomConfirmVisible(true);


  const isAdmin = currentUserRole === 'owner' || currentUserRole === 'admin';

  // [REFACTORED] 하위 컴포넌트로 전달할 공통 Props (Landscape/Portrait 공용)
  const commonUIProps = {
    selectedVideo,
    currentTime,
    duration,
    isPlaying,
    setIsPlaying,
    isSyncEnabled,
    isOwner,
    handleSyncToggle: () => isOwner ? toggleSyncControl() : toggleSyncFollow(),
    syncState,
    updateSyncImmediately,
    handleVideoEnded,
    playbackSettings,
    handlePlaybackSettingsChange: (updates: any) => RoomService.updatePlaybackSettings(id || '', { ...playbackSettings, ...updates }),
    isAdmin,
    showToast,
    messages,
    currentUserId: currentUserId || '',
    messagesLoading,
    sendMessage,
    isVideoListVisible,
    setIsVideoListVisible,
    videoList,
    setSelectedVideo,
    isYouTubeBrowserVisible,
    setIsYouTubeBrowserVisible,
    handleVideoDelete,
    handleVideoReorder,
    handleYouTubeVideoSelect,
    handleYouTubeMultipleVideoSelect,
    toastState,
    hideToast: () => setToastState(prev => ({ ...prev, visible: false })),
    isLeaveConfirmVisible,
    confirmLeaveRoom: async () => { setIsLeaveConfirmVisible(false); await leaveRoom(); router.back(); },
    setIsLeaveConfirmVisible,
    removeMemberConfirm,
    confirmRemoveMember: async () => {
      const member = removeMemberConfirm.member;
      setRemoveMemberConfirm({ visible: false, member: null });
      if (member && await removeMember(id || '', member.userId)) showToast(`${member.displayName}님 추방됨`);
    },
    setRemoveMemberConfirm,
    insets: insets || { top: 0, bottom: 0, left: 0, right: 0 },
    playerHeight,
    onTimeUpdate: (current: number, total: number) => {
      setCurrentTime(current);
      setDuration(total);
    }
  };

  if (loading) return <View style={styles.centerContainer}><Text style={styles.loadingText}>로딩 중...</Text></View>;
  if (!room) return <View style={styles.centerContainer}><Text style={styles.loadingText}>방을 찾을 수 없습니다.</Text></View>;

  return (
    <Drawer
      open={isDrawerOpen}
      onOpen={() => setIsDrawerOpen(true)}
      onClose={() => setIsDrawerOpen(false)}
      drawerPosition="right"
      renderDrawerContent={() => (
        <View style={[styles.drawerContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>멤버 ({members.length})</Text>
            <TouchableOpacity onPress={() => setIsDrawerOpen(false)}>
              <Text style={{ color: 'white' }}>닫기</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={members}
            keyExtractor={(item) => item.userId}
            renderItem={({ item }) => (
              <ItemRoomMember
                member={item}
                currentUserId={currentUserId || ''}
                isAdmin={isAdmin}
                onRoleChange={handleRoleChange}
                onRemoveMember={async (m) => setRemoveMemberConfirm({ visible: true, member: m })}
              />
            )}
            contentContainerStyle={{ padding: 16 }}
          />
          <View style={styles.drawerFooter}>
            <TouchableOpacity style={styles.leaveButton} onPress={() => setIsLeaveConfirmVisible(true)}>
              <IconExitRoom width={20} height={20} fill={colors.error} />
              <Text style={styles.leaveButtonText}>방 나가기</Text>
            </TouchableOpacity>
            {isOwner && (
              <TouchableOpacity style={styles.deleteButton} onPress={() => setIsDeleteRoomConfirmVisible(true)}>
                <Text style={styles.deleteButtonText}>방 삭제</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    >
      {isLandscape ? (
        <RoomLandscapeView {...commonUIProps} />
      ) : (
        <RoomPortraitView
          {...commonUIProps}
          roomName={room?.name || '방'}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onBack={() => router.back()}
        />
      )}

      {/* 방 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        visible={isDeleteRoomConfirmVisible}
        title="방 삭제"
        message="정말로 방을 삭제하시겠습니까? 모든 멤버가 나가게 됩니다."
        confirmText="삭제"
        cancelText="취소"
        confirmColor={colors.error}
        onConfirm={async () => {
          setIsDeleteRoomConfirmVisible(false);
          const response = await RoomService.deleteRoom(id || '');
          if (response.success) {
            showToast('방이 삭제되었습니다.');
            router.back();
          } else {
            showToast(response.error || '방 삭제 실패', undefined, 'error');
          }
        }}
        onCancel={() => setIsDeleteRoomConfirmVisible(false)}
      />
    </Drawer>
  );
};

export default RoomDetailScreen;

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundDark },
  loadingText: { color: 'white', fontSize: 16 },
  drawerContainer: { flex: 1, backgroundColor: colors.backgroundDark, width: 280 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  drawerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  drawerFooter: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  leaveButton: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  leaveButtonText: { color: colors.error, marginLeft: 8, fontSize: 16 },
  deleteButton: { marginTop: 8, padding: 12 },
  deleteButtonText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
});
