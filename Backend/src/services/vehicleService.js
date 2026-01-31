import * as vehicleRepository from '../repositories/vehicleRepository.js';

export async function listVehicles() {
  return vehicleRepository.findAll();
}

export async function getVehicleById(id) {
  return vehicleRepository.findById(id);
}

export async function createVehicle(payload, user) {
  // Sellers can only create their own listings; admin can override seller_id
  const ownerId = user.role === 'admin' && payload.sellerId ? payload.sellerId : user.sub;
  return vehicleRepository.create({ ...payload, sellerId: ownerId });
}

export async function updateVehicle(id, payload, user) {
  const existing = await vehicleRepository.findById(id);
  if (!existing) return null;
  if (user.role !== 'admin' && existing.seller_id !== user.sub) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  return vehicleRepository.update(id, payload);
}

export async function deleteVehicle(id) {
  return vehicleRepository.remove(id);
}
