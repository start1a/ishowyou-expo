import { createContext, useContext, useState, ReactNode } from 'react';

interface SharedVideo {
  videoId: string;
  url: string;
  thumbnail: string;
}

interface ShareContextType {
  sharedVideo: SharedVideo | null;
  setSharedVideo: (video: SharedVideo | null) => void;
  clearSharedVideo: () => void;
  isProcessingShare: boolean;
}

const ShareContext = createContext<ShareContextType | undefined>(undefined);

export const useShare = () => {
  const context = useContext(ShareContext);
  if (context === undefined) {
    throw new Error('useShare must be used within a ShareProvider');
  }
  return context;
};

interface ShareProviderProps {
  children: ReactNode;
}

export const ShareProvider = ({ children }: ShareProviderProps) => {
  const [sharedVideo, setSharedVideo] = useState<SharedVideo | null>(null);
  const [isProcessingShare] = useState(false);

  const clearSharedVideo = () => {
    setSharedVideo(null);
  };

  const value = {
    sharedVideo,
    setSharedVideo,
    clearSharedVideo,
    isProcessingShare,
  };

  return <ShareContext.Provider value={value}>{children}</ShareContext.Provider>;
};
