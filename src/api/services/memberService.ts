import { apiClient } from '@src/api/client';
import { ENDPOINTS } from '@src/api/config';
import { ApiResponse, Member, UpdateMemberRequest } from '@src/api/types';

export class MemberService {
  // 멤버 정보 조회
  static async getMember(memberId: string): Promise<ApiResponse<Member>> {
    return apiClient.get<Member>(`${ENDPOINTS.MEMBERS}/${memberId}`);
  }

  // 멤버 정보 수정
  static async updateMember(memberId: string, updates: UpdateMemberRequest): Promise<ApiResponse<Member>> {
    return apiClient.put<Member>(`${ENDPOINTS.MEMBERS}/${memberId}`, updates);
  }

  // 멤버 삭제 (방에서 추방)
  static async removeMember(roomId: string, memberId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${ENDPOINTS.ROOMS}/${roomId}/members/${memberId}`);
  }

  // 멤버 권한 변경
  static async updateMemberRole(
    roomId: string, 
    memberId: string, 
    role: Member['role']
  ): Promise<ApiResponse<Member>> {
    return apiClient.put<Member>(`${ENDPOINTS.ROOMS}/${roomId}/members/${memberId}/role`, { role });
  }

  // 온라인 상태 업데이트
  static async updateOnlineStatus(memberId: string, isOnline: boolean): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`${ENDPOINTS.MEMBERS}/${memberId}/status`, { isOnline });
  }
}
