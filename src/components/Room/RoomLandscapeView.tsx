import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { VideoPlayerComponent } from '@src/components/VideoPlayer';
import { ChatInput, ChatList, VideoListBottomSheet } from '@src/components/Chat';
import { YouTubeBrowser } from '@src/components/YouTubeBrowser';
import { Toast } from '@src/components/Toast';
import { ConfirmDialog } from '@src/components/ConfirmDialog';
import { colors } from '@src/theme';
import { VideoData } from '@src/types/VideoData';
import { SyncState, PlaybackSettings } from '@src/api/types';

interface RoomLandscapeViewProps {
    selectedVideo: VideoData | null;
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;
    isSyncEnabled: boolean;
    isOwner: boolean;
    handleSyncToggle: () => void;
    syncState: SyncState | null;
    updateSyncImmediately: (time: number, isPlaying: boolean) => void;
    handleVideoEnded: () => void;
    playbackSettings: PlaybackSettings;
    handlePlaybackSettingsChange: (updates: Partial<PlaybackSettings>) => void;
    isAdmin: boolean;
    showToast: (message: string, thumbnail?: string, type?: 'success' | 'error' | 'info') => void;
    messages: any[];
    currentUserId: string;
    messagesLoading: boolean;
    sendMessage: (text: string) => void;
    isVideoListVisible: boolean;
    setIsVideoListVisible: (visible: boolean) => void;
    videoList: VideoData[];
    setSelectedVideo: (video: VideoData) => void;
    isYouTubeBrowserVisible: boolean;
    setIsYouTubeBrowserVisible: (visible: boolean) => void;
    handleVideoDelete: (video: VideoData) => void;
    handleVideoReorder: (videos: VideoData[]) => void;
    handleYouTubeVideoSelect: (video: any) => void;
    handleYouTubeMultipleVideoSelect: (videos: any[]) => void;
    toastState: any;
    hideToast: () => void;
    isLeaveConfirmVisible: boolean;
    confirmLeaveRoom: () => void;
    setIsLeaveConfirmVisible: (visible: boolean) => void;
    removeMemberConfirm: any;
    confirmRemoveMember: () => void;
    setRemoveMemberConfirm: (state: any) => void;
    insets: any;
}

export const RoomLandscapeView = ({
    selectedVideo,
    isPlaying,
    setIsPlaying,
    isSyncEnabled,
    isOwner,
    handleSyncToggle,
    syncState,
    updateSyncImmediately,
    handleVideoEnded,
    playbackSettings,
    handlePlaybackSettingsChange,
    isAdmin,
    showToast,
    messages,
    currentUserId,
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
    hideToast,
    isLeaveConfirmVisible,
    confirmLeaveRoom,
    setIsLeaveConfirmVisible,
    removeMemberConfirm,
    confirmRemoveMember,
    setRemoveMemberConfirm,
    insets
}: RoomLandscapeViewProps) => {
    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={colors.backgroundDark} barStyle="light-content" />

            {selectedVideo ? (
                <VideoPlayerComponent
                    videoId={selectedVideo.videoId}
                    onTimeUpdate={() => { }} // Time update is handled in Landscape inside component
                    isPlaying={isPlaying}
                    onPlayStateChange={setIsPlaying}
                    isSyncEnabled={isSyncEnabled}
                    isOwner={isOwner}
                    onSyncToggle={handleSyncToggle}
                    syncTime={syncState?.currentTime}
                    syncIsPlaying={syncState?.isPlaying}
                    onSyncUpdate={updateSyncImmediately}
                    onVideoEnded={handleVideoEnded}
                    repeatOne={playbackSettings.repeatMode === 'repeat-one'}
                    playbackSettings={playbackSettings}
                    onPlaybackSettingsChange={handlePlaybackSettingsChange}
                    isAdmin={isAdmin}
                    showToast={showToast}
                />
            ) : (
                <View style={styles.noVideoContainer}>
                    <Text style={styles.noVideoText}>영상을 추가해주세요</Text>
                </View>
            )}

            <KeyboardAvoidingView
                style={[styles.chatSection, {
                    paddingEnd: insets.right,
                    paddingBottom: insets.bottom,
                    paddingTop: insets.top,
                }]}
                behavior="padding"
            >
                <ChatList
                    messages={messages}
                    currentUserId={currentUserId}
                    isLoading={messagesLoading}
                />
                <ChatInput
                    onSend={sendMessage}
                    onVideoListPress={() => setIsVideoListVisible(true)}
                />
            </KeyboardAvoidingView>

            {/* Components & Modals */}
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

            <YouTubeBrowser
                visible={isYouTubeBrowserVisible}
                onClose={() => setIsYouTubeBrowserVisible(false)}
                onSelectVideo={handleYouTubeVideoSelect}
                onSelectMultipleVideos={handleYouTubeMultipleVideoSelect}
            />

            <Toast
                visible={toastState.visible}
                message={toastState.message}
                subtitle={toastState.subtitle}
                thumbnail={toastState.thumbnail}
                type={toastState.type}
                onHide={hideToast}
            />

            <ConfirmDialog
                visible={isLeaveConfirmVisible}
                title="방 나가기"
                message="정말로 방을 나가시겠습니까?"
                confirmText="나가기"
                cancelText="취소"
                confirmColor={colors.error}
                onConfirm={confirmLeaveRoom}
                onCancel={() => setIsLeaveConfirmVisible(false)}
            />

            <ConfirmDialog
                visible={removeMemberConfirm.visible}
                title="멤버 추방"
                message={`${removeMemberConfirm.member?.displayName}님을 방에서 추방하시겠습니까?`}
                confirmText="추방"
                cancelText="취소"
                confirmColor={colors.error}
                onConfirm={confirmRemoveMember}
                onCancel={() => setRemoveMemberConfirm({ visible: false, member: null })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: colors.backgroundDark,
    },
    chatSection: {
        flex: 1,
        backgroundColor: colors.backgroundCard,
    },
    noVideoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    noVideoText: {
        color: colors.textSecondary,
        fontSize: 16,
    },
});
