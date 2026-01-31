import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../config/index.js';
import * as userRepository from '../repositories/userRepository.js';

export async function register({ email, password, role, name }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }
  const hashed = await bcrypt.hash(password, config.bcryptRounds);
  const user = await userRepository.create({ email, passwordHash: hashed, role, name, isVerified: false });
  return { id: user.id, email: user.email, role: user.role, name: user.name, isVerified: user.isVerified };
}

export async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  if (!user.is_verified) {
    const err = new Error('User not verified');
    err.status = 403;
    throw err;
  }
  const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  return { token, user: { id: user.id, email: user.email, role: user.role, name: user.name, isVerified: user.is_verified } };
}
