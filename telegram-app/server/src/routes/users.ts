import { Router } from 'express';
import { db } from '../database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const users = db.getAllUsers().filter(u => u.id !== req.userId);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const user = db.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      online: user.online,
      lastSeen: user.lastSeen,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
