/**
 * Create a new card for a user, initializing its base & active cooldown multipliers.
 */
async function createCard(userId, rarity, baseValue, maxLives, imageURL) {
    // Pull the base multiplier from our central definitions
    const def = RARITY_DEFINITIONS[rarity] || {};
    const baseCooldownMultiplier = def.baseCooldownMultiplier ?? 1;
  
    const newCard = await Card.create({
      userId,
      rarity,
      baseValue,
      lives:    maxLives,
      maxLives,
      imageURL,
      baseCooldownMultiplier,
      cooldownMultiplier: 1.0  // no buff active initially
    });
  
    // Record ownership history
    await CardOwnershipHistory.create({
      cardId:      newCard.id,
      fromUserId:  null,
      toUserId:    userId,
    });
  
    return newCard;
  }
  
  /**
   * Transfer a card between users.
   */
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
  
    // 1) Expire any stopwatch buff
    if (card.stopwatchExpiresAt && now > new Date(card.stopwatchExpiresAt)) {
      // remove only the temporary buff factor
      card.cooldownMultiplier    = 1.0;
      card.stopwatchActivatedAt  = null;
      card.stopwatchExpiresAt    = null;
      await card.save();
    }
  
    // 2) Compute effective factor: base (rarity) × buff (inverse speed)
    const baseFactor      = card.baseCooldownMultiplier ?? 1.0;
    const buffFactor      = card.cooldownMultiplier      ?? 1.0;
    const effectiveFactor = baseFactor * buffFactor;
  
    // 3) Return adjusted cooldown
    return baseMs * effectiveFactor;
  }
  
  module.exports = {
    createCard,
    transferCard,
    computeCooldown,
  };