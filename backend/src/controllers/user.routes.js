import { Router } from 'express';
import {
  getAllStores,
  getStoreDetails,
  rateStore,
  resetPassword
} from '../controllers/user.controller.js';
import { authorizeUser } from '../middlewares/authorizeUser.middleware.js';

const userRouter = Router();

userRouter.get('/get/allStore', getAllStores);
userRouter.get('/get/store/:storeId', getStoreDetails);
userRouter.post('/reset/password', authorizeUser, resetPassword);
userRouter.post('/rate/store/:storeId', authorizeUser, rateStore);

export default userRouter;