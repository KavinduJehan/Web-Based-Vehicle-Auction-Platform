import * as bidRepository from '../repositories/bidRepository.js';
import * as vehicleRepository from '../repositories/vehicleRepository.js';

export async function listBidsForVehicle(vehicleId, user) {
  const vehicle = await vehicleRepository.findById(vehicleId);
  if (!vehicle) {
    const err = new Error('Vehicle not found');
    err.status = 404;
    throw err;
  }
  // Admins see all bids; buyers see only their own
  if (user.role === 'admin') {
    return bidRepository.findByVehicle(vehicleId);
  }
  return bidRepository.findByVehicleAndUser(vehicleId, user.sub);
}

export async function placeBid(vehicleId, amount, user) {
  if (!user.isVerified) {
    const err = new Error('Your account must be verified by an admin before you can place bids');
    err.status = 403;
    throw err;
  }

  const vehicle = await vehicleRepository.findById(vehicleId);
  if (!vehicle) {
    const err = new Error('Vehicle not found');
    err.status = 404;
    throw err;
  }
  // Simple bidding rule: bid must exceed current highest
  const highest = await bidRepository.findHighestBid(vehicleId);
  if (highest && amount <= highest.amount) {
    const err = new Error('Bid must be higher than current highest');
    err.status = 400;
    throw err;
  }
  // TODO: enforce auction status and timing rules per REST/API design
  return bidRepository.create({ vehicleId, userId: user.sub, amount });
}
