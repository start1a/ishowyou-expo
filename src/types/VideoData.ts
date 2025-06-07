export interface VideoData {
  id: string;
  title: string;
  videoId: string;  // 유튜브 영상 ID
  thumbnail: string;
  duration: number; // 초 단위
  channelName: string;
  description?: string;
  viewCount?: number;
  uploadDate: string;
}