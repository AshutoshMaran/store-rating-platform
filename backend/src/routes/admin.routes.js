import { Router } from 'express';
import {
  addAdmin,
  addStore,
  addStoreOwner,
  addUser,
  assignOwner,
  getAllRatings,
  getAllStores,
  getAllUser,
  getStoreDetails,
  getUserDetails,
  getDashboardStats
} from '../controllers/admin.controller.js';
import { authorizeAdmin } from '../middlewares/authorizeAdmin.middleware.js';

const adminRouter = Router();

// Protect all admin endpoints with authorizeAdmin middleware
adminRouter.use(authorizeAdmin);

adminRouter.get('/dashboard/stats', getDashboardStats);
adminRouter.post('/add/admin', addAdmin);
adminRouter.post('/add/user', addUser);
adminRouter.post('/add/storeOwner', addStoreOwner);
adminRouter.post('/add/store', addStore);
adminRouter.get('/get/allUser', getAllUser);
adminRouter.get('/get/allStore', getAllStores);
adminRouter.get('/get/allRating', getAllRatings);
adminRouter.get('/get/user/:userId', getUserDetails);
adminRouter.get('/get/store/:storeId', getStoreDetails);
adminRouter.post('/assign/storeOwner/:storeId', assignOwner);

export default adminRouter;