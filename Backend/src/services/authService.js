import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import config from '../config/index.js';
import * as userRepository from '../repositories/userRepository.js';
import { sendPasswordResetEmail } from './emailService.js';

const PUBLIC_ROLES = new Set(['buyer']);

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function buildResetUrl(token) {
  const url = new URL('/reset-password', config.appBaseUrl);
  url.searchParams.set('token', token);
  return url.toString();
}

export async function register({ email, password, role, name }) {
  const normalizedEmail = normalizeEmail(email);
  if (!PUBLIC_ROLES.has(role)) {
    const err = new Error('Invalid role');
    err.status = 400;
    throw err;
  }
  const existing = await userRepository.findByEmail(normalizedEmail);
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }
  const hashed = await bcrypt.hash(password, config.bcryptRounds);
  const user = await userRepository.create({ email: normalizedEmail, passwordHash: hashed, role, name });
  return { id: user.id, email: user.email, role: user.role, name: user.name, isVerified: user.verification_status === 'verified' };
}

export async function login({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const user = await userRepository.findByEmail(normalizedEmail);
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
    { sub: user.id, role: user.role, email: user.email, isVerified: user.verification_status === 'verified', mustChangePassword: user.must_change_password },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
  return { token, user: { id: user.id, email: user.email, role: user.role, name: user.name, isVerified: user.verification_status === 'verified', mustChangePassword: user.must_change_password } };
}

export async function requestPasswordReset({ email }) {
  const normalizedEmail = normalizeEmail(email);
  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user) {
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + config.passwordResetExpiresMinutes * 60 * 1000);

  await userRepository.createPasswordResetToken({
    userId: user.id,
    tokenHash,
    expiresAt
  });

  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetUrl: buildResetUrl(token)
  });
}

export async function resetPassword({ token, newPassword }) {
  const tokenHash = hashToken(token);
  const passwordHash = await bcrypt.hash(newPassword, config.bcryptRounds);
  const user = await userRepository.resetPasswordWithToken({ tokenHash, passwordHash });

  if (!user) {
    const err = new Error('Invalid or expired password reset token');
    err.status = 400;
    throw err;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    isVerified: user.verification_status === 'verified',
    mustChangePassword: user.must_change_password
  };
}
