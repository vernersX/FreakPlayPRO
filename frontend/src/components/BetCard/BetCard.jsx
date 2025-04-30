// client/src/components/BetCard/BetCard.jsx
import React from 'react';
import styles from './BetCard.module.css';

function BetCard({ bet }) {
    // Ensure we have match information
    if (!bet.Match) {
        return <div className={styles.betCardContainer}>Match information is not available.</div>;
    }

    const { commenceTime, homeTeam, awayTeam, sportKey } = bet.Match;
    const isFinished = bet.status === 'won' || bet.status === 'lost';

    return (
        <div className={styles.betCardContainer}>
            <div className={styles.betCardTop}>
                <p>{new Date(commenceTime).toLocaleString()}</p>
                <p>{sportKey || 'N/A'}</p>
            </div>
            <div className={styles.matchInfo}>
                <div className={bet.selection === 'home' ? `${styles.teamContainer} ${styles.fadingText}` : styles.teamContainer}>
                    <div className={styles.teamLogoContainer}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                            <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M7.76804 0.358932C5.26169 1.03246 3.1258 2.6104 1.73178 4.72135L3.80255 5.28223L7.76804 2.40114V0.358932ZM0.977056 6.07097C0.350094 7.41673 0 8.91748 0 10.5C0 11.6358 0.180348 12.7295 0.513971 13.754L2.8836 14.0031L4.86391 11.3307L3.3651 6.7178L0.977056 6.07097ZM3.14445 17.9931C2.35602 17.219 1.68922 16.3215 1.17534 15.3318L2.61086 15.4827L3.14445 17.9931ZM4.9848 19.4366C6.5876 20.4279 8.47699 21 10.5 21C11.089 21 11.6666 20.9515 12.2292 20.8583C12.0422 20.6816 11.9556 20.417 12.0108 20.1573L13.1117 14.9781L10.9718 12.2166H6.07438L4.0351 14.9686L4.9848 19.4366ZM19.482 15.9412C18.2787 17.9233 16.4378 19.4754 14.2439 20.3129L13.5913 19.9361L14.5379 15.4827L19.0659 15.0068L19.482 15.9412ZM20.3383 14.1767C20.7661 13.0324 21 11.7935 21 10.5C21 9.63754 20.896 8.79937 20.6999 7.99734L16.8215 5.86435L13.671 6.71778L12.1753 11.3209L14.2546 14.0042L19.451 13.458C19.7742 13.4241 20.0824 13.6021 20.2146 13.8989L20.3383 14.1767ZM18.3221 3.49525C18.9559 4.20253 19.4952 4.99626 19.9201 5.85658L17.8522 4.71935L18.3221 3.49525ZM17.1469 2.37129C15.3365 0.889235 13.0221 0 10.5 0C10.0832 0 9.67213 0.0242819 9.26804 0.0715081V2.40114L13.2335 5.28223L16.3539 4.43695L17.1469 2.37129ZM4.83464 6.38647L8.51804 3.71033L12.2014 6.38647L10.7945 10.7166H6.24158L4.83464 6.38647Z" fill="#F2F2F2" />
                        </svg>
                    </div>
                    <p>{homeTeam}</p>
                </div>
                <p className={`${styles.vsp} ${bet.selection === 'draw' ? styles.fadingText : ''}`}>VS</p>
                <div className={bet.selection === 'away' ? `${styles.teamContainer} ${styles.fadingText}` : styles.teamContainer}>
                    <div className={styles.teamLogoContainer}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                            <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M7.76804 0.358932C5.26169 1.03246 3.1258 2.6104 1.73178 4.72135L3.80255 5.28223L7.76804 2.40114V0.358932ZM0.977056 6.07097C0.350094 7.41673 0 8.91748 0 10.5C0 11.6358 0.180348 12.7295 0.513971 13.754L2.8836 14.0031L4.86391 11.3307L3.3651 6.7178L0.977056 6.07097ZM3.14445 17.9931C2.35602 17.219 1.68922 16.3215 1.17534 15.3318L2.61086 15.4827L3.14445 17.9931ZM4.9848 19.4366C6.5876 20.4279 8.47699 21 10.5 21C11.089 21 11.6666 20.9515 12.2292 20.8583C12.0422 20.6816 11.9556 20.417 12.0108 20.1573L13.1117 14.9781L10.9718 12.2166H6.07438L4.0351 14.9686L4.9848 19.4366ZM19.482 15.9412C18.2787 17.9233 16.4378 19.4754 14.2439 20.3129L13.5913 19.9361L14.5379 15.4827L19.0659 15.0068L19.482 15.9412ZM20.3383 14.1767C20.7661 13.0324 21 11.7935 21 10.5C21 9.63754 20.896 8.79937 20.6999 7.99734L16.8215 5.86435L13.671 6.71778L12.1753 11.3209L14.2546 14.0042L19.451 13.458C19.7742 13.4241 20.0824 13.6021 20.2146 13.8989L20.3383 14.1767ZM18.3221 3.49525C18.9559 4.20253 19.4952 4.99626 19.9201 5.85658L17.8522 4.71935L18.3221 3.49525ZM17.1469 2.37129C15.3365 0.889235 13.0221 0 10.5 0C10.0832 0 9.67213 0.0242819 9.26804 0.0715081V2.40114L13.2335 5.28223L16.3539 4.43695L17.1469 2.37129ZM4.83464 6.38647L8.51804 3.71033L12.2014 6.38647L10.7945 10.7166H6.24158L4.83464 6.38647Z" fill="#F2F2F2" />
                        </svg>
                    </div>
                    <p>{awayTeam}</p>
                </div>
            </div>
            {/* <div className={styles.betInfo}>
                <p><strong>Selection:</strong> {bet.selection}</p>
                <p><strong>Status:</strong> {bet.status}</p>
            </div> */}
            <div className={styles.cardInfo}>
                {Array.isArray(bet.Cards) && bet.Cards.length > 0 ? (
                    <div className={styles.cardDetails}>
                        {bet.Cards.map(card => (
                            <img
                                key={card.id}
                                src={card.imageURL}
                                alt={`${card.rarity} card`}
                                className={styles.cardImage}
                            />
                        ))}
                    </div>
                ) : (
                    <p>
                        <strong>Card Used:</strong>{' '}
                        {Array.isArray(bet.cardIds)
                            ? bet.cardIds.map(id => `#${id}`).join(', ')
                            : `#${bet.cardId}`}
                    </p>
                )}
            </div>
            {isFinished && <div className={bet.status === 'won' ? styles.statusWon : styles.statusLost}>
                {bet.status === 'won' ? <p>You won {bet.payout}</p> : <p>You lost</p>}
            </div>}
        </div>
    );
}

export default BetCard;
