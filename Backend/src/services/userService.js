import * as userRepository from '../repositories/userRepository.js';

export async function verifyUser(id) {
  const user = await userRepository.findById(id);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  if (user.is_verified) {
    const err = new Error('User is already verified');
    err.status = 409;
    throw err;
  }
  return userRepository.verify(id);
}
