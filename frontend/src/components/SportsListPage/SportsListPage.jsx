
// client/src/components/SportsListPage/SportsListPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SportsListPage.module.css';
import { API_BASE_URL } from '../../config';

/**
 * Example of a sports list. If your backend has an endpoint
 * like /api/sports or if you just want a static array, adjust accordingly.
 */
function SportsListPage() {
    const navigate = useNavigate();
    const [sports, setSports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // For demonstration, we might have a static array or fetch from an endpoint
        // For example, if your backend returns a list of sportKeys:
        async function fetchSports() {
            try {
                const res = await fetch(`${API_BASE_URL}/api/sports`);
                const data = await res.json();
                setSports(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching sports:', err);
                setLoading(false);
            }
        }

        fetchSports();
    }, []);

    if (loading) {
        return <div className={styles.loading}>Loading sports...</div>;
    }

    if (!sports.length) {
        return <div className={styles.noSports}>No sports available.</div>;
    }

    function handleSportClick(sportKey) {
        // Navigate to /sports/:sportKey page
        navigate(`/sports/${sportKey}`);
    }

    return (
        <div className={styles.sportsListContainer}>
            <h1 className={styles.title}>All Sports</h1>
            <div className={styles.sportsGrid}>
                {sports.map((sport) => (
                    <div
                        key={sport.sportKey}
                        className={styles.sportItem}
                        onClick={() => handleSportClick(sport.sportKey)}
                    >
                        <img
                            src={sport.iconURL}
                            alt={sport.displayName}
                            className={styles.sportIcon}
                        />
                        <p>{sport.displayName}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SportsListPage;
