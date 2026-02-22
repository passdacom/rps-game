import React from 'react';
import type { GameState, MatchResult, Gesture } from '../types';

interface ResultOverlayProps {
    gameState: GameState;
    countdown: number;
    result: MatchResult | null;
    userGesture: Gesture | null;
    aiGesture: Gesture | null;
}

export const ResultOverlay: React.FC<ResultOverlayProps> = ({ gameState, countdown, result, userGesture, aiGesture }) => {
    if (gameState === 'IDLE') return null;

    return (
        <div className="result-overlay">
            {gameState === 'READY' && <h1 className="giant-text neon-blue">READY?</h1>}
            {gameState === 'COUNTDOWN' && <h1 className="giant-text neon-pink">{countdown}</h1>}
            {gameState === 'SHOOT' && <h1 className="giant-text neon-green shake">SHOOT!</h1>}

            {gameState === 'RESULT' && result && (
                <div className={`result-box ${result.toLowerCase()}`}>
                    <h2 className="result-text">{result === 'WIN' ? 'VICTORY' : result === 'LOSE' ? 'DEFEAT' : 'DRAW'}</h2>
                    <div className="gesture-comparison">
                        <span>You: {userGesture || '?'}</span>
                        <span className="vs">VS</span>
                        <span>AI: {aiGesture || '?'}</span>
                    </div>
                </div>
            )}
        </div>
    );
};
