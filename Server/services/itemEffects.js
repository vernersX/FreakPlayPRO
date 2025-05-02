// --------------------------------------------------------------
//  Pure gameplay effects – NO DB deletions here!
//  All quantity handling happens in inventoryService.useItem()
// --------------------------------------------------------------
const { models } = require('../db/init');
const { Card } = models;
const rarities = require('../constants/rarities');

/*───────────────────────────────────────────────────────────────
 1)  Coin Boost   (needs a card)
────────────────────────────────────────────────────────────────*/
async function coinBoostEffect(_user, card, _invItem, metadata = {}) {
  if (!card) {
    throw new Error('coin_boost requires a target card');
  }

  // Reload to get the freshest expiry time
  await card.reload();

  const now = new Date();
  const durationMs = metadata.duration ?? 86_400_000; // default 24h
  const multiplier = metadata.boostAmount ?? 2;

  const currentExpiresAt = card.coinBoostExpiresAt
    ? new Date(card.coinBoostExpiresAt)
    : null;

  if (currentExpiresAt && currentExpiresAt > now) {
    // Extend existing boost by durationMs
    const newExpiry = new Date(currentExpiresAt.getTime() + durationMs);
    card.coinBoostExpiresAt = newExpiry;
    card.coinBoostMultiplier = multiplier;
    await card.save();

    console.log(
      `Extended coin boost ×${multiplier} by ${durationMs}ms on card #${card.id}` +
      ` (new expiry at ${card.coinBoostExpiresAt.toISOString()})`
    );
    return;
  }

  // Otherwise apply new boost
  card.coinBoostMultiplier = multiplier;
  card.coinBoostExpiresAt = new Date(now.getTime() + durationMs);
  await card.save();

  console.log(
    `Applied coin boost ×${multiplier} for ${durationMs}ms on card #${card.id}` +
    ` (expires at ${card.coinBoostExpiresAt.toISOString()})`
  );
}

/*───────────────────────────────────────────────────────────────
 2)  Refill Lives  (needs a card)
────────────────────────────────────────────────────────────────*/
async function refillLivesEffect(_user, card) {
    if (!card) {
      throw new Error('refill_lives requires a target card');
    }
  
    // Fresh data
    await card.reload();
  
    const now = new Date();
  
    // Only allow if card.cooldownUntil is in the future
    if (!card.cooldownUntil || card.cooldownUntil <= now) {
      throw new Error('Cannot refill: card is not on cooldown');
    }
  
    // Clear the cooldown by setting it to now
    card.cooldownUntil = now;
    await card.save();
  
    console.log(`Cleared cooldown on card #${card.id} at ${now.toISOString()}`);
  }
  

/*───────────────────────────────────────────────────────────────
 3)  Ball Merge – combine two same‑rarity cards listed in
     metadata.selectedCardIds  (NO target card argument)
────────────────────────────────────────────────────────────────*/
async function ballMergeEffect(user, _card, _invItem, metadata) {
    const pair = metadata?.selectedCardIds;
    if (!Array.isArray(pair) || pair.length !== 2) {
        throw new Error('ball_merge requires exactly two card IDs');
    }

    // load both cards, ensure same user & same rarity
    const cards = await Card.findAll({
        where: { id: pair, userId: user.id }
    });
    if (cards.length !== 2 || cards[0].rarity !== cards[1].rarity) {
        throw new Error('Cards must exist and share the same rarity');
    }

    // find where they sit in the ladder
    const idx = rarities.indexOf(cards[0].rarity);
    if (idx < 0) {
        throw new Error(`Unknown rarity: ${cards[0].rarity}`);
    }
    if (idx === rarities.length - 1) {
        throw new Error('Cannot merge at highest rarity');
    }

    // compute next step
    const nextRarity = rarities[idx + 1];

    // delete the old two…
    await Card.destroy({ where: { id: pair } });

    // …and create the new one with doubled baseValue
    await Card.create({
        userId: user.id,
        rarity: nextRarity,
        baseValue: cards[0].baseValue * 2,
        imageURL: metadata.nextImageURL || cards[0].imageURL // optional
    });

    console.log(`Merged two ${cards[0].rarity} → one ${nextRarity}`);
}

/*───────────────────────────────────────────────────────────────
 4)  Stopwatch  (bronze/silver/gold) – sets cooldown multiplier
────────────────────────────────────────────────────────────────*/
async function stopwatchEffect(_user, card, _invItem, metadata) {
    if (!card) throw new Error('stopwatch item requires a target card');
    const mult = metadata?.multiplier ?? 1.5;
    card.cooldownMultiplier = mult;
    await card.save();
    console.log(`Set cooldown multiplier ×${mult} on card #${card.id}`);
}

/*───────────────────────────────────────────────────────────────
 5)  Shield
────────────────────────────────────────────────────────────────*/
async function shieldEffect(_user, card) {
    if (!card) throw new Error('shield requires a target card');
    card.hasShield = true;
    await card.save();
    console.log(`Shield applied to card #${card.id}`);
}

/*───────────────────────────────────────────────────────────────
 6)  Mystery Boxes – stubs
────────────────────────────────────────────────────────────────*/
async function mysteryBoxClassicEffect() { console.log('(stub) classic box'); }
async function mysteryBoxProfessionalEffect() { console.log('(stub) pro box'); }
async function mysterySkinBoxEffect() { console.log('(stub) skin box'); }

/*───────────────────────────────────────────────────────────────
  Export lookup table
────────────────────────────────────────────────────────────────*/
module.exports = {
    coin_boost: coinBoostEffect,
    refill_lives: refillLivesEffect,
    ball_merge: ballMergeEffect,

    stopwatch_bronze: stopwatchEffect,
    stopwatch_silver: stopwatchEffect,
    stopwatch_gold: stopwatchEffect,

    shield: shieldEffect,

    mystery_box_classic: mysteryBoxClassicEffect,
    mystery_box_professional: mysteryBoxProfessionalEffect,
    mystery_skin_box: mysterySkinBoxEffect
};
