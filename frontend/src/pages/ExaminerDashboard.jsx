import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExamAlert from '../components/ExamAlert';
import '../styles/examiner.css';

export default function ExaminerDashboard() {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const [activeTab, setActiveTab] = useState('exams'); // exams | history | results | create

    // Form State
    const [examId, setExamId] = useState('');
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(60);
    const [questions, setQuestions] = useState([
        { id: 1, section: 'General', text: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: 'A', marks: 4, imageUrl: '' }
    ]);

    // View Results Filter
    const [filterExamId, setFilterExamId] = useState(null);

    // Alert State
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'info', title: '', message: '' });

    const showAlert = (type, title, message, onConfirm = null) => {
        setAlertConfig({ isOpen: true, type, title, message, onConfirm });
    };

    const closeAlert = () => {
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(() => {
        fetchExams();
        fetchResults();
    }, []);

    const fetchExams = () => fetch('http://localhost:4001/api/exams').then(r => r.json()).then(setExams);
    const fetchResults = () => fetch('http://localhost:4001/api/results').then(r => r.json()).then(setResults);

    const addQuestion = () => {
        setQuestions([...questions, {
            id: questions.length + 1,
            section: 'General',
            text: '',
            options: { A: '', B: '', C: '', D: '' },
            correctAnswer: 'A',
            marks: 4,
            imageUrl: ''
        }]);
    };

    const updateQuestion = (idx, field, value) => {
        const newQs = [...questions];
        newQs[idx][field] = value;
        setQuestions(newQs);
    };

    const updateOption = (qIdx, optKey, value) => {
        const newQs = [...questions];
        newQs[qIdx].options[optKey] = value;
        setQuestions(newQs);
    };

    const handleEdit = (exam) => {
        setExamId(exam.id);
        setTitle(exam.title);
        setDuration(exam.durationMinutes);
        setQuestions(exam.questions || []);
        setActiveTab('create');
    };

    const handleArchive = async (id, status) => {
        const action = status ? 'archive' : 'unarchive';
        showAlert('warning', `Confirm ${action}`, `Are you sure you want to ${action} this exam?`, async () => {
            try {
                await fetch(`http://localhost:4001/api/exams/${id}/${action}`, { method: 'PUT' });
                fetchExams();
                closeAlert();
            } catch (e) {
                showAlert('error', 'Error', `Error ${action}ing exam`);
            }
        });
    };

    const handleViewResults = (id) => {
        setFilterExamId(id);
        setActiveTab('results');
    };

    // Auth Check
    useEffect(() => {
        const token = localStorage.getItem('examiner_token');
        if (!token) {
            navigate('/examiner-login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('examiner_token');
        navigate('/examiner-login');
    };

    const handleImageUpload = async (file, qIdx) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            showAlert('info', 'Uploading...', 'Please wait while we upload the image.');
            const res = await fetch('http://localhost:4001/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.url) {
                updateQuestion(qIdx, 'imageUrl', data.url);
                closeAlert();
            } else {
                throw new Error('Upload failed');
            }
        } catch (e) {
            showAlert('error', 'Upload Error', 'Failed to upload image. Check your internet connection.');
        }
    };

    const handleCreate = async () => {
        if (!examId || !title) return showAlert('warning', 'Missing Fields', "Please fill Exam ID and Title");

        const examData = {
            id: examId,
            title,
            durationMinutes: parseInt(duration),
            questions,
            isArchived: false
        };

        try {
            await fetch('http://localhost:4001/api/exams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(examData)
            });
            showAlert('success', 'Success', 'Exam Saved Successfully!', () => {
                setActiveTab('exams');
                fetchExams();
                // Reset Form
                setExamId('');
                setTitle('');
                setQuestions([{ id: 1, section: 'General', text: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: 'A', marks: 4, imageUrl: '' }]);
                closeAlert();
            });
        } catch (e) {
            showAlert('error', 'Error', 'Error saving exam');
        }
    };

    const activeExams = exams.filter(e => !e.isArchived);
    const archivedExams = exams.filter(e => e.isArchived);
    const filteredResults = filterExamId ? results.filter(r => r.examId === filterExamId) : results;

    return (
        <div className="examiner-dashboard">
            <ExamAlert
                isOpen={alertConfig.isOpen}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                onConfirm={alertConfig.onConfirm}
                onClose={closeAlert}
            />

            {/* Sidebar */}
            <div className="sidebar">
                <div className="brand">Pariksha Mitra</div>
                <div className="nav-menu">
                    <div className={`nav-item ${activeTab === 'exams' ? 'active' : ''}`} onClick={() => { setActiveTab('exams'); setFilterExamId(null); }}>
                        Active Exams
                    </div>
                    <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => { setActiveTab('history'); setFilterExamId(null); }}>
                        Test History
                    </div>
                    <div className={`nav-item ${activeTab === 'results' ? 'active' : ''}`} onClick={() => { setActiveTab('results'); setFilterExamId(null); }}>
                        Student Results
                    </div>
                    <div className={`nav-item ${activeTab === 'create' ? 'active' : ''}`} onClick={() => {
                        setActiveTab('create');
                        setExamId(''); setTitle(''); setDuration(60);
                        setQuestions([{ id: 1, section: 'General', text: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: 'A', marks: 4, imageUrl: '' }]);
                    }}>
                        Create New
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="header">
                    <h1 className="page-title">
                        {activeTab === 'exams' && 'Active Examinations'}
                        {activeTab === 'history' && 'Archived Exams'}
                        {activeTab === 'results' && 'Student Results'}
                        {activeTab === 'create' && (examId && exams.find(e => e.id === examId) ? 'Edit Exam' : 'Create New Exam')}
                    </h1>
                    <button onClick={handleLogout} className="logout-btn">Log Out</button>
                </div>

                <div className="animate-fade-in">
                    {/* ACTIVE EXAMS TAB */}
                    {activeTab === 'exams' && (
                        <div className="grid-container">
                            {activeExams.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No active exams found.</p> : activeExams.map(e => (
                                <div key={e.id} className="glass-card">
                                    <div className="card-badge success">Active</div>
                                    <h3 className="card-title">{e.title}</h3>
                                    <div className="card-stats">
                                        <span>⏳ {e.durationMinutes} min</span>
                                        <span>❓ {e.questions.length} Qs</span>
                                    </div>
                                    <div className="card-actions">
                                        <button onClick={() => handleEdit(e)} className="action-btn btn-warning" style={{ background: '#f59e0b', color: 'white' }}>Edit</button>
                                        <button onClick={() => handleViewResults(e.id)} className="action-btn btn-primary">Results</button>
                                        <button onClick={() => handleArchive(e.id, true)} className="action-btn btn-danger">Archive</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* HISTORY TAB */}
                    {activeTab === 'history' && (
                        <div className="grid-container">
                            {archivedExams.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No archived exams.</p> : archivedExams.map(e => (
                                <div key={e.id} className="glass-card" style={{ opacity: 0.8 }}>
                                    <div className="card-badge" style={{ background: '#64748b' }}>Archived</div>
                                    <h3 className="card-title">{e.title}</h3>
                                    <div className="card-actions">
                                        <button onClick={() => handleEdit(e)} className="action-btn btn-secondary">View</button>
                                        <button onClick={() => handleViewResults(e.id)} className="action-btn btn-primary">Results</button>
                                        <button onClick={() => handleArchive(e.id, false)} className="action-btn success" style={{ background: '#10b981' }}>Restore</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* RESULTS TAB */}
                    {activeTab === 'results' && (
                        <div className="table-container">
                            {filterExamId && <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                                Showing results for: <strong>{filterExamId}</strong>
                                <button onClick={() => setFilterExamId(null)} style={{ marginLeft: '10px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear Filter</button>
                            </div>}
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Student Name</th>
                                        <th>Exam ID</th>
                                        <th>Score</th>
                                        <th>Date Submitted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredResults.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No results found.</td></tr> : filteredResults.map((r, i) => (
                                        <tr key={i}>
                                            <td>{r.candidateName || r.candidate || 'Unknown'}</td>
                                            <td>{r.examId}</td>
                                            <td style={{ color: '#4ade80', fontWeight: 'bold' }}>{r.score}</td>
                                            <td>{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* CREATE / EDIT TAB */}
                    {activeTab === 'create' && (
                        <div className="form-card">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Exam ID (Unique)</label>
                                    <input className="modern-input" value={examId} onChange={e => setExamId(e.target.value)} placeholder="e.g. math-101" disabled={!!exams.find(e => e.id === examId && activeTab === 'create' && title !== '')} />
                                </div>
                                <div className="form-group">
                                    <label>Exam Title</label>
                                    <input className="modern-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Math Final" />
                                </div>
                                <div className="form-group">
                                    <label>Duration (Minutes)</label>
                                    <input className="modern-input" type="number" value={duration} onChange={e => setDuration(e.target.value)} />
                                </div>
                            </div>

                            <hr style={{ borderColor: 'var(--glass-border)', margin: '2rem 0', opacity: 0.5 }} />

                            {questions.map((q, idx) => (
                                <div key={idx} className="question-block">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <h4 style={{ margin: 0, color: 'var(--primary)' }}>Question {idx + 1}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Correct Answer:</label>
                                            <select
                                                className="modern-input"
                                                style={{ width: 'auto', padding: '0.25rem 0.5rem' }}
                                                value={q.correctAnswer}
                                                onChange={e => updateQuestion(idx, 'correctAnswer', e.target.value)}
                                            >
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </select>
                                        </div>
                                    </div>

                                    <textarea
                                        className="modern-input"
                                        style={{ height: '80px', marginBottom: '1rem', resize: 'vertical' }}
                                        placeholder="Enter question text..."
                                        value={q.text}
                                        onChange={e => updateQuestion(idx, 'text', e.target.value)}
                                    />

                                    {/* Image Upload Area */}
                                    <div className="image-preview-area">
                                        <div style={{ flex: 1 }}>
                                            <label className="upload-label">
                                                📷 Upload Image
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e.target.files[0], idx)}
                                                />
                                            </label>
                                            <input
                                                className="modern-input"
                                                style={{ marginTop: '10px', fontSize: '12px' }}
                                                placeholder="Or paste image URL..."
                                                value={q.imageUrl || ''}
                                                onChange={e => updateQuestion(idx, 'imageUrl', e.target.value)}
                                            />
                                        </div>
                                        {q.imageUrl && (
                                            <div style={{ position: 'relative' }}>
                                                <img src={q.imageUrl} alt="preview" style={{ height: '80px', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
                                                <button
                                                    onClick={() => updateQuestion(idx, 'imageUrl', '')}
                                                    style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', width: '20px', height: '20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                        <input className="modern-input" placeholder="Option A" value={q.options.A} onChange={e => updateOption(idx, 'A', e.target.value)} />
                                        <input className="modern-input" placeholder="Option B" value={q.options.B} onChange={e => updateOption(idx, 'B', e.target.value)} />
                                        <input className="modern-input" placeholder="Option C" value={q.options.C} onChange={e => updateOption(idx, 'C', e.target.value)} />
                                        <input className="modern-input" placeholder="Option D" value={q.options.D} onChange={e => updateOption(idx, 'D', e.target.value)} />
                                    </div>
                                </div>
                            ))}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button onClick={addQuestion} className="action-btn btn-secondary" style={{ maxWidth: '200px' }}>+ Add Question</button>
                                <button onClick={handleCreate} className="action-btn btn-primary" style={{ maxWidth: '200px' }}>{examId && exams.find(e => e.id === examId) ? 'Update Exam' : 'Save & Publish'}</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

