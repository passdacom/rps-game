import type { Gesture } from '../types';

export class AiLogic {
    private history: Gesture[] = [];

    // 기본 RNG (가위바위보 33% 확률)
    public static getRandomGesture(): Gesture {
        const gestures: Gesture[] = ['ROCK', 'PAPER', 'SCISSORS'];
        return gestures[Math.floor(Math.random() * gestures.length)];
    }

    // 승리를 위해 상대의 제스처를 이기는 낼 패를 반환
    public static getWinningGesture(target: Gesture): Gesture {
        switch (target) {
            case 'ROCK': return 'PAPER';
            case 'PAPER': return 'SCISSORS';
            case 'SCISSORS': return 'ROCK';
        }
    }

    // 사용자의 움직임 역사 기록
    public recordUserGesture(gesture: Gesture) {
        this.history.push(gesture);
        // 메모리 관리 (최근 100개까지만 유지)
        if (this.history.length > 100) {
            this.history.shift();
        }
    }

    // 패턴 인식: 최근 2개의 패턴과 가장 유사한 과거 패턴의 다음 수를 이기도록 낸다.
    public getPatternMatchedGesture(): Gesture {
        if (this.history.length < 3) {
            return AiLogic.getRandomGesture();
        }

        const last = this.history[this.history.length - 1];
        const prev = this.history[this.history.length - 2];

        for (let i = this.history.length - 3; i >= 1; i--) {
            if (this.history[i] === last && this.history[i - 1] === prev) {
                // 과거 패턴 발견: 다음 사용자가 낼 것으로 예상되는 손
                const predictedUserGesture = this.history[i + 1];
                if (predictedUserGesture) {
                    return AiLogic.getWinningGesture(predictedUserGesture);
                }
            }
        }

        // 패턴을 못 찾으면 RNG
        return AiLogic.getRandomGesture();
    }
}
