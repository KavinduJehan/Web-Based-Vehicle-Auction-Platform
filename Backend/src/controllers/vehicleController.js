import * as vehicleService from '../services/vehicleService.js';

export async function listVehiclesController(req, res, next) {
  try {
    const items = await vehicleService.listVehicles();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getVehicleController(req, res, next) {
  try {
    const item = await vehicleService.getVehicleById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function createVehicleController(req, res, next) {
  try {
    const payload = await vehicleService.createVehicle(req.body, req.user);
    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
}

export async function updateVehicleController(req, res, next) {
  try {
    const payload = await vehicleService.updateVehicle(req.params.id, req.body, req.user);
    if (!payload) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

export async function deleteVehicleController(req, res, next) {
  try {
    const removed = await vehicleService.deleteVehicle(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Vehicle not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
