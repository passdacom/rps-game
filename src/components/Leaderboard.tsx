import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface LeaderboardEntry {
    uid: string;
    displayName: string;
    photoURL: string;
    totalWins: number;
    highestStreak: number;
}

interface LeaderboardProps {
    onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onClose }) => {
    const [topWins, setTopWins] = useState<LeaderboardEntry[]>([]);
    const [topStreaks, setTopStreaks] = useState<LeaderboardEntry[]>([]);
    const [activeTab, setActiveTab] = useState<'WINS' | 'STREAKS'>('WINS');

    useEffect(() => {
        // Query for Most Wins
        const winsQ = query(collection(db, 'users'), orderBy('totalWins', 'desc'), limit(10));
        const unsubscribeWins = onSnapshot(winsQ, (snapshot) => {
            const data: LeaderboardEntry[] = [];
            snapshot.forEach((doc) => data.push(doc.data() as LeaderboardEntry));
            setTopWins(data);
        });

        // Query for Highest Streaks
        const streaksQ = query(collection(db, 'users'), orderBy('highestStreak', 'desc'), limit(10));
        const unsubscribeStreaks = onSnapshot(streaksQ, (snapshot) => {
            const data: LeaderboardEntry[] = [];
            snapshot.forEach((doc) => data.push(doc.data() as LeaderboardEntry));
            setTopStreaks(data);
        });

        return () => {
            unsubscribeWins();
            unsubscribeStreaks();
        };
    }, []);

    const renderList = (data: LeaderboardEntry[], type: 'WINS' | 'STREAKS') => {
        return (
            <div className="leaderboard-list">
                {data.map((user, idx) => {
                    const rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : '';
                    return (
                        <div key={user.uid} className={`leaderboard-item ${rankClass}`}>
                            <span className="rank">#{idx + 1}</span>
                            <img src={user.photoURL || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=guest'} alt="avatar" className="avatar-img-sm" />
                            <span className="name-score">
                                {user.displayName || 'Player'} -
                                <span className="score neon-pink">
                                    {type === 'WINS' ? ` ${user.totalWins}승` : ` ${user.highestStreak}연승`}
                                </span>
                            </span>
                        </div>
                    );
                })}
                {data.length === 0 && <div className="no-data">데이터가 없습니다.</div>}
            </div>
        );
    };

    return (
        <div className="modal-overlay">
            <div className="leaderboard-modal">
                <div className="leaderboard-header">
                    <h2 className="cyber-title-sm">LEADERBOARD</h2>
                    <button className="neon-btn sm close-btn" onClick={onClose}>X</button>
                </div>

                <div className="tab-buttons">
                    <button
                        className={`neon-btn sm ${activeTab === 'WINS' ? 'active' : ''}`}
                        onClick={() => setActiveTab('WINS')}
                    >
                        최다승 (Most Wins)
                    </button>
                    <button
                        className={`neon-btn sm ${activeTab === 'STREAKS' ? 'active' : ''}`}
                        onClick={() => setActiveTab('STREAKS')}
                    >
                        최대 연승 (Highest Streak)
                    </button>
                </div>

                <div className="leaderboard-content">
                    {activeTab === 'WINS' ? renderList(topWins, 'WINS') : renderList(topStreaks, 'STREAKS')}
                </div>
            </div>
        </div>
    );
};
