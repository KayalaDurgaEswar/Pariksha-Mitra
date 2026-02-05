import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ExamAlert from '../components/ExamAlert';
import '../styles/instructions.css';

export default function InstructionsPage() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const candidateName = location.state?.candidateName || localStorage.getItem('candidateName') || 'Student';

    const [agreed, setAgreed] = useState(false);
    const [checks, setChecks] = useState({
        camera: 'pending', // pending, success, error
        microphone: 'pending',
        browser: 'success', // Mocked
        internet: 'success' // Mocked
    });

    const videoRef = useRef(null);

    // Alert State
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'info', title: '', message: '' });

    const showAlert = (type, title, message) => {
        setAlertConfig({ isOpen: true, type, title, message });
    };

    const closeAlert = () => {
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(() => {
        startSystemChecks();
    }, []);

    const startSystemChecks = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setChecks(prev => ({ ...prev, camera: 'success', microphone: 'success' }));
        } catch (err) {
            console.error("Media Access Error:", err);
            setChecks(prev => ({ ...prev, camera: 'error', microphone: 'error' }));
            showAlert('error', 'System Check Failed', 'Camera and Microphone access is required to take this exam. Please allow access in your browser settings.');
        }
    };

    const handleStart = () => {
        if (checks.camera !== 'success' || checks.microphone !== 'success') {
            return showAlert('error', 'System Check Failed', "System checks failed. Please allow camera and microphone access to proceed.");
        }
        if (!agreed) return showAlert('warning', 'Agreement Required', "Please read and agree to the instructions before starting the exam.");

        // Stop the test stream before navigating
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }

        // Request Full Screen
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.log("Full screen denied", err));
        }

        navigate(`/exam/${examId}`, { state: { candidateName } });
    };



    return (
        <div className="instructions-root">
            <ExamAlert
                isOpen={alertConfig.isOpen}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={closeAlert}
            />

            <div className="instructions-container">
                {/* Header */}
                <div className="instructions-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1>Pariksha Mitra Guidelines</h1>
                        <p>Candidate: <strong>{candidateName}</strong></p>
                    </div>
                </div>

                <div className="instructions-content-wrapper">

                    {/* Step Cards Grid */}
                    <div className="instructions-split">

                        {/* Left Column: System, Camera, Rules */}
                        <div className="left-panel">
                            {/* Card 1: System */}
                            <div className="card-box">
                                <div className="card-header">
                                    <span className="card-number">1</span>
                                    <h3 className="card-title">System Readiness</h3>
                                </div>
                                <div className="flex-col gap-2">
                                    <CheckItem label="Browser Support" status={checks.browser} size="small" />
                                    <CheckItem label="Internet Connection" status={checks.internet} size="small" />
                                    <CheckItem label="Microphone Access" status={checks.microphone} size="small" />
                                </div>
                            </div>

                            {/* Card 2: Environment */}
                            <div className="card-box" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="card-header">
                                    <span className="card-number">2</span>
                                    <h3 className="card-title">Camera Verification</h3>
                                </div>
                                <div className="camera-box-wrapper">
                                    <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div className="camera-badge">
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: checks.camera === 'success' ? '#4ade80' : '#ef4444' }}></div>
                                        {checks.camera === 'success' ? 'FEED LIVE' : 'CONNECTING...'}
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Rules */}
                            <div className="card-box">
                                <div className="card-header">
                                    <span className="card-number">3</span>
                                    <h3 className="card-title">Important Rules</h3>
                                </div>
                                <ul className="rules-list">
                                    <li className="rules-item">
                                        <span style={{ color: '#dc2626', fontWeight: 'bold' }}>›</span> No tab switching allowed.
                                    </li>
                                    <li className="rules-item">
                                        <span style={{ color: '#dc2626', fontWeight: 'bold' }}>›</span> Face must remain visible.
                                    </li>
                                    <li className="rules-item">
                                        <span style={{ color: '#003366', fontWeight: 'bold' }}>›</span> "Save & Next" to record answers.
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Right Column: Voice & Hand Controls */}
                        <div className="right-panel">
                            <div className="card-box" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div className="card-header" style={{ marginBottom: '1.5rem', paddingBottom: '1rem' }}>
                                    <span className="card-number" style={{ width: '28px', height: '28px', fontSize: '0.9rem' }}>4</span>
                                    <h3 className="card-title" style={{ fontSize: '1.1rem' }}>Voice & Hand Controls</h3>
                                </div>
                                <ul className="voice-list">
                                    <li className="voice-item">
                                        <span className="voice-label">Select Answer</span>
                                        <span className="voice-value">Show 1, 2, 3, or 4 fingers (A, B, C, D) or say "Option A"</span>
                                    </li>
                                    <li className="voice-item">
                                        <span className="voice-label">Navigate</span>
                                        <span className="voice-value">Thumb "Right/Left" for Next/Prev or say "Next Question"</span>
                                    </li>
                                    <li className="voice-item">
                                        <span className="voice-label">Save & Next</span>
                                        <span className="voice-value">Thumb "Up" or say "Save"</span>
                                    </li>
                                    <li className="voice-item">
                                        <span className="voice-label">Clear</span>
                                        <span className="voice-value">Make a "Fist" or say "Clear Answer"</span>
                                    </li>
                                    <li className="voice-item">
                                        <span className="voice-label">Submit</span>
                                        <span className="voice-value">OK Sign (👌) or say "Submit Test"</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Footer Action */}
                <div className="action-bar">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}>
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={e => setAgreed(e.target.checked)}
                            style={{ width: '18px', height: '18px', accentColor: '#003366' }}
                        />
                        <span style={{ fontWeight: '600', fontSize: '0.95rem', color: '#334155' }}>
                            I declare that I have read the instructions and am ready to begin.
                        </span>
                    </label>

                    <button
                        onClick={handleStart}
                        disabled={!agreed || checks.camera !== 'success'}
                        className="btn"
                        style={{
                            background: agreed && checks.camera === 'success' ? '#003366' : '#94a3b8',
                            color: 'white',
                            padding: '0.75rem 2.5rem',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontWeight: '600',
                            border: 'none',
                            cursor: agreed && checks.camera === 'success' ? 'pointer' : 'not-allowed',
                            boxShadow: agreed && checks.camera === 'success' ? '0 4px 6px -1px rgba(0, 51, 102, 0.3)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Start Examination
                    </button>
                </div>
            </div>

        </div>
    );
}

function CheckItem({ label, status, size = 'normal' }) {
    const isSuccess = status === 'success';
    const color = isSuccess ? '#198754' : status === 'error' ? '#dc3545' : '#ffc107';
    // Use simple unicode instead of text badges
    const icon = isSuccess ? '✔' : status === 'error' ? '✖' : '...';

    const padding = size === 'small' ? '0.5rem' : '0.75rem';
    const fontSize = size === 'small' ? '0.85rem' : '0.9rem';

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: padding,
            background: 'white',
            borderRadius: '4px',
            border: `1px solid ${color}`,
            fontSize: fontSize
        }}>
            <span style={{ fontWeight: '500', color: '#212529' }}>{label}</span>
            <span style={{ color: color, fontWeight: 'bold' }}>{icon}</span>
        </div>
    );
}
