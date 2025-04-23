// Server/services/inventoryService.js

const { models } = require('../db/init');
const itemEffects = require('./itemEffects');
const { User, Card, Item, InventoryItem } = models;

/** Decrease quantity and delete or save */
async function consumeInventoryItem(inventoryItem, qty = 1) {
    inventoryItem.quantity -= qty;
    if (inventoryItem.quantity <= 0) {
        await inventoryItem.destroy();
    } else {
        await inventoryItem.save();
    }
}

async function listUserCards(userId) {
    return Card.findAll({ where: { userId } });
}

async function listUserItems(userTelegramId) {
    return InventoryItem.findAll({
        where: { UserTelegramId: userTelegramId },
        include: [{ model: Item }]
    });
}

/**
 * Use an inventory item. Now accepts selectedCardIds for effects like ball_merge.
 *
 * @param {string} telegramId
 * @param {number} inventoryItemId
 * @param {number|null} targetCardId
 * @param {number[]|null} selectedCardIds
 */
async function useItem(
    telegramId,
    inventoryItemId,
    targetCardId = null,
    selectedCardIds = null
) {
    // 1) Validate user
    const user = await User.findOne({ where: { telegramId } });
    if (!user) throw new Error('User not found');

    // 2) Validate inventory item
    const inventoryItem = await InventoryItem.findOne({
        where: { id: inventoryItemId, UserTelegramId: telegramId },
        include: [{ model: Item }]
    });
    if (!inventoryItem || inventoryItem.quantity <= 0) {
        throw new Error('Item not found in inventory');
    }
    const { Item: item } = inventoryItem;

    // 3) Fetch target card if provided
    let targetCard = null;
    if (targetCardId) {
        targetCard = await Card.findOne({
            where: { id: targetCardId, userId: telegramId }
        });
        if (!targetCard) throw new Error('Target card not found');
    }

    // 4) Lookup effect function
    const effectFn = itemEffects[item.type];
    if (!effectFn) throw new Error(`No effect implemented for ${item.type}`);

    // 5) Merge in selectedCardIds so ball_mergeEffect sees them
    const metadata = { ...item.metadata };
    if (Array.isArray(selectedCardIds)) {
        metadata.selectedCardIds = selectedCardIds;
    }

    // 6) Execute effect (may throw)
    await effectFn(user, targetCard, inventoryItem, metadata);

    // 7) Consume one quantity after successful effect
    await consumeInventoryItem(inventoryItem);

    return { message: `${item.type} used successfully` };
}

module.exports = {
    listUserCards,
    listUserItems,
    useItem
};
