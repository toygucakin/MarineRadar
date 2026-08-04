import { Router } from 'express';
import { generateNewsletter, getAllNewsletters, getNewsletterById } from '../controllers/newsletterController.js';

const router = Router();

/**
 * Bülten Rotası (Newsletter Routes)
 */

// GET /api/newsletters -> Tüm bülten arşivini getirme
router.get('/', getAllNewsletters);

// POST /api/newsletters/generate -> Yeni özel bülten üretme
router.post('/generate', generateNewsletter);

// GET /api/newsletters/:id -> ID bazlı bülten detayı getirme
router.get('/:id', getNewsletterById);

export default router;
