import { useState } from 'react';
import { MemberService } from '@src/api';
import { Member, UpdateMemberRequest } from '@src/api/types';

export const useMember = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMember = async (memberId: string, updates: UpdateMemberRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await MemberService.updateMember(memberId, updates);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || 'Failed to update member');
        return null;
      }
    } catch (err) {
      setError('Network error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (roomId: string, memberId: string, role: Member['role']) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await MemberService.updateMemberRole(roomId, memberId, role);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error || 'Failed to update member role');
        return null;
      }
    } catch (err) {
      setError('Network error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (roomId: string, memberId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await MemberService.removeMember(roomId, memberId);
      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Failed to remove member');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateOnlineStatus = async (memberId: string, isOnline: boolean) => {
    try {
      await MemberService.updateOnlineStatus(memberId, isOnline);
    } catch (err) {
      // 온라인 상태 업데이트는 에러를 무시 (백그라운드 동작)
      console.warn('Failed to update online status:', err);
    }
  };

  return {
    loading,
    error,
    updateMember,
    updateMemberRole,
    removeMember,
    updateOnlineStatus,
  };
};
