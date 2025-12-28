import { useState, useEffect, useCallback } from 'react';
import { RoomService } from '@src/api';
import { VideoData } from '@src/types/VideoData';
import { RoomVideo, PlaybackSettings } from '@src/api/types';
import { VideoUtils } from '@src/utils/VideoUtils';

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

interface UseVideoPlaylistProps {
    roomId: string;
    currentUserId: string | undefined;
    sharedVideoId?: string;
    playbackSettings: PlaybackSettings;
    isOwner: boolean;
    isSyncEnabled: boolean;
    updateSyncImmediately: (time: number, isPlaying: boolean) => void;
    showToast: (message: string, thumbnail?: string, type?: 'success' | 'error' | 'info', subtitle?: string) => void;
    notifyMembersOfNewVideo: (videoTitle: string) => Promise<void>;
    onIsPlayingChange: (isPlaying: boolean) => void;
}

export const useVideoPlaylist = ({
    roomId,
    currentUserId,
    sharedVideoId,
    playbackSettings,
    isOwner,
    isSyncEnabled,
    updateSyncImmediately,
    showToast,
    notifyMembersOfNewVideo,
    onIsPlayingChange,
}: UseVideoPlaylistProps) => {
    const [videoList, setVideoList] = useState<VideoData[]>([]);
    const [isLoadingVideos, setIsLoadingVideos] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

    // Firebase에서 영상 목록 불러오기
    useEffect(() => {
        const loadVideos = async () => {
            if (!roomId) return;

            setIsLoadingVideos(true);
            try {
                const response = await RoomService.getVideosFromRoom(roomId);
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
    }, [roomId]);

    // 공유된 비디오 처리 및 방에 추가
    useEffect(() => {
        const handleSharedVideo = async () => {
            if (!sharedVideoId || !roomId || !currentUserId) return;

            const existingVideo = videoList.find(v => v.videoId === sharedVideoId);
            if (existingVideo) {
                setSelectedVideo(existingVideo);
                return;
            }

            const videoInfo = await VideoUtils.fetchVideoInfo(sharedVideoId);

            const newRoomVideo: Omit<RoomVideo, 'addedAt'> = {
                videoId: sharedVideoId,
                title: videoInfo?.title || '공유된 영상',
                thumbnail: videoInfo?.thumbnail || VideoUtils.getThumbnailUrl(sharedVideoId, 'high'),
                channelName: videoInfo?.channelName || 'YouTube',
                addedBy: currentUserId,
            };

            const response = await RoomService.addVideoToRoom(roomId, newRoomVideo);
            if (response.success && response.data) {
                const newVideoData = roomVideoToVideoData(response.data);
                setVideoList(prev => [...prev, newVideoData]);
                setSelectedVideo(newVideoData);
                showToast(`"${newRoomVideo.title}" 추가됨`, newRoomVideo.thumbnail, 'success');
                notifyMembersOfNewVideo(newRoomVideo.title);
            } else if (response.error === '이미 추가된 영상입니다') {
                const video = videoList.find(v => v.videoId === sharedVideoId);
                if (video) {
                    setSelectedVideo(video);
                }
            }
        };

        handleSharedVideo();
    }, [sharedVideoId, roomId, currentUserId, videoList]);

    const handleYouTubeVideoSelect = async (video: {
        videoId: string;
        title: string;
        channelName: string;
        thumbnail: string;
    }) => {
        if (!roomId || !currentUserId) return;

        const existingVideo = videoList.find(v => v.videoId === video.videoId);
        if (existingVideo) {
            setSelectedVideo(existingVideo);
            showToast('이미 추가된 영상입니다', existingVideo.thumbnail, 'info');
            return;
        }

        const newRoomVideo: Omit<RoomVideo, 'addedAt'> = {
            videoId: video.videoId,
            title: video.title,
            thumbnail: video.thumbnail,
            channelName: video.channelName,
            addedBy: currentUserId,
        };

        const response = await RoomService.addVideoToRoom(roomId, newRoomVideo);
        if (response.success && response.data) {
            const newVideoData = roomVideoToVideoData(response.data);
            setVideoList(prev => [...prev, newVideoData]);
            setSelectedVideo(newVideoData);
            showToast(`"${video.title}" 추가됨`, video.thumbnail, 'success');
            notifyMembersOfNewVideo(video.title);
        } else {
            showToast(response.error || '영상 추가 실패', undefined, 'error');
        }
    };

    const handleYouTubeMultipleVideoSelect = async (
        videos: { videoId: string; title: string; channelName: string; thumbnail: string }[]
    ) => {
        if (!roomId || !currentUserId) return;

        const succeeded: typeof videos = [];

        for (const video of videos) {
            const existingVideo = videoList.find(v => v.videoId === video.videoId);
            if (existingVideo) continue;

            const newRoomVideo: Omit<RoomVideo, 'addedAt'> = {
                videoId: video.videoId,
                title: video.title,
                thumbnail: video.thumbnail,
                channelName: video.channelName,
                addedBy: currentUserId,
            };

            const response = await RoomService.addVideoToRoom(roomId, newRoomVideo);
            if (response.success && response.data) {
                const newVideoData = roomVideoToVideoData(response.data);
                setVideoList(prev => [...prev, newVideoData]);
                succeeded.push(video);
                if (succeeded.length === 1) setSelectedVideo(newVideoData);
            }
        }

        if (succeeded.length === videos.length) {
            showToast(`${succeeded.length}개 영상이 추가되었습니다`, succeeded[0]?.thumbnail, 'success');
        } else if (succeeded.length > 0) {
            showToast(`${videos.length}개 중 ${succeeded.length}개 영상이 추가되었습니다`, succeeded[0]?.thumbnail, 'info');
        } else if (videos.length > 0) {
            showToast('영상 추가 실패 또는 이미 존재하는 영상입니다', undefined, 'info');
        }
    };

    const handleVideoDelete = async (video: VideoData) => {
        if (!roomId) return;

        const response = await RoomService.removeVideoFromRoom(roomId, video.videoId);
        if (response.success) {
            setVideoList(prev => prev.filter(v => v.videoId !== video.videoId));
            if (selectedVideo?.videoId === video.videoId) {
                const remainingVideos = videoList.filter(v => v.videoId !== video.videoId);
                setSelectedVideo(remainingVideos.length > 0 ? remainingVideos[0] : null);
            }
            showToast(`"${video.title}" 삭제됨`, undefined, 'success');
        } else {
            showToast(response.error || '영상 삭제 실패', undefined, 'error');
        }
    };

    const handleVideoReorder = async (reorderedVideos: VideoData[]) => {
        if (!roomId) return;
        setVideoList(reorderedVideos);
        // TODO: 서버에 새로운 순서 저장 로직 (현재는 로컬만)
    };

    const getNextVideo = useCallback((
        currentVideo: VideoData,
        videos: VideoData[],
        settings: PlaybackSettings
    ): VideoData | null => {
        const currentIndex = videos.findIndex(v => v.videoId === currentVideo.videoId);

        if (settings.repeatMode === 'repeat-one') return currentVideo;
        if (settings.repeatMode === 'once') return null;

        if (settings.shuffle) {
            const otherVideos = videos.filter(v => v.videoId !== currentVideo.videoId);
            if (otherVideos.length === 0) return null;
            return otherVideos[Math.floor(Math.random() * otherVideos.length)];
        }

        const nextIndex = currentIndex + 1;
        if (settings.repeatMode === 'all') {
            return nextIndex < videos.length ? videos[nextIndex] : null;
        }
        if (settings.repeatMode === 'repeat-all') {
            return nextIndex < videos.length ? videos[nextIndex] : videos[0];
        }

        return null;
    }, []);

    const handleVideoEnded = useCallback(() => {
        if (!selectedVideo) return;

        const nextVideo = getNextVideo(selectedVideo, videoList, playbackSettings);

        if (nextVideo) {
            if (nextVideo.videoId !== selectedVideo.videoId) {
                setSelectedVideo(nextVideo);
                onIsPlayingChange(true);
                if (isOwner && isSyncEnabled) {
                    updateSyncImmediately(0, true);
                }
            }
        } else {
            onIsPlayingChange(false);
        }
    }, [selectedVideo, videoList, playbackSettings, getNextVideo, isOwner, isSyncEnabled, updateSyncImmediately, onIsPlayingChange]);

    return {
        videoList,
        isLoadingVideos,
        selectedVideo,
        setSelectedVideo,
        handleYouTubeVideoSelect,
        handleYouTubeMultipleVideoSelect,
        handleVideoDelete,
        handleVideoReorder,
        handleVideoEnded,
    };
};
