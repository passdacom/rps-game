import { useState, useRef, useCallback, useEffect } from 'react';
import type { GameState, Gesture, MatchResult, MatchHistoryEntry } from '../types';
import { CONSTANTS } from '../config/constants';
import { classifyGesture } from '../lib/gestureClassifier';
import { AiLogic } from '../lib/aiLogic';
import { audio } from '../lib/audioEngine';
import type { Landmark } from '@mediapipe/tasks-vision';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, increment, updateDoc } from 'firebase/firestore';

export const useGameEngine = (
    getLatestLandmarks: () => Landmark[] | null,
    userId: string | null,
    isPremium: boolean = false
) => {
    const [gameState, setGameState] = useState<GameState>('IDLE');
    const [countdown, setCountdown] = useState<number>(3);
    const [userGesture, setUserGesture] = useState<Gesture | null>(null);
    const [aiGesture, setAiGesture] = useState<Gesture | null>(null);
    const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
    const [history, setHistory] = useState<MatchHistoryEntry[]>([]);
    const [currentSessionStreak, setCurrentSessionStreak] = useState<number>(0);

    const aiLogicRef = useRef(new AiLogic());
    const lastValidGestureRef = useRef<Gesture | null>(null);

    const startGame = useCallback(() => {
        if (gameState !== 'IDLE' && gameState !== 'RESULT') return;

        setGameState('READY');
        setTimeout(() => {
            setGameState('COUNTDOWN');
            setCountdown(3);
            lastValidGestureRef.current = null; // Reset
        }, 1000); // Show "Ready?" for 1s
    }, [gameState]);

    // Live gesture polling during countdown
    useEffect(() => {
        let reqId: number;
        const poll = () => {
            if (gameState === 'COUNTDOWN' || gameState === 'READY') {
                const landmarks = getLatestLandmarks();
                const detected = landmarks ? classifyGesture(landmarks) : null;
                if (detected) {
                    lastValidGestureRef.current = detected;
                }
            }
            reqId = requestAnimationFrame(poll);
        };
        reqId = requestAnimationFrame(poll);
        return () => cancelAnimationFrame(reqId);
    }, [gameState, getLatestLandmarks]);

    // Countdown logic
    useEffect(() => {
        if (gameState === 'COUNTDOWN') {
            audio.playCountdown();
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(c => c - 1), CONSTANTS.COUNTDOWN_DURATION);
                return () => clearTimeout(timer);
            } else {
                audio.playShoot();
                setGameState('SHOOT');

                setTimeout(() => {
                    handleResult(lastValidGestureRef.current || 'ROCK');
                }, CONSTANTS.SHOOT_DELAY);
            }
        }
    }, [gameState, countdown]);
    const handleResult = async (userG: Gesture) => {
        const aiG = isPremium
            ? aiLogicRef.current.getPatternMatchedGesture()
            : AiLogic.getRandomGesture();

        setUserGesture(userG);
        setAiGesture(aiG);
        aiLogicRef.current.recordUserGesture(userG);

        let res: MatchResult = 'DRAW';
        if (userG === aiG) {
            res = 'DRAW';
        } else if (
            (userG === 'ROCK' && aiG === 'SCISSORS') ||
            (userG === 'PAPER' && aiG === 'ROCK') ||
            (userG === 'SCISSORS' && aiG === 'PAPER')
        ) {
            res = 'WIN';
        } else {
            res = 'LOSE';
        }

        setMatchResult(res);
        setGameState('RESULT');

        if (res === 'WIN') audio.playWin();
        else if (res === 'LOSE') audio.playLose();
        else audio.playDraw();

        // Scoring Logic: Track Streak Session
        let newSessionStreak = currentSessionStreak;
        if (res === 'WIN') {
            newSessionStreak += 1;
            setCurrentSessionStreak(newSessionStreak);
        } else if (res === 'LOSE') {
            // Commit streak to DB only on loss
            if (userId && currentSessionStreak > 0) {
                try {
                    const userRef = doc(db, 'users', userId);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const data = userSnap.data();
                        let highestStreak = data.highestStreak || 0;
                        if (currentSessionStreak > highestStreak) highestStreak = currentSessionStreak;
                        await updateDoc(userRef, {
                            totalWins: increment(currentSessionStreak),
                            highestStreak: highestStreak
                        });
                    } else {
                        await setDoc(userRef, {
                            uid: userId,
                            totalWins: currentSessionStreak,
                            highestStreak: currentSessionStreak
                        }, { merge: true });
                    }
                } catch (e) {
                    console.error("Firestore Update Error:", e);
                }
            }
            setCurrentSessionStreak(0); // Reset local streak on lose
        }
        // If DRAW, newSessionStreak remains unchanged and we do not touch DB.

        setHistory(prev => [...prev.slice(-49), { userGesture: userG, aiGesture: aiG, result: res, timestamp: Date.now() }]);

        // Auto reset
        setTimeout(() => {
            setGameState('IDLE');
            setUserGesture(null);
            setAiGesture(null);
            setMatchResult(null);
            if (res === 'LOSE') {
                setHistory([]);
            }
        }, CONSTANTS.RESULT_DURATION);
    };

    return {
        gameState,
        countdown,
        userGesture,
        aiGesture,
        matchResult,
        history,
        startGame,
        currentSessionStreak
    };
};
