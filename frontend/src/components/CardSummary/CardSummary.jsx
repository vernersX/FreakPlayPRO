// client/src/components/CardDetail/CardSummary.jsx
import React from 'react';
import styles from './CardSummary.module.css';

function CardSummary({ card }) {
    return (
        <div className={styles.cardSummary}>
            <img src={card.imageURL} alt={`${card.rarity} card`} />
            <p>
                <strong>ID:</strong> {card.id}
            </p>
            <p>
                <strong>Rarity:</strong> {card.rarity}
            </p>
            <p>
                <strong>Base Value:</strong> {card.baseValue}
            </p>
            <p>
                <strong>Lives:</strong> {card.lives}/{card.maxLives}
            </p>
            <p>
                <strong>Win Streak:</strong> {card.winStreak}
            </p>
            <p>
                <strong>Status:</strong> {card.isLocked ? 'In Use' : 'Available'}
            </p>
        </div>
    );
}

export default CardSummary;
