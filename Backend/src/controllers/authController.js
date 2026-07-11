import * as authService from '../services/authService.js';
import config from '../config/index.js';

const COOKIE_NAME = 'token';

function cookieOptions() {
  const prod = config.env === 'production';
  return {
    httpOnly: true,
    secure: prod,
    sameSite: prod ? 'none' : 'lax',
  };
}

export async function registerController(req, res, next) {
  try {
    const { email, password, role, name } = req.body;
    const result = await authService.register({ email, password, role, name });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function loginController(req, res, next) {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login({ email, password });
    res.cookie(COOKIE_NAME, token, cookieOptions());
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function forgotPasswordController(req, res, next) {
  try {
    const { email } = req.body;
    await authService.requestPasswordReset({ email });
    res.json({ message: 'If an account exists for that email, a password reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordController(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword({ token, newPassword });
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
}

export function logoutController(req, res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
  res.json({ message: 'Logged out' });
}

export function meController(req, res) {
  const { sub: id, role, email, isVerified, mustChangePassword } = req.user;
  res.json({ user: { id, role, email, isVerified, mustChangePassword } });
}
