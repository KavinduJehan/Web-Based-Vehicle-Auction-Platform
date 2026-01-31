import * as authService from '../services/authService.js';

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
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
