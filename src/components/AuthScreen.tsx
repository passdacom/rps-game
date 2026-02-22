import React, { useState } from 'react';
import { signInWithGoogle } from '../lib/firebase';

interface AuthScreenProps {
    onLogin: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
            onLogin();
        } catch (err: any) {
            setError(err.message || '로그인에 실패했습니다.');
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-screen">
            <div className="auth-box">
                <h1 className="cyber-title">RPS MASTER</h1>
                <p className="subtitle">AI 기반 실시간 가위바위보 대결</p>

                <button
                    className="neon-btn giant-btn pulse auth-btn"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? '연결 중...' : '구글 계정으로 로그인'}
                </button>

                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};
