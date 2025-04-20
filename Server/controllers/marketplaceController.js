const { models } = require('../db/init');
const itemEffects = require('../services/itemEffects');
const { User, Item, InventoryItem } = models;

async function listMarketplaceItems(req, res) {
    try {
        const items = await Item.findAll();
        return res.json(items);
    } catch (error) {
        console.error("Error fetching marketplace items:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function purchaseItem(req, res) {
    try {
        const { telegramId, itemId, quantity } = req.body;
        const qty = quantity || 1;

        const user = await User.findOne({ where: { telegramId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const item = await Item.findByPk(itemId);
        if (!item) return res.status(404).json({ error: 'Item not found' });

        const price = item.metadata?.price;
        if (price === undefined) {
            return res.status(400).json({ error: 'Item price not set' });
        }

        const totalCost = price * qty;
        if (user.coins < totalCost) {
            return res.status(400).json({ error: 'Insufficient coins' });
        }

        user.coins -= totalCost;
        await user.save();

        let inventoryItem = await InventoryItem.findOne({
            where: { UserTelegramId: telegramId, ItemId: item.id },
        });

        if (inventoryItem) {
            inventoryItem.quantity += qty;
            await inventoryItem.save();
        } else {
            inventoryItem = await InventoryItem.create({
                UserTelegramId: telegramId,
                quantity: qty,
                ItemId: item.id,
            });
        }

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

async function useItem(req, res) {
    try {
        const { telegramId, itemId, metadataOverride } = req.body;
        const user = await User.findOne({ where: { telegramId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const inventoryItem = await InventoryItem.findOne({
            where: { UserTelegramId: telegramId, ItemId: itemId }
        });
        if (!inventoryItem || inventoryItem.quantity < 1) {
            return res.status(400).json({ error: 'Item not in inventory' });
        }

        const item = await Item.findByPk(itemId);
        const effect = itemEffects[item.type];
        if (!effect) {
            return res.status(400).json({ error: 'No effect defined for this item' });
        }

        // Run the effect
        await effect(user, null, inventoryItem, {
            ...item.metadata,
            ...metadataOverride
        });

        // Consume one
        inventoryItem.quantity -= 1;
        await inventoryItem.save();

        return res.json({ success: true, remaining: inventoryItem.quantity });
    } catch (error) {
        console.error('Error using item:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    listMarketplaceItems,
    purchaseItem,
    useItem,
};
