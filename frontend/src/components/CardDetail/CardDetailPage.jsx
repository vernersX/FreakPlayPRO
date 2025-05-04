// client/src/components/CardDetail/CardDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './CardDetailPage.module.css';
import CardSummary from '../CardSummary/CardSummary';
import CardMatchHistory from '../CardMatchHistory/CardMatchHistory';
import CardOwners from '../CardOwners/CardOwners';

function CardDetailPage() {
    const { cardId } = useParams();
    const [cardData, setCardData] = useState(null);
    const [activeTab, setActiveTab] = useState('summary');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
        fetch(`${apiUrl}/api/cards/${cardId}`)
            .then((res) => res.json())
            .then((data) => {
                setCardData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching card details:', err);
                setLoading(false);
            });
    }, [cardId]);

    if (loading) return <p>Loading card details...</p>;
    if (!cardData) return <p>Card not found</p>;

    return (
        <div className={styles.cardDetailPage}>
            <h2>Card Details</h2>
            <div className={styles.cardTabs}>
                <button
                    onClick={() => setActiveTab('summary')}
                    className={activeTab === 'summary' ? styles.activeTab : ''}
                >
                    Summary
                </button>
                <button
                    onClick={() => setActiveTab('matchHistory')}
                    className={activeTab === 'matchHistory' ? styles.activeTab : ''}
                >
                    Match History
                </button>
                <button
                    onClick={() => setActiveTab('owners')}
                    className={activeTab === 'owners' ? styles.activeTab : ''}
                >
                    Owners
                </button>
            </div>
            <hr />
            <div className={styles.tabContent}>
                {activeTab === 'summary' && <CardSummary card={cardData.card} />}
                {activeTab === 'matchHistory' && (
                    <CardMatchHistory matchHistory={cardData.matchHistory} />
                )}
                {activeTab === 'owners' && (
                    <CardOwners ownershipHistory={cardData.ownershipHistory} />
                )}
            </div>
        </div>
    );
}

export default CardDetailPage;
