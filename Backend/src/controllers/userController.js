import * as userService from '../services/userService.js';

export async function listUsersController(req, res, next) {
  try {
    const users = await userService.listUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function getMeController(req, res, next) {
  try {
    const user = await userService.getMe(req.user.sub);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function setUserStatusController(req, res, next) {
  try {
    const user = await userService.setUserStatus(req.params.id, req.body.status);
    res.json({ id: user.id, email: user.email, role: user.role, name: user.name, verificationStatus: user.verification_status });
  } catch (err) {
    next(err);
  }
}
