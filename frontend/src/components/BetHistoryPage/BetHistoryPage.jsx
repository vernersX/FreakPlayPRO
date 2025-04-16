// client/src/components/BetHistoryPage/BetHistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config';

function BetHistoryPage({ telegramId }) {
    const [bets, setBets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const res = await fetch(`${API_BASE_URL}/api/bets/history?telegramId=${telegramId}`);
                const data = await res.json();
                setBets(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching bet history:', err);
                setLoading(false);
            }
        }
        if (telegramId) {
            fetchHistory();
        }
    }, [telegramId]);

    if (loading) return <div>Loading your bet history...</div>;
    if (!bets.length) return <div>No finished bets found.</div>;

    return (
        <div>
            <h2>My Finished Bets</h2>
            {bets.map((bet) => (
                <div key={bet.id} style={{ border: '1px solid #ccc', margin: '8px', padding: '8px' }}>
                    <p>Match: {bet.Match ? `${bet.Match.homeTeam} vs ${bet.Match.awayTeam}` : bet.matchId}</p>
                    <p>Selection: {bet.selection}</p>
                    <p>Stake: {bet.stake}</p>
                    <p>Status: {bet.status}</p>
                    <p>Payout: {bet.payout}</p>
                </div>
            ))}
        </div>
    );
}

export default BetHistoryPage;
