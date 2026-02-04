import mongoose from 'mongoose';

const examinerSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String
});

export default mongoose.model('Examiner', examinerSchema);
