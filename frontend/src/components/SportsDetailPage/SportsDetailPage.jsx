// client/src/components/SportDetailPage/SportDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import MatchCard from '../MatchCard/MatchCard';
import CustomSelect from '../CustomSelect/CustomSelect';
import styles from './SportsDetailPage.module.css';

function SportsDetailPage({ telegramId, onBetSuccess }) {
    const { group } = useParams();

    // All leagues in this group, returned by /api/sports?group=...
    const [sportOptions, setSportOptions] = useState([]);
    // All matches in this group, returned by /api/matches/upcoming?group=...
    const [fullMatches, setFullMatches] = useState([]);
    // The user’s chosen league (sportKey)
    const [selectedSportKey, setSelectedSportKey] = useState('');
    // The matches actually displayed (filtered by selectedSportKey)
    const [displayedMatches, setDisplayedMatches] = useState([]);

    const [loadingOptions, setLoadingOptions] = useState(true);
    const [loadingMatches, setLoadingMatches] = useState(true);

    // 1. Fetch leagues for this group
    useEffect(() => {
        async function fetchLeagues() {
            setLoadingOptions(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/sports?group=${encodeURIComponent(group)}`);
                const data = await res.json();
                // Convert the raw data to the shape needed by CustomSelect: { value, label }
                const options = data.map((sport) => ({
                    value: sport.key,
                    label: sport.title,
                }));
                setSportOptions(options);
            } catch (error) {
                console.error('Error fetching leagues (sports):', error);
            } finally {
                setLoadingOptions(false);
            }
        }
        if (group) {
            fetchLeagues();
        } else {
            setSportOptions([]);
            setLoadingOptions(false);
        }
    }, [group]);

    // 2. Fetch matches for this group
    useEffect(() => {
        async function fetchMatches() {
            setLoadingMatches(true);
            try {
                let url = `${API_BASE_URL}/api/matches/upcoming?group=${encodeURIComponent(group)}`;
                const res = await fetch(url);
                let data = await res.json();
                // Sort by startTime
                data = data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
                // Filter out matches with no odds
                const filteredData = data.filter(
                    (m) => m.homeOdds !== null || m.awayOdds !== null || m.drawOdds !== null
                );
                setFullMatches(filteredData);
            } catch (error) {
                console.error('Error fetching matches:', error);
            } finally {
                setLoadingMatches(false);
            }
        }
        if (group) {
            fetchMatches();
        } else {
            setFullMatches([]);
            setLoadingMatches(false);
        }
    }, [group]);

    // 3. Filter out leagues (sportOptions) that have zero matches.
    const leaguesWithMatches = sportOptions.filter((option) =>
        fullMatches.some((match) => match.sportKey === option.value)
    );

    // 4. On user picking a league, store the selectedSportKey
    function handleSelectChange(newValue) {
        setSelectedSportKey(newValue);
    }

    // 5. Derive displayed matches from the selected league (sportKey).
    useEffect(() => {
        if (!selectedSportKey) {
            // Show all matches if no league selected
            setDisplayedMatches(fullMatches);
        } else {
            // Show only matches with that sportKey
            setDisplayedMatches(
                fullMatches.filter((match) => match.sportKey === selectedSportKey)
            );
        }
    }, [selectedSportKey, fullMatches]);

    if (loadingOptions || loadingMatches) {
        return <p className={styles.loading}>Loading...</p>;
    }

    return (
        <div className={styles.sportDetailContainer}>
            <p>
                <Link to="/" className={styles.BreadCrumbs}>Matches</Link> &gt; {group}
            </p>
            <div className={styles.header}>
                <h1>{group}</h1>
                {leaguesWithMatches.length > 0 && (
                    <CustomSelect
                        options={leaguesWithMatches}
                        value={selectedSportKey}
                        onChange={handleSelectChange}
                    />
                )}
            </div>
            {displayedMatches.length === 0 ? (
                <p>No upcoming matches for {group}{selectedSportKey ? ` in ${selectedSportKey}` : ''}.</p>
            ) : (
                <div className={styles.matchesList}>
                    {displayedMatches.map((match) => (
                        <MatchCard
                            key={match.id}
                            game={match}
                            telegramId={telegramId}
                            onBetSuccess={onBetSuccess}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default SportsDetailPage;
