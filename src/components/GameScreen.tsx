import React, { useRef, useState } from 'react';
import { LiveGesturePreview } from './LiveGesturePreview';
import { AiAvatar } from './AiAvatar';
import { ResultOverlay } from './ResultOverlay';
import { Leaderboard } from './Leaderboard';
import { useGameEngine } from '../hooks/useGameEngine';
import type { Landmark } from '@mediapipe/tasks-vision';
import type { UserProfile } from '../types';

interface GameScreenProps {
    user: UserProfile | null;
    onLogout: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ user, onLogout }) => {
    const [cameraReady, setCameraReady] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const getLandmarksRef = useRef<() => Landmark[] | null>(() => null);

    // Game Engine Hook
    const { gameState, countdown, userGesture, aiGesture, matchResult, history, startGame, currentSessionStreak } = useGameEngine(
        () => getLandmarksRef.current(),
        user?.uid || null,
        false // isPremium
    );

    const renderHistory = () => {
        return (
            <div className="history-bar">
                {history.slice(-5).map((match, idx) => (
                    <div key={idx} className={`history-dot ${match.result.toLowerCase()}`} title={`${match.userGesture} vs ${match.aiGesture}`} />
                ))}
            </div>
        );
    };

    return (
        <div className="game-screen">
            <header className="game-header">
                <div className="user-profile">
                    {user?.photoURL && <img src={user.photoURL} alt="User" className="avatar-img" />}
                    <span>{user?.displayName || 'Player 1'}</span>
                </div>
                <div className="title-area">
                    <h2 className="cyber-title-sm">RPS MASTER</h2>
                    {renderHistory()}
                </div>
                <div className="header-actions">
                    <button className="neon-btn sm" onClick={() => setShowLeaderboard(true)}>LEADERBOARD</button>
                    <button className="neon-btn sm" onClick={onLogout} style={{ marginLeft: '10px' }}>LOGOUT</button>
                </div>
            </header>

            <div className="battle-arena">
                {/* Left Side: Player Gesture Preview */}
                <div className={`arena-side player-side ${matchResult === 'WIN' ? 'winner-glow' : ''}`}>
                    <div className="webcam-wrapper">
                        <LiveGesturePreview
                            onReady={(ready) => setCameraReady(ready)}
                            getLandmarksRef={getLandmarksRef}
                        />
                    </div>
                    <div className="side-label">
                        <span className="label-text">YOU</span>
                        {currentSessionStreak > 0 && (
                            <span className="streak-badge neon-pink pulse">🔥 {currentSessionStreak} 연승</span>
                        )}
                    </div>
                </div>

                {/* Center: Result / Action Area */}
                <div className="arena-center">
                    {gameState === 'IDLE' && cameraReady && (
                        <button className="neon-btn giant-btn pulse" onClick={startGame}>
                            START MATCH
                        </button>
                    )}

                    {!cameraReady && <div className="loading-text neon-blue pulse">Initializing Core Systems...</div>}

                    {(gameState === 'READY' || gameState === 'COUNTDOWN') && (
                        <div className="giant-text neon-pink shake">{gameState === 'READY' ? 'READY?' : countdown}</div>
                    )}

                    {gameState === 'RESULT' && matchResult && userGesture && aiGesture && (
                        <ResultOverlay
                            gameState={gameState}
                            countdown={countdown}
                            result={matchResult}
                            userGesture={userGesture}
                            aiGesture={aiGesture}
                        />
                    )}
                </div>

                {/* Right Side: AI Avatar */}
                <div className={`arena-side ai-side ${matchResult === 'LOSE' ? 'winner-glow' : ''}`}>
                    <div className="ai-wrapper">
                        <AiAvatar aiGesture={aiGesture} isActive={gameState !== 'IDLE'} />
                    </div>
                    <div className="side-label">AI ENGINE</div>
                </div>
            </div>

            {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
        </div>
    );
};
