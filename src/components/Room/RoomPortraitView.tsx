import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';

import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { VideoPlayerComponent } from '@src/components/VideoPlayer';
import { PortraitProgressBar } from '@src/components/ProgressBar';
import { ChatInput, ChatList, VideoListBottomSheet } from '@src/components/Chat';
import { YouTubeBrowser } from '@src/components/YouTubeBrowser';
import { Toast } from '@src/components/Toast';
import { ConfirmDialog } from '@src/components/ConfirmDialog';
import { colors, spacing, typography } from '@src/theme';
import { VideoData } from '@src/types/VideoData';
import { SyncState, PlaybackSettings } from '@src/api/types';

interface RoomPortraitViewProps {
    roomName: string;
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
    onOpenDrawer: () => void;
    onBack: () => void;
    insets: any;
    playerHeight: number;
}

export const RoomPortraitView = ({
    roomName,
    selectedVideo,
    currentTime,
    duration,
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
    onOpenDrawer,
    onBack,
    insets,
    playerHeight
}: RoomPortraitViewProps) => {
    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={colors.backgroundDark} barStyle="light-content" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={onBack} style={styles.headerButton}>
                    <Text style={{ color: 'white' }}>뒤로</Text>
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{roomName}</Text>
                </View>
                <TouchableOpacity onPress={onOpenDrawer} style={styles.headerButton}>
                    <Text style={{ color: 'white' }}>멤버</Text>
                </TouchableOpacity>
            </View>

            {/* Video Player Area */}
            <View style={{ height: playerHeight, backgroundColor: 'black', zIndex: 1 }}>
                {selectedVideo ? (
                    <VideoPlayerComponent
                        videoId={selectedVideo.videoId}
                        onTimeUpdate={(current, total) => {
                            // Note: currentTime and duration are managed in parent for synchronization
                        }}
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
                {/* Progress Bar moved inside to be relative to this container */}
                <PortraitProgressBar
                    currentTime={currentTime}
                    duration={duration}
                    playHeadWidth={15}
                    playerHeight={playerHeight}
                />
            </View>


            {/* Chat Area */}
            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: colors.backgroundDark }}
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
        backgroundColor: colors.backgroundDark,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        height: 60,
        backgroundColor: colors.backgroundDark,
    },
    headerButton: {
        padding: spacing.sm,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        color: colors.textPrimary,
        fontSize: typography.h4.fontSize,
        fontWeight: 'bold',
    },
    noVideoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    noVideoText: {
        color: colors.textSecondary,
        fontSize: typography.body.fontSize,
    },
});
