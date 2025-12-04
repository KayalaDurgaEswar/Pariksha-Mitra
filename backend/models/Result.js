import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
    examId: String,
    candidateName: String,
    answers: { type: Map, of: String },
    score: Number,
    submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Result', resultSchema);
