// Mock 데이터 생성 유틸리티 (개발/테스트용)
// 현재는 Firebase를 직접 사용하므로 이 파일은 사용되지 않음

export const createMockApiResponse = <T>(data: T, success: boolean = true) => {
  return {
    success,
    data: success ? data : undefined,
    error: success ? undefined : 'Mock API Error',
    message: success ? 'Success' : 'Error occurred'
  };
};
