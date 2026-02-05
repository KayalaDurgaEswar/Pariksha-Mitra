import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { useNavigate } from 'react-router-dom';
import ExamAlert from '../components/ExamAlert';

export default function StudentLogin() {
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();

    // Alert State
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'info', title: '', message: '' });

    const showAlert = (type, title, message) => {
        setAlertConfig({ isOpen: true, type, title, message });
    };

    const closeAlert = () => {
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/exams?t=` + Date.now())
            .then(r => r.json())
            .then(data => {
                console.log("Fetched exams:", data);
                setExams(data);
            })
            .catch(err => console.error("Backend not running?", err));
    }, []);

    const handleStart = () => {
        if (!selectedExam || !name) return showAlert('warning', 'Missing Information', "Please enter your name and select an exam to proceed.");
        localStorage.setItem('candidateName', name);
        navigate(`/instructions/${selectedExam}`, { state: { candidateName: name } });
    };

    return (
        <div className="water-glass-bg">
            <ExamAlert
                isOpen={alertConfig.isOpen}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={closeAlert}
            />

            <div className="water-glass-card animate-enter">
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Pariksha Mitra</h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Your Exam Companion</p>
                </div>

                <div className="flex-col gap-4">
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Candidate Name"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Select Examination</label>
                        <select
                            value={selectedExam}
                            onChange={e => setSelectedExam(e.target.value)}
                        >
                            <option value="">-- Select Exam --</option>
                            {exams.filter(e => !e.isArchived).map(e => (
                                <option key={e.id} value={e.id}>{e.title} (ID: {e.id})</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleStart}
                        className="btn btn-primary"
                        style={{ marginTop: '1.5rem', width: '100%', padding: '0.8rem' }}
                    >
                        Enter Examination Hall
                    </button>
                </div>

                <div className="text-center" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <a href="/examiner-login" style={{ fontSize: '0.85rem', color: '#64748b', textDecoration: 'none' }}>Administrator Login</a>
                </div>
            </div>
        </div>
    );
}
