// backend/itemEffects.js

/**
 * Each function should follow a similar signature:
 * async function(user, card, inventoryItem, metadata)
 */

async function coinBoostEffect(user, card, inventoryItem, metadata) {
    // Example: Boost the card's coin amount for a specific time period.
    // You might add a temporary boost property or schedule a timeout/cron job to remove the boost.
    // This is a placeholder implementation.
    card.coinBoost = metadata.boostAmount;
    card.boostExpiresAt = Date.now() + metadata.duration; // duration in ms
    await card.save();
    console.log(`Applied coin boost of ${metadata.boostAmount} for ${metadata.duration}ms`);
}

async function refillLivesEffect(user, card, inventoryItem, metadata) {
    // Refill the card's lives to its maximum.
    card.lives = card.maxLives;
    await card.save();
    console.log('Card lives refilled to maximum');
}

// Define additional item effects here...
// For example, upgrade_rarityEffect, extra_drawEffect, shieldEffect, etc.

const itemEffects = {
    coin_boost: coinBoostEffect,
    refill_lives: refillLivesEffect,
    // e.g., upgrade_rarity: upgradeRarityEffect,
    // extra_draw: extraDrawEffect,
    // shield: shieldEffect,
};

module.exports = itemEffects;
