// backend/services/inventoryService.js
const { models } = require('../db/init');
const { Card, InventoryItem, Item } = models;
const itemEffects = require('./itemEffects');


/**
 * Returns all trading cards owned by the user.
 * @param {number} userId 
 */
async function listUserCards(userId) {
    return Card.findAll({ where: { userId } });
}

/**
 * Returns all inventory items owned by the user, including item details.
 * @param {number} userId 
 */
async function listUserItems(userTelegramId) {
    return InventoryItem.findAll({
        where: { UserTelegramId: userTelegramId },
        include: [Item],
    });
}

/**
 * Applies an inventory item’s effect to a card.
 * For example, if the item type is "restore_life", it increases the card’s lives by 1 (up to maxLives).
 * @param {number} userId 
 * @param {number} inventoryItemId 
 * @param {number} targetCardId 
 */
async function useItem(userTelegramId, inventoryItemId, targetCardId) {
    // 1) Find the inventory item including its associated Item details.
    const invItem = await InventoryItem.findByPk(inventoryItemId, { include: [Item] });
    if (!invItem || invItem.userTelegramId !== userTelegramId) {
        throw new Error('Item not found or not owned by user');
    }

    // 2) Find the target card.
    const card = await Card.findByPk(targetCardId);
    if (!card || card.userTelegramId !== userTelegramId) {
        throw new Error('Card not found or not owned by user');
    }

    // 3) Determine the effect based on the item type.
    const effect = itemEffects[invItem.Item.type];
    if (!effect) {
        throw new Error('Unknown item type');
    }

    // 4) Execute the effect.
    await effect({ id: userTelegramId }, card, invItem, invItem.Item.metadata);

    // 5) Deduct one usage from the inventory item.
    invItem.quantity -= 1;
    if (invItem.quantity <= 0) {
        await invItem.destroy();
    } else {
        await invItem.save();
    }

    return { card, usedItem: invItem.Item };
}

module.exports = {
    listUserCards,
    listUserItems,
    useItem,
};
