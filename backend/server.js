import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { analyzeImage } from './utils/gemini.js';
import Scan from './models/Scan.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scannerapp')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Analyze and save scan
app.post('/api/analyze', async (req, res) => {
  try {
    const { image, category } = req.body;
    
    // Validate request
    if (!image || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const analysis = await analyzeImage(image, category);
    
    // Create new scan document
    const newScan = new Scan({
      imageUrl: image,
      analysis,
      category
    });
    
    // Save to database
    await newScan.save();
    
    res.json({ analysis, scanId: newScan._id });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get recent scans
app.get('/api/scans', async (req, res) => {
  try {
    const scans = await Scan.find()
      .sort({ timestamp: -1 }) // Sort by newest first
      .limit(10); // Limit to 10 most recent scans
    res.json(scans);
  } catch (error) {
    console.error('Error fetching scans:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
