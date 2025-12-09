export class VideoUtils {

  static formatTime(seconds: number) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };


  // 시간 포맷 메서드 - HH:MM:SS 또는 MM:SS 형식으로 변환
  static formatDuration(duration: number): string {
    const hrs = Math.floor(duration / 3600);
    const mins = Math.floor((duration % 3600) / 60);
    const secs = Math.floor(duration % 60);

    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // 조회수 포맷 메서드
  static formatViewCount(viewCount?: number): string {
    if (!viewCount) return '';

    if (viewCount >= 1000000) {
      return `${(viewCount / 1000000).toFixed(1)}M`;
    } else if (viewCount >= 1000) {
      return `${(viewCount / 1000).toFixed(1)}K`;
    }
    return viewCount.toString();
  }

  // 비디오 메타 정보 포맷팅 (조회수 포함)
  static formatViewCountWithLabel(viewCount?: number): string {
    const formatted = VideoUtils.formatViewCount(viewCount);
    return formatted ? `조회수 ${formatted}회` : '';
  }

  // 업로드 날짜 포맷팅 (예: 2024-04-09 -> 2024년 4월 9일)
  static formatUploadDate(uploadDate: string): string {
    const date = new Date(uploadDate);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  }

  // 썸네일 URL을 다른 품질로 변환
  static getThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'maxres'): string {
    const qualityMap = {
      default: 'default',
      medium: 'mqdefault',
      high: 'hqdefault',
      maxres: 'maxresdefault'
    };
    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
  }

  // 비디오 길이 카테고리 반환
  static getDurationCategory(duration: number): 'short' | 'medium' | 'long' {
    if (duration < 300) return 'short';      // 5분 미만
    if (duration < 1800) return 'medium';    // 30분 미만
    return 'long';                           // 30분 이상
  }

  // YouTube URL에서 videoId 추출
  static extractVideoId(url: string): string | null {
    if (!url) return null;

    const patterns = [
      /youtu\.be\/([^?&#]+)/,                    // youtu.be/VIDEO_ID
      /youtube\.com\/watch\?v=([^&#]+)/,         // youtube.com/watch?v=VIDEO_ID
      /youtube\.com\/embed\/([^?&#]+)/,          // youtube.com/embed/VIDEO_ID
      /youtube\.com\/shorts\/([^?&#]+)/,         // youtube.com/shorts/VIDEO_ID
      /youtube\.com\/v\/([^?&#]+)/,              // youtube.com/v/VIDEO_ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  // YouTube URL인지 확인
  static isYouTubeUrl(url: string): boolean {
    if (!url) return false;
    return /(?:youtube\.com|youtu\.be)/.test(url);
  }

  // YouTube oEmbed API로 영상 정보 가져오기 (무료, API 키 불필요)
  static async fetchVideoInfo(videoId: string): Promise<{
    title: string;
    channelName: string;
    thumbnail: string;
  } | null> {
    try {
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;

      const response = await fetch(oembedUrl);
      if (!response.ok) return null;

      const data = await response.json();

      return {
        title: data.title || '제목 없음',
        channelName: data.author_name || 'YouTube',
        thumbnail: VideoUtils.getThumbnailUrl(videoId, 'high'),
      };
    } catch (error) {
      console.error('YouTube oEmbed 조회 오류:', error);
      return null;
    }
  }
}
