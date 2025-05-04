// client/src/components/CardDetail/CardSummary.jsx
import React from 'react';
import styles from './CardSummary.module.css';
import CardWithCooldown from '../CardWithCooldown/CardWithCooldown';
import { Link } from 'react-router-dom';

function CardSummary({ card }) {
    const boosted =
        card.coinBoostExpiresAt &&
        new Date(card.coinBoostExpiresAt) > new Date();

    return (
        <div className={`${styles.cardSummary}${boosted ? ` ${styles.boosted}` : ''}`}>
            <CardWithCooldown
                imageUrl={card.imageURL}
                cooldownUntil={card.cooldownUntil}
                altText={`${card.rarity} card`}
                className={styles.summaryImg}
            />
            {/* <p>
                <strong>ID:</strong> {card.id}
            </p> */}
            <section className={styles.cardInfo}>
                <p>
                    <span>Rarity:</span> <span>{card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1).toLowerCase()}</span>
                </p>
                <p>
                    <span>Base Value:</span> <span>{card.baseValue}</span>
                </p>
                <p>
                    <span>Win Streak:</span> <span>{card.winStreak}</span>
                </p>
                <p>
                    <span>Status:</span> <span>{card.isLocked ? 'In Use' : 'Available'}</span>
                </p>
                <p>
                    <span>Boost Active:</span> <span>{boosted ? "Yes" : "No"}</span>
                </p>
            </section>
            <section className={styles.buttonSection}>
                <Link to="/market">
                    <button className={styles.buyButton}>
                        Buy More Balls
                    </button>
                </Link>
            </section>
        </div>
    );
}

export default CardSummary;
