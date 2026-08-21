import { Router } from 'express';
import { getAllUsers, getUserById, createUser, seedUsersAndFleet, assignVesselToUser, removeVesselFromUser } from '../controllers/userController.js';

const router = Router();

// GET /api/users -> Tüm kullanıcıları atanmış gemileri ile getirme
router.get('/', getAllUsers);

// POST /api/users/seed -> Örnek A ve B Kullanıcıları filolarını otomatik yükleme
router.post('/seed', seedUsersAndFleet);

// GET /api/users/:id -> ID bazlı kullanıcı getirme
router.get('/:id', getUserById);

// POST /api/users/:id/vessels -> Kullanıcı filosuna yeni gemi ekleme
router.post('/:id/vessels', assignVesselToUser);

// DELETE /api/users/:id/vessels/:vesselId -> Kullanıcı filosundan gemi çıkarma
router.delete('/:id/vessels/:vesselId', removeVesselFromUser);

// POST /api/users -> Yeni kullanıcı ve gemi yetkisi ekleme
router.post('/', createUser);

export default router;
