import * as auctionService from '../services/auctionService.js';

export async function closeAuctionController(req, res, next) {
  try {
    const result = await auctionService.closeAuction(Number(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getWinnerController(req, res, next) {
  try {
    const result = await auctionService.getWinner(Number(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function selectWinnerController(req, res, next) {
  try {
    const result = await auctionService.selectWinner(
      Number(req.params.id),
      Number(req.body.bidId),
      req.user
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function listAuctionsController(req, res, next) {
  try {
    const items = await auctionService.listAuctions(req.user);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getAuctionController(req, res, next) {
  try {
    const item = await auctionService.getAuctionById(req.params.id, req.user);
    if (!item) return res.status(404).json({ message: 'Auction not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function createAuctionController(req, res, next) {
  try {
    const payload = await auctionService.createAuction(req.body, req.user);
    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
}

export async function updateAuctionController(req, res, next) {
  try {
    const payload = await auctionService.updateAuction(req.params.id, req.body, req.user);
    if (!payload) return res.status(404).json({ message: 'Auction not found' });
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

export async function deleteAuctionController(req, res, next) {
  try {
    const removed = await auctionService.deleteAuction(req.params.id, req.user);
    if (!removed) return res.status(404).json({ message: 'Auction not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getMyWonAuctionsController(req, res, next) {
  try {
    const items = await auctionService.getWonAuctions(req.user.sub);
    res.json(items);
  } catch (err) {
    next(err);
  }
}
