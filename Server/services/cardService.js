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

module.exports = {
    createCard,
    transferCard,
    // ...other methods like updateCard, useCardForBet, etc.
};
