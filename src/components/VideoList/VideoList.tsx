import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { scaleWidth, scaleHeight } from '@src/DeviceScale';
import { VideoData } from '@src/types/VideoData';
import { VideoUtils } from '@src/utils/VideoUtils';
import { colors, spacing, sizes, typography, shadows } from '@src/theme';
import { DeleteConfirmModal } from '@src/components/DeleteConfirmModal';
import { IconWarning } from '@src/assets/icons';

interface VideoListProps {
    videos: VideoData[];
    onVideoSelect: (video: VideoData) => void;
    currentVideoId?: string;
    onVideoDelete?: (video: VideoData) => void;
    canDelete?: boolean;
    canReorder?: boolean;
    onVideoReorder?: (videos: VideoData[]) => void;
}

export const VideoList = ({
    videos,
    onVideoSelect,
    currentVideoId,
    onVideoDelete,
    canDelete = false,
    canReorder = false,
    onVideoReorder,
}: VideoListProps) => {
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState<VideoData | null>(null);

    // 실패한 영상 감지
    const isFailedVideo = (video: VideoData): boolean => {
        return video.title === '영상 정보를 불러올 수 없음';
    };

    const handleDelete = (video: VideoData) => {
        setVideoToDelete(video);
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        if (videoToDelete) {
            onVideoDelete?.(videoToDelete);
        }
        setDeleteModalVisible(false);
        setVideoToDelete(null);
    };

    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
        setVideoToDelete(null);
    };

    const renderVideoItem = ({ item, drag, isActive }: RenderItemParams<VideoData>) => {
        const isPlaying = item.videoId === currentVideoId;
        const isFailed = isFailedVideo(item);

        return (
        <ScaleDecorator>
        <View
            style={[
                styles.videoItem,
                isPlaying && styles.videoItemPlaying,
                isFailed && styles.videoItemFailed,
                isActive && styles.videoItemDragging
            ]}
        >
            {/* 드래그 핸들 */}
            {canReorder && (
                <TouchableOpacity
                    onLongPress={drag}
                    delayLongPress={Platform.OS === 'android' ? 0 : 100}
                    style={styles.dragHandle}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                >
                    <Text style={styles.dragHandleText}>☰</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={styles.videoContent}
                onPress={() => isFailed && onVideoDelete ? handleDelete(item) : onVideoSelect(item)}
                onLongPress={canDelete && onVideoDelete && !isFailed ? () => handleDelete(item) : undefined}
                activeOpacity={0.7}
                delayLongPress={500}
            >
                <Image source={{ uri: item.thumbnail }} style={[styles.thumbnail, isFailed && styles.thumbnailFailed]} />
                {isFailed && (
                    <View style={styles.failedBadge}>
                        <IconWarning width={16} height={16} color={colors.textOnPrimary} />
                    </View>
                )}
                <View style={styles.videoInfo}>
                    <Text style={[styles.title, isFailed && styles.titleFailed]} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <View style={styles.metaInfo}>
                        <Text style={[styles.channelName, isFailed && styles.channelNameFailed]}>{item.channelName}</Text>
                        {canDelete && onVideoDelete && !isFailed ? (
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDelete(item)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Text style={styles.deleteButtonText}>삭제</Text>
                            </TouchableOpacity>
                        ) : !isFailed ? (
                            <Text style={styles.metaText}>
                                {VideoUtils.formatDuration(item.duration)}
                            </Text>
                        ) : null}
                    </View>
                </View>
            </TouchableOpacity>
        </View>
        </ScaleDecorator>
        );
    };

    return (
        <>
            <DraggableFlatList
                data={videos}
                keyExtractor={(item) => item.id}
                renderItem={renderVideoItem}
                onDragEnd={({ data }) => onVideoReorder?.(data)}
                containerStyle={styles.videoList}
                showsVerticalScrollIndicator={false}
            />
            <DeleteConfirmModal
                visible={deleteModalVisible}
                video={videoToDelete}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </>
    );
};

const styles = StyleSheet.create({
    videoList: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
    },
    videoItem: {
        flexDirection: 'row',
        backgroundColor: colors.surfaceCard,
        marginBottom: spacing.lg,
        borderRadius: sizes.radiusMd,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
        overflow: 'hidden',
    },
    videoContent: {
        flexDirection: 'row',
        flex: 1,
    },
    dragHandle: {
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.backgroundElevated,
        borderRightWidth: 1,
        borderRightColor: colors.border,
    },
    dragHandleText: {
        fontSize: 20,
        color: colors.textSecondary,
    },
    videoItemDragging: {
        opacity: 0.8,
        transform: [{ scale: 1.02 }],
    },
    thumbnail: {
        width: scaleWidth(120),
        height: scaleHeight(90),
        borderTopLeftRadius: sizes.radiusMd,
        borderBottomLeftRadius: sizes.radiusMd,
    },
    videoInfo: {
        flex: 1,
        padding: spacing.md,
        justifyContent: 'space-between',
    },
    title: {
        ...typography.bodySmall,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
        lineHeight: 18,
    },
    channelName: {
        ...typography.caption,
        color: colors.textSecondary,
        flex: 1,
    },
    metaInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'stretch',
    },
    metaText: {
        fontSize: 11,
        color: colors.textMuted,
    },
    videoItemPlaying: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    videoItemFailed: {
        opacity: 0.7,
        backgroundColor: colors.backgroundElevated,
    },
    thumbnailFailed: {
        opacity: 0.5,
    },
    failedBadge: {
        position: 'absolute',
        top: spacing.xs,
        left: spacing.xs,
        backgroundColor: colors.error,
        borderRadius: sizes.radiusFull,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    titleFailed: {
        color: colors.error,
        opacity: 0.8,
    },
    channelNameFailed: {
        opacity: 0.5,
    },
    deleteButton: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        backgroundColor: colors.error,
        borderRadius: sizes.radiusSm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonText: {
        fontSize: 11,
        color: colors.textOnPrimary,
        fontWeight: '600',
    },
});
