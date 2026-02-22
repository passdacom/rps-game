import React from 'react';
import type { Gesture } from '../types';

interface AiAvatarProps {
    aiGesture: Gesture | null;
    isActive: boolean;
}

export const AiAvatar: React.FC<AiAvatarProps> = ({ aiGesture, isActive }) => {
    const getIcon = (g: Gesture | null) => {
        switch (g) {
            case 'ROCK': return '✊';
            case 'PAPER': return '🖐️';
            case 'SCISSORS': return '✌️';
            default: return '🤖';
        }
    };

    return (
        <div className={`ai-avatar-container ${isActive ? 'active' : ''}`}>
            <div className="ai-character">
                {aiGesture === null ? (
                    <div className="ai-idle-pulse">Waiting for challenger...</div>
                ) : (
                    <div className="ai-gesture-display">
                        {getIcon(aiGesture)}
                    </div>
                )}
            </div>
        </div>
    );
};
