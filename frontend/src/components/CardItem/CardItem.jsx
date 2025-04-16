// client/src/components/Inventory/CardItem.jsx
import React from 'react';
import styles from './CardItem.module.css';

function CardItem({ card }) {
    return (
        <div className={styles.cardItem}>
            <img className={styles.cardImg} src={card.imageURL} alt={`${card.rarity} card`} />
            <div>
                <p>Rarity: {card.rarity}</p>
                <p>Base Value: {card.baseValue}</p>
                <p>Lives: {card.lives}/{card.maxLives}</p>
                <p>Win Streak: {card.winStreak}</p>
                <p>Status: {card.isLocked ? 'In Use' : 'Available'}</p>
            </div>
        </div>
    );
}

export default CardItem;
