# IShowYou 프로젝트 분석 및 현황 보고서 (2025-01-02)

## 1. 프로젝트 개요
**IShowYou**는 사용자가 방을 생성하고, 유튜브 영상을 실시간으로 함께 시청하며 채팅할 수 있는 소셜 워치 파티(Social Watch Party) 모바일 애플리케이션입니다.

### 🛠 기술 스택
- **Core**: React Native, Expo SDK 53
- **Language**: TypeScript
- **Backend / DB**: Firebase (Authentication, Realtime Database)
- **State / Logic**: React Hooks (Custom Hooks for Business Logic)
- **Navigation**: Expo Router (File-based routing)
- **Video**: `react-native-youtube-iframe`
- **UI/UX**: Custom Design System (Fixed-Scroll-Fixed layouts, DeviceScale responsiveness)

## 2. 아키텍처 분석
이 프로젝트는 **관심사의 분리(Separation of Concerns)**가 명확한 모듈형 아키텍처를 따르고 있습니다.

- **UI Layer (Components)**: 렌더링만 담당. `Container-Presenter` 패턴이 적용되어, 특히 `Room` 화면에서 로직(`app/room/[id].tsx`)과 뷰(`RoomPortraitView`/`RoomLandscapeView`)가 잘 분리되어 있습니다.
- **Logic Layer (Hooks)**: `useRoomSession`, `useVideoPlaylist`, `useVideoSync` 등 핵심 기능이 커스텀 훅으로 캡슐화되어 있어 재사용성과 유지보수성이 높습니다.
- **Data Layer (Services)**: `RoomService`, `AuthService` 등을 통해 Firebase 호출을 추상화하여, 컴포넌트가 직접 DB에 접근하지 않습니다.

## 3. 현재 개발 상태

### ✅ 완료된 기능 (Stable)
- **인증 (Auth)**: 구글 로그인, 자동 로그인 복원, 세션 관리.
- **방 (Room)**: 방 생성/참여/나가기, 실시간 멤버 목록 동기화.
- **비디오 (Video)**: 유튜브 검색/재생, 재생목록 관리, **방장 제어 동기화(Sync)** (재생/일시정지/탐색).
- **채팅 (Chat)**: 실시간 채팅, 시스템 메시지.
- **레이아웃 (Layout)**: 가로/세로 모드 전환 시 플레이어 상태 유지, 다양한 기기 대응 레이아웃 수정 완료.
- **알림 (Push Notification)**: 기본 인프라(토큰 저장, 발송 유틸) 구현 및 방장 알림 연결 확인.

### 🚧 진행 중 / 개선 필요 (In Progress)
- **반응형 고도화**: `DeviceScale` 도입으로 다양한 화면 크기에 대응 중이나, 일부 컴포넌트(폰트 스케일링 등)의 감사(Audit) 및 적용이 필요합니다.
- **확장성**: 현재는 **유튜브(YouTube)**만 지원하는 구조입니다. 추후 Twitch, Vimeo 등 다중 소스 확장을 위해서는 `VideoPlayerComponent`의 리팩토링이 필요합니다.

## 4. 종합 평가
프로젝트의 코어 엔진(동기화, 방 관리)은 매우 안정적입니다. 최근 UI 레이아웃 이슈들을 해결하며 사용자 완성도를 높였습니다. 이제는 기능을 확장(프로필 편집, 비디오 소스 추가)하거나 운영 편의성(방 옵션 수정)을 높이는 단계로 넘어갈 적기입니다.
