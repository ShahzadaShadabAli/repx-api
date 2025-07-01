import express from 'express';
import upload from '../middleware/multer.js';
import { createBodyImage } from '../controllers/bodyimageController.js';

const router = express.Router();

router.post('/upload', upload.single('image'), createBodyImage);

export default router;
