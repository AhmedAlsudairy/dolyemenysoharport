import express from 'express';
import { users } from '../controllers/userController.js';

const router = express.Router();

router.get('/',users)

export default router;
