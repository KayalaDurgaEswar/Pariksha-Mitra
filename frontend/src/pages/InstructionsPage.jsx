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
        <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            fontFamily: 'Inter, sans-serif',
            padding: '40px'
        }}>
            <ExamAlert
                isOpen={alertConfig.isOpen}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={closeAlert}
            />

            <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ background: '#3b82f6', padding: '20px', color: 'white' }}>
                    <h1 style={{ margin: 0, fontSize: '24px' }}>Exam Instructions & System Check</h1>
                    <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Welcome, {candidateName}</p>
                </div>

                <div style={{ padding: '30px' }}>
                    {/* System Checks Section */}
                    <div style={{ marginBottom: '30px', padding: '20px', background: '#f1f5f9', borderRadius: '8px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#334155' }}>1. System Compatibility Check</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <CheckItem label="Browser Compatibility" status={checks.browser} />
                            <CheckItem label="Internet Connectivity" status={checks.internet} />
                            <CheckItem label="Webcam Access" status={checks.camera} />
                            <CheckItem label="Microphone Access" status={checks.microphone} />
                        </div>

                        {/* Camera Preview */}
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <div style={{
                                width: '320px',
                                height: '240px',
                                background: '#000',
                                margin: '0 auto',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', bottom: '10px', left: '0', right: '0', color: 'white', fontSize: '12px' }}>Live Camera Preview</div>
                            </div>
                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ color: '#334155' }}>2. General Instructions</h3>
                        <ul style={{ lineHeight: '1.6', color: '#475569' }}>
                            <li>Total duration of the examination is as specified in the exam details.</li>
                            <li>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination.</li>
                            <li>The question palette displayed on the right side of screen will show the status of each question using symbols.</li>
                            <li>You can click on the "&gt;" arrow to maximize the question window.</li>
                        </ul>

                        <h3 style={{ color: '#dc2626' }}>3. Security & Proctoring Rules (Strictly Enforced)</h3>
                        <ul style={{ lineHeight: '1.6', color: '#dc2626', fontWeight: '500' }}>
                            <li><strong>Full Screen Mode:</strong> The exam will be conducted in full-screen mode. Do not exit full-screen mode.</li>
                            <li><strong>No Tab Switching:</strong> Switching tabs or minimizing the browser is strictly prohibited.</li>
                            <li><strong>Auto-Submission:</strong> If you switch tabs more than 2 times, your exam will be <u>automatically submitted</u>.</li>
                            <li><strong>Webcam Monitoring:</strong> Your webcam will be active throughout the exam for proctoring purposes.</li>
                        </ul>
                    </div>

                    {/* Agreement */}
                    <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={e => setAgreed(e.target.checked)}
                                style={{ width: '20px', height: '20px' }}
                            />
                            <span style={{ color: '#334155', fontWeight: '500' }}>
                                I have read and understood the instructions. I agree to adhere to the proctoring rules.
                            </span>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ textAlign: 'center' }}>
                        <button
                            onClick={handleStart}
                            style={{
                                padding: '15px 40px',
                                background: agreed && checks.camera === 'success' ? '#16a34a' : '#94a3b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                cursor: agreed && checks.camera === 'success' ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s'
                            }}
                            disabled={!agreed || checks.camera !== 'success'}
                        >
                            I am ready to begin
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}

function CheckItem({ label, status }) {
    const color = status === 'success' ? '#16a34a' : status === 'error' ? '#ef4444' : '#f59e0b';
    const icon = status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'white', borderRadius: '6px', border: `1px solid ${color}` }}>
            <span>{icon}</span>
            <span style={{ fontWeight: '500', color: '#334155' }}>{label}</span>
        </div>
    );
}

const checkRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: 'white',
    borderRadius: '8px',
    marginBottom: '10px',
    border: '1px solid #e2e8f0'
};

const statusStyle = (status) => ({
    fontWeight: 'bold',
    color: status === 'success' ? '#16a34a' : status === 'pending' ? '#f59e0b' : '#dc2626'
});
