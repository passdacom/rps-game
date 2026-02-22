export type Gesture = 'ROCK' | 'PAPER' | 'SCISSORS';

export type GameState =
    | 'IDLE'        // 대기 화면, 카메라 준비 중
    | 'READY'       // "준비됐나요?" 안내 표시
    | 'COUNTDOWN'   // 3, 2, 1 카운트다운
    | 'SHOOT'       // 제스처 캡처 순간 (단일 프레임)
    | 'RESULT'      // 승/패/무 결과 표시
    | 'ERROR';      // 카메라 권한 거부 등 오류 상태

export type MatchResult = 'WIN' | 'LOSE' | 'DRAW';

export interface UserProfile {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
    email: string | null;
}

export interface MatchHistoryEntry {
    userGesture: Gesture;
    aiGesture: Gesture;
    result: MatchResult;
    timestamp: number;
}
