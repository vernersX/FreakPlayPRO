// services/auctionService.js
const { models } = require('../db/init');
const { Auction, Bid, CardOwnershipHistory, Card } = models;

async function createAuction(cardId, userId, startingPrice, endsAt) {
  const card = await Card.findByPk(cardId);
  if (!card || card.userId !== userId) {
    throw new Error('You do not own this card');
  }
  // Create Auction
  const auction = await Auction.create({
    cardId,
    startingPrice,
    currentPrice: startingPrice,
    endsAt,
    status: 'open',
  });
  return auction;
}

async function placeBid(auctionId, userId, bidAmount) {
  const auction = await Auction.findByPk(auctionId);
  if (!auction) throw new Error('Auction not found');
  if (auction.status !== 'open') throw new Error('Auction is closed');
  if (bidAmount <= auction.currentPrice) throw new Error('Bid too low');

  // Create a new bid
  await Bid.create({ auctionId, userId, amount: bidAmount });
  auction.currentPrice = bidAmount;
  await auction.save();
  return auction;
}

async function closeAuction(auctionId, userId) {
  // Possibly restrict to the card owner or admin
  const auction = await Auction.findByPk(auctionId, {
    include: [Card],
  });
  if (!auction) throw new Error('Auction not found');
  if (auction.status !== 'open') throw new Error('Auction already closed');
  // Mark as closed
  auction.status = 'closed';
  await auction.save();

  // Get the highest bid
  const highestBid = await Bid.findOne({
    where: { auctionId },
    order: [['amount', 'DESC']],
  });
  if (!highestBid) {
    // No bids placed, ownership remains the same
    return { message: 'No bids. Auction closed with no sale.' };
  }

  // Transfer card ownership to highestBid.userId
  const card = auction.Card;
  const oldOwner = card.userId;
  card.userId = highestBid.userId;
  await card.save();

  await CardOwnershipHistory.create({
    cardId: card.id,
    fromUserId: oldOwner,
    toUserId: highestBid.userId,
  });

  return { message: 'Auction closed, card transferred.' };
}

module.exports = {
  createAuction,
  placeBid,
  closeAuction,
};
