import { useState } from 'react';
import { MemberService } from '@src/api';
import { RoomMember } from '@src/api/types';

export const useMember = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMemberRole = async (roomId: string, memberId: string, role: RoomMember['role']) => {
    setLoading(true);
    setError(null);

    try {
      const response = await MemberService.updateMemberRole(roomId, memberId, role);
      if (response.success) {
        return true;
      } else {
        setError(response.error || '권한 변경에 실패했습니다');
        return false;
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다');
      return false;
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
        setError(response.error || '멤버 추방에 실패했습니다');
        return false;
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    updateMemberRole,
    removeMember,
  };
};
