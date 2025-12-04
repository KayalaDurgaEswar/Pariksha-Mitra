import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import OpenAI from 'openai'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

// Models
import Exam from './models/Exam.js'
import Result from './models/Result.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 4000

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

// Multer for audio uploads
fs.ensureDirSync('uploads')
const upload = multer({ dest: 'uploads/' })

// --- API Endpoints ---

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
                } else if (userAns) {
                    // Optional: Negative marking?
                    // score -= 1 
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
