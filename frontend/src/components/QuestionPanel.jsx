import React from 'react'

export default function QuestionPanel({ question, answer }) {
    if (!question) return <div className="empty">Loading question...</div>

    return (
        <div className="panel-card">
            <div className="question-header">
                <span>Question {question.id}</span>
                <span>Marks: {question.marks}</span>
            </div>

            <div className="q-body">
                <div className="question-text">{question.text}</div>
                {question.imageUrl && (
                    <div style={{ margin: '1rem 0', textAlign: 'center' }}>
                        {/* Debug: {question.imageUrl} */}
                        <img
                            key={question.imageUrl}
                            src={question.imageUrl}
                            alt="Question Illustration"
                            style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'contain' }}
                            onError={(e) => { e.target.style.display = 'none'; console.error("Image failed to load:", question.imageUrl); }}
                        />
                    </div>
                )}
                <div className="options-grid">
                    {['A', 'B', 'C', 'D'].map((k) => (
                        <div key={k} className={`option-item ${answer === k ? 'selected' : ''}`}>
                            <div className="option-marker">{k}</div>
                            <div className="opt-text">{question.options && question.options[k]}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
