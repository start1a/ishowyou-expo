# 프로젝트 구조 및 아키텍처

이 문서는 IShowYou 프로젝트의 아키텍처, 파일 구성 및 주요 디자인 패턴에 대한 포괄적인 개요를 제공합니다.

## 1. 아키텍처 개요

이 프로젝트는 React Native 및 Expo를 기반으로 하는 **모듈형 아키텍처**를 사용합니다. UI(컴포넌트), 로직(훅), 데이터(서비스)를 분리하여 관심사 분리를 강조합니다.

```mermaid
graph TD
    User[사용자 상호작용] --> UI[UI 계층 (스크린/컴포넌트)]
    UI --> Hooks[로직 계층 (커스텀 훅)]
    Hooks --> Services[데이터 계층 (API 서비스)]
    Services --> Firebase[Firebase Realtime DB]
    
    subgraph "핵심 모듈"
        UI
        Hooks
    end
    
    subgraph "외부 시스템"
        Firebase
    end
```

### 주요 계층
- **UI 계층 (`app/`, `src/components`)**: 렌더링을 전담합니다. Props 혹은 Hooks를 통해 데이터를 전달받습니다.
- **로직 계층 (`src/hooks`)**: 비즈니스 로직, 상태 관리 및 사이드 이펙트를 캡슐화합니다.
- **데이터 계층 (`src/api`)**: Firebase 및 내부 API 엔드포인트와의 직접적인 통신을 담당합니다.

---

## 2. 디렉토리 구조

```text
/
├── app/                  # Expo Router (페이지 및 스크린)
│   ├── (tabs)/           # 하단 탭 네비게이션
│   ├── room/             # 방 관련 라우트
│   └── _layout.tsx       # 루트 레이아웃 및 프로바이더
│
├── src/                  # 핵심 애플리케이션 로직
│   ├── api/              # API 서비스 (Firebase 래퍼)
│   │   ├── services/     # 도메인별 서비스 (예: RoomService)
│   │   └── types/        # API 데이터용 TypeScript 인터페이스
│   │
│   ├── components/       # 재사용 가능한 UI 컴포넌트
│   │   ├── Room/         # 방 전용 컴포넌트 (세로/가로 뷰)
│   │   ├── Chat/         # 채팅 관련 컴포넌트
│   │   └── VideoPlayer/  # 비디오 플레이어 래퍼 및 컨트롤
│   │
│   ├── contexts/         # 전역 컨텍스트 (인증, 테마, 화면 방향)
│   ├── hooks/            # 커스텀 훅 (비즈니스 로직)
│   ├── theme/            # 디자인 토큰 (색상, 타이포그래피)
│   ├── types/            # 전역 TypeScript 유형
│   └── utils/            # 헬퍼 함수
│
└── docs/                 # 프로젝트 문서
```

---

## 3. 디자인 패턴

### A. 컨테이너-프레젠터 패턴 (Container-Presenter Pattern)
우리는 수정된 컨테이너-프레젠터 패턴을 사용하며, 특히 **방 화면(Room Screen)**에서 잘 드러납니다.

- **컨테이너 (`app/room/[id].tsx`)**: 
  - 방대한 상태를 관리하거나 훅에 위임합니다.
  - 내비게이션 및 전역 UI(토스트, 다이얼로그)를 처리합니다.
  - 데이터를 프레젠터로 전달합니다.
  
- **프레젠터 (`src/components/Room/*`)**:
  - `RoomPortraitView.tsx`: 세로 모드 UI를 렌더링합니다.
  - `RoomLandscapeView.tsx`: 가로 모드 UI를 렌더링합니다.
  - 주로 데이터를 표시하고 콜백을 트리거하는 순수 함수형 컴포넌트입니다.

### B. 로직 분리를 위한 커스텀 훅
컴포넌트를 가볍게 유지하기 위해 복잡한 로직은 커스텀 훅으로 추출됩니다.

**예시: 비디오 재생목록 로직**
컴포넌트 내부에서 `videoList`, 추가, 삭제를 직접 관리하는 대신 다음을 사용합니다.
```typescript
const { 
  videoList, 
  addToPlaylist, 
  playNext 
} = useVideoPlaylist(roomId);
```

### C. 서비스 레이어 패턴 (Service Layer Pattern)
컴포넌트에서 Firebase를 직접 호출하는 것을 지양합니다. 대신 `RoomService` 클래스의 정적 메서드를 사용합니다.
- **장점**: 에러 처리를 집중화하고 타입 안정성을 보장합니다.
- **예시**: `RoomService.createRoom(...)`, `RoomService.addVideo(...)`

---

## 4. 주요 참조 (방 모듈)

**방(Room)** 기능은 앱에서 가장 복잡한 부분이며 아키텍처 참조 모델 역할을 합니다.

| 파일 | 유형 | 역할 |
|------|------|----------------|
| `app/room/[id].tsx` | 스크린 | **코디네이터**. 초기 데이터 페칭, `useRoomSession`, `useVideoSync` 보유. |
| `src/hooks/useVideoPlaylist.ts` | 훅 | **재생목록 관리자**. 비디오 목록 CRUD 및 자동 재생 로직 처리. |
| `src/hooks/useVideoSync.ts` | 훅 | **동기화 도구**. 재생 시간 및 상태를 방장과 동기화. |
| `src/components/Room/RoomPortraitView.tsx` | 컴포넌트 | **UI (세로)**. 표준 수직 레이아웃. |
| `src/components/Room/RoomLandscapeView.tsx` | 컴포넌트 | **UI (가로)**. 몰입형 전체 화면 레이아웃. |
| `src/api/services/roomService.ts` | 서비스 | **데이터 접근**. Firebase 실시간 DB 읽기/쓰기 작업. |
