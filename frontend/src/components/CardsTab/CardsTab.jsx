// client/src/components/Inventory/CardsTab.jsx
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import styles from '../Inventory/InventoryPage.module.css';
import CardItem from '../CardItem/CardItem';

function CardsTab({ telegramId }) {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/inventory/cards?telegramId=${telegramId}`)
            .then(res => res.json())
            .then(data => {
                setCards(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching inventory cards:', err);
                setLoading(false);
            });
    }, [telegramId]);

    function handleCardClick(cardId) {
        navigate(`/card/${cardId}`);
    }

    if (loading) return <p>Loading cards...</p>;
    if (cards.length === 0) return <p>You have no cards.</p>;

    return (
        <div className={styles.cardsGrid}>
            {cards.map((card) => (
                <div
                    className={styles.cardContainer}
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                >
                    <CardItem card={card} />
                </div>
            ))}
        </div>
    );
}

export default CardsTab;
