// frontend/src/components/ProfileModal/ProfileModal.jsx

import React, { useState, useEffect } from 'react';
import styles from './ProfileModal.module.css';
import profileDefault from '../../imgs/ProfilePic.png';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import CardItem from '../CardItem/CardItem';
import BetCard from '../BetCard/BetCard';
import inventoryStyles from '../Inventory/InventoryPage.module.css';

export default function ProfileModal({ user, onClose }) {
    const navigate = useNavigate();
    const tabs = [
        { id: 'profile', label: 'Profile' },
        { id: 'cards', label: 'Cards' },
        { id: 'matches', label: 'Matches' },
    ];
    const [active, setActive] = useState('profile');

    // --- Cards state ---
    const [cards, setCards] = useState([]);
    const [loadingCards, setLoading] = useState(false);

    useEffect(() => {
        if (active === 'cards') {
            setLoading(true);
            fetch(
                `${API_BASE_URL}/api/inventory/cards?telegramId=${user.telegramId}`
            )
                .then(r => r.json())
                .then(data => setCards(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [active, user.telegramId]);

    // --- Matches state ---
    const [pendingBets, setPendingBets] = useState([]);
    const [historyBets, setHistoryBets] = useState([]);
    const [loadingBets, setLoadingBets] = useState(false);

    useEffect(() => {
        if (active === 'matches') {
            setLoadingBets(true);
            Promise.all([
                fetch(
                    `${API_BASE_URL}/api/bets/my?telegramId=${user.telegramId}`
                ).then(r => r.json()),
                fetch(
                    `${API_BASE_URL}/api/bets/history?telegramId=${user.telegramId}`
                ).then(r => r.json())
            ])
                .then(([pending, history]) => {
                    setPendingBets(pending);
                    setHistoryBets(history);
                })
                .catch(err => console.error(err))
                .finally(() => setLoadingBets(false));
        }
    }, [active, user.telegramId]);

    // Slide-down animation state
    const [closing, setClosing] = useState(false);
    const handleClose = () => {
        setClosing(true);
        // Delay the real onClose to allow 300ms animation
        setTimeout(onClose, 300);
    };

    // Container classes include .closing when appropriate
    const containerClass = [
        styles.container,
        closing ? styles.closing : null
    ]
        .filter(Boolean)
        .join(' ');

    const totalMatches =
        (user.matchesCount || 0) + (user.liveMatchesCount || 0);

    const overlayClass = [styles.overlay, closing && styles.overlayClosing]
        .filter(Boolean)
        .join(' ');


    return (
        <div className={overlayClass} onClick={handleClose}>
            <div
                className={containerClass}
                onClick={e => e.stopPropagation()}
            >
                <button className={styles.closeBtn} onClick={handleClose}>
                    ×
                </button>

                <div className={styles.tabList}>
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            className={[
                                styles.tabTrigger,
                                active === t.id && styles.active
                            ]
                                .filter(Boolean)
                                .join(' ')}
                            onClick={() => setActive(t.id)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className={styles.tabContent}>
                    {active === 'profile' && (
                        <div className={styles.profileSection}>
                            <img
                                className={styles.avatar}
                                src={user.avatarUrl || profileDefault}
                                alt="avatar"
                            />
                            <h2 className={styles.username}>{user.username}</h2>
                            <p className={styles.joined}>
                                Joined{' '}
                                {new Date(
                                    user.joinedAt || user.createdAt
                                ).toLocaleDateString()}
                            </p>
                            <hr className={styles.divider} />
                            <div className={styles.stats}>
                                <div className={styles.statContainer}>
                                    <span className={styles.statLabel}>Cards</span>
                                    <span className={styles.statValue}>
                                        {user.cardsCount}
                                    </span>
                                </div>
                                <div className={styles.statContainer}>
                                    <span className={styles.statLabel}>Matches</span>
                                    <span className={styles.statValue}>
                                        {totalMatches}
                                    </span>
                                </div>
                                <div className={styles.statContainer}>
                                    <span className={styles.statLabel}>Ranking</span>
                                    <span className={styles.statValue}>
                                        {user.ranking}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {active === 'cards' && (
                        <>
                            {loadingCards && <p>Loading cards...</p>}
                            {!loadingCards && cards.length === 0 && (
                                <p>You have no cards.</p>
                            )}
                            {!loadingCards && cards.length > 0 && (
                                <div className={inventoryStyles.cardsGrid}>
                                    {cards.map(card => (
                                        <div
                                            key={card.id}
                                            className={inventoryStyles.cardContainer}
                                            onClick={() => navigate(`/card/${card.id}`)}
                                        >
                                            <CardItem card={card} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {active === 'matches' && (
                        <>
                            {loadingBets && <p>Loading matches...</p>}
                            {!loadingBets &&
                                pendingBets.length === 0 &&
                                historyBets.length === 0 && (
                                    <p>
                                        You haven’t participated in any matches yet.
                                    </p>
                                )}

                            {!loadingBets && pendingBets.length > 0 && (
                                <>
                                    <h3>Pending Matches</h3>
                                    <div className={styles.matchesList}>
                                        {pendingBets.map(bet => (
                                            <BetCard key={bet.id} bet={bet} />
                                        ))}
                                    </div>
                                </>
                            )}

                            {!loadingBets && historyBets.length > 0 && (
                                <>
                                    <h3>Past Matches</h3>
                                    <div className={styles.matchesList}>
                                        {historyBets.map(bet => (
                                            <BetCard key={bet.id} bet={bet} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
