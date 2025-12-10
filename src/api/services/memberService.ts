import { database } from '@src/config/firebase';
import { ref, update, remove } from 'firebase/database';
import { ApiResponse, RoomMember } from '@src/api/types';

export class MemberService {
  // 멤버 권한 변경
  static async updateMemberRole(
    roomId: string,
    memberId: string,
    role: RoomMember['role']
  ): Promise<ApiResponse<void>> {
    try {
      const memberRef = ref(database, `rooms/${roomId}/members/${memberId}`);
      await update(memberRef, { role });
      return { success: true, data: undefined };
    } catch (error) {
      console.error('멤버 권한 변경 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '권한 변경에 실패했습니다'
      };
    }
  }

  // 멤버 추방
  static async removeMember(roomId: string, memberId: string): Promise<ApiResponse<void>> {
    try {
      const memberRef = ref(database, `rooms/${roomId}/members/${memberId}`);
      await remove(memberRef);
      return { success: true, data: undefined };
    } catch (error) {
      console.error('멤버 추방 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '멤버 추방에 실패했습니다'
      };
    }
  }
}
