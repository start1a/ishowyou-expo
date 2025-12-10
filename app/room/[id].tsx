import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList, StatusBar } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
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
import { VideoData } from '@src/types/VideoData';
import { RoomVideo } from '@src/api/types';
import { VideoUtils } from '@src/utils/VideoUtils';
import { colors, spacing, sizes, typography } from '@src/theme';
import { IconBack, IconExitRoom, IconUser } from '@src/assets/icons';
import { YouTubeBrowser } from '@src/components/YouTubeBrowser';
import { Toast } from '@src/components/Toast';

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

  // 동적 영상 목록 상태
  const [videoList, setVideoList] = useState<VideoData[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);

  // 비디오 플레이어 상태
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
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
    videoId: selectedVideo?.videoId || '',
    onSyncVideoChange: (videoId) => {
      // 동기화된 영상으로 변경
      const video = videoList.find(v => v.videoId === videoId);
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

  // YouTube 브라우저 상태
  const [isYouTubeBrowserVisible, setIsYouTubeBrowserVisible] = useState(false);

  // 토스트 알림 상태
  const [toastState, setToastState] = useState<{
    visible: boolean;
    message: string;
    subtitle?: string;
    thumbnail?: string;
    type: 'success' | 'error' | 'info';
  }>({ visible: false, message: '', type: 'success' });

  const showToast = (
    message: string,
    thumbnail?: string,
    type: 'success' | 'error' | 'info' = 'success',
    subtitle?: string
  ) => {
    setToastState({ visible: true, message, subtitle, thumbnail, type });
  };

  const hideToast = () => {
    setToastState(prev => ({ ...prev, visible: false }));
  };

  // Firebase에서 영상 목록 불러오기
  useEffect(() => {
    const loadVideos = async () => {
      if (!id) return;

      setIsLoadingVideos(true);
      try {
        const response = await RoomService.getVideosFromRoom(id);
        if (response.success && response.data) {
          const videos = response.data.map(roomVideoToVideoData);
          setVideoList(videos);

          // 첫 번째 영상을 기본 선택 (이미 선택된 영상이 없을 때만)
          if (!selectedVideo && videos.length > 0) {
            setSelectedVideo(videos[0]);
          }
        }
      } catch (error) {
        console.error('영상 목록 불러오기 오류:', error);
      } finally {
        setIsLoadingVideos(false);
      }
    };

    loadVideos();
  }, [id]);

  // 공유된 비디오 처리 및 방에 추가
  useEffect(() => {
    const handleSharedVideo = async () => {
      if (!sharedVideoId || !id || !currentUserId) return;

      // 기존 영상 목록에서 찾기
      const existingVideo = videoList.find(v => v.videoId === sharedVideoId);
      if (existingVideo) {
        setSelectedVideo(existingVideo);
        return;
      }

      // YouTube oEmbed API로 영상 정보 가져오기 (무료)
      const videoInfo = await VideoUtils.fetchVideoInfo(sharedVideoId);

      // 공유된 비디오를 방에 추가
      const newRoomVideo: Omit<RoomVideo, 'addedAt'> = {
        videoId: sharedVideoId,
        title: videoInfo?.title || '공유된 영상',
        thumbnail: videoInfo?.thumbnail || VideoUtils.getThumbnailUrl(sharedVideoId, 'high'),
        channelName: videoInfo?.channelName || 'YouTube',
        addedBy: currentUserId,
      };

      const response = await RoomService.addVideoToRoom(id, newRoomVideo);
      if (response.success && response.data) {
        const newVideoData = roomVideoToVideoData(response.data);
        setVideoList(prev => [...prev, newVideoData]);
        setSelectedVideo(newVideoData);
        showToast(`"${newRoomVideo.title}" 추가됨`, newRoomVideo.thumbnail, 'success');
      } else if (response.error === '이미 추가된 영상입니다') {
        // 이미 있는 영상이면 해당 영상 선택
        const video = videoList.find(v => v.videoId === sharedVideoId);
        if (video) {
          setSelectedVideo(video);
        }
      }
    };

    handleSharedVideo();
  }, [sharedVideoId, id, currentUserId, videoList]);

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

  // YouTube 브라우저에서 영상 선택 시 처리
  const handleYouTubeVideoSelect = async (video: {
    videoId: string;
    title: string;
    channelName: string;
    thumbnail: string;
  }) => {
    if (!id || !currentUserId) return;

    // 이미 목록에 있는지 확인
    const existingVideo = videoList.find(v => v.videoId === video.videoId);
    if (existingVideo) {
      setSelectedVideo(existingVideo);
      showToast('이미 추가된 영상입니다', existingVideo.thumbnail, 'info');
      return;
    }

    // 방에 영상 추가
    const newRoomVideo: Omit<RoomVideo, 'addedAt'> = {
      videoId: video.videoId,
      title: video.title,
      thumbnail: video.thumbnail,
      channelName: video.channelName,
      addedBy: currentUserId,
    };

    const response = await RoomService.addVideoToRoom(id, newRoomVideo);
    if (response.success && response.data) {
      const newVideoData = roomVideoToVideoData(response.data);
      setVideoList(prev => [...prev, newVideoData]);
      setSelectedVideo(newVideoData);
      showToast(`"${video.title}" 추가됨`, video.thumbnail, 'success');
    } else {
      showToast(response.error || '영상 추가 실패', undefined, 'error');
    }
  };

  // YouTube 브라우저에서 여러 영상 선택 시 배치 처리
  const handleYouTubeMultipleVideoSelect = async (
    videos: { videoId: string; title: string; channelName: string; thumbnail: string }[]
  ) => {
    if (!id || !currentUserId) return;

    const results = {
      total: videos.length,
      succeeded: [] as typeof videos,
      failed: [] as typeof videos,
      alreadyExists: [] as typeof videos,
    };

    // 각 영상 처리
    for (const video of videos) {
      // 이미 목록에 있는지 확인
      const existingVideo = videoList.find(v => v.videoId === video.videoId);
      if (existingVideo) {
        results.alreadyExists.push(video);
        continue;
      }

      // 방에 영상 추가
      const newRoomVideo: Omit<RoomVideo, 'addedAt'> = {
        videoId: video.videoId,
        title: video.title,
        thumbnail: video.thumbnail,
        channelName: video.channelName,
        addedBy: currentUserId,
      };

      const response = await RoomService.addVideoToRoom(id, newRoomVideo);
      if (response.success && response.data) {
        const newVideoData = roomVideoToVideoData(response.data);
        setVideoList(prev => [...prev, newVideoData]);
        results.succeeded.push(video);

        // 첫 번째 성공한 영상을 선택
        if (results.succeeded.length === 1) {
          setSelectedVideo(newVideoData);
        }
      } else {
        results.failed.push(video);
      }
    }

    // 집계 결과에 따른 토스트 표시
    const successCount = results.succeeded.length;
    const failCount = results.failed.length;
    const existCount = results.alreadyExists.length;

    if (successCount === results.total) {
      // 모두 성공
      showToast(
        `${successCount}개 영상이 추가되었습니다`,
        results.succeeded[0]?.thumbnail,
        'success'
      );
    } else if (successCount === 0) {
      // 모두 실패
      if (existCount > 0) {
        showToast('이미 추가된 영상입니다', undefined, 'info');
      } else {
        showToast('영상을 추가할 수 없습니다', undefined, 'error');
      }
    } else {
      // 부분 성공
      const failedTitles = results.failed.map(v => v.title).join(', ');
      const subtitle = failCount > 0
        ? `${failCount}개 영상을 불러올 수 없습니다: ${failedTitles}`
        : undefined;

      showToast(
        `${results.total}개 중 ${successCount}개 영상이 추가되었습니다`,
        results.succeeded[0]?.thumbnail,
        'info',
        subtitle
      );
    }
  };

  // 영상 삭제 처리
  const handleVideoDelete = async (video: VideoData) => {
    if (!id) return;

    const response = await RoomService.removeVideoFromRoom(id, video.videoId);
    if (response.success) {
      setVideoList(prev => prev.filter(v => v.videoId !== video.videoId));
      // 삭제된 영상이 현재 재생 중인 영상이면 다른 영상 선택
      if (selectedVideo?.videoId === video.videoId) {
        const remainingVideos = videoList.filter(v => v.videoId !== video.videoId);
        setSelectedVideo(remainingVideos.length > 0 ? remainingVideos[0] : null);
      }
      showToast(`"${video.title}" 삭제됨`, undefined, 'success');
    } else {
      showToast(response.error || '영상 삭제 실패', undefined, 'error');
    }
  };

  // 영상 순서 변경 처리
  const handleVideoReorder = async (reorderedVideos: VideoData[]) => {
    if (!id) return;

    // 로컬 state 업데이트
    setVideoList(reorderedVideos);

    // TODO: 서버에 새로운 순서 저장
    // const videoIds = reorderedVideos.map(v => v.videoId);
    // await RoomService.updateVideoOrder(id, videoIds);
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

        {selectedVideo ? (
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
        ) : (
          <View style={[styles.noVideoContainer, { flex: 1 }]}>
            <Text style={styles.noVideoText}>영상을 추가해주세요</Text>
          </View>
        )}

        <KeyboardAvoidingView
          style={{
            flex: 1,
            backgroundColor: colors.backgroundCard,
            paddingEnd: insets.right,
            paddingBottom: insets.bottom,
            paddingTop: insets.top,
          }}
          behavior="padding"
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
            videos={videoList}
            onVideoSelect={setSelectedVideo}
            currentVideoId={selectedVideo?.videoId || ''}
            onAddVideoPress={() => setIsYouTubeBrowserVisible(true)}
            onVideoDelete={handleVideoDelete}
            canDelete={isAdmin}
            canReorder={isAdmin}
            onVideoReorder={handleVideoReorder}
          />
          {/* YouTube 브라우저 (가로 모드) */}
          <YouTubeBrowser
            visible={isYouTubeBrowserVisible}
            onClose={() => setIsYouTubeBrowserVisible(false)}
            onSelectVideo={handleYouTubeVideoSelect}
            onSelectMultipleVideos={handleYouTubeMultipleVideoSelect}
          />
          {/* 토스트 알림 (가로 모드) */}
          <Toast
            visible={toastState.visible}
            message={toastState.message}
            subtitle={toastState.subtitle}
            thumbnail={toastState.thumbnail}
            type={toastState.type}
            onHide={hideToast}
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
              style={styles.footerButton}
              onPress={handleLeaveRoom}
            >
              <IconExitRoom width={18} height={18} color={colors.textSecondary} />
              <Text style={styles.footerButtonText}>방 나가기</Text>
            </TouchableOpacity>

            {currentUserRole === 'owner' && (
              <TouchableOpacity
                style={[styles.footerButton, styles.deleteButton]}
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
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.memberBadgeContainer}>
              <IconUser width={14} height={14} color={colors.textPrimary} />
              <Text style={styles.memberBadge}>{members.length}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          {selectedVideo ? (
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
          ) : (
            <View style={[styles.noVideoContainer, { height: playerHeight }]}>
              <Text style={styles.noVideoText}>
                {isLoadingVideos ? '영상 불러오는 중...' : '영상을 추가해주세요'}
              </Text>
              <Text style={styles.noVideoSubtext}>
                YouTube에서 영상을 공유하거나{'\n'}영상 목록에서 추가할 수 있습니다
              </Text>
            </View>
          )}

          {/* 채팅 영역 */}
          <KeyboardAvoidingView
            style={styles.chatContainer}
            behavior="padding"
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
            videos={videoList}
            onVideoSelect={setSelectedVideo}
            currentVideoId={selectedVideo?.videoId || ''}
            onAddVideoPress={() => setIsYouTubeBrowserVisible(true)}
            onVideoDelete={handleVideoDelete}
            canDelete={isAdmin}
            canReorder={isAdmin}
            onVideoReorder={handleVideoReorder}
          />

          {/* YouTube 브라우저 */}
          <YouTubeBrowser
            visible={isYouTubeBrowserVisible}
            onClose={() => setIsYouTubeBrowserVisible(false)}
            onSelectVideo={handleYouTubeVideoSelect}
            onSelectMultipleVideos={handleYouTubeMultipleVideoSelect}
          />

          {/* 토스트 알림 */}
          <Toast
            visible={toastState.visible}
            message={toastState.message}
            subtitle={toastState.subtitle}
            thumbnail={toastState.thumbnail}
            type={toastState.type}
            onHide={hideToast}
          />

          {selectedVideo && (
            <PortraitProgressBar
              currentTime={currentTime}
              duration={duration}
              playHeadWidth={WIDTH_PLAY_HEAD}
              playerHeight={playerHeight}
              style={{ bottom: insets.bottom }}
            />
          )}
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
    flexDirection: 'column',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
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
  memberBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    gap: 4,
  },
  memberBadge: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  roomInfoHeader: {
    backgroundColor: colors.backgroundCard,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    marginBottom: spacing.md,
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
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: sizes.radiusMd,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footerButtonText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderColor: colors.error,
  },
  deleteButtonText: {
    ...typography.bodySmall,
    color: colors.error,
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
  noVideoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
    padding: spacing.xl,
  },
  noVideoText: {
    ...typography.h3,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  noVideoSubtext: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});


export default RoomDetailScreen;
