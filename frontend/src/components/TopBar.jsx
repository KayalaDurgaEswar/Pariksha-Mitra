import React from 'react'

function formatTime(s) {
    const mm = Math.floor(s / 60)
    const ss = s % 60
    return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
}

export default function TopBar({ title, candidate, timeLeft, questionNumber }) {
    return (
        <div className="topbar">
            <div className="top-left">
                <div className="title">Pariksha Mitra</div>
            </div>
            <div className="top-center">
                <div className="qn-number">Question No: {questionNumber ?? '-'}</div>
            </div>
            <div className="top-right" style={{ display: 'flex', alignItems: 'center' }}>
                <div className="candidate">{candidate || 'Student'}</div>
                <div className="timer">Time Left: {formatTime(timeLeft)}</div>
            </div>
        </div>
    )
}
