// controllers/marketplaceController.js
const { models } = require('../db/init');
const { User, Item, InventoryItem } = models;

async function listMarketplaceItems(req, res) {
    try {
        // Fetch all available items
        const items = await Item.findAll();
        res.json(items);
    } catch (error) {
        console.error("Error fetching marketplace items:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// controllers/marketplaceController.js
async function purchaseItem(req, res) {
    try {
        console.log('purchaseItem - body:', req.body); // Debug
        const { telegramId, itemId, quantity } = req.body;
        const qty = quantity || 1;

        // 1) Find user by telegramId
        const user = await User.findOne({ where: { telegramId } });
        console.log('purchaseItem - found user:', user); // Debug

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 2) Find item
        const item = await Item.findByPk(itemId);
        console.log('purchaseItem - found item:', item); // Debug

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // 3) Check price in metadata
        const price = item.metadata?.price;
        if (price === undefined) {
            return res.status(400).json({ error: 'Item price not set' });
        }

        // 4) Check user has enough coins
        const totalCost = price * qty;
        if (user.coins < totalCost) {
            return res.status(400).json({ error: 'Insufficient coins' });
        }

        // Deduct coins
        user.coins -= totalCost;
        await user.save();

        // 5) Find or create an InventoryItem
        let inventoryItem = await InventoryItem.findOne({
            where: { UserTelegramId: user.telegramId, ItemId: item.id },
        });
        console.log('purchaseItem - existing inventoryItem:', inventoryItem); // Debug

        if (inventoryItem) {
            inventoryItem.quantity += qty;
            await inventoryItem.save();
        } else {
            inventoryItem = await InventoryItem.create({
                UserTelegramId: user.telegramId,
                quantity: qty,
                ItemId: item.id,
            });
        }

        console.log('purchaseItem - final inventoryItem:', inventoryItem); // Debug

        return res.json({
            message: 'Purchase successful',
            inventoryItem,
            remainingCoins: user.coins,
        });
    } catch (error) {
        console.error('Error processing purchase:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    listMarketplaceItems,
    purchaseItem,
};