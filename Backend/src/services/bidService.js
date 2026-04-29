import * as bidRepository from '../repositories/bidRepository.js';
import * as auctionRepository from '../repositories/auctionRepository.js';
import { effectiveStatus } from './auctionService.js';

export async function listBidsForAuction(auctionId, user) {
  const auction = await auctionRepository.findById(auctionId);
  if (!auction) {
    const err = new Error('Auction not found');
    err.status = 404;
    throw err;
  }
  // Guests and buyers see all bids (amount + timestamp, no personal data).
  // Admins also see all bids.
  // Buyers only used to see their own bids — now everyone sees all to show live highest bid.
  return bidRepository.findByAuction(auctionId);
}

export async function placeBid(auctionId, amount, user) {
  if (!user.isVerified) {
    const err = new Error('Your account must be verified by an admin before you can place bids');
    err.status = 403;
    throw err;
  }

  const auction = await auctionRepository.findById(auctionId);
  if (!auction) {
    const err = new Error('Auction not found');
    err.status = 404;
    throw err;
  }

  const status = effectiveStatus(auction);

  if (status === 'draft') {
    const err = new Error('Auction has not started yet');
    err.status = 400;
    throw err;
  }
  if (status === 'ended') {
    const err = new Error('Auction has ended');
    err.status = 400;
    throw err;
  }
  if (status !== 'active') {
    const err = new Error('Auction is not active');
    err.status = 400;
    throw err;
  }

  const highest = await bidRepository.findHighestBid(auctionId);
  if (highest) {
    const increment = Number(auction.min_increment ?? 0);
    if (increment > 0) {
      if (amount < Number(highest.amount) + increment) {
        const err = new Error(
          `Bid must be at least ${increment} more than the current highest bid of ${highest.amount}`
        );
        err.status = 400;
        throw err;
      }
    } else {
      if (amount <= Number(highest.amount)) {
        const err = new Error('Bid must be higher than current highest');
        err.status = 400;
        throw err;
      }
    }
  }

  return bidRepository.create({ auctionId, userId: user.sub, amount });
}
