const { models } = require('../db/init');
const { User } = models;

async function getProfile(userId) {
    return User.findByPk(userId, {
        attributes: [
            'id', 'username', 'avatarUrl', 'cardsOwned', 'betsPlaced', 'gamesPlayed', 'ranking'
        ]
    });
}
async function updateAvatar(userId, fileUrl) {
    await User.update({ avatarUrl: fileUrl }, { where: { id: userId } });
    return getProfile(userId);
}

module.exports = {
    getProfile,
    updateAvatar,
};