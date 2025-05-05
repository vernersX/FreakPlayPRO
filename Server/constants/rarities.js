// Server/constants/rarities.js

// 1) The ordered ladder:
const RARITY_LEVELS = [
    'rookie',    // Tennis ball
    'tactician', // American football ball
    'playmaker', // Basketball
    'striker',   // Football
    'allstar'    // Trophy ball
  ];
  
  // 2) Metadata for each rarity,
  //    including your newly required base cooldown multiplier:
  const RARITY_DEFINITIONS = {
    rookie: {
      baseValue:              5,
      imageURL:               '/card-imgs/CardTennisBall.webp',
      baseCooldownMultiplier: 1,
    },
    tactician: {
      baseValue:              15,
      imageURL:               '/card-imgs/CardRugbyBall.webp',
      baseCooldownMultiplier: 3,
    },
    playmaker: {
      baseValue:              30,
      imageURL:               '/card-imgs/CardBasketBall.webp',
      baseCooldownMultiplier: 5,
    },
    striker: {
      baseValue:              60,
      imageURL:               '/card-imgs/CardFootballBall.png',
      baseCooldownMultiplier: 10,
    },
    allstar: {
      baseValue:              120,
      imageURL:               '/card-imgs/CardTrophyBall.png',
      baseCooldownMultiplier: 15,
    },
  };
  
  module.exports = {
    RARITY_LEVELS,
    RARITY_DEFINITIONS,
  };
  