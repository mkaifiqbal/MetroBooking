import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowRight, ShieldHalf } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const login = useAuthStore((s) => s.login);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password.');
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            const success = login(username.trim(), password);
            if (success) {
                navigate('/admin');
            } else {
                setError('Invalid username or password.');
                setIsLoading(false);
            }
        }, 500);
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md animate-fade-in-up">

                {/* header icon and title */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-green-500/15 flex items-center justify-center border border-green-500/20 mb-4 shadow-lg">
                        <ShieldHalf className="w-8 h-8 text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Login</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Enter your credentials to access the admin panel
                    </p>
                </div>

                {/* login form */}
                <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-5">

                    {/* error message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-fade-in-up">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* username field */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                            Username
                        </label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                className="metro-input"
                                autoFocus
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    {/* password field */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="metro-input"
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    {/* submit button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* hint for demo purposes */}
                <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
                    Demo credentials: <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>admin</span> / <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>admin123</span>
                </p>
            </div>
        </div>
    );
};
