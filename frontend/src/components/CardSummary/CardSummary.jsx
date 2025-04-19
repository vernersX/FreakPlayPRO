// client/src/components/CardDetail/CardSummary.jsx
import React from 'react';
import styles from './CardSummary.module.css';
import CardWithCooldown from '../CardWithCooldown/CardWithCooldown';


function CardSummary({ card }) {
    return (
        <div className={styles.cardSummary}>
            <CardWithCooldown
                imageUrl={card.imageURL}
                cooldownUntil={card.cooldownUntil}
                altText={`${card.rarity} card`}
                className={styles.summaryImg}
            />
            {/* <p>
                <strong>ID:</strong> {card.id}
            </p> */}
            <p>
                <strong>Rarity:</strong> {card.rarity}
            </p>
            <p>
                <strong>Base Value:</strong> {card.baseValue}
            </p>
            {/* <p>
                <strong>Lives:</strong> {card.lives}/{card.maxLives}
            </p> */}
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
