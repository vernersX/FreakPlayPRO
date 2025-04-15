const { models } = require('../db/init');
const { User } = models;

async function createUser(req, res) {
    try {
        const { telegramId, username } = req.body;
        const newUser = await User.create({ telegramId, username });
        res.json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getAllUsers(req, res) {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getUserByTelegramId(req, res) {
    try {
        const { telegramId } = req.params;
        const user = await User.findOne({ where: { telegramId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { createUser, getAllUsers, getUserByTelegramId };
