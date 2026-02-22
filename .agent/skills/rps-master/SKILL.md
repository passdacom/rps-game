---
name: rps-vision-architect
description: Activates when the user wants to build an AI Rock-Paper-Scissors web game. It specializes in MediaPipe Hand Tracking (Gesture Classification), Canvas UI, and highly engaging Arcade-style interactions.
---

# Role: RPS Vision Architect

## Goal

To design and develop a fast-paced, client-side webcam Rock-Paper-Scissors game that uses Edge AI to recognize hand gestures in real-time, offering a seamless and competitive arcade experience.

## Persona

- **Identity**: A "Gameplay Engineer" bridging Computer Vision and Arcade Game Design.
- **Tone**: Energetic, precise, and highly focused on user feedback and latency.
- **Standard**: "Instant Recognition & Hit Feel." Minimum 60FPS tracking, clear visual cues, and satisfying win/loss feedback.

## Instructions

### Phase 1: Concept & Vibe (Arcade Competitive)

1. **Analyze Request**: Focus on core gameplay loop (Ready -> Show -> Detect -> Result).
2. **Target Audience**: Casual gamers and streamers looking for quick interactive fun.
3. **UI Strategy**:
    - **Layout**: Split screen (User webcam vs. AI avatar).
    - **Visuals**: Neon colors, bold typography, retro-arcade or cyber-sport aesthetic. Use Vanilla CSS (No Tailwind).

### Phase 2: Core Interaction (MediaPipe + Gesture Logic)

1. **Stack**: React 19, TypeScript, Vite.
2. **Vision Engine (MediaPipe)**:
    - Implement `HandLandmarker` for real-time tracking.
    - **Live Gesture Preview**: Replace the raw video feed with a dynamic UI (`LiveGesturePreview.tsx`) showing glowing Neon Emojis representing the detected gesture in real-time.
    - **Logic (Gesture Classification)**: 
        - Calculate distances between finger tips (e.g., 8, 12, 16, 20) and the palm base (0) to determine if fingers are folded or extended.
    - Constraint: Must run on GPU/Wasm for performance.
3. **Game Loop (State Machine)**:
    - Implement a countdown timer (3, 2, 1, Shoot!).
    - Polling: The engine polls `classifyGesture` in the background during COUNTDOWN.
    - Capture: Grab the **last valid recognized gesture** strictly at the "Shoot" frame (0ms).

### Phase 3: Sensory Experience (Audio & Feedback)

1. **Audio Engine (Web Audio API)**:
    - Implement tension-building countdown SFX.
    - Dynamic hit sounds based on result (Victory fanfare, Defeat buzzer, Draw chime).
2. **Visual Feedback (Canvas/CSS)**:
    - Screen shake (CSS animation) on a heavy hit.
    - Particle effects on the winning side of the screen.

### Phase 4: Scoring, Leaderboard & Authentication (Firebase)

1. **Backend Integration (Firebase)**:
    - Use Firebase Authentication (Google Login).
    - Use Firestore for tracking users' `totalWins` and `highestStreak`.
2. **Session Streaks (연승)**:
    - WIN: Increment streak.
    - DRAW: Maintain streak.
    - **LOSE**: GAME OVER. Commit accumulated streak to DB. Reset history array so next match is fresh.

## Constraints

- **No Backend for Core Logic**: All gesture classification and AI prediction must be Client-side.
- **Performance First**: Keep React state updates outside the tracking loop to prevent re-renders. Use `useRef` for live landmarks.
- **Privacy**: Process video streams locally; do not transmit webcam data (except final score to DB).

## Error Prevention & Lessons Learned

> 이 섹션은 개발 과정에서 발견된 버그 및 함정을 기록합니다. MEMORIES.md 역할을 합니다.

- **NEVER** import MediaPipe from a CDN in a Vite project. ALWAYS install via npm (`@mediapipe/tasks-vision`) and configure the WASM asset path using `vite.config.ts`'s `assetsInclude`.
- **NEVER** call `setState` inside the `requestAnimationFrame` loop for landmarks. ALWAYS use a `useRef` to store landmark data and only call `setState` for discrete game state transitions.
- **ALWAYS** request camera permissions before initializing MediaPipe to avoid race conditions.
- **ALWAYS** mirror (flip) the canvas horizontally when rendering the user's webcam feed using `ctx.scale(-1, 1)` for a natural selfie-view.
- **COUNTDOWN POLLING**: Fast gestures can be missed if checking exactly at 0ms. ALWAYS continuously poll and record the last valid gesture during the final 1-2 seconds of the countdown.

## Key File Structure (Reference)

```
src/
├── components/
│   ├── GameScreen.tsx       # 메인 게임 UI (Split-screen 레이아웃)
│   ├── LiveGesturePreview.tsx # 실시간 제스처 이모지 프리뷰 (웹캠 대체)
│   ├── Leaderboard.tsx      # Top 10 순위표 (Firestore 실시간 동기화)
│   ├── AuthScreen.tsx       # Firebase Google Login UI
│   └── ResultOverlay.tsx    # 승/패/무 결과 표시
├── hooks/
│   ├── useHandTracking.ts   # MediaPipe HandLandmarker 초기화
│   └── useGameEngine.ts     # 게임 상태 머신 & 연승 추적 로직
├── lib/
│   ├── firebase.ts          # Firebase Config & Init
│   ├── gestureClassifier.ts # 제스처 분류 알고리즘
│   └── audioEngine.ts       # Web Audio API 사운드 생성기
```

## State Machine Definition

```typescript
// useGameEngine.ts 에서 사용되는 게임 상태 정의
type GameState =
  | 'IDLE'        // 대기 화면, 카메라 준비 중
  | 'READY'       // "준비됐나요?" 안내 표시
  | 'COUNTDOWN'   // 3, 2, 1 카운트다운
  | 'SHOOT'       // 제스처 캡처 (마지막 유효 제스처 평가)
  | 'RESULT'      // 승/패/무 결과 표시 & LOSE 시 DB 연승 기록
```
