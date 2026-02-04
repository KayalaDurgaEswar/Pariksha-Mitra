
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Exam from './models/Exam.js';
import Examiner from './models/Examiner.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cbt_db';

const seed = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB for Seeding');

        // 1. Create Default Examiner
        const existingExaminer = await Examiner.findOne({ username: 'admin' });
        if (!existingExaminer) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await Examiner.create({
                username: 'admin',
                password: hashedPassword,
                name: 'Chief Examiner'
            });
            console.log('✅ Created Examiner: admin / admin123');
        } else {
            console.log('ℹ️ Examiner "admin" already exists');
        }

        process.exit();
    } catch (error) {
        console.error('❌ Seeding Error:', error);
        process.exit(1);
    }
};

seed();
