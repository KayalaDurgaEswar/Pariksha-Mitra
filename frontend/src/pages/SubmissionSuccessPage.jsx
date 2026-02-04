import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SubmissionSuccessPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { candidateName, examId, submittedAt } = location.state || {};

    if (!candidateName) {
        return (
            <div className="water-glass-bg">
                <div className="water-glass-card text-center">
                    <h1>Access Denied</h1>
                    <button onClick={() => navigate('/')} className="btn btn-primary">Go Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="water-glass-bg">
            <div className="water-glass-card animate-enter" style={{ maxWidth: '500px', textAlign: 'center' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: '#198754',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto',
                    fontSize: '40px',
                    color: 'white',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    ✔
                </div>

                <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#1e293b' }}>Submission Successful</h1>
                <p style={{ marginBottom: '2rem', color: '#64748b' }}>Your assessment responses have been recorded.</p>

                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="row-item">
                            <span className="label">Candidate Name</span>
                            <span className="value">{candidateName}</span>
                        </div>
                        <div className="row-item">
                            <span className="label">Exam ID</span>
                            <span className="value">{examId}</span>
                        </div>
                        <div className="row-item">
                            <span className="label">Submission Time</span>
                            <span className="value">{new Date(submittedAt || Date.now()).toLocaleString()}</span>
                        </div>
                        <div className="row-item">
                            <span className="label">Status</span>
                            <span className="value" style={{ color: '#198754' }}>Completed</span>
                        </div>
                    </div>
                </div>

                <p style={{ fontSize: '0.9rem', marginBottom: '2rem', color: '#64748b' }}>
                    You may clear your workstation. Results will be declared by the administration.
                </p>

                <button onClick={() => navigate('/')} className="btn btn-primary" style={{ width: '100%' }}>
                    Return to Login
                </button>
            </div>

            <style>{`
                .row-item {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 0.5rem;
                }
                .row-item:last-child { border-bottom: none; padding-bottom: 0; }
                .label { color: #64748b; font-size: 0.9rem; }
                .value { font-weight: 600; color: #1e293b; font-size: 0.95rem; }
            `}</style>
        </div>
    );
}
