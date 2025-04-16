// client/src/components/CardDetail/CardMatchHistory.jsx
import React from 'react';
import styles from './CardMatchHistory.module.css';

function CardMatchHistory({ matchHistory }) {
    if (!matchHistory || matchHistory.length === 0) {
        return <p>No match history for this card.</p>;
    }
    return (
        <div className={styles.matchHistory}>
            {matchHistory.map((bet) => (
                <div key={bet.id} className={styles.betRecord}>
                    <p>
                        <strong>Match:</strong>{' '}
                        {bet.Match ? `${bet.Match.homeTeam} vs ${bet.Match.awayTeam}` : bet.matchId}
                    </p>
                    <p>
                        <strong>Selection:</strong> {bet.selection}
                    </p>
                    <p>
                        <strong>Stake:</strong> {bet.stake}
                    </p>
                    <p>
                        <strong>Status:</strong> {bet.status}
                    </p>
                    {bet.status !== 'pending' && (
                        <p>
                            <strong>Payout:</strong> {bet.payout}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}

export default CardMatchHistory;
