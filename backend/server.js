import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import OpenAI from 'openai'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Models
import Exam from './models/Exam.js'
import Result from './models/Result.js'
import Examiner from './models/Examiner.js';

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 4001

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cbt_db'
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err))

// OpenAI Setup
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-key'
})

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

// Multer for uploads
fs.ensureDirSync('uploads')
const upload = multer({ dest: 'uploads/' })

// --- ROOT ENDPOINT ---
app.get('/', (req, res) => {
    res.json({ message: 'Pariksha Mitra Backend is running' })
})

// --- AUTH ENDPOINTS ---

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, name } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await Examiner.create({ username, password: hashedPassword, name });
        res.json({ message: 'Examiner registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const examiner = await Examiner.findOne({ username });
        if (!examiner) return res.status(400).json({ error: 'Examiner not found' });

        const isMatch = await bcrypt.compare(password, examiner.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: examiner._id, name: examiner.name }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, name: examiner.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- IMAGE UPLOAD ENDPOINT ---

app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image file provided' });

        console.log("Uploading file to Cloudinary:", req.file.path);

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'cbt_exams'
        });

        console.log("Cloudinary Result:", result);

        // Cleanup local file
        fs.remove(req.file.path);

        res.json({ url: result.secure_url });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: 'Image upload failed: ' + err.message });
    }
});

// --- EXAM ENDPOINTS ---

// 1. Get All Exams
app.get('/api/exams', async (req, res) => {
    try {
        const exams = await Exam.find()
        res.json(exams)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// 2. Create/Update Exam
app.post('/api/exams', async (req, res) => {
    try {
        const newExam = req.body
        // Check if exists
        const existing = await Exam.findOne({ id: newExam.id })
        if (existing) {
            await Exam.updateOne({ id: newExam.id }, newExam)
            res.json({ message: 'Exam updated', id: newExam.id })
        } else {
            await Exam.create(newExam)
            res.json({ message: 'Exam created', id: newExam.id })
        }
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// 2.5 Archive/Unarchive Exam
app.put('/api/exams/:id/archive', async (req, res) => {
    try {
        await Exam.updateOne({ id: req.params.id }, { isArchived: true })
        res.json({ message: 'Exam archived' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.put('/api/exams/:id/unarchive', async (req, res) => {
    try {
        await Exam.updateOne({ id: req.params.id }, { isArchived: false })
        res.json({ message: 'Exam unarchived' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// 3. Submit Results
app.post('/api/submit', async (req, res) => {
    try {
        const submission = req.body
        // Handle legacy field
        if (!submission.candidateName && submission.candidate) {
            submission.candidateName = submission.candidate
        }
        console.log("Received submission:", submission)
        // Calculate Score
        const exam = await Exam.findOne({ id: submission.examId })
        let score = 0

        if (exam) {
            exam.questions.forEach(q => {
                const correctOpt = q.correctAnswer || 'A' // Default to A if missing (legacy)
                const userAns = submission.answers[q.id]

                if (userAns === correctOpt) {
                    score += (q.marks || 4)
                }
            })
        }

        submission.score = score

        await Result.create(submission)
        res.json({ message: 'Result submitted', score })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// 4. Get All Results
app.get('/api/results', async (req, res) => {
    try {
        const results = await Result.find().sort({ submittedAt: -1 })
        res.json(results)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// 5. Whisper Transcription
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No audio file' })

        if (process.env.OPENAI_API_KEY) {
            const transcription = await openai.audio.transcriptions.create({
                file: fs.createReadStream(req.file.path),
                model: 'whisper-1',
            })
            res.json({ text: transcription.text })
        } else {
            // Mock response if no key
            console.log("Mocking Whisper response...")
            res.json({ text: "Mock transcription: Select Option A" })
        }

        // Cleanup
        fs.remove(req.file.path)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Transcription failed' })
    }
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
