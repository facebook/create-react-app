import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const chats = db.getChatsByUserId(req.userId!);
    const chatsWithDetails = chats.map(chat => {
      const otherUserId = chat.participants.find(p => p !== req.userId);
      const otherUser = otherUserId ? db.getUserById(otherUserId) : null;

      return {
        ...chat,
        name: chat.type === 'group' ? chat.name : otherUser?.username,
        avatar: chat.type === 'private' ? otherUser?.avatar : undefined,
        online: chat.type === 'private' ? otherUser?.online : undefined,
      };
    });

    res.json(chatsWithDetails);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { participantId, type = 'private', name } = req.body;

    if (!participantId) {
      return res.status(400).json({ error: 'Participant ID required' });
    }

    if (type === 'private') {
      const existingChat = db.findPrivateChat(req.userId!, participantId);
      if (existingChat) {
        return res.json(existingChat);
      }
    }

    const chat = db.createChat({
      id: uuidv4(),
      type,
      name,
      participants: [req.userId!, participantId],
      createdAt: new Date(),
    });

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/messages', authenticateToken, (req: AuthRequest, res) => {
  try {
    const chat = db.getChatById(req.params.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (!chat.participants.includes(req.userId!)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = db.getMessagesByChatId(req.params.id);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/search', authenticateToken, (req: AuthRequest, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const chats = db.searchChats(req.userId!, query);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
