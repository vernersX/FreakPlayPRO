// src/components/CardWithCooldown/CardWithCooldown.jsx
import React, { useState, useEffect } from 'react';
import styles from './CardWithCooldown.module.css';

/**
 * Displays a card image with a dark overlay and countdown when on cooldown.
 */
export default function CardWithCooldown({
    imageUrl,
    cooldownUntil,
    altText,
}) {
    const [now, setNow] = useState(Date.now());

    // Tick every second while counting down
    useEffect(() => {
        if (!cooldownUntil) return;
        const untilMs = new Date(cooldownUntil).getTime();
        if (Date.now() < untilMs) {
            const timer = setTimeout(() => setNow(Date.now()), 1000);
            return () => clearTimeout(timer);
        }
    }, [now, cooldownUntil]);

    const untilMs = cooldownUntil ? new Date(cooldownUntil).getTime() : 0;
    const remainingMs = Math.max(untilMs - now, 0);

    const onCooldown = true;
    // const onCooldown = remainingMs > 0;

    // format HH:MM:SS
    const h = String(Math.floor(remainingMs / 3600000)).padStart(2, '0');
    const m = String(Math.floor((remainingMs % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0');
    const countdownText = `${h}:${m}:${s}`;

    return (
        <div className={styles.cardContainer}>
            <img
                src={imageUrl}
                alt={altText}
                className={styles.cardImage}
            />

            {onCooldown && (
                <>
                    <div className={styles.overlay} />
                    <div className={styles.countdown}>
                        {countdownText}
                    </div>
                </>
            )}
        </div>
    );
}
