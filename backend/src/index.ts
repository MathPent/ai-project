import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import areasRoutes from './routes/areas';
import scansRoutes from './routes/scans';
import communityRoutes from './routes/community';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/areas', areasRoutes);
app.use('/scans', scansRoutes);
app.use('/community', communityRoutes);

app.get('/', (req, res) => {
  res.send('AgroTech API Running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
