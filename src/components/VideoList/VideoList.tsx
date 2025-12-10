import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { scaleWidth, scaleHeight } from '@src/DeviceScale';
import { VideoData } from '@src/types/VideoData';
import { VideoUtils } from '@src/utils/VideoUtils';
import { colors, spacing, sizes, typography, shadows } from '@src/theme';
import { DeleteConfirmModal } from '@src/components/DeleteConfirmModal';

interface VideoListProps {
    videos: VideoData[];
    onVideoSelect: (video: VideoData) => void;
    currentVideoId?: string;
    onVideoDelete?: (video: VideoData) => void;
    canDelete?: boolean;
}

export const VideoList = ({
    videos,
    onVideoSelect,
    currentVideoId,
    onVideoDelete,
    canDelete = false,
}: VideoListProps) => {
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState<VideoData | null>(null);

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

    const renderVideoItem = ({ item }: { item: VideoData }) => {
        const isPlaying = item.videoId === currentVideoId;

        return (
        <TouchableOpacity
            style={[styles.videoItem, isPlaying && styles.videoItemPlaying]}
            onPress={() => onVideoSelect(item)}
            onLongPress={canDelete && onVideoDelete ? () => handleDelete(item) : undefined}
            activeOpacity={0.7}
            delayLongPress={500}
        >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.videoInfo}>
                <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                </Text>
                <View style={styles.metaInfo}>
                    <Text style={styles.channelName}>{item.channelName}</Text>
                    {canDelete && onVideoDelete ? (
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDelete(item)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text style={styles.deleteButtonText}>삭제</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.metaText}>
                            {VideoUtils.formatDuration(item.duration)}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
        );
    };

    return (
        <>
            <FlatList
                data={videos}
                keyExtractor={(item) => item.id}
                renderItem={renderVideoItem}
                style={styles.videoList}
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
