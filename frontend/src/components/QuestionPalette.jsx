import React from 'react'

export default function QuestionPalette({ questions, currentIndex, answers, statusMap, onGoto }) {
    return (
        <div className="palette-card">
            <div className="palette-header">Question Paper</div>
            <div className="palette-grid">
                {(questions || []).map((q, i) => {
                    const status = statusMap[q.id] || 'notVisited'
                    const cls = status === 'answered' ? 'green' : status === 'marked' ? 'purple' : (answers[q.id] ? 'green' : 'grey')
                    return (
                        <div key={q.id} className={`palette-item ${cls} ${i === currentIndex ? 'current' : ''}`} onClick={() => onGoto(i)}>
                            {q.id}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
