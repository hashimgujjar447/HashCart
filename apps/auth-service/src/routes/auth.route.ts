import { Router } from 'express';
import { userRegistration } from '../controller/auth.controller';

const router = Router();

router.post('/register', userRegistration);

export default router;
