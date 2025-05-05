import React, { useState, useMemo } from 'react';
import styles from './MatchCard.module.css';
import BetFormModal from '../BetFormModal/BetFormModal';

import { ReactComponent as SoccerIcon } from '../../icons/soccer.svg'
import { ReactComponent as BasketballIcon } from '../../icons/basketball.svg'
import { ReactComponent as TennisIcon } from '../../icons/tennis.svg'
import { ReactComponent as MmaIcon } from '../../icons/mma.svg'
import { ReactComponent as HockeyIcon } from '../../icons/hockey.svg'

const SPORT_ICON = {
    Soccer: SoccerIcon,
    Basketball: BasketballIcon,
    Tennis: TennisIcon,
    'Mixed Martial Arts': MmaIcon,
    'Ice Hockey': HockeyIcon,
}

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

    // pick the right icon component (falls back to soccer)
    const Icon = SPORT_ICON[game.group] || SoccerIcon

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
                    <Icon width={21} height={21} fill="none" />
                </div>
                <div className={styles.teamInfoContainer}>
                    <div className={styles.teamOdds}>{game.homeOdds}</div>
                    <p className={styles.teamName}>{game.homeTeam}</p>
                </div>
            </div>

            {/* Away team */}
            <div className={styles.teamContainer}>
                <div className={styles.teamLogoContainer}>
                    <Icon width={21} height={21} fill="none" />
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
