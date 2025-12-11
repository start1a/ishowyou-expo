import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Room } from '@src/api/types';

interface RecentRoomsContextValue {
  currentRoom: Room | null;
  setCurrentRoom: (room: Room | null) => void;
  updateCurrentRoom: (room: Room) => void;
}

const RecentRoomsContext = createContext<RecentRoomsContextValue | null>(null);

export const useRecentRoomsContext = () => {
  const context = useContext(RecentRoomsContext);
  if (!context) {
    throw new Error('useRecentRoomsContext must be used within RecentRoomsProvider');
  }
  return context;
};

interface RecentRoomsProviderProps {
  children: ReactNode;
}

export const RecentRoomsProvider = ({ children }: RecentRoomsProviderProps) => {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  // 현재 방 정보 업데이트 (방 안에서 데이터 변경 시)
  const updateCurrentRoom = useCallback((room: Room) => {
    setCurrentRoom(prev => {
      if (prev?.id === room.id) {
        return room;
      }
      return prev;
    });
  }, []);

  return (
    <RecentRoomsContext.Provider
      value={{
        currentRoom,
        setCurrentRoom,
        updateCurrentRoom,
      }}
    >
      {children}
    </RecentRoomsContext.Provider>
  );
};
