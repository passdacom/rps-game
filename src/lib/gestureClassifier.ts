import type { Gesture } from '../types';
import type { Landmark } from '@mediapipe/tasks-vision';

/**
 * 손가락 끝(tip)과 손바닥 기저부(MCP) 간의 Y축 거리로 접힘 여부를 판단합니다.
 * Y값이 작을수록 화면 상단을 의미하므로, tip의 Y값이 mcp의 Y값보다 작으면 손가락이 펴진 것으로 간주합니다.
 */
function isFingerExtended(landmarks: Landmark[], tipId: number, mcpId: number): boolean {
    return landmarks[tipId].y < landmarks[mcpId].y;
}

export function classifyGesture(landmarks: Landmark[]): Gesture | null {
    if (!landmarks || landmarks.length === 0) return null;

    // 인덱스 기준:
    // 검지(Index): tip=8, mcp=5
    // 중지(Middle): tip=12, mcp=9
    // 약지(Ring): tip=16, mcp=13
    // 새끼(Pinky): tip=20, mcp=17
    // 엄지(Thumb): tip=4, mcp=2 (엄지는 x축으로도 비교해야 더 정확함)

    const indexExtended = isFingerExtended(landmarks, 8, 5);
    const middleExtended = isFingerExtended(landmarks, 12, 9);
    const ringExtended = isFingerExtended(landmarks, 16, 13);
    const pinkyExtended = isFingerExtended(landmarks, 20, 17);

    // 간단한 휴리스틱: 엄지를 제외한 4개의 손가락 상태로 판별

    // 바위(ROCK): 4손가락 모두 접힘
    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
        return 'ROCK';
    }

    // 가위(SCISSORS): 검지와 중지만 펴짐
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
        return 'SCISSORS';
    }

    // 보(PAPER): 4손가락 모두 펴짐
    if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
        return 'PAPER';
    }

    // 판단 불가 (애매한 손모양)
    return null;
}
