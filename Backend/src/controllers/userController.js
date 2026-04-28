import * as userService from '../services/userService.js';

export async function verifyUserController(req, res, next) {
  try {
    const user = await userService.verifyUser(req.params.id);
    res.json({ id: user.id, email: user.email, role: user.role, name: user.name, isVerified: user.is_verified });
  } catch (err) {
    next(err);
  }
}
