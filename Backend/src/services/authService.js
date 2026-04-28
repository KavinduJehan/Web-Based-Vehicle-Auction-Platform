import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../config/index.js';
import * as userRepository from '../repositories/userRepository.js';

const PUBLIC_ROLES = new Set(['buyer']);

export async function register({ email, password, role, name }) {
  if (!PUBLIC_ROLES.has(role)) {
    const err = new Error('Invalid role');
    err.status = 400;
    throw err;
  }
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }
  const hashed = await bcrypt.hash(password, config.bcryptRounds);
  const user = await userRepository.create({ email, passwordHash: hashed, role, name });
  return { id: user.id, email: user.email, role: user.role, name: user.name, isVerified: user.verification_status === 'verified' };
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
  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email, isVerified: user.verification_status === 'verified' },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
  return { token, user: { id: user.id, email: user.email, role: user.role, name: user.name, isVerified: user.verification_status === 'verified' } };
}
