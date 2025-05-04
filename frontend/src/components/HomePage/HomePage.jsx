// client/src/components/HomePage/HomePage.jsx
import React, { useEffect, useState, useRef } from 'react';
import styles from './HomePage.module.css';
import HorizontalMatchList from '../HorizontalMatchList/HorizontalMatchList';
import { API_BASE_URL } from '../../config';
import friendsIcon from '../../imgs/passports-icon.png'
import dailyIcon from '../../imgs/gift-icon.png'
import weeklyIcon from '../../imgs/win-cup-icon.png'
import aiPic from '../../imgs/Live AI frame (1).png'
import winners from '../../imgs/winners.png'
import { Link } from 'react-router-dom';
import DailyRewardModal from '../DailyRewardModal/DailyRewardModal';


function HomePage({ onBetSuccess, telegramId }) {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSport, setActiveSport] = useState('');
    const [showDailyReward, setShowDailyReward] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [dailyDay, setDailyDay] = useState(0);
    const TOTAL_DAYS = 7;


    const tasksRef = useRef(null);

    // When user clicks anywhere in the document, if the click is outside tasksRef,
    // then unselect the item.
    useEffect(() => {
        function handleClickOutside(event) {
            if (tasksRef.current && !tasksRef.current.contains(event.target)) {
                setSelectedTask(null);
            }
        }

        // Listen for clicks on the entire document
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fetch only currentDay from DailyRewardModal endpoint
    useEffect(() => {
        if (!telegramId) return;
        fetch(`${API_BASE_URL}/api/daily-reward/status/${telegramId}`)
            .then(res => res.json())
            .then(data => {
                if (typeof data.rewardDay === 'number') {
                    setDailyDay(data.rewardDay);
                }
            })
            .catch(err => console.error('Failed to fetch daily reward day:', err));
    }, [telegramId]);

    function handleSelectTask(task) {
        // If the user clicks the same task again, we can either keep it selected or toggle it off
        // For example, to toggle:
        setSelectedTask(prev => (prev === task ? null : task));
    }

    useEffect(() => {
        let url = `${API_BASE_URL}/api/matches/upcoming`;
        if (activeSport) {
            url += `?sportKey=${encodeURIComponent(activeSport)}`;
        }
        setLoading(true);
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                const filteredData = data.filter(
                    (match) =>
                        match.homeOdds !== null ||
                        match.awayOdds !== null ||
                        match.drawOdds !== null
                );
                setGames(filteredData);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching matches:', err);
                setLoading(false);
            });
    }, [activeSport]);

    //For daily tasks
    function handleSelectTask(task) {
        setSelectedTask(task);
        if (task === 'daily') {
            setShowDailyReward(true);
        }
    }

    function handleFilter(sport) {
        setActiveSport(sport);
    }

    const now = new Date();
    const next24Matches = games.filter((game) => {
        const commence = new Date(game.commenceTime);
        const diffHours = (commence - now) / (1000 * 60 * 60);
        return diffHours >= 0 && diffHours <= 24;
    });

    return (
        <div className={styles.mainPageContainer}>
            <div className={styles.taskContainer} ref={tasksRef}>
                <div className={`${styles.taskItem} ${selectedTask === 'invite' ? styles.selected : ''
                    }`} onClick={() => handleSelectTask('invite')}>
                    <img src={friendsIcon} alt='friends icon' />
                    Invite friends
                </div>
                <div
          className={`${styles.taskItem} ${selectedTask === 'daily' ? styles.selected : ''}`}
          onClick={() => handleSelectTask('daily')}
        >
          <img src={dailyIcon} alt='daily reward' />
          {`Daily Reward ${dailyDay}/${TOTAL_DAYS}`}
        </div>
        {showDailyReward && (
          <DailyRewardModal
            telegramId={telegramId}
            onClose={() => setShowDailyReward(false)}
          />
        )}

                {/* Modal for daily reward */}
                {showDailyReward && (
                    <DailyRewardModal telegramId={telegramId} onClose={() => setShowDailyReward(false)} />
                )}
                <div className={`${styles.taskItem} ${selectedTask === 'weekly' ? styles.selected : ''
                    }`} onClick={() => handleSelectTask('weekly')}>
                    <img src={weeklyIcon} alt='friends icon' />
                    Weekly tasks 0/7
                </div>
            </div>
            <div>
                <h1 className={styles.title}>Matches</h1>
            </div>
            <div className={styles.navLinks}>
                <Link to='/matches'>
                    <button className={styles.navButton}>All</button>
                </Link>
                <button className={`${styles.navButton} ${styles.selected}`}>Soon</button>
                <Link to='/sports/Soccer'>
                    <button className={styles.navButton}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                            <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M7.76804 0.358932C5.26169 1.03246 3.1258 2.6104 1.73178 4.72135L3.80255 5.28223L7.76804 2.40114V0.358932ZM0.977056 6.07097C0.350094 7.41673 0 8.91748 0 10.5C0 11.6358 0.180348 12.7295 0.513971 13.754L2.8836 14.0031L4.86391 11.3307L3.3651 6.7178L0.977056 6.07097ZM3.14445 17.9931C2.35602 17.219 1.68922 16.3215 1.17534 15.3318L2.61086 15.4827L3.14445 17.9931ZM4.9848 19.4366C6.5876 20.4279 8.47699 21 10.5 21C11.089 21 11.6666 20.9515 12.2292 20.8583C12.0422 20.6816 11.9556 20.417 12.0108 20.1573L13.1117 14.9781L10.9718 12.2166H6.07438L4.0351 14.9686L4.9848 19.4366ZM19.482 15.9412C18.2787 17.9233 16.4378 19.4754 14.2439 20.3129L13.5913 19.9361L14.5379 15.4827L19.0659 15.0068L19.482 15.9412ZM20.3383 14.1767C20.7661 13.0324 21 11.7935 21 10.5C21 9.63754 20.896 8.79937 20.6999 7.99734L16.8215 5.86435L13.671 6.71778L12.1753 11.3209L14.2546 14.0042L19.451 13.458C19.7742 13.4241 20.0824 13.6021 20.2146 13.8989L20.3383 14.1767ZM18.3221 3.49525C18.9559 4.20253 19.4952 4.99626 19.9201 5.85658L17.8522 4.71935L18.3221 3.49525ZM17.1469 2.37129C15.3365 0.889235 13.0221 0 10.5 0C10.0832 0 9.67213 0.0242819 9.26804 0.0715081V2.40114L13.2335 5.28223L16.3539 4.43695L17.1469 2.37129ZM4.83464 6.38647L8.51804 3.71033L12.2014 6.38647L10.7945 10.7166H6.24158L4.83464 6.38647Z" fill="#F2F2F2" />
                        </svg>
                        Football
                    </button>
                </Link>
                <Link to='/sports/Basketball'>
                    <button className={styles.navButton}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                            <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M7.50294 0.521277C7.48178 0.476807 7.43123 0.454539 7.38419 0.469122C5.59671 1.02322 4.01358 2.04195 2.77598 3.38414C2.73596 3.42755 2.74284 3.49593 2.78983 3.53168C4.01522 4.46385 4.98729 5.71187 5.58467 7.15437C5.60308 7.19882 5.65023 7.22434 5.69743 7.21506C6.88261 6.98216 8.09812 6.83385 9.33742 6.77669C9.39726 6.77393 9.44152 6.71971 9.43171 6.66062C9.07248 4.49878 8.41499 2.43776 7.50294 0.521277ZM1.72008 4.73472C1.75131 4.68726 1.81595 4.67595 1.86129 4.71018C2.8124 5.42823 3.58098 6.37522 4.0851 7.46919C4.11081 7.52499 4.07949 7.59007 4.02019 7.60611C2.72329 7.95681 1.46861 8.41029 0.265433 8.95725C0.193343 8.99003 0.113317 8.93049 0.125646 8.85227C0.362397 7.35015 0.917646 5.95386 1.72008 4.73472ZM4.61381 9.10925C4.60291 9.05313 4.54665 9.01837 4.49141 9.0331C2.94355 9.4458 1.45923 10.0142 0.0562606 10.7205C0.0218558 10.7379 0.000531199 10.7736 0.001655 10.8121C0.0603414 12.8227 0.684279 14.6916 1.72008 16.2653C1.75131 16.3127 1.81597 16.324 1.86131 16.2898C3.61415 14.9665 4.74707 12.8655 4.74707 10.5C4.74707 10.0243 4.70126 9.55935 4.61381 9.10925ZM18.9748 4.46717C19.0193 4.43743 19.0793 4.44885 19.11 4.49274C20.0009 5.76775 20.616 7.24979 20.8686 8.85228C20.8809 8.9305 20.8009 8.99003 20.7288 8.95726C19.3889 8.34816 17.9852 7.855 16.5305 7.49059C16.4694 7.47531 16.4371 7.40829 16.4645 7.35165C17.03 6.18033 17.9013 5.1843 18.9748 4.46717ZM18.0119 3.16666C18.0551 3.21092 18.0473 3.28331 17.9966 3.31869C16.6584 4.25223 15.5934 5.55025 14.9454 7.06884C14.927 7.11205 14.8812 7.13706 14.835 7.12888C13.6024 6.91098 12.3383 6.78429 11.05 6.75606C11.0013 6.75499 10.9603 6.71908 10.9528 6.67092C10.6015 4.40884 9.94384 2.24807 9.02358 0.232357C8.99581 0.171521 9.03405 0.100902 9.10034 0.09209C9.5573 0.0313508 10.0235 0 10.4971 0C13.4428 0 16.1051 1.21296 18.0119 3.16666ZM18.9748 16.5328C19.0193 16.5626 19.0793 16.5512 19.11 16.5073C20.2438 14.8847 20.9308 12.9268 20.9926 10.8121C20.9937 10.7736 20.9724 10.7379 20.938 10.7205C19.3913 9.9419 17.7459 9.33086 16.0254 8.91125C15.9713 8.89805 15.9169 8.93182 15.9053 8.98629C15.8016 9.4745 15.7471 9.98088 15.7471 10.5C15.7471 13.016 17.0287 15.2327 18.9748 16.5328ZM14.3535 8.56834C14.4099 8.57776 14.4466 8.63263 14.4348 8.68858C14.3118 9.27303 14.2471 9.87896 14.2471 10.5C14.2471 13.4732 15.73 16.1001 17.9966 17.6813C18.0473 17.7167 18.0551 17.7891 18.0119 17.8333C16.1051 19.787 13.4428 21 10.4971 21C10.0235 21 9.5573 20.9686 9.10034 20.9079C9.03405 20.8991 8.9958 20.8285 9.02357 20.7677C10.4515 17.6399 11.2472 14.1629 11.2472 10.5C11.2472 9.78277 11.2167 9.07267 11.1569 8.37092C11.1518 8.31128 11.1997 8.26034 11.2595 8.26227C12.3099 8.29611 13.3427 8.39962 14.3535 8.56834ZM9.74722 10.5C9.74722 9.77829 9.71434 9.06426 9.64999 8.35933C9.64518 8.3066 9.59991 8.26693 9.54701 8.26906C8.3931 8.31544 7.26085 8.44592 6.1562 8.65453C6.10124 8.66491 6.06577 8.71853 6.07675 8.77338C6.18847 9.33157 6.24707 9.90894 6.24707 10.5C6.24707 13.3434 4.89078 15.8701 2.78984 17.4683C2.74285 17.5041 2.73596 17.5724 2.77598 17.6159C4.01358 18.958 5.59671 19.9768 7.38419 20.5309C7.43123 20.5455 7.48177 20.5232 7.50294 20.4787C8.9419 17.455 9.74722 14.0716 9.74722 10.5Z" fill="#F2F2F2" />
                        </svg>
                        Basketball
                    </button>
                </Link>
                <Link to='/sports/Tennis'>
                    <button className={styles.navButton}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                            <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M10.0775 0C5.67792 0.174117 1.97427 3.05525 0.586175 7.02378C0.590856 7.02965 0.595465 7.0356 0.6 7.04165C1.63004 8.41503 2.92583 9.28837 4.33188 10.0027C4.99875 10.3415 5.67917 10.6391 6.37105 10.9418L6.49705 10.997C7.22416 11.3153 7.96477 11.6426 8.66624 12.0178C10.0779 12.7729 11.3907 13.7522 12.2612 15.3614C12.9795 16.6891 13.3615 18.38 13.3244 20.6074C17.34 19.4886 20.3858 16.0429 20.9174 11.8148C19.0215 11.8611 17.5858 11.4709 16.4639 10.7153C15.1371 9.82179 14.3628 8.49074 13.7515 7.10727C13.4972 6.53177 13.262 5.92461 13.029 5.32333C12.982 5.20194 12.9351 5.08079 12.8881 4.96018C12.6049 4.23331 12.3153 3.51326 11.974 2.81202C11.4819 1.80061 10.8888 0.842641 10.0775 0ZM20.9985 10.3119C19.2648 10.3725 18.1209 10.0228 17.3018 9.47114C16.3316 8.81776 15.6997 7.80506 15.1235 6.50103C14.8846 5.96039 14.6644 5.39211 14.4316 4.79132L14.4316 4.79127C14.3836 4.66747 14.3351 4.5423 14.2858 4.4157C14.0006 3.68359 13.6925 2.91535 13.3228 2.15566C12.9869 1.46527 12.5975 0.776418 12.121 0.116013C17.0928 0.886471 20.9117 5.1449 20.9985 10.3119ZM10.5 20.9917C10.9457 20.9917 11.3849 20.9639 11.8161 20.91C11.8953 18.6891 11.5357 17.1727 10.9419 16.0751C10.2656 14.8249 9.23459 14.0229 7.95876 13.3405C7.31648 12.9969 6.6274 12.6915 5.89553 12.3711L5.76052 12.312L5.7605 12.312L5.76036 12.3119C5.07688 12.013 4.35936 11.6991 3.65249 11.34C2.42776 10.7178 1.20246 9.94444 0.133556 8.8124C0.0456687 9.35919 0 9.92009 0 10.4917C0 16.2906 4.70101 20.9917 10.5 20.9917Z" fill="#F2F2F2" />
                        </svg>
                        Tennis
                    </button>
                </Link>
                <Link to='/sports/Mixed%20Martial%20Arts'>
                    <button className={styles.navButton}>MMA</button>
                </Link>
                <Link to='/sports/Ice%20Hockey'>
                    <button className={styles.navButton}>Hockey</button>
                </Link>
            </div>
            {loading ? (
                <p>Loading matches...</p>
            ) : games.length === 0 ? (
                <p>No upcoming matches found.</p>
            ) : (
                <HorizontalMatchList
                    sportKey="next24"
                    matches={games}
                    telegramId={telegramId}
                    onBetSuccess={onBetSuccess}
                />)}
            <div className={styles.titleContainer}>
                <h1 className={styles.title}>Live AI</h1>
            </div>
            <div className={styles.liveAiContainer}>
                <img src={aiPic} alt='Live AI' />
            </div>
            <div className={styles.titleContainer}>
                <h1 className={styles.title}>Leaderboard</h1>
            </div>
            <div className={styles.leaderboardContainer}>
                <img src={winners} alt='Leaderboard' />
            </div>
            <div className={styles.titleContainer}>
                <h1 className={styles.title}>Join our community</h1>
            </div>
            <div className={styles.leaderboardContainer}>
                <img src={winners} alt='Social links' />
            </div>
        </div>
    );
}

export default HomePage;
