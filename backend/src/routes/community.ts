import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { prisma } from '../prisma';
import { authMiddleware } from './auth';

const router = Router();
const uploadDir = path.join(__dirname, '../../uploads');
const storage = multer.diskStorage({
  destination: (req, res, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/posts', authMiddleware, upload.single('image'), async (req: any, res: any) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const post = await prisma.post.create({
      data: {
        user_id: req.user.id,
        title,
        content,
        image: image_url
      }
    });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.get('/posts', authMiddleware, async (req: any, res: any) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        user: { select: { name: true, profile_photo: true } },
        comments: {
          include: { user: { select: { name: true } } },
          orderBy: { timestamp: 'asc' }
        }
      }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.post('/posts/:id/like', authMiddleware, async (req: any, res: any) => {
  try {
    const post = await prisma.post.update({
      where: { post_id: req.params.id },
      data: { likes: { increment: 1 } }
    });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to like post' });
  }
});

router.post('/posts/:id/comment', authMiddleware, async (req: any, res: any) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        user_id: req.user.id,
        post_id: req.params.id,
      }
    });

    const populated = await prisma.comment.findUnique({
       where: { comment_id: comment.comment_id },
       include: { user: { select: { name: true } } }
    });
    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;
