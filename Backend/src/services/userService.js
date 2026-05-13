import bcrypt from 'bcryptjs';
import config from '../config/index.js';
import * as userRepository from '../repositories/userRepository.js';

export async function listUsers() {
  const rows = await userRepository.findAll();
  return rows.map(u => ({
    id: u.id,
    email: u.email,
    role: u.role,
    name: u.name,
    verificationStatus: u.verification_status,
    createdAt: u.created_at,
  }));
}

export async function getMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return { id: user.id, email: user.email, role: user.role, name: user.name, verificationStatus: user.verification_status, mustChangePassword: user.must_change_password };
}

export async function setUserStatus(id, status) {
  const user = await userRepository.findById(id);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  if (user.verification_status === status) {
    const err = new Error(`User is already ${status}`);
    err.status = 409;
    throw err;
  }
  return userRepository.setStatus(id, status);
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await userRepository.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  const ok = await bcrypt.compare(currentPassword, user.password_hash);
  if (!ok) {
    const err = new Error('Current password is incorrect');
    err.status = 400;
    throw err;
  }
  const hash = await bcrypt.hash(newPassword, config.bcryptRounds);
  return userRepository.changePassword(userId, hash);
}
