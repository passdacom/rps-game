import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type { Landmark } from '@mediapipe/tasks-vision';

export const useHandTracking = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const landmarkerRef = useRef<HandLandmarker | null>(null);
    // Store the latest landmarks without causing re-renders
    const latestLandmarksRef = useRef<Landmark[] | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        let active = true;

        const initTracker = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );

                const landmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 1, // Only tracking one hand per player
                    minHandDetectionConfidence: 0.5,
                    minHandPresenceConfidence: 0.5,
                    minTrackingConfidence: 0.5
                });

                if (!active) return;

                landmarkerRef.current = landmarker;
                setIsReady(true);

                const detectFrame = () => {
                    if (videoRef.current && videoRef.current.readyState >= 2 && landmarkerRef.current) {
                        const results = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());
                        if (results.landmarks && results.landmarks.length > 0) {
                            latestLandmarksRef.current = results.landmarks[0]; // First hand detected
                        } else {
                            latestLandmarksRef.current = null;
                        }
                    }
                    animationFrameRef.current = requestAnimationFrame(detectFrame);
                };
                detectFrame();

            } catch (err: any) {
                console.error("Tracking Init Error:", err);
                setError(err.message || 'Failed to initialize camera or AI model.');
            }
        };

        initTracker();

        return () => {
            active = false;
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (landmarkerRef.current) landmarkerRef.current.close();
            if (videoRef.current?.srcObject) {
                // Stop all video tracks
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            }
        };
    }, [videoRef]);

    return { isReady, error, latestLandmarksRef };
};
