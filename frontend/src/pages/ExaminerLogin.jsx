import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ExaminerLogin() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', password: '', name: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

        try {
            const res = await fetch(`http://localhost:4001${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Something went wrong');

            if (isLogin) {
                localStorage.setItem('examiner_token', data.token);
                localStorage.setItem('examiner_name', data.name);
                navigate('/examiner');
            } else {
                setIsLogin(true); // Switch to login after register
                setError('Registration successful! Please login.');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="water-glass-bg">
            <div className="water-glass-card animate-enter">
                <h2 className="text-center" style={{ marginBottom: '2rem', color: '#1e293b' }}>
                    Pariksha Mitra {isLogin ? 'Admin' : 'Registration'}
                </h2>

                {error && (
                    <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', border: '1px solid #fecaca' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex-col gap-4">
                    {!isLogin && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Full Name</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required={!isLogin}
                                placeholder="Dr. Name"
                            />
                        </div>
                    )}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Username</label>
                        <input
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            required
                            placeholder="Username"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        {isLogin ? 'Login Dashboard' : 'Create Account'}
                    </button>
                </form>

                <div className="text-center" style={{ marginTop: '2rem' }}>
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                        {isLogin ? "New Examiner? " : "Existing User? "}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
                        >
                            {isLogin ? 'Register' : 'Login'}
                        </button>
                    </p>
                    <div style={{ marginTop: '1rem' }}>
                        <a href="/" style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'underline' }}>Back to Student Portal</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
