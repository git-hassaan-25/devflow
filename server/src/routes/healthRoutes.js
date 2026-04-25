import { Router } from 'express';
import { ping } from '../controllers/healthController.js';

const router = Router();

router.get('/', ping);

export default router;
