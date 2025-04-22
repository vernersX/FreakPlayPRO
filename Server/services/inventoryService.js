// --------------------------------------------------------------
//  Inventory‐related helpers: list cards / items, use an item
// --------------------------------------------------------------
const { models } = require('../db/init');
const itemEffects = require('./itemEffects');       // lookup table

const { User, Card, Item, InventoryItem } = models;

/*───────────────────────────────────────────────────────────────
 ▸  Utilities
 ───────────────────────────────────────────────────────────────*/

/** Return all (non‑deleted) cards that belong to a user (for UI). */
async function listUserCards(userTelegramId) {
    return Card.findAll({ where: { userId: userTelegramId } });
}

/** Return inventory items + their Item metadata for a user. */
async function listUserItems(userTelegramId) {
    return InventoryItem.findAll({
        where: { UserTelegramId: userTelegramId },
        include: [{ model: Item }]
    });
}

/** Decrease quantity and delete the InventoryItem if it reaches 0. */
async function consumeInventoryItem(inventoryItem, qty = 1) {
    inventoryItem.quantity -= qty;
    if (inventoryItem.quantity <= 0) {
        await inventoryItem.destroy();
    } else {
        await inventoryItem.save();
    }
}

/*───────────────────────────────────────────────────────────────
 ▸  Main entry – called by the /api/inventory/use‑item route
 ───────────────────────────────────────────────────────────────*/

/**
 * @param {string} telegramId        user who is using the item
 * @param {number} inventoryItemId   primary key in InventoryItem table
 * @param {number|null} targetCardId card id if the item needs one
 */
async function useItem(telegramId, inventoryItemId, targetCardId = null) {
    // 1)  Validate user
    const user = await User.findOne({ where: { telegramId } });
    if (!user) throw new Error('User not found');

    // 2)  Validate inventory item belongs to user and still has quantity
    const inventoryItem = await InventoryItem.findOne({
        where: { id: inventoryItemId, UserTelegramId: telegramId },
        include: [{ model: Item }]
    });
    if (!inventoryItem || inventoryItem.quantity <= 0) {
        throw new Error('Item not found in inventory');
    }

    const { Item: item } = inventoryItem;           // convenience alias

    // 3)  Fetch target card if provided
    let targetCard = null;
    if (targetCardId) {
        targetCard = await Card.findOne({
            where: { id: targetCardId, userId: telegramId }
        });
        if (!targetCard) throw new Error('Target card not found');
    }

    // 4)  Lookup effect function
    const effectFn = itemEffects[item.type];
    if (!effectFn) throw new Error(`No effect implemented for ${item.type}`);

    // 5)  Execute effect (may throw)
    await effectFn(user, targetCard, inventoryItem, item.metadata);

    // 6)  Consume one quantity *after* successful effect
    await consumeInventoryItem(inventoryItem);

    return { message: `${item.type} used successfully` };
}

/*───────────────────────────────────────────────────────────────
 ▸  Exports
 ───────────────────────────────────────────────────────────────*/
module.exports = {
    listUserCards,
    listUserItems,
    useItem      // used by routes/inventory.js
};
