import { Router } from 'express';
import { getStoreOwnerDashboard } from '../controllers/owner.controller.js';
import { authorizeStoreOwner } from '../middlewares/authorizeStoreOwner.middleware.js';

const ownerRouter = Router();

// Protect all store owner routes with authorizeStoreOwner
ownerRouter.use(authorizeStoreOwner);

ownerRouter.get('/dashboard', getStoreOwnerDashboard);

export default ownerRouter;
