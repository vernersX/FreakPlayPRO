// frontend/src/components/ProfileInfo/ProfileInfo.jsx

import React, {
    useEffect,
    useState,
    forwardRef,
    useImperativeHandle
} from 'react';
import styles from './ProfileInfo.module.css';
import { API_BASE_URL } from '../../config';
import { formatCoins } from '../../utils/formatCoins';
// import logo from '../../imgs/logo.png';
import logo from '../../imgs/CardTrophyBall.png';
import profilePic from '../../imgs/CardTrophyBall.png';

// import profilePic from '../../imgs/ProfilePic.png';
import ballsPic from '../../imgs/BallsCoin.png';
import { Link } from 'react-router-dom';
import ProfileModal from '../ProfileModal/ProfileModal';

function ProfileInfoComponent({ telegramId }, ref) {
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    async function fetchUser(tgId) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/${tgId}`);
            const data = await res.json();
            setUser(data);
        } catch (err) {
            console.error('Error fetching user:', err);
        }
    }

    useEffect(() => {
        if (telegramId) {
            fetchUser(telegramId);
        }
    }, [telegramId]);

    useImperativeHandle(ref, () => ({
        refetchUser: () => {
            if (telegramId) {
                fetchUser(telegramId);
            }
        },
    }));

    if (!user) {
        return <div className={styles.profileError}>No user loaded</div>;
    }

    return (
        <>
            <div className={styles.profileContainer}>
                <div className={styles.logoContainer}>
                    <Link className={styles.navItem} to="/">
                        <img
                            className={styles.logoImg}
                            src={logo}
                            alt="logo"
                        />
                    </Link>
                </div>

                <div className={styles.headerProfileContainer}>
                    <div className={styles.coinsContainer}>
                        <p className={styles.coins}>
                            {formatCoins(user.coins)}
                        </p>
                        <img
                            src={ballsPic}
                            alt="balls coin"
                            width={28}
                            height={28}
                        />
                    </div>

                    <div className={styles.profilePicContainer}>
                        <img
                            className={styles.profileImg}
                            src={profilePic}
                            alt="profile pic"
                        />
                    </div>

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="35"
                        height="35"
                        viewBox="0 0 30 30"
                        fill="none"
                        onClick={() => setShowModal(true)}
                        className={styles.menuIcon}
                        style={{ cursor: 'pointer' }}
                    >
                        <path
                            d="M3.75 22.5V20H26.25V22.5H3.75ZM3.75 16.25V13.75H26.25V16.25H3.75ZM3.75 10V7.5H26.25V10H3.75Z"
                            fill="white"
                        />
                    </svg>
                </div>
            </div>

            {showModal && (
                <ProfileModal
                    user={user}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}

export default forwardRef(ProfileInfoComponent);
