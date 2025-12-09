import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { WebView, WebViewNavigation, WebViewMessageEvent } from 'react-native-webview';
import { colors, spacing, typography, sizes } from '@src/theme';
import { VideoUtils } from '@src/utils/VideoUtils';
import { IconBack } from '@src/assets/icons';

interface VideoInfo {
  videoId: string;
  title: string;
  channelName: string;
  thumbnail: string;
}

interface YouTubeBrowserProps {
  visible: boolean;
  onClose: () => void;
  onSelectVideo: (video: VideoInfo) => void;
  onSelectMultipleVideos?: (videos: VideoInfo[]) => void;
}

// YouTube 모바일 URL
const YOUTUBE_URL = 'https://m.youtube.com';


// WebView용 JavaScript 주입
const INJECTED_JAVASCRIPT = `
(function() {
  if (window.__ytInterceptorInjected) return;
  window.__ytInterceptorInjected = true;

  function extractVideoId(url) {
    if (!url) return null;
    let match = url.match(/[?&]v=([^&]+)/);
    if (match) return match[1];
    match = url.match(/\\/shorts\\/([^?&/]+)/);
    if (match) return match[1];
    match = url.match(/\\/watch\\/([^?&/]+)/);
    if (match) return match[1];
    match = url.match(/youtu\\.be\\/([^?&]+)/);
    if (match) return match[1];
    return null;
  }

  document.addEventListener('click', function(e) {
    let target = e.target;
    let attempts = 0;

    while (target && attempts < 15) {
      const href = target.href || target.getAttribute('href');

      if (href) {
        const videoId = extractVideoId(href);

        if (videoId) {
          e.preventDefault();
          e.stopPropagation();

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'VIDEO_CLICK',
            videoId: videoId,
            url: href
          }));

          return false;
        }
      }

      target = target.parentElement;
      attempts++;
    }
  }, true);
})();
true;
`;

export const YouTubeBrowser: React.FC<YouTubeBrowserProps> = ({
  visible,
  onClose,
  onSelectVideo,
  onSelectMultipleVideos,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [videoQueue, setVideoQueue] = useState<VideoInfo[]>([]);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  // 모달 닫힐 때 초기화
  const handleClose = useCallback(() => {
    setVideoQueue([]);
    onClose();
  }, [onClose]);

  // 영상 추가 공통 함수
  const addVideoToQueue = useCallback(async (videoId: string) => {
    // 이미 큐에 있는지 확인
    if (videoQueue.some(v => v.videoId === videoId)) {
      return;
    }

    setIsLoadingVideo(true);

    try {
      const info = await VideoUtils.fetchVideoInfo(videoId);

      const newVideo: VideoInfo = info
        ? {
            videoId: videoId,
            title: info.title,
            channelName: info.channelName,
            thumbnail: info.thumbnail,
          }
        : {
            videoId: videoId,
            title: '영상 정보를 불러올 수 없음',
            channelName: 'YouTube',
            thumbnail: VideoUtils.getThumbnailUrl(videoId, 'high'),
          };

      setVideoQueue(prev => [...prev, newVideo]);
    } catch (error) {
      console.log('Failed to fetch video info:', error);
    } finally {
      setIsLoadingVideo(false);
    }
  }, [videoQueue]);

  // WebView 메시지 처리
  const handleMessage = useCallback(async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'VIDEO_CLICK' && data.videoId) {
        await addVideoToQueue(data.videoId);
      }
    } catch (error) {
      console.log('WebView message parse error:', error);
    }
  }, [addVideoToQueue]);

  // 큐에서 영상 제거
  const removeFromQueue = useCallback((videoId: string) => {
    setVideoQueue(prev => prev.filter(v => v.videoId !== videoId));
  }, []);

  // URL 변경 감지
  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      setCanGoBack(navState.canGoBack);
    },
    []
  );

  // 뒤로가기
  const handleGoBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    }
  };

  // 선택 완료
  const handleConfirmSelection = () => {
    if (videoQueue.length > 0) {
      if (onSelectMultipleVideos) {
        onSelectMultipleVideos(videoQueue);
      } else {
        videoQueue.forEach(video => onSelectVideo(video));
      }
      setVideoQueue([]);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={canGoBack ? handleGoBack : handleClose}
            style={styles.headerButton}
          >
            <IconBack width={24} height={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>YouTube 영상 추가</Text>

          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* WebView */}
        <View style={styles.webViewContainer}>
            <WebView
              ref={webViewRef}
              source={{ uri: YOUTUBE_URL }}
              style={styles.webView}
              onNavigationStateChange={(navState) => {
                handleNavigationStateChange(navState);
                setIsLoading(navState.loading);
              }}
              onLoadProgress={(e) => {
                if (e.nativeEvent.progress >= 0.9) {
                  setIsLoading(false);
                }
              }}
              onMessage={handleMessage}
              injectedJavaScript={INJECTED_JAVASCRIPT}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              originWhitelist={['*']}
              // Android
              setSupportMultipleWindows={false}
              thirdPartyCookiesEnabled={true}
              onShouldStartLoadWithRequest={(request) => {
                // Intent 스킴 차단
                if (
                  request.url.startsWith('intent://') ||
                  request.url.startsWith('vnd.youtube://') ||
                  request.url.startsWith('youtube://')
                ) {
                  return false;
                }
                return true;
              }}
            />

            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
          </View>

        {/* 영상 큐 */}
        {videoQueue.length > 0 && (
          <View style={styles.queueContainer}>
            <View style={styles.queueHeader}>
              <Text style={styles.queueTitle}>
                선택한 영상 ({videoQueue.length}개)
              </Text>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmSelection}
              >
                <Text style={styles.confirmButtonText}>완료</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={videoQueue}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.videoId}
              contentContainerStyle={styles.queueList}
              renderItem={({ item }) => (
                <View style={styles.queueItem}>
                  <Image
                    source={{ uri: item.thumbnail }}
                    style={styles.queueThumbnail}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromQueue(item.videoId)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                  <Text style={styles.queueItemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                </View>
              )}
            />
          </View>
        )}

        {/* 영상 정보 로딩 중 */}
        {isLoadingVideo && (
          <View style={styles.loadingBar}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>영상 정보 불러오는 중...</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
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
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundCard,
  },
  headerButton: {
    padding: spacing.xs,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '300',
  },
  headerTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  // WebView
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 영상 큐
  queueContainer: {
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  queueTitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: sizes.radiusMd,
  },
  confirmButtonText: {
    ...typography.bodySmall,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  queueList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  queueItem: {
    width: 100,
    marginRight: spacing.sm,
  },
  queueThumbnail: {
    width: 100,
    height: 56,
    borderRadius: sizes.radiusSm,
    backgroundColor: colors.backgroundElevated,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  queueItemTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  loadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});

export default YouTubeBrowser;
