import { Router } from 'express';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../../common/middleware/role.middleware';
import { UserRole } from '../../../common/enums/UserRole.enum';

const router = Router();

router.get('/user', authMiddleware, roleMiddleware([UserRole.USER]), (req, res) => {
  res.json({ message: 'User route accessed' });
});

router.get('/admin', authMiddleware, roleMiddleware([UserRole.ADMIN]), (req, res) => {
  res.json({ message: 'Admin route accessed' });
});

export default router;
