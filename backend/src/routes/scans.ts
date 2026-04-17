import { Router } from 'express';
import multer from 'multer';
import FormData from 'form-data';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { prisma } from '../prisma';
import { authMiddleware } from './auth';

const router = Router();
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, res, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });
// @ts-ignore
import { Client } from "@gradio/client";
import { Blob } from "buffer";

router.post('/analyze', authMiddleware, upload.single('image'), async (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: 'Image is required' });

  try {
    const filePath = req.file.path;

    // Connect to Hugging Face Space
    const client = await Client.connect("epixjayant/ai-project");

    // Convert local file to Blob for Gradio
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer]);

    // Predict using the Hugging Face model
    // Note: 'img' is the expected key as per the user's snippet
    const result: any = await client.predict("/predict", {
      img: blob,
    });

    // The Space returns an array in 'data', with the first element being the result object
    const aiData = result.data[0];

    if (!aiData || !aiData.disease) {
      throw new Error("Invalid or empty response from AI model");
    }

    // Map HF Space fields to our local database format
    // Format: "Plant___Disease"
    const [plant_type, disease] = aiData.disease.split('___');
    const confidence = aiData.confidence || 0.95;
    const remedy = aiData.cure || "No specific remedy provided. Consult a local expert.";

    // Save scan to database
    const scan = await prisma.scan.create({
      data: {
        user_id: req.user.id,
        image_url: `/uploads/${req.file.filename}`,
        plant_type: plant_type || "Unknown",
        disease: disease || "Healthy",
        confidence,
        remedy
      }
    });

    res.json(scan);
  } catch (error: any) {
    console.error('Scan error:', error.message);
    res.status(500).json({ error: 'Failed to analyze plant using HF Space API' });
  }
});

router.get('/history', authMiddleware, async (req: any, res: any) => {
  try {
    const authReq = req as any;
    const history = await prisma.scan.findMany({
      where: { user_id: authReq.user.id },
      orderBy: { timestamp: 'desc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scan history' });
  }
});

// Serve static uploads
router.use('/uploads', Router().get('/:filename', (req, res) => {
  res.sendFile(path.join(uploadDir, req.params.filename));
}));

export default router;
