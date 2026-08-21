import { Router } from 'express';
import { getAllVessels, getVesselById, createVessel } from '../controllers/vesselController.js';

const router = Router();

// GET /api/vessels -> Tüm gemileri getirme
router.get('/', getAllVessels);

// GET /api/vessels/:id -> ID bazlı gemi getirme
router.get('/:id', getVesselById);

// POST /api/vessels -> Yeni gemi ekleme
router.post('/', createVessel);

export default router;
