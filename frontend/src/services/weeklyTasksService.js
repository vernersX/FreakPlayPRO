// frontend/src/services/weeklyTasksService.js
import axios from 'axios';
import { API_BASE_URL } from '../config';

// — GET /api/weekly-tasks/status/:telegramId
export function getWeeklyTasks(telegramId) {
  return axios.get(
    `${API_BASE_URL}/api/weekly-tasks/status/${telegramId}`
  );
}

// — POST /api/weekly-tasks/:telegramId/claim/:taskId
export function claimWeeklyTask(telegramId, taskId) {
  return axios.post(
    `${API_BASE_URL}/api/weekly-tasks/${telegramId}/claim/${taskId}`
  );
}
