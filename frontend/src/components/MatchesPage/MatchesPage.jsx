// client/src/components/MatchesPage/MatchesPage.jsx
import React, { useEffect, useState } from 'react';
import styles from './MatchesPage.module.css';
import { API_BASE_URL } from '../../config';
import HorizontalMatchList from '../HorizontalMatchList/HorizontalMatchList';
import { Link } from 'react-router-dom';
import Football from '../../imgs/SoccerPageIcon.png';
import MMA from '../../imgs/MMAPageIcon.png';
import BasketBall from '../../imgs/BasketballPageIcon.png';
import Hockey from '../../imgs/HockeyPageIcon.png';

// You can keep your static sports carousel data if needed
const SPORTS_LIST = [
    { sportKey: 'soccer_epl', group: 'Soccer', displayName: 'Football', iconURL: Football },
    { sportKey: 'basketball_nba', group: 'Basketball', displayName: 'Basketball', iconURL: BasketBall },
    { sportKey: 'icehockey_nhl', group: 'Ice Hockey', displayName: 'Ice Hockey', iconURL: Hockey }, // Replace with a proper image
    { sportKey: 'mma_mixed_martial_arts', group: 'Mixed Martial Arts', displayName: 'MMA', iconURL: MMA },
    // ... add more if needed
];

/**
 * Group matches by their `group` field.
 * If a match does not have a valid group value, assign it to "Other".
 */
function groupMatchesByGroup(matches) {
    const grouped = {};
    matches.forEach((match) => {
        const grp = match.group ? match.group : "Other";
        if (!grouped[grp]) {
            grouped[grp] = [];
        }
        grouped[grp].push(match);
    });
    // Sort matches within each group by commenceTime
    Object.keys(grouped).forEach(grp => {
        grouped[grp].sort((a, b) => new Date(a.commenceTime) - new Date(b.commenceTime));
    });
    return grouped;
}

function MatchesPage({ onBetSuccess, telegramId }) {
    const [allMatches, setAllMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all upcoming matches from the backend
    useEffect(() => {
        const url = `${API_BASE_URL}/api/matches/upcoming`;
        setLoading(true);
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                // Filter out matches with no odds
                const filteredData = data.filter(
                    (match) =>
                        match.homeOdds !== null ||
                        match.awayOdds !== null ||
                        match.drawOdds !== null
                );
                setAllMatches(filteredData);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching matches:", err);
                setLoading(false);
            });
    }, []);

    // Group matches by the "group" field
    const groupedMatches = groupMatchesByGroup(allMatches);
    // Sort groups alphabetically; you can adjust this sorting as needed.
    const sortedGroupNames = Object.keys(groupedMatches).sort();

    return (
        <div className={styles.mainPageContainer}>
            <p>
                <Link to="/" className={styles.BreadCrumbs}>Home</Link> &gt; Matches
            </p>
            <h1 className={styles.title}>Matches</h1>

            <div className={styles.navLinks}>
                <Link to="/matches" className={`${styles.navButton} ${styles.selected}`}>
                    All Matches
                </Link>
                <Link to="/mybets" className={styles.navButton}>My Matches</Link>
            </div>

            {/* Optionally: If you want to show a sports carousel */}
            <div className={styles.sportsCarousel}>
                {SPORTS_LIST.map((sport) => (
                    <Link
                        key={sport.sportKey}
                        // In this design, the link could navigate to a page filtered by group
                        to={`/sports/${encodeURIComponent(sport.group)}`}
                        className={styles.sportCard}
                        style={{
                            backgroundImage: `url(${sport.iconURL})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <p>{sport.displayName}</p>
                    </Link>
                ))}
            </div>

            {loading ? (
                <div className={styles.loading}>Loading matches...</div>
            ) : allMatches.length === 0 ? (
                <p>No upcoming matches found.</p>
            ) : (
                // Render each group with its heading and horizontal list of matches
                sortedGroupNames.map((groupName) => (
                    <div key={groupName}>
                        <h2 className={styles.groupHeading}>{groupName}</h2>
                        <HorizontalMatchList
                            matches={groupedMatches[groupName]}
                            telegramId={telegramId}
                            onBetSuccess={onBetSuccess}
                        />
                    </div>
                ))
            )}
        </div>
    );
}

export default MatchesPage;
