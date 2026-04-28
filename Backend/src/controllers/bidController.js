import * as bidService from '../services/bidService.js';

export async function listBidsForAuctionController(req, res, next) {
  try {
    const bids = await bidService.listBidsForAuction(req.params.auctionId, req.user);
    res.json(bids);
  } catch (err) {
    next(err);
  }
}

export async function placeBidController(req, res, next) {
  try {
    const bid = await bidService.placeBid(req.params.auctionId, req.body.amount, req.user);
    res.status(201).json(bid);
  } catch (err) {
    next(err);
  }
}
