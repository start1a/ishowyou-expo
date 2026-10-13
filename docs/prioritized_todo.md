# 우선순위별 할 일 (Proioritized Todo List)

현재 프로젝트 상황과 중요도를 기반으로 정리한 할 일 목록입니다.

## 🔴 Priority 1 (High): 사용자 경험 및 운영 편의성 개선
가장 적은 리소스로 사용자 만족도를 크게 높일 수 있는 기능들입니다.

### 1-1. 사용자 프로필 수정 (User Personalization)
- **이유**: 현재는 가입 시 Google 프로필을 그대로 쓰거나 '익명'으로 처리됩니다. 사용자가 자신의 닉네임과 프로필 사진을 변경할 수 있어야 애착(Retention)이 생깁니다.
- **작업 내용**:
  - `MyPage` 또는 `ProfileEditScreen` 추가.
  - 닉네임 유효성 검사 및 Firebase `users` 노드 업데이트 로직.
  - 변경된 정보가 채팅 및 참여자 목록에 실시간 반영되는지 확인.

### 1-2. 방 정보 수정 (Room Management)
- **이유**: 방을 잘 못 만들었을 때(제목 오타 등) 삭제하고 다시 만들어야 하는 불편함이 있습니다.
- **작업 내용**:
  - 방장 권한인 경우 방 제목, 비밀번호 설정 변경 기능 (`Modal` 또는 `Sheet`).
  - 실시간 DB 업데이트 및 참여자들에게 변경 사항 반영.

---

## 🟡 Priority 2 (Medium): 기술 부채 해결 및 확장성 확보
장기적인 서비스 안정성과 기능 확장을 위해 반드시 짚고 넘어가야 할 부분입니다.

### 2-1. 비디오 플레이어 구조 개선 (Refactor for Multi-Source)
- **이유**: 현재 `VideoPlayerComponent`는 `react-native-youtube-iframe`에 **강하게 결합(Tightly Coupled)**되어 있습니다. Vimeo나 Twitch, 직업 업로드 영상 등 다른 소스를 추가하려면 구조 변경이 필수적입니다.
- **작업 내용**:
  - `VideoPlayerComponent`를 `VideoPlayerContainer`와 `VideoPlayerView`(인터페이스)로 분리.
  - `sourceType` ('youtube' | 'vimeo' | 'mp4')에 따라 내부 플레이어를 교체하는 팩토리 패턴 도입.
  - 재생/일시정지/탐색(Seek) 인터페이스 표준화.

### 2-2. 반응형 디자인 시스템 전면 적용 (Responsive Audit)
- **이유**: 최근 `DeviceScale`을 도입했으나, 여전히 고정 픽셀(Hardcoded Pixel)이나 기본 폰트 스케일링과 충돌하는 부분이 남아있습니다.
- **작업 내용**:
  - 모든 간격(Margin, Padding)과 폰트 크기를 `DeviceScale` 기반 유틸리티로 교체.
  - `allowFontScaling` 정책 확립 (접근성 vs 레이아웃 유지).

---

## 🟢 Priority 3 (Low): 기능 고도화
당장 급하지 않지만 완성도를 위해 필요한 작업입니다.

### 3-1. 푸시 알림 시나리오 확장
- **이유**: 인프라는 구축되어 있으나 활용이 제한적(방장 알림)입니다.
- **작업 내용**:
  - "관심 있는 방에 새 영상이 추가되었을 때" 알림.
  - "친구가 온라인일 때" 알림 등 소셜 인터랙션 강화.
