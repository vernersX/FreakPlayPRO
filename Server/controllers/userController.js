const { models } = require('../db/init');
const { Op } = require('sequelize');

const { User, Card, Bet, Match } = models;

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

        // Turn into a plain object so we can add our counts
        const userData = user.toJSON();

        // 1) Total cards owned
        const cardsCount = await Card.count({
            where: { userId: user.id }
        });

        // 2) Total distinct matches they've bet on
        const matchesCount = await Bet.count({
            where: { userId: user.id },
            distinct: true,
            col: 'matchId'
        });

        // 3) Live matches (started but no outcome yet)
        const liveMatchesCount = await Match.count({
            where: {
                commenceTime: { [Op.lte]: new Date() },
                outcome: null
            }
        });

        // 4) Hard-coded ranking
        const ranking = 1;

        res.json({
            ...userData,
            cardsCount,
            matchesCount,
            liveMatchesCount,
            ranking
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getProfile(req, res) {
    const profile = await userService.getProfile(req.params.id);
    res.json(profile);
}

async function patchAvatar(req, res) {
    const fileUrl = await uploadService.handleUpload(req.file);
    const updated = await userService.updateAvatar(req.params.id, fileUrl);
    res.json(updated);
}

module.exports = {
    createUser,
    getAllUsers,
    getUserByTelegramId,
    getProfile,
    patchAvatar,
};
