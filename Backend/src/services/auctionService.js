import * as auctionRepository from '../repositories/auctionRepository.js';

function notImplemented() {
  const err = new Error('Not implemented');
  err.status = 501;
  return err;
}

export async function listAuctions() {
  throw notImplemented();
}

export async function getAuctionById(id) {
  return auctionRepository.findById(id);
}

export async function createAuction(payload, user) {
  // TODO: enforce auction lifecycle, timing, and ownership rules per REST/API design
  throw notImplemented();
}

export async function updateAuction(id, payload, user) {
  // TODO: enforce status transitions and ownership rules
  throw notImplemented();
}

export async function deleteAuction(id, user) {
  // TODO: enforce deletion constraints
  throw notImplemented();
}
