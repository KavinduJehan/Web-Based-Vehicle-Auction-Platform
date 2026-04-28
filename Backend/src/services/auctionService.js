import * as auctionRepository from '../repositories/auctionRepository.js';
import * as vehicleRepository from '../repositories/vehicleRepository.js';

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

  // Basic time sanity checks if provided
  if (payload.startsAt && payload.endsAt && new Date(payload.startsAt) >= new Date(payload.endsAt)) {
    throw badRequest('startsAt must be before endsAt');
  }

  const auctionPayload = {
    vehicleId: payload.vehicleId,
    title: payload.title || vehicle.title,
    description: payload.description || vehicle.description,
    status: payload.status || 'draft',
    startsAt: payload.startsAt || null,
    endsAt: payload.endsAt || null
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
    title: payload.title ?? existing.title,
    description: payload.description ?? existing.description,
    status: payload.status ?? existing.status,
    startsAt: payload.startsAt ?? existing.starts_at,
    endsAt: payload.endsAt ?? existing.ends_at
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
