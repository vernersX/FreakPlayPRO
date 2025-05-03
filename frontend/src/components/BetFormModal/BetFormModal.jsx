// src/components/BetFormModal/BetFormModal.jsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import styles from './BetFormModal.module.css';
import { API_BASE_URL } from '../../config';
import CardWithCooldown from '../CardWithCooldown/CardWithCooldown';

function getOdds(selection, game) {
    if (selection === 'home') return game.homeOdds;
    if (selection === 'draw') return game.drawOdds;
    if (selection === 'away') return game.awayOdds;
    return 0;
}

export default function BetFormModal({ game, telegramId, onClose, onBetSuccess, backgroundImg }) {
    const [cards, setCards] = useState([]);
    const [selected, setSelected] = useState([]);             // array of selected card IDs
    const [selection, setSelection] = useState(null);         // 'home' | 'draw' | 'away'
    const [placedBet, setPlacedBet] = useState(null);

    const [showInventory, setShowInventory] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [loadingCards, setLoadingCards] = useState(true);
    const [error, setError] = useState('');
    const [closing, setClosing] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // Build URL into public/SVG Logos using sportKey
    const leagueLogoUrl = `${process.env.PUBLIC_URL}/SVG Logos/${game.sportKey}.svg`;

    // prevent body scroll while modal open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // load cards
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/inventory/cards?telegramId=${telegramId}`)
            .then(res => res.json())
            .then(data => {
                setCards(data.filter(c => !c.isLocked));
                setLoadingCards(false);
            })
            .catch(() => setLoadingCards(false));
    }, [telegramId]);

    // check existing bet for this match
    useEffect(() => {
        async function checkExisting() {
            try {
                const res = await fetch(
                    `${API_BASE_URL}/api/bets/forMatch?telegramId=${telegramId}&matchId=${game.id}`
                );
                const bet = await res.json();
                if (bet) setPlacedBet(bet);
            } catch (err) {
                console.error(err);
            }
        }
        checkExisting();
    }, [telegramId, game.id]);

    // handle outcome selection
    function handleSelectOutcome(outcome) {
        setSelection(outcome);
        setShowInventory(true);
        setShowConfirmation(false);
    }

    function isOnCooldown(card) {
        return (
            card.cooldownUntil &&
            new Date(card.cooldownUntil).getTime() > Date.now()
        );
    }

    // toggle card in selection array (max 3)
    function handleCardSelection(cardId) {
        const card = cards.find(c => c.id === cardId);
        // if the card is cooling down, bail out
        if (!card || isOnCooldown(card)) return;

        setSelected(ids => {
            if (ids.includes(cardId)) {
                return ids.filter(id => id !== cardId);
            }
            if (ids.length < 3) {
                return [...ids, cardId];
            }
            return ids;
        });
    }

    // confirm inventory (must have ≥1 selected)
    function handleInventoryConfirm() {
        if (selected.length === 0) return;
        setShowInventory(false);
        setShowConfirmation(true);
    }

    // clear everything
    function handleClearSelection() {
        setSelected([]);
        setSelection(null);
        setShowConfirmation(false);
        setError('');
    }

    // slide down animation
    function handleStartClosing() {
        setClosing(true);
    }

    function handleAnimationEnd(e) {
        if (e.animationName === styles.slideDown) onClose();
    }

    function handleOverlayClick() {
        handleStartClosing();
    }

    function handleArrowClick() {
        if (location.pathname === '/matches') handleStartClosing();
        else navigate('/matches');
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('en-GB', { month: 'short' }).toLowerCase();
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        return (
            <>
                <span className={styles.dateMonth}>{day}. {month}</span>
                <span className={styles.dateTime}>{hh}:{mm}</span>
            </>
        );
    }

    // compute totals
    const totalValue = selected.reduce((sum, id) => {
        const card = cards.find(c => c.id === id);
        return card ? sum + card.baseValue : sum;
    }, 0);

    const odds = getOdds(selection, game);
    const potentialWin = odds
        ? (totalValue * odds).toFixed(2)
        : '0.00';

    // submit multi-card bet
    async function handleSubmit() {
        if (!selection || selected.length === 0) {
            setError('Please select an outcome and at least one card.');
            return;
        }
        setError('');
        try {
            console.log("placing bet with:", {
                telegramId,
                matchId: game.id,
                predictedOutcome: selection,
                cardIds: selected
            });
            const res = await fetch(`${API_BASE_URL}/api/bets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegramId,
                    matchId: game.id,
                    predictedOutcome: selection,
                    cardIds: selected,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Error placing bet');
                toast.error(data.error || 'Error placing bet');
            } else {
                toast.success('Bet placed successfully!');
                onBetSuccess(data.bet);
            }
        } catch (err) {
            console.error(err);
            setError('Error placing bet');
            toast.error('Network error. Please try again.');
        }
    }

    return (
        <div>
            <div className={styles.overlay} onClick={handleOverlayClick} />

            <div
                className={`${styles.bottomSheet} ${closing ? styles.slideDown : ''}`}
                onAnimationEnd={handleAnimationEnd}
            >
                {/* header with background */}
                <div
                    className={styles.menuContainer}
                    style={{
                        background: `linear-gradient(to bottom, #251328 0%, #251328 1%, rgba(37,19,40,0.3) 50%, #251328 90%, #251328 100%), url('${backgroundImg}')`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover'
                    }}
                >
                    <div className={styles.navContainer}>
                        <p onClick={handleArrowClick} style={{ cursor: 'pointer' }}>Matches</p>
                        <div onClick={handleOverlayClick} style={{ cursor: 'pointer' }}>
                            <svg width="16" height="16" viewBox="0 0 16 16">
                                <path d="M1 1L15 15" stroke="white" strokeWidth="1.5" />
                                <path d="M1 15L15 1" stroke="white" strokeWidth="1.5" />
                            </svg>
                        </div>
                    </div>
                    <div className={styles.leagueLogoContainer}>
                        <img
                            src={leagueLogoUrl}
                            alt={`${game.sportKey} logo`}
                            className={styles.leagueLogoModal}
                            onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                    </div>
                    <div className={styles.gameContainer}>
                        <div className={styles.teamLogoContainer}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.76804 0.358932C5.26169 1.03246 3.1258 2.6104 1.73178 4.72135L3.80255 5.28223L7.76804 2.40114V0.358932ZM0.977056 6.07097C0.350094 7.41673 0 8.91748 0 10.5C0 11.6358 0.180348 12.7295 0.513971 13.754L2.8836 14.0031L4.86391 11.3307L3.3651 6.7178L0.977056 6.07097ZM3.14445 17.9931C2.35602 17.219 1.68922 16.3215 1.17534 15.3318L2.61086 15.4827L3.14445 17.9931ZM4.9848 19.4366C6.5876 20.4279 8.47699 21 10.5 21C11.089 21 11.6666 20.9515 12.2292 20.8583C12.0422 20.6816 11.9556 20.417 12.0108 20.1573L13.1117 14.9781L10.9718 12.2166H6.07438L4.0351 14.9686L4.9848 19.4366ZM19.482 15.9412C18.2787 17.9233 16.4378 19.4754 14.2439 20.3129L13.5913 19.9361L14.5379 15.4827L19.0659 15.0068L19.482 15.9412ZM20.3383 14.1767C20.7661 13.0324 21 11.7935 21 10.5C21 9.63754 20.896 8.79937 20.6999 7.99734L16.8215 5.86435L13.671 6.71778L12.1753 11.3209L14.2546 14.0042L19.451 13.458C19.7742 13.4241 20.0824 13.6021 20.2146 13.8989L20.3383 14.1767ZM18.3221 3.49525C18.9559 4.20253 19.4952 4.99626 19.9201 5.85658L17.8522 4.71935L18.3221 3.49525ZM17.1469 2.37129C15.3365 0.889235 13.0221 0 10.5 0C10.0832 0 9.67213 0.0242819 9.26804 0.0715081V2.40114L13.2335 5.28223L16.3539 4.43695L17.1469 2.37129ZM4.83464 6.38647L8.51804 3.71033L12.2014 6.38647L10.7945 10.7166H6.24158L4.83464 6.38647Z" fill="#F2F2F2" />
                            </svg>
                        </div>
                        <div className={styles.matchTime}>
                            <p>{formatDate(game.commenceTime)}</p>
                        </div>
                        <div className={styles.teamLogoContainer}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.76804 0.358932C5.26169 1.03246 3.1258 2.6104 1.73178 4.72135L3.80255 5.28223L7.76804 2.40114V0.358932ZM0.977056 6.07097C0.350094 7.41673 0 8.91748 0 10.5C0 11.6358 0.180348 12.7295 0.513971 13.754L2.8836 14.0031L4.86391 11.3307L3.3651 6.7178L0.977056 6.07097ZM3.14445 17.9931C2.35602 17.219 1.68922 16.3215 1.17534 15.3318L2.61086 15.4827L3.14445 17.9931ZM4.9848 19.4366C6.5876 20.4279 8.47699 21 10.5 21C11.089 21 11.6666 20.9515 12.2292 20.8583C12.0422 20.6816 11.9556 20.417 12.0108 20.1573L13.1117 14.9781L10.9718 12.2166H6.07438L4.0351 14.9686L4.9848 19.4366ZM19.482 15.9412C18.2787 17.9233 16.4378 19.4754 14.2439 20.3129L13.5913 19.9361L14.5379 15.4827L19.0659 15.0068L19.482 15.9412ZM20.3383 14.1767C20.7661 13.0324 21 11.7935 21 10.5C21 9.63754 20.896 8.79937 20.6999 7.99734L16.8215 5.86435L13.671 6.71778L12.1753 11.3209L14.2546 14.0042L19.451 13.458C19.7742 13.4241 20.0824 13.6021 20.2146 13.8989L20.3383 14.1767ZM18.3221 3.49525C18.9559 4.20253 19.4952 4.99626 19.9201 5.85658L17.8522 4.71935L18.3221 3.49525ZM17.1469 2.37129C15.3365 0.889235 13.0221 0 10.5 0C10.0832 0 9.67213 0.0242819 9.26804 0.0715081V2.40114L13.2335 5.28223L16.3539 4.43695L17.1469 2.37129ZM4.83464 6.38647L8.51804 3.71033L12.2014 6.38647L10.7945 10.7166H6.24158L4.83464 6.38647Z" fill="#F2F2F2" />
                            </svg>
                        </div>
                    </div>
                    <div className={styles.sheetHeader}>
                        <h3 className={styles.nameTeam}>{game.homeTeam}</h3>
                        <h3>VS</h3>
                        <h3 className={styles.nameTeam}>{game.awayTeam}</h3>
                    </div>
                </div>

                {placedBet ? (
                    <div className={styles.chosenBetContainer}>
                        <div className={styles.chosenTeamContainer}>
                            <p>Winner</p>
                            <p>
                                {placedBet.selection === 'home'
                                    ? game.homeTeam
                                    : placedBet.selection === 'draw'
                                        ? 'Draw'
                                        : game.awayTeam
                                } x{placedBet.odds}
                            </p>
                            <p>Status: {placedBet.status}</p>
                        </div>

                        {placedBet.Cards && placedBet.Cards.length > 0 && (
                            <div className={styles.cardPreview}>
                                {placedBet.Cards.map(card => (
                                    <CardWithCooldown
                                        key={card.id}
                                        imageUrl={card.imageURL}
                                        altText={card.rarity}
                                        cooldownUntil={card.cooldownUntil}
                                        className={styles.cardImg}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* outcome selection */}
                        <div className={styles.outcomeContainer}>
                            <p className={styles.outcomeTitle}>Winner</p>
                            <div className={styles.selectionRow}>
                                {['home', 'draw', 'away'].map(opt => (
                                    game[opt + 'Odds'] != null && (
                                        <div
                                            key={opt}
                                            className={`${styles.selectionBox} ${selection === opt ? styles.selected : ''}`}
                                            onClick={() => handleSelectOutcome(opt)}
                                        >
                                            <p>{opt === 'home' ? 'Team 1' : opt === 'draw' ? 'Draw' : 'Team 2'}</p>
                                            <span className={styles.teamOdds}>x{game[opt + 'Odds']}</span>
                                            <svg className={styles.plusIcon} width="16" height="16" viewBox="0 0 16 16">
                                                <path d="M1 1L15 15" stroke="white" strokeWidth="1.5" />
                                                <path d="M1 15L15 1" stroke="white" strokeWidth="1.5" />
                                            </svg>
                                            <p className={styles.selectionText}>Select cards</p>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Inventory sheet */}
            {showInventory && (
                <>
                    <div className={styles.overlay} onClick={() => setShowInventory(false)} />
                    <div className={styles.inventorySheet}>
                        <div className={styles.inventoryTop}>
                            <h2 className={styles.inventoryTitle}>Select up to 3 cards</h2>
                            <div onClick={handleOverlayClick} style={{ cursor: 'pointer' }}>
                                <svg width="16" height="16" viewBox="0 0 16 16">
                                    <path d="M1 1L15 15" stroke="white" strokeWidth="1.5" />
                                    <path d="M1 15L15 1" stroke="white" strokeWidth="1.5" />
                                </svg>
                            </div>
                        </div>
                        <hr />
                        <div className={styles.inventoryContent}>
                            {loadingCards
                                ? <p>Loading cards...</p>
                                : cards.length === 0
                                    ? <p>No available cards.</p>
                                    : (
                                        <div className={styles.cardList}>
                                            {cards.map(card => {
                                                const isSel = selected.includes(card.id);
                                                return (
                                                    <div
                                                        key={card.id}
                                                        className={`${styles.cardItem} ${isSel ? styles.cardSelected : ''}`}
                                                        onClick={() => handleCardSelection(card.id)}
                                                    >
                                                        <CardWithCooldown
                                                            imageUrl={card.imageURL}
                                                            altText={card.rarity}
                                                            cooldownUntil={card.cooldownUntil}
                                                            className={styles.cardImg}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )
                            }
                        </div>
                        <div className={styles.invButtonRow}>
                            <button className={styles.clearSelectionBtn} onClick={handleClearSelection}>
                                Clear selection
                            </button>
                            <button
                                className={styles.cnfrmBtn}
                                onClick={handleInventoryConfirm}
                                disabled={selected.length === 0}
                            >
                                Confirm ({selected.length}/3)
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Confirmation sheet */}
            {showConfirmation && (
                <>
                    <div className={styles.overlay} onClick={() => setShowConfirmation(false)} />
                    <div className={styles.confirmationSheet}>
                        <div className={styles.navContainer}>
                            <p>Winner</p>
                            <div onClick={handleOverlayClick} style={{ cursor: 'pointer' }}>
                                <svg width="16" height="16" viewBox="0 0 16 16">
                                    <path d="M1 1L15 15" stroke="white" strokeWidth="1.5" />
                                    <path d="M1 15L15 1" stroke="white" strokeWidth="1.5" />
                                </svg>
                            </div>
                        </div>
                        <div className={styles.confirmationContainer}>
                            <div className={styles.confirmationRow}>
                                <p className={styles.confirmationTeam}>
                                    {selection === 'home'
                                        ? game.homeTeam
                                        : selection === 'draw'
                                            ? 'Draw'
                                            : game.awayTeam
                                    }
                                </p>
                                <p className={styles.oddsBox}>x{odds}</p>
                            </div>
                            <div className={styles.confirmationRow}>
                                <p className={styles.winText}>Your stake</p>
                                <p className={styles.winText}>{totalValue.toFixed(2)}</p>
                            </div>
                            <div className={styles.confirmationRow}>
                                <p className={styles.winText}>Potential win</p>
                                <p className={styles.winText}>{potentialWin}</p>
                            </div>
                            <div className={styles.cardPreview}>
                                {cards
                                    .filter(c => selected.includes(c.id))
                                    .map(c => (
                                        <CardWithCooldown
                                            key={c.id}
                                            imageUrl={c.imageURL}
                                            altText={c.rarity}
                                            cooldownUntil={c.cooldownUntil}
                                            className={styles.cardImg}
                                        />
                                    ))
                                }
                            </div>
                            {error && <p className={styles.error}>{error}</p>}
                            <div className={styles.invButtonRow}>
                                <button className={styles.clearSelectionBtn} onClick={handleClearSelection}>
                                    Clear cards
                                </button>
                                <button className={styles.cnfrmBtn} onClick={handleSubmit}>
                                    Place Bet
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
