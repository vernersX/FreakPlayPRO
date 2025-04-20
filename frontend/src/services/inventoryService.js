// frontend/src/services/inventoryService.js
import { API_BASE_URL } from '../config';

export async function useInventoryItem({
    telegramId,
    inventoryItemId,
    selectedCardIds,
    targetCardId,
}) {
    const body = { telegramId, inventoryItemId };
    if (selectedCardIds) body.selectedCardIds = selectedCardIds;
    if (targetCardId) body.targetCardId = targetCardId;

    const res = await fetch(`${API_BASE_URL}/api/inventory/use-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error using item');
    return data;
}
