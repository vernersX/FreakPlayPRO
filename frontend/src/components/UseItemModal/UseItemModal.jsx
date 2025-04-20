import React, { useEffect, useState } from 'react';
import styles from './UseItemModal.module.css';
import { API_BASE_URL } from '../../config';
import CardItem from '../CardItem/CardItem';

const cardRequirement = {
    coin_boost: 1,
    refill_lives: 1,
    shield: 1,
    ball_merge: 2,
    // all others (stopwatches, mystery boxes, …) need 0 cards
};

export default function UseItemModal({ telegramId, inventoryItem, onClose, onUsed }) {
    const needCards = cardRequirement[inventoryItem.Item.type] || 0;
    const [step, setStep] = useState(needCards === 0 ? 'confirm' : 'confirm-select');
    const [cards, setCards] = useState([]);
    const [selected, setSelected] = useState([]);

    /* load cards only if we will need them */
    useEffect(() => {
        if (needCards === 0 || step === 'confirm') return;
        fetch(`${API_BASE_URL}/api/inventory/cards?telegramId=${telegramId}`)
            .then(r => r.json())
            .then(setCards)
            .catch(console.error);
    }, [step, needCards, telegramId]);

    const toggleCard = (id) => {
        setSelected(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : prev.length < needCards
                    ? [...prev, id]
                    : prev
        );
    };

    const doUse = async () => {
        try {
            const body = {
                telegramId,
                inventoryItemId: inventoryItem.id,
            };
            if (needCards === 1) body.targetCardId = selected[0];
            if (needCards > 1) body.selectedCardIds = selected;

            const res = await fetch(`${API_BASE_URL}/api/inventory/use-item`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'Failed to use item');
                return;
            }
            onUsed();            // let parent know to refresh
        } catch (err) {
            console.error(err);
            alert('Network error');
        }
    };

    /* ---------- RENDER ---------- */
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.sheet}
                onClick={e => e.stopPropagation()}      /* prevent overlay click */
            >
                {step === 'confirm' && (
                    <>
                        <h3 className={styles.title}>{inventoryItem.Item.type.replace(/_/g, ' ')}</h3>
                        <p className={styles.question}>Use this item?</p>
                        <div className={styles.btnRow}>
                            <button className={styles.cancel} onClick={onClose}>Cancel</button>
                            <button className={styles.confirm} onClick={doUse}>Use</button>
                        </div>
                    </>
                )}

                {step === 'confirm-select' && (
                    <>
                        <h3 className={styles.title}>{inventoryItem.Item.type.replace(/_/g, ' ')}</h3>
                        <p className={styles.question}>
                            Select {needCards} card{needCards > 1 ? 's' : ''} to apply the item
                        </p>

                        <div className={styles.cardGrid}>
                            {cards.map(c => (
                                <div
                                    key={c.id}
                                    className={
                                        `${styles.cardBox} ${selected.includes(c.id) ? styles.selected : ''}`
                                    }
                                    onClick={() => toggleCard(c.id)}
                                >
                                    <CardItem card={c} />
                                </div>
                            ))}
                        </div>

                        <div className={styles.btnRow}>
                            <button className={styles.cancel} onClick={onClose}>Cancel</button>
                            <button
                                className={styles.confirm}
                                disabled={selected.length !== needCards}
                                onClick={doUse}
                            >
                                Confirm
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
