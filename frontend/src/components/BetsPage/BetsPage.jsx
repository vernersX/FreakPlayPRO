// frontend/src/components/BetsPage/BetsPage.jsx

import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config';                 // your base URL :contentReference[oaicite:0]{index=0}
import BetCard from '../BetCard/BetCard';                   // reuse your BetCard component :contentReference[oaicite:1]{index=1}

export default function BetsPage({ telegramId }) {
    const [pendingBets, setPendingBets] = useState([]);
    const [historyBets, setHistoryBets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!telegramId) return;

        async function fetchBets() {
            setLoading(true);
            try {
                const [pendingRes, historyRes] = await Promise.all([
                    fetch(
                        `${API_BASE_URL}/api/bets/my?telegramId=${encodeURIComponent(
                            telegramId
                        )}`
                    ),
                    fetch(
                        `${API_BASE_URL}/api/bets/history?telegramId=${encodeURIComponent(
                            telegramId
                        )}`
                    )
                ]);

                const [pendingData, historyData] = await Promise.all([
                    pendingRes.json(),
                    historyRes.json()
                ]);

                setPendingBets(pendingData);
                setHistoryBets(historyData);
            } catch (err) {
                console.error('Error fetching bets:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchBets();
    }, [telegramId]);

    if (loading) {
        return <div>Loading your bets...</div>;
    }

    // No bets at all
    if (pendingBets.length === 0 && historyBets.length === 0) {
        return <div>You have no bets yet.</div>;
    }

    return (
        <div style={{ padding: '16px' }}>
            {/* Active Bets */}
            {pendingBets.length > 0 && (
                <>
                    <h2>My Active Bets</h2>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            marginBottom: '24px'
                        }}
                    >
                        {pendingBets.map(bet => (
                            <BetCard key={bet.id} bet={bet} />
                        ))}
                    </div>
                </>
            )}

            {/* Past Bets */}
            {historyBets.length > 0 && (
                <>
                    <h2>Past Bets</h2>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}
                    >
                        {historyBets.map(bet => (
                            <BetCard key={bet.id} bet={bet} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
