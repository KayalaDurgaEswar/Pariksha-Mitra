import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import QuestionPanel from '../components/QuestionPanel'
import QuestionPalette from '../components/QuestionPalette'
import TopBar from '../components/TopBar'
import HandGestureEngine from '../components/HandGestureEngine'
import VoiceEngine from '../components/VoiceEngine'
import ExamAlert from '../components/ExamAlert'
import '../styles/exam.css'

export default function ExamPage({ examData, candidateName }) {
    // Fallback to localStorage if prop is missing (double safety)
    const effectiveCandidateName = candidateName || localStorage.getItem('candidateName') || 'Student'
    const [questions, setQuestions] = useState(examData?.questions || [])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState({}) // {questionId: 'A' }
    const [statusMap, setStatusMap] = useState({}) // visited/answered/marked
    const [timeLeft, setTimeLeft] = useState((examData?.durationMinutes || 60) * 60)
    const voiceRef = useRef(null)
    const navigate = useNavigate()

    // Alert State
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'info', title: '', message: '' });

    const showAlert = (type, title, message, onConfirm = null) => {
        setAlertConfig({ isOpen: true, type, title, message, onConfirm });
    };

    const closeAlert = () => {
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(() => {
        // Request full screen
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.log("Full screen denied", err));
        }

        if (examData) {
            setQuestions(examData.questions || [])
            // Reset timer explicitly
            setTimeLeft((examData.durationMinutes || 60) * 60)

            // init statusMap
            const map = {}
            const qs = examData.questions || []
            qs.forEach((q) => (map[q.id] = 'notVisited'))
            setStatusMap(map)

            // Reset current index
            setCurrentIndex(0)
            // Reset answers
            setAnswers({})
        }
    }, [examData])

    useEffect(() => {
        if (questions.length > 0 && currentIndex >= 0) {
            const qid = questions[currentIndex].id
            setStatusMap((prev) => {
                if (prev[qid] === 'notVisited') {
                    return { ...prev, [qid]: 'notAnswered' }
                }
                return prev
            })
        }
    }, [currentIndex, questions])

    const submitTest = useCallback(async () => {
        console.log('Submitting test...')
        try {
            await fetch('http://localhost:4001/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    examId: examData.id,
                    candidateName: effectiveCandidateName,
                    answers,
                    score: 0 // Calculate on backend ideally
                })
            })
            showAlert('success', 'Exam Submitted', 'Your exam has been submitted successfully. You will be redirected shortly.', () => {
                navigate('/success', {
                    state: {
                        candidateName: effectiveCandidateName,
                        examId: examData.id,
                        submittedAt: new Date().toISOString()
                    }
                });
            });
        } catch (e) {
            console.error(e)
            showAlert('error', 'Submission Failed', 'There was an error submitting your test. Please try again.');
        }
    }, [answers, examData, effectiveCandidateName, navigate])

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(timer);
                    showAlert('warning', 'Time Up!', 'Your exam time has ended. Submitting automatically...', () => submitTest());
                    submitTest(); // Call immediately as well to be safe
                    return 0;
                }
                return t - 1;
            })
        }, 1000)
        return () => clearInterval(timer)
    }, []) // Removed submitTest from dependency array to avoid circular dependency/initialization issues

    // helpers
    console.log("ExamPage Render: Questions:", questions.length, "CurrentIndex:", currentIndex)
    const currQ = questions[currentIndex] || null

    const saveAnswer = useCallback((qid, opt) => {
        setAnswers((a) => ({ ...a, [qid]: opt }))
        setStatusMap((s) => ({ ...s, [qid]: 'answered' }))
    }, [])

    const clearAnswer = useCallback((qid) => {
        setAnswers((a) => {
            const copy = { ...a }
            delete copy[qid]
            return copy
        })
        setStatusMap((s) => ({ ...s, [qid]: 'notAnswered' }))
    }, [])

    const gotoNext = useCallback(() => {
        setCurrentIndex((i) => (i < questions.length - 1 ? i + 1 : i))
    }, [questions.length])

    const gotoPrev = useCallback(() => {
        setCurrentIndex((i) => (i > 0 ? i - 1 : i))
    }, [])

    const [submissionStage, setSubmissionStage] = useState('idle') // 'idle' | 'confirming'

    // Gesture callback mapping
    const onGestureAction = useCallback((action) => {
        if (!currQ) return
        const qid = currQ.id

        // Special handling for confirmation stage
        if (submissionStage === 'confirming') {
            if (action === 'submit_test') {
                // Confirmed
                closeAlert()
                submitTest()
                setSubmissionStage('idle')
            } else if (action === 'clear') {
                // Cancelled
                closeAlert()
                setSubmissionStage('idle')
                // No alert, just return to exam
            }
            return // Ignore other gestures while confirming
        }

        switch (action) {
            case 'option_A': saveAnswer(qid, 'A'); break
            case 'option_B': saveAnswer(qid, 'B'); break
            case 'option_C': saveAnswer(qid, 'C'); break
            case 'option_D': saveAnswer(qid, 'D'); break
            case 'save_next': saveAnswer(qid, answers[qid] || null); gotoNext(); break
            case 'submit_test':
                setSubmissionStage('confirming')
                showAlert('warning', 'Confirm Submission', 'Are you sure you want to submit? Show "OK" gesture again or say "Submit Test" to confirm. Show "FIST" or say "Clear" to cancel.', () => {
                    // Manual confirm click
                    submitTest()
                    setSubmissionStage('idle')
                })
                break
            case 'clear': clearAnswer(qid); break
            case 'next': gotoNext(); break
            case 'prev': gotoPrev(); break
            default: break
        }
    }, [currQ, questions, currentIndex, answers, saveAnswer, clearAnswer, gotoNext, gotoPrev, submitTest, submissionStage])

    // Voice command mapping (from VoiceEngine)
    const onVoiceCommand = useCallback((cmd) => {
        console.log("ExamPage received voice command:", cmd) // DEBUG
        const c = cmd.toLowerCase()
        if (c.includes('option a') || c.includes('select a')) {
            console.log("Matched Option A")
            onGestureAction('option_A')
        }
        else if (c.includes('option b') || c.includes('select b')) onGestureAction('option_B')
        else if (c.includes('option b') || c.includes('select b')) onGestureAction('option_B')
        else if (c.includes('option c') || c.includes('select c')) onGestureAction('option_C')
        else if (c.includes('option d') || c.includes('select d')) onGestureAction('option_D')
        else if (c.includes('next')) onGestureAction('next')
        else if (c.includes('previous') || c.includes('back')) onGestureAction('prev')
        else if (c.includes('submit test') || c.includes('submit exam') || c.includes('submit')) onGestureAction('submit_test')
        else if (c.includes('save')) onGestureAction('save_next')
        else if (c.includes('clear response') || c.includes('clear answer') || c.includes('clear')) onGestureAction('clear')
        else if (c.includes('go to question') || c.includes('goto question')) {
            const match = c.match(/question (\d+)/)
            if (match && match[1]) {
                const qNum = parseInt(match[1]) - 1
                if (qNum >= 0 && qNum < questions.length) setCurrentIndex(qNum)
            }
        }
    }, [onGestureAction, questions.length])

    const [warnings, setWarnings] = useState(0);
    const [isViolationOpen, setViolationOpen] = useState(false);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                const newWarnings = warnings + 1;
                setWarnings(newWarnings);
                setViolationOpen(true);

                if (newWarnings >= 3) {
                    showAlert('error', 'Malpractice Detected', 'You have switched tabs too many times. Your exam is being auto-submitted.', () => submitTest());
                    submitTest();
                }
            }
        };

        const handleFullScreenChange = () => {
            if (!document.fullscreenElement) {
                setViolationOpen(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullScreenChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        }
    }, [warnings, submitTest]);

    const handleResumeExam = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().then(() => {
                setViolationOpen(false);
            }).catch(err => {
                console.log("Full screen denied", err);
            });
        }
    };

    if (!questions || questions.length === 0) {
        return <div style={{ padding: 40, color: 'white' }}>No questions found in this exam.</div>
    }

    return (
        <div className="exam-root">
            {/* Security Violation Overlay */}
            {isViolationOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.95)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <h1 style={{ color: '#ef4444', fontSize: '3rem', marginBottom: '1rem' }}>⚠️ SECURITY ALERT</h1>
                    <p style={{ fontSize: '1.25rem', maxWidth: '600px', marginBottom: '2rem', color: '#e2e8f0' }}>
                        You have exited the secure examination environment.
                        This has been recorded as a violation attempt.
                        <br /><br />
                        Please click below to return to full-screen mode immediately.
                    </p>
                    <button
                        onClick={handleResumeExam}
                        style={{
                            padding: '1rem 2rem',
                            fontSize: '1.2rem',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            boxShadow: '0 0 20px rgba(37, 99, 235, 0.5)'
                        }}
                    >
                        RESUME EXAMINATION
                    </button>
                </div>
            )}

            <ExamAlert
                isOpen={alertConfig.isOpen}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                onConfirm={alertConfig.onConfirm}
                onClose={closeAlert}
                confirmText={alertConfig.type === 'success' ? 'Go to Home' : 'OK'}
            />

            <TopBar title={examData?.title || 'Exam'} candidate={effectiveCandidateName} timeLeft={timeLeft} questionNumber={currQ?.id} />

            {/* Warning Banner */}
            {warnings > 0 && (
                <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px', textAlign: 'center', borderBottom: '1px solid #fecaca', fontWeight: 'bold' }}>
                    ⚠️ Warning: Tab Switching / Exit Fullscreen Detected ({warnings}/3)
                </div>
            )}

            <div className="exam-body">
                <div className="question-area">
                    <QuestionPanel question={currQ} answer={answers[currQ?.id]} />
                    <div className="controls" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button className="btn btn-primary" onClick={() => { saveAnswer(currQ.id, answers[currQ.id] || null); gotoNext() }}>Save & Next</button>
                        <button className="btn btn-secondary" onClick={() => clearAnswer(currQ.id)}>Clear Response</button>
                        <div style={{ flex: 1 }}></div>
                        <button className="btn btn-danger" onClick={submitTest}>Submit Test</button>
                    </div>
                </div>

                <div className="palette-area">
                    <QuestionPalette questions={questions} currentIndex={currentIndex} answers={answers} statusMap={statusMap} onGoto={(i) => setCurrentIndex(i)} />
                </div>
            </div>

            {/* Gesture & Voice Engines */}
            <HandGestureEngine
                onAction={onGestureAction}
                questStats={{
                    total: questions.length,
                    answered: Object.keys(answers).length,
                    // Logic matches palette: 
                    // Answered = count of answers
                    // Not Answered = Visited - Answered
                    // Not Visited = Total - Visited
                    // We can use the statusMap directly
                    notAnswered: questions.filter(q => statusMap[q.id] === 'notAnswered' && !answers[q.id]).length,
                    notVisited: questions.length - Object.keys(answers).length - questions.filter(q => statusMap[q.id] === 'notAnswered').length,
                    // Note: This logic can be refined. Usually simplifed to:
                    // Answered = answers count
                    // Not Answered = visited - answered
                    // Not Visited = total - visited
                    // But statusMap explicitly tracks 'notAnswered' when cleared.
                    // Let's explicitly pass the map instead for perfect sync or calculate here.
                    // To match the Palette logic exactly:
                    currentQ: currQ?.id
                }}
                statusMap={statusMap}
                answers={answers}
                questions={questions}
            />
            <VoiceEngine ref={voiceRef} onCommand={onVoiceCommand} />
        </div>
    )
}
