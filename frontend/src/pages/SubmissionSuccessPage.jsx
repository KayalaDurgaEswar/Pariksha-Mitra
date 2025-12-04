import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SubmissionSuccessPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { candidateName, examId, submittedAt } = location.state || {};

    if (!candidateName) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'Inter' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1>Access Denied</h1>
                    <button onClick={() => navigate('/')} style={btnStyle}>Go Home</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            fontFamily: 'Inter, sans-serif',
            color: 'white',
            padding: '20px'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '40px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: '#22c55e',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto',
                    fontSize: '40px',
                    boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)'
                }}>
                    ✅
                </div>

                <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: '700' }}>Exam Submitted!</h1>
                <p style={{ color: '#94a3b8', margin: '0 0 30px 0' }}>Your responses have been securely recorded.</p>

                <div style={{ background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '30px' }}>
                    <div style={rowStyle}>
                        <span style={labelStyle}>Candidate Name</span>
                        <span style={valueStyle}>{candidateName}</span>
                    </div>
                    <div style={rowStyle}>
                        <span style={labelStyle}>Exam ID</span>
                        <span style={valueStyle}>{examId}</span>
                    </div>
                    <div style={rowStyle}>
                        <span style={labelStyle}>Submission Time</span>
                        <span style={valueStyle}>{new Date(submittedAt || Date.now()).toLocaleString()}</span>
                    </div>
                    <div style={rowStyle}>
                        <span style={labelStyle}>Status</span>
                        <span style={{ ...valueStyle, color: '#4ade80' }}>Completed Successfully</span>
                    </div>
                </div>

                <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '30px' }}>
                    You may now close this window or return to the home page.
                    Results will be published by your examiner shortly.
                </p>

                <button onClick={() => navigate('/')} style={btnStyle}>
                    Return to Home
                </button>
            </div>
        </div>
    );
}

const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '8px'
};

const labelStyle = {
    color: '#94a3b8',
    fontSize: '14px'
};

const valueStyle = {
    fontWeight: '600',
    fontSize: '14px'
};

const btnStyle = {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.1s',
    width: '100%'
};
