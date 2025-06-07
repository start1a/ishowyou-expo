import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { scaleWidth, scaleHeight } from '@src/DeviceScale';
import { formatTime } from '@src/utils/videoUtils';
import { VideoData } from '@src/types/VideoData';

interface VideoListProps {
    videos: VideoData[];
    onVideoSelect: (video: VideoData) => void;
}

export const VideoList = ({ videos, onVideoSelect }: VideoListProps) => {

    const formatViewCount = (count: number) => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        } else if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    const renderVideoItem = ({ item }: { item: VideoData }) => (
        <TouchableOpacity
            style={styles.videoItem}
            onPress={() => onVideoSelect(item)}
        >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.videoInfo}>
                <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={styles.channelName}>{item.channelName}</Text>
                <View style={styles.metaInfo}>
                    <Text style={styles.metaText}>
                        {item.viewCount ? `조회수 ${formatViewCount(item.viewCount)}회` : ''}
                    </Text>
                    <Text style={styles.metaText}>
                        {formatTime(item.duration)}
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
        paddingHorizontal: scaleWidth(16),
        paddingTop: scaleHeight(8),
    },
    videoItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginBottom: scaleHeight(16),
        borderRadius: scaleWidth(12),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: scaleHeight(2),
        },
        shadowOpacity: 0.1,
        shadowRadius: scaleWidth(4),
        elevation: 3,
        overflow: 'hidden',
    },
    thumbnail: {
        width: scaleWidth(120),
        height: scaleHeight(90),
        borderTopLeftRadius: scaleWidth(12),
        borderBottomLeftRadius: scaleWidth(12),
    },
    videoInfo: {
        flex: 1,
        padding: scaleWidth(12),
        justifyContent: 'space-between',
    },
    title: {
        fontSize: scaleWidth(14),
        fontWeight: '600',
        color: '#333',
        marginBottom: scaleHeight(4),
        lineHeight: scaleHeight(18),
    },
    channelName: {
        fontSize: scaleWidth(12),
        color: '#666',
        marginBottom: scaleHeight(6),
    },
    metaInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metaText: {
        fontSize: scaleWidth(11),
        color: '#888',
    },
});
