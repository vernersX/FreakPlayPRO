// constants/weeklyTaskDefinitions.js

module.exports = [
    {
      key: 'win_5_bets',
      title: 'Win 5 bets',
      description: 'Win 5 bets this week',
      criteria:    { action: 'winBet', count: 5 },
      rewardType:  'card',
      rewardValue: { rarity: 'rookie' },
      displayOrder: 1
    },
    {
      key: 'merge_two_cards',
      title: 'Merge two cards into next rarity card',
      description: 'Merge two cards into a card of the next rarity',
      criteria:    { action: 'mergeCards', count: 1 },
      rewardType:  'item',
      rewardValue: { itemKey: 'coin_boost' },
      displayOrder: 2
    },
    {
      key: 'use_refill_item_3x',
      title: 'Use the refill item 3 times',
      description: 'Use your refill item three times this week',
      criteria:    { action: 'useRefillItem', count: 3 },
      rewardType:  'item',
      rewardValue: { itemKey: 'stopwatch_bronze' },
      displayOrder: 3
    },
    {
      key: 'win_3_bets_in_a_row',
      title: 'Win 3 bets in a row',
      description: 'Achieve three consecutive bet wins',
      criteria:    { action: 'winBetStreak', count: 3 },
      rewardType:  'card',
      rewardValue: { rarity: 'tactician' },
      displayOrder: 4
    },
    {
      key: 'win_with_two_cards',
      title: 'Win a bet using 2 cards',
      description: 'Use exactly two cards in one bet and win',
      criteria:    { action: 'winBetWith2Cards', count: 1 },
      rewardType:  'card',
      rewardValue: { rarity: 'striker' },
      displayOrder: 5
    },

    {
      key: 'win_with_three_cards',
      title: 'Win a bet using 3 cards',
      description: 'Use exactly three cards in one bet and win',
      criteria:    { action: 'winBetWith3Cards', count: 1 },
      rewardType:  'card',
      rewardValue: { rarity: 'striker' },
      displayOrder: 5
    },

    {
      key: 'win_3_with_boost',
      title: 'Win 3 bets with coin boost applied',
      description: 'Win three bets while a coin-boost card is in play',
      criteria:    { action: 'winBetWithBoost', count: 3 },
      rewardType:  'card',
      rewardValue: { rarity: 'all-star' },
      displayOrder: 6
    },
    {
      key: 'invite_one_friend',
      title: 'Invite one friend',
      description: 'Send an invite link to a friend and get them to join',
      criteria:    { action: 'inviteFriend', count: 1 },
      rewardType:  'item',
      rewardValue: { itemKey: 'mystery_box_classic' },
      displayOrder: 7
    },
    {
      key: 'use_shield_item_3x',
      title: 'Use the shield item 3 times',
      description: 'Use your shield item three times this week',
      criteria:    { action: 'useShieldItem', count: 3 },
      rewardType:  'item',
      rewardValue: { itemKey: 'stopwatch_gold' },
      displayOrder: 8
    }
    // …add more definitions here as needed
  ];