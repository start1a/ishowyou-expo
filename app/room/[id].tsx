import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform, SafeAreaView, StatusBar, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@src/contexts/AuthContext';
import { useRoom } from '@src/hooks/useRoomApi';
import { useMember } from '@src/hooks/useMemberApi';
import { useRoomSession } from '@src/hooks/useRoomSession';
import { ItemRoomMember } from '@src/components/Member';
import { VideoPlayerComponent } from '@src/components/VideoPlayer';
import { VideoList } from '@src/components/VideoList/VideoList';
import { PortraitProgressBar } from '@src/components/ProgressBar';
import { RoomService } from '@src/api';
import { useOrientation } from '@src/hooks/useOrientation';
import { useOrientationContext } from '@src/contexts/OrientationContext';
import { usePlayerSize } from '@src/hooks/usePlayerSize';
import { scaleWidth } from '@src/DeviceScale';
import { VIDEO_LIST } from '@src/constants/videoData';
import { colors, spacing, sizes, typography } from '@src/theme';

const RoomDetailScreen = () => {

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { room, loading, error, refetch } = useRoom(id || '');
  const { updateOnlineStatus } = useMember();

  // 실제 로그인된 사용자 ID 사용
  const currentUserId = user?.uid;

  // 세션 관리 훅
  const { sessionMembers, isConnected, joinSession, leaveSession } = useRoomSession(id || '', currentUserId);
  const { isLandscape } = useOrientationContext();
  const insets = useSafeAreaInsets();
  const { playerHeight } = usePlayerSize();

  const [currentUserRole, setCurrentUserRole] = useState<'owner' | 'admin' | 'member'>('member');

  // 비디오 플레이어 상태
  const [selectedVideo, setSelectedVideo] = useState(VIDEO_LIST[0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // 탭 상태 (비디오 목록 또는 방 정보)
  const [activeTab, setActiveTab] = useState<'videos' | 'room'>('videos');

  const WIDTH_PLAY_HEAD = scaleWidth(15);

  const { updateMemberRole, removeMember, loading: memberLoading } = useMember();

  const handleRoleChange = async (member: any) => {
    if (!isAdmin || member.id === currentUserId) return;

    const newRole = member.role === 'admin' ? 'member' : 'admin';
    const result = await updateMemberRole(id || '', member.id, newRole);

    if (result) {
      Alert.alert('성공', `${member.nickname}님의 권한이 변경되었습니다.`);
      refetch();
    }
  };

  const handleRemoveMember = async (member: any) => {
    if (!isAdmin || member.id === currentUserId || member.role === 'owner') return;

    Alert.alert(
      '멤버 추방',
      `${member.nickname}님을 방에서 추방하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '추방',
          style: 'destructive',
          onPress: async () => {
            const success = await removeMember(id || '', member.id);
            if (success) {
              Alert.alert('성공', `${member.nickname}님이 방에서 추방되었습니다.`);
              refetch();
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (room && !isConnected && currentUserId) {
      const currentMember = room.members.find(m => m.id === currentUserId);
      if (currentMember) {
        setCurrentUserRole(currentMember.role);

        // 세션에 참여
        joinSession({
          nickname: currentMember.nickname || user?.displayName || '익명',
          avatar: currentMember.avatar || user?.photoURL || undefined,
          role: currentMember.role
        }).catch(error => {
          console.error('세션 참여 실패:', error);
        });
      }
    }

    // 컴포넌트 언마운트 시 세션 정리
    return () => {
      if (isConnected) {
        leaveSession().catch(error => {
          console.error('세션 정리 실패:', error);
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
              // 세션에서 먼저 나가기
              await leaveSession();

              // 방에서 나가기
              if (currentUserId) {
                const response = await RoomService.leaveRoom(id || '', currentUserId);
                if (response.success) {
                  router.back();
                } else {
                  Alert.alert('오류', response.error || '방 나가기에 실패했습니다.');
                }
              } else {
                Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.');
              }
            } catch (error) {
              Alert.alert('오류', '네트워크 오류가 발생했습니다.');
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
      <View style={{ flex: 1 }}>
        <StatusBar backgroundColor={colors.backgroundDark} barStyle="light-content" />
        <View style={{ width: insets.left, position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: colors.backgroundDark }} />

        <SafeAreaView style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
          <VideoPlayerComponent
            videoId={selectedVideo.videoId}
            onTimeUpdate={(current, total) => {
              setCurrentTime(current);
              setDuration(total);
            }}
          />

          <View style={{
            flex: 1,
            backgroundColor: colors.backgroundCard,
            width: '35%',
            paddingEnd: insets.bottom,
            paddingBottom: insets.bottom,
          }}>
            {renderTabContent()}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // 세로 모드
  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor={colors.backgroundDark} barStyle="light-content" />
      <View style={{ height: insets.top, backgroundColor: colors.backgroundDark }} />

      <SafeAreaView style={{
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
        />

        {/* 탭 헤더 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
            onPress={() => setActiveTab('videos')}
          >
            <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
              비디오 목록
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'room' && styles.activeTab]}
            onPress={() => setActiveTab('room')}
          >
            <Text style={[styles.tabText, activeTab === 'room' && styles.activeTabText]}>
              방 정보
            </Text>
          </TouchableOpacity>
        </View>

        {/* 탭 콘텐츠 */}
        <View style={{
          flex: 1,
          backgroundColor: colors.backgroundCard,
          width: '100%',
          paddingBottom: insets.bottom,
        }}>
          {renderTabContent()}
        </View>

        <PortraitProgressBar
          currentTime={currentTime}
          duration={duration}
          playHeadWidth={WIDTH_PLAY_HEAD}
          playerHeight={playerHeight}
          style={{ bottom: insets.bottom }}
        />
      </SafeAreaView>
    </View>
  );

  // 탭 콘텐츠 렌더링 함수
  function renderTabContent() {
    if (activeTab === 'videos') {
      return (
        <VideoList
          videos={VIDEO_LIST}
          onVideoSelect={setSelectedVideo}
        />
      );
    } else {
      const renderRoomHeader = () => (
        <View style={styles.roomInfoHeader}>
          <Text style={styles.roomName}>{room?.name}</Text>
          {room?.description && (
            <Text style={styles.roomDescription}>{room.description}</Text>
          )}
          <Text style={styles.memberCount}>
            {room?.currentMembers}/{room?.maxMembers} 명
          </Text>
        </View>
      );

      const renderMemberItem = ({ item }: { item: any }) => (
        <ItemRoomMember
          member={item}
          currentUserId={currentUserId || ''}
          isAdmin={isAdmin}
          onRoleChange={handleRoleChange}
          onRemoveMember={handleRemoveMember}
        />
      );

      const renderRoomFooter = () => (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.leaveButton}
            onPress={handleLeaveRoom}
          >
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
      );

      return (
        <FlatList
          data={room?.members || []}
          renderItem={renderMemberItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderRoomHeader}
          ListFooterComponent={renderRoomFooter}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        />
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  videoSection: {
    backgroundColor: colors.backgroundDark,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
  },
  activeTab: {
    backgroundColor: colors.backgroundCard,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
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
