import express from 'express';
import {
  createUserData,
  getAllUserData,
  getUserDataById,
  updateUserData,
  deleteUserData,
  findUserDataByClerkUserId
} from '../controllers/userDataController.js';

const router = express.Router();

router.post('/', createUserData);
router.get('/', getAllUserData);
router.get('/:id', getUserDataById);
router.put('/:id', updateUserData);
router.delete('/:id', deleteUserData);
router.get('/find/:clerkUserId', findUserDataByClerkUserId);

export default router; 