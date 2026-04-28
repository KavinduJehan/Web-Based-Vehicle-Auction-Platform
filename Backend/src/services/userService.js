import * as userRepository from '../repositories/userRepository.js';

export async function getMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return { id: user.id, email: user.email, role: user.role, name: user.name, verificationStatus: user.verification_status };
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
