import * as bidRepository from '../repositories/bidRepository.js';
import * as vehicleRepository from '../repositories/vehicleRepository.js';

export async function listBidsForVehicle(vehicleId, user) {
  // Buyers can see their own bids; admin/seller can see bids on their listings
  const vehicle = await vehicleRepository.findById(vehicleId);
  if (!vehicle) {
    const err = new Error('Vehicle not found');
    err.status = 404;
    throw err;
  }
  if (user.role === 'admin' || vehicle.seller_id === user.sub) {
    return bidRepository.findByVehicle(vehicleId);
  }
  return bidRepository.findByVehicleAndUser(vehicleId, user.sub);
}

export async function placeBid(vehicleId, amount, user) {
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
