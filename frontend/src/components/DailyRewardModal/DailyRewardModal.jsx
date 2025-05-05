import React, { useEffect, useState } from 'react';
import styles from './DailyRewardModal.module.css';
import { API_BASE_URL } from '../../config';
import { toast } from 'react-toastify';
import profileDefault from '../../imgs/ProfilePic.png';

export default function DailyRewardModal({ telegramId, user = {}, onClose }) {
  // --- State for reward status ---
  const [currentDay, setCurrentDay] = useState(0);
  const [lastClaimed, setLastClaimed] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- Fetch current rewardDay & lastClaimedDate on mount ---
  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/daily-reward/status/${telegramId}`);
        if (!res.ok) throw new Error('Failed to fetch status');
        const { rewardDay, lastClaimedDate } = await res.json();
        setCurrentDay(rewardDay);
        setLastClaimed(lastClaimedDate);
      } catch (err) {
        console.error('Error loading reward status:', err);
        toast.error('Could not load daily rewards status.');
      }
    }
    loadStatus();
  }, [telegramId]);

  // --- Prevent background scroll while modal is open ---
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // --- Determine if already claimed today ---
  const alreadyClaimedToday = (() => {
    if (!lastClaimed) return false;
    const d = new Date(lastClaimed);
    return d.toDateString() === new Date().toDateString();
  })();

  // --- Mapping of day → reward metadata ---
  const dailyRewards = {
    1: { name: 'Refill Lives', icon: '/item-imgs/AirPump.png' },
    2: { name: 'Shield', icon: '/item-imgs/Shield.png' },
    3: { name: 'Stopwatch Bronze', icon: '/item-imgs/StopwatchBronze.png' },
    4: { name: 'Stopwatch Silver', icon: '/item-imgs/StopwatchSilver.png' },
    5: { name: 'Stopwatch Gold', icon: '/item-imgs/StopwatchGold.png' },
    6: { name: 'Coin Boost', icon: '/item-imgs/CoinBooster.png' },
    7: { name: 'Ball Merge', icon: '/item-imgs/BallMerge.png' },
  };

  // --- Compute fill percentage (out of 7 days) ---
  const fillPercent = (currentDay / 7) * 100;

  // --- Handler to claim today's reward ---
  async function handleClaim() {
    if (loading || alreadyClaimedToday) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/daily-reward/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Claim failed');
      toast.success(data.message);

      // Update local state so UI reflects the new day
      setCurrentDay(data.rewardDay);
      setLastClaimed(new Date().toISOString());
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.bottomSheet}>
        <div className={styles.sheetHeader}>
          <h2 className={styles.titleText}>Daily rewards</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.menuContainer}>
          <p className={styles.subText}>Visit daily and receive prizes.</p>
          <p className={styles.completedText}>Completed: {currentDay}/7</p>

          <div className={styles.progressWrapper}>
            {/* Day numbers 0–7 */}
            <div className={styles.numbersColumn}>
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className={styles.numberLabel}>{i}</div>
              ))}
            </div>

            {/* Vertical progress bar */}
            <div className={styles.barColumn}>
              <div className={styles.progressBarTrack}>
                <div
                  className={styles.progressBarFill}
                  style={{ top: 0, height: `${fillPercent}%` }}
                />
                {currentDay > 0 && (
                  <img
                    src={user.avatarUrl || profileDefault}
                    alt="marker"
                    className={styles.avatarMarker}
                    style={{ top: `${(currentDay / 7) * 100}%` }}
                  />
                )}
              </div>
            </div>

            {/* Reward icons & labels */}
            <div className={styles.labelsColumn}>
              {Array.from({ length: 8 }, (_, i) => {
                const reward = dailyRewards[i];
                return (
                  <div
                    key={i}
                    className={styles.labelItem}
                    style={{ top: `${(i / 7) * 100}%` }}
                  >
                    {reward
                      ? (
                        <>
                          <img
                            src={reward.icon}
                            alt={reward.name}
                            className={styles.rewardIcon}
                          />
                          <span className={styles.stepLabel}>x1 {reward.name}</span>
                        </>
                      )
                      : <span className={styles.stepLabel}>-</span>
                    }
                  </div>
                );
              })}
            </div>
          </div>

          <button
            className={styles.cnfrmBtn}
            onClick={handleClaim}
            disabled={loading || alreadyClaimedToday}
          >
            {alreadyClaimedToday
              ? 'Already Claimed'
              : loading
                ? 'Claiming…'
                : 'Claim Reward'}
          </button>
        </div>
      </div>
    </>
  );
}
