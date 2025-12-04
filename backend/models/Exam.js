import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    id: Number,
    section: String,
    text: String,
    options: {
        A: String,
        B: String,
        C: String,
        D: String
    },
    correctAnswer: String, // 'A', 'B', 'C', or 'D'
    marks: Number
});

const examSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    title: String,
    durationMinutes: Number,
    questions: [questionSchema],
    isArchived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Exam', examSchema);
