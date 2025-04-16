// client/src/components/HorizontalMatchList/HorizontalMatchList.jsx
import React from 'react';
import styles from './HorizontalMatchList.module.css';
import MatchCard from '../MatchCard/MatchCard';

function HorizontalMatchList({ groupName, matches, telegramId, onBetSuccess }) {
    return (
        <div className={styles.sportSection}>
            <h2 className={styles.sportTitle}>{groupName}</h2>
            <div className={styles.horizontalScroll}>
                {matches.map((game) => (
                    <MatchCard
                        key={game.id}
                        game={game}
                        telegramId={telegramId}
                        onBetSuccess={onBetSuccess}
                    />
                ))}
            </div>
        </div>
    );
}

export default HorizontalMatchList;
