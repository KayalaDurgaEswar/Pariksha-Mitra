import React from 'react';

export default function ExamAlert({ isOpen, type = 'info', title, message, onClose, onConfirm, confirmText = 'OK' }) {
    if (!isOpen) return null;

    const isWarning = type === 'warning';
    const isError = type === 'error';
    const isSuccess = type === 'success';

    const headerColor = isWarning ? '#f59e0b' : isError ? '#ef4444' : isSuccess ? '#10b981' : '#3b82f6';
    const icon = isWarning ? '⚠️' : isError ? '🚫' : isSuccess ? '✅' : 'ℹ️';

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                width: '400px',
                maxWidth: '90%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
                animation: 'popIn 0.2s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    background: headerColor,
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <span style={{ fontSize: '24px' }}>{icon}</span>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '600' }}>{title}</h3>
                </div>

                {/* Body */}
                <div style={{ padding: '24px', color: '#334155', lineHeight: '1.6', fontSize: '15px' }}>
                    {message}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    borderTop: '1px solid #e2e8f0'
                }}>
                    {onConfirm && (
                        <button
                            onClick={onConfirm}
                            style={{
                                padding: '10px 20px',
                                background: headerColor,
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            {confirmText}
                        </button>
                    )}
                    {!onConfirm && onClose && (
                        <button
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                background: '#e2e8f0',
                                color: '#475569',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
