import React, { useState, useMemo } from 'react';
import styles from './MatchCard.module.css';
import BetFormModal from '../BetFormModal/BetFormModal';
import backgroundImgFootball from '../../imgs/UEFAbg.jpg';
import backgroundImgBasketball from '../../imgs/NBAbg.webp';
import backgroundImgUFC from '../../imgs/UFCbg.jpg';

// 1) Bulk‐import all images in each sport‐group folder
const soccerImgs = require
    .context('../../imgs/Soccer imgs', false, /\.(png|jpe?g|webp)$/)
    .keys()
    .map(key => require(`../../imgs/Soccer imgs/${key.replace('./', '')}`));

const basketballImgs = require
    .context('../../imgs/Basketball imgs', false, /\.(png|jpe?g|webp)$/)
    .keys()
    .map(key => require(`../../imgs/Basketball imgs/${key.replace('./', '')}`));

const mmaImgs = require
    .context('../../imgs/MMA imgs', false, /\.(png|jpe?g|webp)$/)
    .keys()
    .map(key => require(`../../imgs/MMA imgs/${key.replace('./', '')}`));

const hockeyImgs = require
    .context('../../imgs/Hockey imgs', false, /\.(png|jpe?g|webp)$/)
    .keys()
    .map(key => require(`../../imgs/Hockey imgs/${key.replace('./', '')}`));

// 2) Map the DB `group` field to the appropriate array
const backgroundMapByGroup = {
    Soccer: soccerImgs,
    Basketball: basketballImgs,
    'Mixed Martial Arts': mmaImgs,
    'Ice Hockey': hockeyImgs,
    // you can add more groups here if you create folders for them
};

export default function MatchCard({ game, telegramId, onBetPlaced }) {
    const [showBetModal, setShowBetModal] = useState(false);

    const leagueLogoUrl = `${process.env.PUBLIC_URL}/SVG Logos/${game.sportKey}.svg`;

    // 3) Pick the right image array based on game.group
    const imgsForGroup = backgroundMapByGroup[game.group] || soccerImgs;

    // 4) Memoize a random pick per match ID, so it stays consistent
    const backgroundImg = useMemo(() => {
        const idx = Math.floor(Math.random() * imgsForGroup.length);
        return imgsForGroup[idx];
    }, [game.id, imgsForGroup]);

    // modal handlers
    function handleOpenBet() { setShowBetModal(true); }
    function handleCloseBet() { setShowBetModal(false); }
    function handleBetSuccess(bet, userCoins) {
        onBetPlaced?.(bet, userCoins);
        setShowBetModal(false);
    }

    return (
        <div
            className={styles.cardContainer}
            onClick={handleOpenBet}
            style={{
                background: `linear-gradient(to bottom, #30183524 40%, #301835 100%), url('${backgroundImg}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* League logo via <img> */}
            <div className={styles.leagueLogoContainer}>
                <img
                    src={leagueLogoUrl}
                    alt={`${game.sportKey} logo`}
                    className={styles.leagueLogo}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                />
            </div>

            {/* Time */}
            <div className={styles.timeContainer}>
                <p>{new Date(game.commenceTime).toLocaleString()}</p>
            </div>

            {/* Sport info
            {game.sportTitle && (
                <div className={styles.sportInfo}>
                    <p className={styles.sportTitle}>{game.sportTitle}</p>
                    <p className={styles.sportDescription}>{game.sportDescription}</p>
                </div>
            )} */}

            {/* Home team */}
            <div className={styles.teamContainer}>
                <div className={styles.teamLogoContainer}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                        <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M7.76804 0.358932C5.26169 1.03246 3.1258 2.6104 1.73178 4.72135L3.80255 5.28223L7.76804 2.40114V0.358932ZM0.977056 6.07097C0.350094 7.41673 0 8.91748 0 10.5C0 11.6358 0.180348 12.7295 0.513971 13.754L2.8836 14.0031L4.86391 11.3307L3.3651 6.7178L0.977056 6.07097ZM3.14445 17.9931C2.35602 17.219 1.68922 16.3215 1.17534 15.3318L2.61086 15.4827L3.14445 17.9931ZM4.9848 19.4366C6.5876 20.4279 8.47699 21 10.5 21C11.089 21 11.6666 20.9515 12.2292 20.8583C12.0422 20.6816 11.9556 20.417 12.0108 20.1573L13.1117 14.9781L10.9718 12.2166H6.07438L4.0351 14.9686L4.9848 19.4366ZM19.482 15.9412C18.2787 17.9233 16.4378 19.4754 14.2439 20.3129L13.5913 19.9361L14.5379 15.4827L19.0659 15.0068L19.482 15.9412ZM20.3383 14.1767C20.7661 13.0324 21 11.7935 21 10.5C21 9.63754 20.896 8.79937 20.6999 7.99734L16.8215 5.86435L13.671 6.71778L12.1753 11.3209L14.2546 14.0042L19.451 13.458C19.7742 13.4241 20.0824 13.6021 20.2146 13.8989L20.3383 14.1767ZM18.3221 3.49525C18.9559 4.20253 19.4952 4.99626 19.9201 5.85658L17.8522 4.71935L18.3221 3.49525ZM17.1469 2.37129C15.3365 0.889235 13.0221 0 10.5 0C10.0832 0 9.67213 0.0242819 9.26804 0.0715081V2.40114L13.2335 5.28223L16.3539 4.43695L17.1469 2.37129ZM4.83464 6.38647L8.51804 3.71033L12.2014 6.38647L10.7945 10.7166H6.24158L4.83464 6.38647Z" fill="#F2F2F2" />
                    </svg>
                </div>
                <div className={styles.teamInfoContainer}>
                    <div className={styles.teamOdds}>{game.homeOdds}</div>
                    <p className={styles.teamName}>{game.homeTeam}</p>
                </div>
            </div>

            {/* Away team */}
            <div className={styles.teamContainer}>
                <div className={styles.teamLogoContainer}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                        <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M7.76804 0.358932C5.26169 1.03246 3.1258 2.6104 1.73178 4.72135L3.80255 5.28223L7.76804 2.40114V0.358932ZM0.977056 6.07097C0.350094 7.41673 0 8.91748 0 10.5C0 11.6358 0.180348 12.7295 0.513971 13.754L2.8836 14.0031L4.86391 11.3307L3.3651 6.7178L0.977056 6.07097ZM3.14445 17.9931C2.35602 17.219 1.68922 16.3215 1.17534 15.3318L2.61086 15.4827L3.14445 17.9931ZM4.9848 19.4366C6.5876 20.4279 8.47699 21 10.5 21C11.089 21 11.6666 20.9515 12.2292 20.8583C12.0422 20.6816 11.9556 20.417 12.0108 20.1573L13.1117 14.9781L10.9718 12.2166H6.07438L4.0351 14.9686L4.9848 19.4366ZM19.482 15.9412C18.2787 17.9233 16.4378 19.4754 14.2439 20.3129L13.5913 19.9361L14.5379 15.4827L19.0659 15.0068L19.482 15.9412ZM20.3383 14.1767C20.7661 13.0324 21 11.7935 21 10.5C21 9.63754 20.896 8.79937 20.6999 7.99734L16.8215 5.86435L13.671 6.71778L12.1753 11.3209L14.2546 14.0042L19.451 13.458C19.7742 13.4241 20.0824 13.6021 20.2146 13.8989L20.3383 14.1767ZM18.3221 3.49525C18.9559 4.20253 19.4952 4.99626 19.9201 5.85658L17.8522 4.71935L18.3221 3.49525ZM17.1469 2.37129C15.3365 0.889235 13.0221 0 10.5 0C10.0832 0 9.67213 0.0242819 9.26804 0.0715081V2.40114L13.2335 5.28223L16.3539 4.43695L17.1469 2.37129ZM4.83464 6.38647L8.51804 3.71033L12.2014 6.38647L10.7945 10.7166H6.24158L4.83464 6.38647Z" fill="#F2F2F2" />
                    </svg>
                </div>
                <div className={styles.teamInfoContainer}>
                    <div className={styles.teamOdds}>{game.awayOdds}</div>
                    <p className={styles.teamName}>{game.awayTeam}</p>
                </div>
            </div>

            {/* Bet Modal */}
            {showBetModal && (
                <BetFormModal
                    backgroundImg={backgroundImg}
                    game={game}
                    telegramId={telegramId}
                    onClose={handleCloseBet}
                    onBetSuccess={handleBetSuccess}
                />
            )}
        </div>
    );
}
