import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useParams, useLocation } from 'react-router-dom';
import StudentLogin from './pages/StudentLogin';
import ExaminerDashboard from './pages/ExaminerDashboard';
import ExamPage from './pages/ExamPage';
import InstructionsPage from './pages/InstructionsPage';
import SubmissionSuccessPage from './pages/SubmissionSuccessPage';
import ExaminerLogin from './pages/ExaminerLogin';

// Wrapper for ExamPage to fetch data from backend
function ExamWrapper() {
    const { examId } = useParams();
    const { state } = useLocation();
    const [examData, setExamData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Fetching exam:", examId);
        fetch('http://localhost:4001/api/exams')
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
            <div className="container" style={{ padding: '40px', color: 'var(--red-500)' }}>
                <h2>Error Loading Exam</h2>
                <pre>{error}</pre>
                <p>Check if backend is running on port 4001.</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry Connection</button>
            </div>
        )
    }

    if (!examData) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <h3 className="text-slate-400" style={{ marginTop: '1.5rem', fontWeight: 400 }}>Setting up secure environment...</h3>
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
                <div className="container flex-center flex-col" style={{ minHeight: '100vh', color: 'var(--red-500)' }}>
                    <h1>Simply Broken.</h1>
                    <pre style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', color: '#fff' }}>
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload System</button>
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
                    <Route path="/examiner-login" element={<ExaminerLogin />} />
                    <Route path="/examiner" element={<ExaminerDashboard />} />
                    <Route path="/exam/:examId" element={<ExamWrapper />} />
                    <Route path="/success" element={<SubmissionSuccessPage />} />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}
