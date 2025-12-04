import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExamAlert from '../components/ExamAlert';

export default function ExaminerDashboard() {
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const [activeTab, setActiveTab] = useState('exams'); // exams | history | results | create

    // Form State
    const [examId, setExamId] = useState('');
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(60);
    const [questions, setQuestions] = useState([
        { id: 1, section: 'General', text: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: 'A', marks: 4 }
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

    const fetchExams = () => fetch('http://localhost:4000/api/exams').then(r => r.json()).then(setExams);
    const fetchResults = () => fetch('http://localhost:4000/api/results').then(r => r.json()).then(setResults);

    const addQuestion = () => {
        setQuestions([...questions, {
            id: questions.length + 1,
            section: 'General',
            text: '',
            options: { A: '', B: '', C: '', D: '' },
            correctAnswer: 'A',
            marks: 4
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
                await fetch(`http://localhost:4000/api/exams/${id}/${action}`, { method: 'PUT' });
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
            await fetch('http://localhost:4000/api/exams', {
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
                setQuestions([{ id: 1, section: 'General', text: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: 'A', marks: 4 }]);
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
        <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter' }}>
            <ExamAlert
                isOpen={alertConfig.isOpen}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                onConfirm={alertConfig.onConfirm}
                onClose={closeAlert}
            />

            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h1 style={{ color: '#0f172a', marginBottom: '30px' }}>Examiner Dashboard</h1>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                    <button onClick={() => { setActiveTab('exams'); setFilterExamId(null); }} style={tabStyle(activeTab === 'exams')}>Active Exams</button>
                    <button onClick={() => { setActiveTab('history'); setFilterExamId(null); }} style={tabStyle(activeTab === 'history')}>Test History</button>
                    <button onClick={() => { setActiveTab('results'); setFilterExamId(null); }} style={tabStyle(activeTab === 'results')}>Student Results</button>
                    <button onClick={() => {
                        setActiveTab('create');
                        setExamId(''); setTitle(''); setDuration(60);
                        setQuestions([{ id: 1, section: 'General', text: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: 'A', marks: 4 }]);
                    }} style={tabStyle(activeTab === 'create')}>Create New Exam</button>
                </div>

                {activeTab === 'exams' && (
                    <div style={cardGrid}>
                        {activeExams.length === 0 ? <p>No active exams.</p> : activeExams.map(e => (
                            <div key={e.id} style={cardStyle}>
                                <h3>{e.title}</h3>
                                <p>Duration: {e.durationMinutes} mins</p>
                                <p>Questions: {e.questions.length}</p>
                                <code style={{ background: '#eee', padding: '4px', display: 'block', marginBottom: '10px' }}>ID: {e.id}</code>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <button onClick={() => handleEdit(e)} style={{ ...btnStyle, background: '#f59e0b', padding: '8px 16px', fontSize: '12px' }}>Edit</button>
                                    <button onClick={() => handleViewResults(e.id)} style={{ ...btnStyle, background: '#3b82f6', padding: '8px 16px', fontSize: '12px' }}>Results</button>
                                    <button onClick={() => handleArchive(e.id, true)} style={{ ...btnStyle, background: '#ef4444', padding: '8px 16px', fontSize: '12px' }}>Archive</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div style={cardGrid}>
                        {archivedExams.length === 0 ? <p>No archived exams.</p> : archivedExams.map(e => (
                            <div key={e.id} style={{ ...cardStyle, background: '#f1f5f9' }}>
                                <h3 style={{ color: '#64748b' }}>{e.title} (Archived)</h3>
                                <p>Questions: {e.questions.length}</p>
                                <code style={{ background: '#e2e8f0', padding: '4px', display: 'block', marginBottom: '10px' }}>ID: {e.id}</code>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleEdit(e)} style={{ ...btnStyle, background: '#64748b', padding: '8px 16px', fontSize: '12px' }}>View Questions</button>
                                    <button onClick={() => handleViewResults(e.id)} style={{ ...btnStyle, background: '#3b82f6', padding: '8px 16px', fontSize: '12px' }}>Results</button>
                                    <button onClick={() => handleArchive(e.id, false)} style={{ ...btnStyle, background: '#10b981', padding: '8px 16px', fontSize: '12px' }}>Unarchive</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'results' && (
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        {filterExamId && <h3 style={{ marginBottom: '20px' }}>Results for Exam: {filterExamId} <button onClick={() => setFilterExamId(null)} style={{ fontSize: '12px', color: 'blue', border: 'none', background: 'none', cursor: 'pointer' }}>(Clear Filter)</button></h3>}
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                    <th style={{ padding: '12px' }}>Student</th>
                                    <th style={{ padding: '12px' }}>Exam ID</th>
                                    <th style={{ padding: '12px' }}>Score</th>
                                    <th style={{ padding: '12px' }}>Submitted At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredResults.length === 0 ? <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>No results found.</td></tr> : filteredResults.map((r, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px' }}>{r.candidateName || r.candidate || 'Unknown'}</td>
                                        <td style={{ padding: '12px' }}>{r.examId}</td>
                                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#16a34a' }}>{r.score}</td>
                                        <td style={{ padding: '12px' }}>{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'create' && (
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <h3>{examId ? (exams.find(e => e.id === examId)?.isArchived ? 'View Archived Exam' : 'Edit Exam') : 'Create New Exam'}</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <label style={labelStyle}>Exam ID (Unique)</label>
                                <input style={inputStyle} value={examId} onChange={e => setExamId(e.target.value)} placeholder="e.g. math-101" disabled={!!exams.find(e => e.id === examId && activeTab === 'create' && title !== '')} />
                            </div>
                            <div>
                                <label style={labelStyle}>Exam Title</label>
                                <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Math Final" />
                            </div>
                            <div>
                                <label style={labelStyle}>Duration (Minutes)</label>
                                <input style={inputStyle} type="number" value={duration} onChange={e => setDuration(e.target.value)} />
                            </div>
                        </div>

                        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

                        {questions.map((q, idx) => (
                            <div key={idx} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h4 style={{ margin: 0 }}>Question {idx + 1}</h4>
                                    <div>
                                        <label style={{ marginRight: '10px', fontSize: '14px', color: '#64748b' }}>Correct Answer:</label>
                                        <select
                                            style={{ padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                            value={q.correctAnswer}
                                            onChange={e => updateQuestion(idx, 'correctAnswer', e.target.value)}
                                        >
                                            <option value="A">Option A</option>
                                            <option value="B">Option B</option>
                                            <option value="C">Option C</option>
                                            <option value="D">Option D</option>
                                        </select>
                                    </div>
                                </div>
                                <textarea
                                    style={{ ...inputStyle, height: '60px', marginBottom: '10px' }}
                                    placeholder="Enter question text..."
                                    value={q.text}
                                    onChange={e => updateQuestion(idx, 'text', e.target.value)}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <input style={inputStyle} placeholder="Option A" value={q.options.A} onChange={e => updateOption(idx, 'A', e.target.value)} />
                                    <input style={inputStyle} placeholder="Option B" value={q.options.B} onChange={e => updateOption(idx, 'B', e.target.value)} />
                                    <input style={inputStyle} placeholder="Option C" value={q.options.C} onChange={e => updateOption(idx, 'C', e.target.value)} />
                                    <input style={inputStyle} placeholder="Option D" value={q.options.D} onChange={e => updateOption(idx, 'D', e.target.value)} />
                                </div>
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={addQuestion} style={{ ...btnStyle, background: '#64748b' }}>+ Add Question</button>
                            <button onClick={handleCreate} style={{ ...btnStyle, background: '#16a34a' }}>{examId && exams.find(e => e.id === examId) ? 'Update Exam' : 'Save & Publish Exam'}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const tabStyle = (active) => ({
    padding: '10px 20px',
    background: active ? '#3b82f6' : 'white',
    color: active ? 'white' : '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
});

const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '14px', color: '#64748b', fontWeight: '500' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' };
const btnStyle = { padding: '12px 24px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' };
const cardGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' };
const cardStyle = { background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' };

