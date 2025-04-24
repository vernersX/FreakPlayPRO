// ProfileModal.jsx
import React, { useState } from 'react';
import styles from './ProfileModal.module.css';
import profileDefault from '../../imgs/ProfilePic.png';
import { formatCoins } from '../../utils/formatCoins';
import { Link } from 'react-router-dom';

export default function ProfileModal({ user, onClose }) {
    const tabs = [
        { id: 'profile', label: 'Profile' },
        { id: 'cards', label: 'Cards' },
        { id: 'matches', label: 'Matches' },
        { id: 'live', label: 'Live Matches' },
    ];
    const [active, setActive] = useState('profile');

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.container} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>×</button>

                <div className={styles.tabList}>
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            className={[
                                styles.tabTrigger,
                                active === t.id && styles.active
                            ].join(' ')}
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
                                Joined {new Date(user.joinedAt).toLocaleDateString()}
                            </p>
                            <div className={styles.stats}>
                                <div className={styles.statContainer}>
                                    <span className={styles.statLabel}>Cards</span>
                                    <span className={styles.statValue}>{user.cardsCount}</span>
                                </div>
                                <div className={styles.statContainer}>
                                    <span className={styles.statLabel}>Matches</span>
                                    <span className={styles.statValue}>{user.matchesCount}</span>
                                </div>
                                <div className={styles.statContainer}>
                                    <span className={styles.statLabel}>Ranking</span>
                                    <span className={styles.statValue}>{user.ranking}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {active === 'cards' && (
                        <Link to="/inventory">View your cards →</Link>
                    )}

                    {active === 'matches' && (
                        <Link to="/mybets">View your bets/matches →</Link>
                    )}

                    {active === 'live' && (
                        <p>No live matches right now.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
