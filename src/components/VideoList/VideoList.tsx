import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { scaleWidth, scaleHeight } from '@src/DeviceScale';
import { VideoData } from '@src/types/VideoData';
import { VideoUtils } from '@src/utils/VideoUtils';
import { colors, spacing, sizes, typography, shadows } from '@src/theme';

interface VideoListProps {
    videos: VideoData[];
    onVideoSelect: (video: VideoData) => void;
}

export const VideoList = ({ videos, onVideoSelect }: VideoListProps) => {

    const renderVideoItem = ({ item }: { item: VideoData }) => (
        <TouchableOpacity
            style={styles.videoItem}
            onPress={() => onVideoSelect(item)}
            activeOpacity={0.7}
        >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.videoInfo}>
                <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={styles.channelName}>{item.channelName}</Text>
                <View style={styles.metaInfo}>
                    <Text style={styles.metaText}>
                        {VideoUtils.formatViewCountWithLabel(item.viewCount)}
                    </Text>
                    <Text style={styles.metaText}>
                        {VideoUtils.formatDuration(item.duration)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={videos}
            keyExtractor={(item) => item.id}
            renderItem={renderVideoItem}
            style={styles.videoList}
            showsVerticalScrollIndicator={false}
        />
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
        marginBottom: spacing.sm,
    },
    metaInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 11,
        color: colors.textMuted,
    },
});
