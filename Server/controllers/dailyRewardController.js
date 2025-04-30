// Server/controllers/dailyRewardController.js

const { models } = require('../db/init');
const { User, InventoryItem, Item } = models;

// POST /api/daily-reward/claim
exports.claimDailyReward = async (req, res) => {
  try {
    const { telegramId } = req.body;
    console.log("▶️ claimDailyReward called", new Date().toISOString(), "body:", req.body);

    // Find the user by Telegram ID
    const user = await User.findOne({ where: { telegramId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const lastClaimed = user.lastClaimedDate ? new Date(user.lastClaimedDate) : null;

    // Determine whether to reset the cycle
    let resetToDayOne = false;
    if (lastClaimed) {
      const diffTime = now.getTime() - lastClaimed.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      if (diffDays >= 2) {
        resetToDayOne = true;
      } else if (diffDays < 1) {
        return res.status(400).json({ message: 'Already claimed today!' });
      }
    }

    // Compute new reward day (1–7)
    const newRewardDay = resetToDayOne ? 1 : (user.rewardDay % 7) + 1;

    // Map reward day → Item ID
    const dailyItemIds = {
      1: 2, // refill_lives
      2: 7, // shield
      3: 4, // stopwatch_bronze
      4: 5, // stopwatch_silver
      5: 6, // stopwatch_gold
      6: 1, // coin_boost
      7: 3  // ball_merge
    };
    const rewardItemId = dailyItemIds[newRewardDay];
    if (!rewardItemId) {
      return res.status(400).json({ message: 'Invalid reward configuration' });
    }

    // Add the item to Inventory using the correct FK fields
    const newInv = await InventoryItem.create({
      UserTelegramId: telegramId,
      ItemId:         rewardItemId,
      quantity:       1
    });
    console.log('New inventory row:', newInv.toJSON());

    // Update the user's rewardDay and lastClaimedDate
    user.rewardDay = newRewardDay;
    user.lastClaimedDate = now;
    await user.save();

    // Fetch the Item to return its details
    const item = await Item.findByPk(rewardItemId);

    return res.json({
      message:   `Successfully claimed Day ${newRewardDay} reward!`,
      rewardDay: newRewardDay,
      item: {
        id:   item.id,
        name: item.name
      }
    });

  } catch (error) {
    console.error('Error claiming daily reward:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Server/controllers/dailyRewardController.js
exports.getDailyRewardStatus = async (req, res) => {
    try {
      const { telegramId } = req.params;
      const user = await User.findOne({ where: { telegramId } });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      return res.json({
        rewardDay:       user.rewardDay || 0,
        lastClaimedDate: user.lastClaimedDate || null
      });
    } catch (error) {
      console.error('Error fetching daily-reward status:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };