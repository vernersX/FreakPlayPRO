require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3001,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASS: process.env.DB_PASS,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_DIALECT: process.env.DB_DIALECT || 'mysql',
    ODDS_API_KEY: process.env.ODDS_API_KEY,
    BOT_TOKEN: process.env.BOT_TOKEN,
};
