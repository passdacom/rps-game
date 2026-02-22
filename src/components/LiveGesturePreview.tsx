import React, { useRef, useEffect, useState } from 'react';
import { useHandTracking } from '../hooks/useHandTracking';
import { classifyGesture } from '../lib/gestureClassifier';

interface LiveGesturePreviewProps {
    onReady: (isReady: boolean) => void;
    getLandmarksRef: React.MutableRefObject<any>;
}

export const LiveGesturePreview: React.FC<LiveGesturePreviewProps> = ({ onReady, getLandmarksRef }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { isReady, error, latestLandmarksRef } = useHandTracking(videoRef);
    const [liveGesture, setLiveGesture] = useState<string>('🤔'); // Emoji representation

    // Expose the getter to parent
    useEffect(() => {
        getLandmarksRef.current = () => latestLandmarksRef.current;
    }, [getLandmarksRef, latestLandmarksRef]);

    useEffect(() => {
        onReady(isReady);
    }, [isReady, onReady]);

    // Polling loop for UI rendering (throttled visually)
    useEffect(() => {
        let animationFrameId: number;
        let lastUpdateTime = 0;

        const loop = (timestamp: number) => {
            // Update UI 10 times a second to prevent flickering 
            if (timestamp - lastUpdateTime > 100) {
                const landmarks = latestLandmarksRef.current;
                const gesture = landmarks ? classifyGesture(landmarks) : null;

                if (gesture === 'ROCK') setLiveGesture('✊');
                else if (gesture === 'PAPER') setLiveGesture('🖐');
                else if (gesture === 'SCISSORS') setLiveGesture('✌️');
                else setLiveGesture('🤔'); // Unknown / No hand

                lastUpdateTime = timestamp;
            }
            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [latestLandmarksRef]);

    if (error) {
        return <div className="camera-error">Error: {error}</div>;
    }

    return (
        <div className="live-preview-container">
            {/* Video is hidden, we only need it to feed MediaPipe */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ visibility: 'hidden', position: 'absolute', width: 10, height: 10 }}
            />
            <div className="gesture-icon-display pulse">
                {liveGesture}
            </div>
        </div>
    );
};
