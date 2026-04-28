import * as vehicleRepository from '../repositories/vehicleRepository.js';

export async function listVehicles() {
  return vehicleRepository.findAll();
}

export async function getVehicleById(id) {
  return vehicleRepository.findById(id);
}

export async function createVehicle(payload, user) {
  // Only admins (the business owners) list vehicles; seller_id is always the calling admin
  return vehicleRepository.create({ ...payload, sellerId: user.sub });
}

export async function updateVehicle(id, payload, user) {
  const existing = await vehicleRepository.findById(id);
  if (!existing) return null;
  return vehicleRepository.update(id, payload);
}

export async function deleteVehicle(id) {
  return vehicleRepository.remove(id);
}
