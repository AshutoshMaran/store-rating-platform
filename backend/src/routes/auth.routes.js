import { Router } from 'express';
import {
  registerController,
  loginController,
  getMeController,
  refreshTokenController,
  logoutController,
  updatePasswordController
} from '../controllers/auth.controller.js';

const authRouter = Router();

authRouter.post('/login', loginController);
authRouter.post('/register', registerController);
authRouter.get('/me', getMeController);
authRouter.post('/refresh', refreshTokenController);
authRouter.post('/logout', logoutController);
authRouter.post('/update-password', updatePasswordController);

export default authRouter;