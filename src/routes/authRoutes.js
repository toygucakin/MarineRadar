import { Router } from 'express';
import { loginUser, getProfile, getUsersFleet } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

// POST /api/auth/login -> Kullanıcı Girişi (JWT Token üretimi)
router.post('/login', loginUser);

// GET /api/auth/me -> Giriş yapan kullanıcının profil bilgileri (Korumalı)
router.get('/me', verifyToken, getProfile);

// GET /api/auth/my-vessels -> Giriş yapan kullanıcının yetkili gemi filosu (Korumalı)
router.get('/my-vessels', verifyToken, getUsersFleet);

export default router;
