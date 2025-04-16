// client/src/components/MyBetsPage/MyBetsPage.jsx
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config';

function MyBetsPage({ telegramId }) {
    const [bets, setBets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMyBets() {
            try {
                const res = await fetch(`${API_BASE_URL}/api/bets/my?telegramId=${telegramId}`);
                const data = await res.json();
                setBets(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching my bets:', err);
                setLoading(false);
            }
        }
        if (telegramId) {
            fetchMyBets();
        }
    }, [telegramId]);

    if (loading) return <div>Loading your pending bets...</div>;
    if (!bets.length) return <div>You have no active bets.</div>;

    return (
        <div>
            <h2>My Active Bets</h2>
            {bets.map((bet) => (
                <div key={bet.id} style={{ border: '1px solid #ccc', margin: '8px', padding: '8px' }}>
                    <p>Bet ID: {bet.id}</p>
                    <p>Match: {bet.Match ? `${bet.Match.homeTeam} vs ${bet.Match.awayTeam}` : bet.matchId}</p>
                    <p>Selection: {bet.selection}</p>
                    <p>Stake: {bet.stake}</p>
                    <p>Status: {bet.status}</p>
                </div>
            ))}
        </div>
    );
}

export default MyBetsPage;
