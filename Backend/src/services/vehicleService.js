import * as vehicleRepository from '../repositories/vehicleRepository.js';

export async function listVehicles(filters = {}) {
  const { rows, total, page, limit } = await vehicleRepository.findAll(filters);
  return {
    data:       rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getVehicleById(id) {
  return vehicleRepository.findById(id);
}

function handleDbError(err) {
  if (err.code === '23505' && err.constraint === 'vehicles_chassis_number_unique') {
    const e = new Error('A vehicle with this chassis number already exists')
    e.status = 409
    throw e
  }
  throw err
}

export async function createVehicle(payload, user) {
  // Only admins (the business owners) list vehicles; seller_id is always the calling admin
  return vehicleRepository.create({ ...payload, sellerId: user.sub }).catch(handleDbError);
}

export async function updateVehicle(id, payload, user) {
  const existing = await vehicleRepository.findById(id);
  if (!existing) return null;
  const merged = {
    title:         payload.title         ?? existing.title,
    description:   payload.description   ?? existing.description,
    startingPrice: payload.startingPrice ?? existing.starting_price,
    make:          payload.make          ?? existing.make,
    model:         payload.model         ?? existing.model,
    year:          payload.year          ?? existing.year,
    status:        payload.status        ?? existing.status,
    chassisNumber: payload.chassisNumber ?? existing.chassis_number,
    mileage:       payload.mileage       ?? existing.mileage,
    grade:         payload.grade         ?? existing.grade,
    images:        payload.images        ?? existing.images,
  };
  return vehicleRepository.update(id, merged).catch(handleDbError);
}

export async function deleteVehicle(id) {
  return vehicleRepository.remove(id);
}
