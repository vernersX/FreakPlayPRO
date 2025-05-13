// frontend/src/components/WeeklyTasksModal/WeeklyTasksModal.js
import React, { useEffect, useState } from 'react';
import styles from './WeeklyTasksModal.module.css';
import dailyStyles from '../DailyRewardModal/DailyRewardModal.module.css';
import { getWeeklyTasks, claimWeeklyTask } from '../../services/weeklyTasksService';
import { toast } from 'react-toastify';

export default function WeeklyTasksModal({ telegramId, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!telegramId) return;
    let mounted = true;
    setLoading(true);

    getWeeklyTasks(telegramId)
      .then(res => {
        if (!mounted) return;
        // API returns array of tasks
        setTasks(res.data);
      })
      .catch(err => {
        console.error('Failed to load weekly tasks:', err);
        toast.error('Failed to load weekly tasks');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [telegramId]);

  const handleClaim = async (taskId) => {
    if (!telegramId) return;
    setLoading(true);
    try {
      await claimWeeklyTask(telegramId, taskId);
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, rewarded: true } : task
      ));
      toast.success('Reward claimed!');
    } catch (error) {
      console.error('Error claiming weekly task:', error);
      const errMsg = error.response?.data?.error || 'Failed to claim reward';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.bottomSheet}>
        <div className={styles.sheetHeader}>
          <h2 className={styles.titleText}>Weekly Tasks</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <p className={styles.subText}>Complete the tasks below to earn rewards!</p>

        {loading ? (
          <p>Loading tasks...</p>
        ) : (
          <ul className={styles.taskList}>
            {tasks.map(task => (
              <li key={task.id} className={styles.taskItem}>
                <input
                  type="checkbox"
                  className={styles.taskCheckbox}
                  checked={task.completed}
                  readOnly
                />
                <span className={styles.taskText}>{task.description}</span>
                <button
                  className={dailyStyles.cnfrmBtn}
                  onClick={() => handleClaim(task.id)}
                  disabled={!task.completed || task.rewarded || loading}
                >
                  {task.rewarded ? 'Claimed' : 'Claim'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
