# Pariksha Mitra - CBT Application

Pariksha Mitra is a comprehensive Computer Based Test (CBT) platform designed for examiners to conduct secure exams and for students to take them with advanced proctoring features. It includes AI-powered proctoring using computer vision and voice commands.

## Features

- **User Roles**: Support for Examiner (Dashboard) and Student (Exam Taker) roles.
- **Examiner Dashboard**:
    - Create and manage exams.
    - View student results.
    - Upload exam question images.
- **CBT Interface**:
    - Secure exam environment.
    - Question navigation palette.
    - Timer and auto-submit functionality.
- **Advanced Proctoring & Controls**:
    - **Hand Gesture Recognition**: Built with MediaPipe to navigate questions using hand gestures.
    - **Voice Commands**: Dual-engine voice control system supporting:
        - **Native Web Speech API**: Instant, browser-based command recognition.
        - **OpenAI Whisper**: High-accuracy, server-side transcription for complex inputs.
    - **Exam Monitoring**: Alert system for suspicious activities.

## Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS, Framer Motion (for animations)
- **Routing**: React Router DOM (v6)
- **AI/ML**: MediaPipe (Face/Hand tracking), Web Speech API
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js & Express
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT & BcryptJS
- **Storage**: Cloudinary (for image/asset management)
- **AI Services**: OpenAI API (Whisper integration)
- **File Handling**: Multer

## Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB (Local or Atlas URI)
- Cloudinary Account (for image uploads)
- OpenAI API Key (optional, for Whisper features)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository_url>
cd CBT
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=4001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
OPENAI_API_KEY=your_openai_api_key
```

Start the backend server:
```bash
# Production start
node server.js

# Development start (with nodemon)
npx nodemon server.js
```
The server will run on `http://localhost:4001`.

### 3. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```

Start the development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

## Usage

1. **Register/Login**: Start by registering as an Examiner to create exams.
2. **Create Exam**: Use the dashboard to create a new exam with questions. You can upload images for questions.
3. **Take Exam**: Students can access the exam using the provided Exam ID.
4. **Controls**:
    - Use mouse clicks to answer.
    - Enable Microphone for voice commands.
    - Enable Camera for gesture controls.

## Development

- **Backend Entry**: `backend/server.js`
- **Frontend Entry**: `frontend/src/main.jsx`
