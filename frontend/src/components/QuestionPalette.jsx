import React from 'react'

export default function QuestionPalette({ questions, currentIndex, answers, statusMap, onGoto }) {
    return (
        <div className="panel-card palette-card">
            <div className="palette-header">
                <h3>Question Navigator</h3>
            </div>
            <div className="palette-grid">
                {(questions || []).map((q, i) => {
                    const status = statusMap[q.id] || 'notVisited'
                    const isAnswered = status === 'answered' || answers[q.id];
                    const isCurrent = i === currentIndex;
                    // Only show Red (not-answered) if it's NOT the current question
                    const cls = isAnswered ? 'answered' : (status === 'notAnswered' && !isCurrent) ? 'not-answered' : 'not-visited';

                    return (
                        <div key={q.id} className={`palette-btn ${cls} ${i === currentIndex ? 'current' : ''}`} onClick={() => onGoto(i)}>
                            {q.id}
                        </div>
                    )
                })}
            </div>


        </div>
    )
}
