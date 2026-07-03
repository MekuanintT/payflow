import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import * as authApi from '../../api/auth.api';
import { useTheme } from '../../context/ThemeContext';
import { Lock, Eye, EyeOff, Users, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Reset link is invalid or missing a token.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const res = await authApi.resetPassword(token, newPassword);
            if (res.success) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 2500);
            } else {
                setError(res.message || 'Failed to reset password.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden"
            style={{
                backgroundImage:
                    theme === 'dark'
                        ? `linear-gradient(to bottom right, rgba(43,43,43,0.85), rgba(212,212,212,0.55)), url('https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1920&q=80')`
                        : `linear-gradient(to bottom right, rgba(255,255,255,0.55), rgba(43,43,43,0.85)), url('https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1920&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            }}
        >
            <div className="w-full max-w-md rounded-2xl p-8 border-0 bg-white dark:bg-[#2B2B2B] shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-[#2B2B2B] dark:bg-[#B3B3B3]">
                        <Users size={24} className="text-white dark:text-[#2B2B2B]" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg leading-none text-[#2B2B2B] dark:text-white">HRMS</h2>
                        <p className="text-xs text-[#2B2B2B]/70 dark:text-[#D4D4D4]">PayFlow</p>
                    </div>
                </div>

                {success ? (
                    <div className="text-center py-6 space-y-3">
                        <CheckCircle2 size={40} className="mx-auto text-[#2B2B2B] dark:text-white" />
                        <h3 className="text-xl font-bold text-[#2B2B2B] dark:text-white">Password Reset</h3>
                        <p className="text-sm text-[#B3B3B3] dark:text-[#D4D4D4]">
                            Your password has been updated. Redirecting to login...
                        </p>
                    </div>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-[#2B2B2B] dark:text-white mb-1">Reset Password</h1>
                        <p className="text-sm text-[#B3B3B3] dark:text-[#D4D4D4] mb-6">
                            Enter a new password for your account.
                        </p>

                        {!token && (
                            <p className="text-sm rounded-lg px-3 py-2 mb-4 text-[#2B2B2B] bg-[#D4D4D4] border border-[#B3B3B3] dark:text-white dark:bg-[#1f1f1f] dark:border-[#B3B3B3]/50">
                                This reset link is missing a token. Please request a new one from the login page.
                            </p>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="newPassword" className="text-[#2B2B2B] dark:text-[#D4D4D4]">New Password</Label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B3B3B3]" />
                                    <Input
                                        id="newPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                        className="pl-10 pr-10 border-[#D4D4D4] dark:border-[#B3B3B3]/40 text-[#2B2B2B] dark:text-white dark:bg-[#1f1f1f]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(prev => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B3B3B3]"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="confirmPassword" className="text-[#2B2B2B] dark:text-[#D4D4D4]">Confirm Password</Label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B3B3B3]" />
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                        className="pl-10 border-[#D4D4D4] dark:border-[#B3B3B3]/40 text-[#2B2B2B] dark:text-white dark:bg-[#1f1f1f]"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm rounded-lg px-3 py-2 text-[#2B2B2B] bg-[#D4D4D4] border border-[#B3B3B3] dark:text-white dark:bg-[#1f1f1f] dark:border-[#B3B3B3]/50">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={loading || !token}
                                className="w-full font-semibold py-5 rounded-lg hover:opacity-90 disabled:opacity-60 bg-[#2B2B2B] text-white dark:bg-white dark:text-[#2B2B2B]"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </form>

                        <p className="text-center text-sm pt-5 text-[#B3B3B3]">
                            <Link to="/login" className="font-medium hover:underline text-[#2B2B2B] dark:text-white">
                                Back to Login
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}