import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useParams, useLocation } from 'react-router-dom';
import StudentLogin from './pages/StudentLogin';
import ExaminerDashboard from './pages/ExaminerDashboard';
import ExamPage from './pages/ExamPage';
import InstructionsPage from './pages/InstructionsPage';
import SubmissionSuccessPage from './pages/SubmissionSuccessPage';

// Wrapper for ExamPage to fetch data from backend
function ExamWrapper() {
    const { examId } = useParams();
    const { state } = useLocation();
    const [examData, setExamData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Fetching exam:", examId);
        fetch('http://localhost:4000/api/exams')
            .then(r => {
                if (!r.ok) throw new Error("Failed to fetch exams");
                return r.json();
            })
            .then(exams => {
                console.log("Exams fetched:", exams);
                const exam = exams.find(e => e.id === examId);
                if (exam) {
                    setExamData(exam);
                } else {
                    console.error("Exam not found:", examId);
                    setError("Exam not found");
                }
            })
            .catch(err => {
                console.error("Error fetching exam:", err);
                setError(err.message);
            });
    }, [examId]);

    if (error) {
        return (
            <div style={{ padding: 40, color: 'red' }}>
                <h2>Error Loading Exam</h2>
                <pre>{error}</pre>
                <p>Check if backend is running on port 4000.</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        )
    }

    if (!examData) {
        return (
            <div style={{ padding: 40 }}>
                <h2>Loading Exam Data...</h2>
                <p>Fetching from http://localhost:4000/api/exams...</p>
            </div>
        )
    }

    // Force re-mount when examId changes by using it as a key
    const candidateName = state?.candidateName || localStorage.getItem('candidateName') || 'Student';
    return <ExamPage key={examId} examData={examData} candidateName={candidateName} />;
}

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 40, color: 'red' }}>
                    <h1>Something went wrong.</h1>
                    <pre>{this.state.error && this.state.error.toString()}</pre>
                    <button onClick={() => window.location.reload()}>Reload Page</button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<StudentLogin />} />
                    <Route path="/instructions/:examId" element={<InstructionsPage />} />
                    <Route path="/examiner" element={<ExaminerDashboard />} />
                    <Route path="/exam/:examId" element={<ExamWrapper />} />
                    <Route path="/success" element={<SubmissionSuccessPage />} />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}
