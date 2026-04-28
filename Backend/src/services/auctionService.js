import * as auctionRepository from '../repositories/auctionRepository.js';
import * as vehicleRepository from '../repositories/vehicleRepository.js';
import * as bidRepository from '../repositories/bidRepository.js';

function forbidden(message = 'Forbidden') {
  const err = new Error(message);
  err.status = 403;
  return err;
}

function notFound(message = 'Auction not found') {
  const err = new Error(message);
  err.status = 404;
  return err;
}

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

export async function listAuctions() {
  return auctionRepository.findAll();
}

export async function getAuctionById(id) {
  return auctionRepository.findById(id);
}

export async function createAuction(payload, user) {
  if (!payload.vehicleId) throw badRequest('vehicleId is required');

  const vehicle = await vehicleRepository.findById(payload.vehicleId);
  if (!vehicle) throw badRequest('Vehicle not found');

  if (payload.startsAt && payload.endsAt && new Date(payload.startsAt) >= new Date(payload.endsAt)) {
    throw badRequest('startsAt must be before endsAt');
  }

  if (payload.minIncrement != null && payload.minIncrement < 0) {
    throw badRequest('minIncrement must be >= 0');
  }

  const auctionPayload = {
    vehicleId:    payload.vehicleId,
    title:        payload.title || vehicle.title,
    description:  payload.description || vehicle.description,
    status:       payload.status || 'draft',
    startsAt:     payload.startsAt || null,
    endsAt:       payload.endsAt || null,
    minIncrement: payload.minIncrement ?? 0
  };

  return auctionRepository.create(auctionPayload);
}

export async function updateAuction(id, payload, user) {
  const existing = await auctionRepository.findById(id);
  if (!existing) throw notFound();

  const vehicle = await vehicleRepository.findById(existing.vehicle_id);
  if (!vehicle) throw badRequest('Linked vehicle missing');

  if (payload.startsAt && payload.endsAt && new Date(payload.startsAt) >= new Date(payload.endsAt)) {
    throw badRequest('startsAt must be before endsAt');
  }

  const auctionPayload = {
    title:        payload.title        ?? existing.title,
    description:  payload.description  ?? existing.description,
    status:       payload.status       ?? existing.status,
    startsAt:     payload.startsAt     ?? existing.starts_at,
    endsAt:       payload.endsAt       ?? existing.ends_at,
    minIncrement: payload.minIncrement ?? existing.min_increment
  };

  return auctionRepository.update(id, auctionPayload);
}

export async function deleteAuction(id, user) {
  const existing = await auctionRepository.findById(id);
  if (!existing) throw notFound();

  const vehicle = await vehicleRepository.findById(existing.vehicle_id);
  if (!vehicle) throw badRequest('Linked vehicle missing');

  return auctionRepository.remove(id);
}

export async function selectWinner(auctionId, bidId, user) {
  const auction = await auctionRepository.findById(auctionId);
  if (!auction) throw notFound();

  if (auction.status === 'draft') {
    throw badRequest('Cannot select a winner for a draft auction');
  }

  if (auction.winning_bid_id) {
    const err = new Error('Winner already selected');
    err.status = 409;
    throw err;
  }

  const bid = await bidRepository.findById(bidId);
  if (!bid) {
    const err = new Error('Bid not found');
    err.status = 404;
    throw err;
  }

  if (bid.auction_id !== auction.id) {
    throw badRequest('Bid does not belong to this auction');
  }

  return auctionRepository.setWinner(auctionId, bidId);
}

export async function closeAuction(auctionId) {
  const auction = await auctionRepository.findById(auctionId);
  if (!auction) throw notFound();

  if (auction.status === 'ended') {
    const err = new Error('Auction is already ended');
    err.status = 409;
    throw err;
  }

  const highest = await bidRepository.findHighestBid(auctionId);
  // Mark ended and set winner if any bids exist; no bids → ended with no winner
  const winningBidId = highest ? highest.id : null;
  return auctionRepository.setWinner(auctionId, winningBidId);
}

export async function getWinner(auctionId) {
  const auction = await auctionRepository.findById(auctionId);
  if (!auction) throw notFound();

  if (!auction.winning_bid_id) {
    const err = new Error('No winner has been selected for this auction');
    err.status = 404;
    throw err;
  }

  const result = await auctionRepository.findWinner(auctionId);
  return {
    auctionId:   result.id,
    auctionTitle: result.title,
    status:      result.status,
    winner: {
      userId: result.winner_id,
      name:   result.winner_name,
      email:  result.winner_email,
    },
    winningBid: {
      bidId:     result.bid_id,
      amount:    result.bid_amount,
      placedAt:  result.bid_placed_at,
    },
  };
}
