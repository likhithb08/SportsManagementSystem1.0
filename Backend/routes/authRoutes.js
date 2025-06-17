// Backend/routes/authRoutes.js

import express from 'express';
import { login ,register } from '../controller/authController.js'; // ✅ .js is required

const router = express.Router();

router.post('/sign-up', register);
router.post('/login', login);

export default router;
