// services/cooldownService.js
// Centralized logic for computing card cooldowns, honoring stopwatch buffs

const { models } = require('../db/init');
const { Card } = models;

/**
 * Computes the effective cooldown for a card, applying any active stopwatch buff
 * and expiring it if its duration has passed.
 *
 * @param {number} baseMs   - The base cooldown duration in milliseconds.
 * @param {Card}   card     - The Sequelize Card instance.
 * @returns {Promise<number>} - The adjusted cooldown in milliseconds.
 */
async function computeCooldown(baseMs, card) {
  const now = new Date();
  // buffFactor holds the active buff's cooldown factor (inverse of speed multiplier)
  let buffFactor = card.cooldownMultiplier || 1.0;

  // If the stopwatch buff has expired, clear it and reset buffFactor
  if (card.stopwatchExpiresAt && now > new Date(card.stopwatchExpiresAt)) {
    buffFactor                   = 1.0;
    card.cooldownMultiplier      = 1.0;  // reset only the buff portion
    card.stopwatchActivatedAt    = null;
    card.stopwatchExpiresAt      = null;
    await card.save();
  }

  // Combine the permanent (rarity) base factor with the active buff factor
  const baseFactor      = card.baseCooldownMultiplier ?? 1.0;
  const effectiveFactor = baseFactor * buffFactor;

  // The final cooldown = baseMs scaled by the combined factor
  return baseMs * effectiveFactor;
}

module.exports = {
  computeCooldown,
};
