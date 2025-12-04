import React, { useState, useEffect } from 'react';
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
        fetch('http://localhost:4000/api/exams?t=' + Date.now())
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
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
            fontFamily: 'Inter, sans-serif'
        }}>
            <ExamAlert
                isOpen={alertConfig.isOpen}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={closeAlert}
            />

            <div style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '40px',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                width: '400px'
            }}>
                <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Student Portal</h1>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Enter your name"
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '16px'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Select Exam</label>
                    <select
                        value={selectedExam}
                        onChange={e => setSelectedExam(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '16px'
                        }}
                    >
                        <option value="">-- Choose Exam --</option>
                        {exams.filter(e => {
                            const isHidden = e.isArchived === true;
                            // console.log(`Exam ${e.id} isArchived: ${e.isArchived} -> Hidden: ${isHidden}`);
                            return !isHidden;
                        }).map(e => (
                            <option key={e.id} value={e.id}>{e.title} ({e.id})</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleStart}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                >
                    Start Exam
                </button>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <a href="/examiner" style={{ color: '#64748b', fontSize: '12px', textDecoration: 'none' }}>Examiner Login</a>
                </div>
            </div>
        </div>
    );
}
