import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ExamAlert from '../components/ExamAlert';

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
        <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', background: '#f4f6f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ExamAlert
                isOpen={alertConfig.isOpen}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={closeAlert}
            />

            <div className="container" style={{
                width: '95%',
                maxWidth: '1400px',
                height: '95vh',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{ background: '#003366', padding: '1rem 1.5rem', borderRadius: '8px 8px 0 0', color: 'white', flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>Pariksha Mitra Guidelines</h1>
                        <p style={{ margin: 0, opacity: 0.9, color: 'white', fontSize: '0.9rem' }}>Candidate: <strong>{candidateName}</strong></p>
                    </div>
                </div>

                <div style={{ padding: '1.5rem', background: '#f8fafc', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                    {/* Step Cards Grid */}
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flex: 1, overflow: 'hidden' }}>

                        {/* Left Column: System, Camera, Rules */}
                        <div style={{ flex: '0 0 45%', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', overflowY: 'auto' }}>
                            {/* Card 1: System */}
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                                    <span style={{ background: '#003366', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>1</span>
                                    <h3 style={{ fontSize: '0.9rem', margin: 0, color: '#1e293b' }}>System Readiness</h3>
                                </div>
                                <div className="flex-col gap-2">
                                    <CheckItem label="Browser Support" status={checks.browser} size="small" />
                                    <CheckItem label="Internet Connection" status={checks.internet} size="small" />
                                    <CheckItem label="Microphone Access" status={checks.microphone} size="small" />
                                </div>
                            </div>

                            {/* Card 2: Environment */}
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                                    <span style={{ background: '#003366', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>2</span>
                                    <h3 style={{ fontSize: '0.9rem', margin: 0, color: '#1e293b' }}>Camera Verification</h3>
                                </div>
                                <div style={{
                                    flex: 1,
                                    width: '100%',
                                    background: '#1e293b',
                                    borderRadius: '6px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '150px'
                                }}>
                                    <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: checks.camera === 'success' ? '#4ade80' : '#ef4444' }}></div>
                                        {checks.camera === 'success' ? 'FEED LIVE' : 'CONNECTING...'}
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Rules */}
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                                    <span style={{ background: '#003366', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>3</span>
                                    <h3 style={{ fontSize: '0.9rem', margin: 0, color: '#1e293b' }}>Important Rules</h3>
                                </div>
                                <ul style={{ paddingLeft: '0', listStyle: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <li style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                                        <span style={{ color: '#dc2626', fontWeight: 'bold' }}>›</span> No tab switching allowed.
                                    </li>
                                    <li style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                                        <span style={{ color: '#dc2626', fontWeight: 'bold' }}>›</span> Face must remain visible.
                                    </li>
                                    <li style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                                        <span style={{ color: '#003366', fontWeight: 'bold' }}>›</span> "Save & Next" to record answers.
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Right Column: Voice & Hand Controls */}
                        <div style={{ flex: '1', display: 'flex' }}>
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', width: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                                    <span style={{ background: '#003366', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>4</span>
                                    <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#1e293b' }}>Voice & Hand Controls</h3>
                                </div>
                                <ul style={{ paddingLeft: '0', listStyle: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, justifyContent: 'center' }}>
                                    <li style={{ fontSize: '0.95rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <span style={{ fontWeight: 'bold', color: '#003366', fontSize: '1.1rem' }}>Select Answer</span>
                                        <span style={{ background: '#f1f5f9', padding: '8px', borderRadius: '4px' }}>Show 1, 2, 3, or 4 fingers (A, B, C, D) or say "Option A"</span>
                                    </li>
                                    <li style={{ fontSize: '0.95rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <span style={{ fontWeight: 'bold', color: '#003366', fontSize: '1.1rem' }}>Navigate</span>
                                        <span style={{ background: '#f1f5f9', padding: '8px', borderRadius: '4px' }}>Thumb "Right/Left" for Next/Prev or say "Next Question"</span>
                                    </li>
                                    <li style={{ fontSize: '0.95rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <span style={{ fontWeight: 'bold', color: '#003366', fontSize: '1.1rem' }}>Save & Next</span>
                                        <span style={{ background: '#f1f5f9', padding: '8px', borderRadius: '4px' }}>Thumb "Up" or say "Save"</span>
                                    </li>
                                    <li style={{ fontSize: '0.95rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <span style={{ fontWeight: 'bold', color: '#003366', fontSize: '1.1rem' }}>Clear</span>
                                        <span style={{ background: '#f1f5f9', padding: '8px', borderRadius: '4px' }}>Make a "Fist" or say "Clear Answer"</span>
                                    </li>
                                    <li style={{ fontSize: '0.95rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <span style={{ fontWeight: 'bold', color: '#003366', fontSize: '1.1rem' }}>Submit</span>
                                        <span style={{ background: '#f1f5f9', padding: '8px', borderRadius: '4px' }}>OK Sign (👌) or say "Submit Test"</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div style={{ background: 'white', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', flexShrink: 0 }}>
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
