// services/cardService.js
const { models } = require('../db/init');
const { Card, CardOwnershipHistory } = models;

async function createCard(userId, rarity, baseValue, maxLives, imageURL) {
    const newCard = await Card.create({
        userId,
        rarity,
        baseValue,
        lives: maxLives,
        maxLives,
        imageURL,
    });
    // Optionally create ownership history with fromUserId = null
    await CardOwnershipHistory.create({
        cardId: newCard.id,
        fromUserId: null,
        toUserId: userId,
    });
    return newCard;
}

async function transferCard(cardId, fromUserId, toUserId) {
    const card = await Card.findByPk(cardId);
    if (!card) throw new Error('Card not found');
    if (card.userId !== fromUserId) throw new Error('You do not own this card');

    card.userId = toUserId;
    await card.save();

    await CardOwnershipHistory.create({
        cardId,
        fromUserId,
        toUserId,
    });

    return card;
}

/**
 * Computes the adjusted cooldown considering any active stopwatch buffs.
 * Resets buffs that have expired (after 24h).
 * @param {number} baseMs - The base cooldown duration in milliseconds.
 * @param {Card} card - The Card instance to evaluate.
 * @returns {Promise<number>} - The effective cooldown in milliseconds.
 */
async function computeCooldown(baseMs, card) {
    const now = new Date();
  
    // Has the stopwatch buff expired?
    if (card.stopwatchExpiresAt && now > card.stopwatchExpiresAt) {
      card.cooldownMultiplier     = 1.0;
      card.stopwatchActivatedAt   = null;
      card.stopwatchExpiresAt     = null;
      await card.save();
    }
  
    return baseMs * factor;
  }

module.exports = {
    createCard,
    transferCard,
    computeCooldown,
    // ...other methods like updateCard, useCardForBet, etc.
};
