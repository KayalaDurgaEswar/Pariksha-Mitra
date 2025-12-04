import React from 'react'

export default function QuestionPanel({ question, answer }) {
    if (!question) return <div className="empty">Loading question...</div>

    return (
        <div className="question-card">
            <div className="q-meta">
                <div className="q-type">MCQ Single</div>
                <div className="marks">Marks: {question.marks}</div>
            </div>

            <div className="q-body">
                <div className="q-text">{question.text}</div>
                <div className="q-figure"> {/* placeholder for figure */} </div>

                <div className="options">
                    {['A', 'B', 'C', 'D'].map((k) => (
                        <div key={k} className={`option ${answer === k ? 'selected' : ''}`}>
                            <div className="opt-letter">{k}.</div>
                            <div className="opt-text">{question.options && question.options[k]}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
