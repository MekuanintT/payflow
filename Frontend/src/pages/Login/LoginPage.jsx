import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import * as authApi from '../../api/auth.api';
import { Mail, Lock, Eye, EyeOff, Users, CalendarCheck, Wallet, Sun, Moon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog';

// Palette: #FFFFFF / #D4D4D4 / #2B2B2B / #B3B3B3 — mapped per-mode via Tailwind `dark:` variants,
// driven by the `dark` class that ThemeProvider toggles on <html>.

export default function LoginPage() {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [forgotOpen, setForgotOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotMessage, setForgotMessage] = useState('');
    const [forgotError, setForgotError] = useState('');

    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await login(email, password);
            if (res.success) {
                navigate('/dashboard');
            } else {
                setError(res.message || 'Login failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function handleForgotSubmit(e) {
        e.preventDefault();
        setForgotError('');
        setForgotMessage('');
        setForgotLoading(true);
        try {
            const res = await authApi.forgotPassword(forgotEmail);
            if (res.success) {
                setForgotMessage(res.message || 'If that email exists, a reset link has been sent.');
            } else {
                setForgotError(res.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            setForgotError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setForgotLoading(false);
        }
    }

    return (
        <div
            className="min-h-screen w-full flex flex-col justify-between p-12 relative overflow-hidden"
            style={{
                backgroundImage:
                    theme === 'dark'
                        ? `linear-gradient(to bottom right, rgba(43,43,43,0.85),  rgba(212,212,212,0.55)), url('https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1920&q=80')`
                        : `linear-gradient(to bottom right, rgba(255,255,255,0.55), rgba(43,43,43,0.85)), url('https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1920&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            }}
        >
            {/* Decorative dots top-left */}
            <div className="absolute top-8 left-8 grid grid-cols-6 gap-2 opacity-30">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#2B2B2B] dark:bg-[#D4D4D4]" />
                ))}
            </div>

            {/* Decorative circle bottom-left */}
            <div className="absolute bottom-16 left-8 w-24 h-24 rounded-full opacity-30 border-2 border-[#2B2B2B] dark:border-[#B3B3B3]" />
            <div className="absolute bottom-8 left-16 w-4 h-4 rounded-full opacity-60 bg-[#2B2B2B] dark:bg-[#B3B3B3]" />

            {/* Decorative dots top-right */}
            <div className="absolute top-8 right-8 grid grid-cols-4 gap-2 opacity-20">
                {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#2B2B2B] dark:bg-[#D4D4D4]" />
                ))}
            </div>

            {/* Top bar: logo + theme toggle + Sign In trigger */}
            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#2B2B2B] dark:bg-[#B3B3B3]">
                        <Users size={28} className="text-white dark:text-[#2B2B2B]" />
                    </div>
                    <div>
                        <h2 className="font-bold text-xl leading-none text-[#2B2B2B] dark:text-white">HRMS</h2>
                        <p className="text-xs text-[#2B2B2B]/70 dark:text-[#D4D4D4]">Human Resource Management System</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Theme toggle */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        className="p-2.5 rounded-lg border border-[#2B2B2B]/30 dark:border-[#B3B3B3]/50 text-[#2B2B2B] dark:text-[#D4D4D4] hover:bg-[#2B2B2B]/10 dark:hover:bg-[#FFFFFF]/10 transition-colors"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="font-semibold px-6 py-5 rounded-lg hover:opacity-90 bg-[#2B2B2B] text-white dark:bg-white dark:text-[#2B2B2B]">
                                Sign In
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-md rounded-2xl p-8 border-0 bg-white dark:bg-[#2B2B2B]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-[#2B2B2B] dark:text-white">
                                    Welcome Back
                                </DialogTitle>
                                <DialogDescription className="text-[#B3B3B3] dark:text-[#D4D4D4]">
                                    Sign in to your HRMS account
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                                {/* Email */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-[#2B2B2B] dark:text-[#D4D4D4]">Email</Label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B3B3B3]" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            required
                                            className="pl-10 border-[#D4D4D4] dark:border-[#B3B3B3]/40 text-[#2B2B2B] dark:text-white dark:bg-[#1f1f1f]"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="text-[#2B2B2B] dark:text-[#D4D4D4]">Password</Label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B3B3B3]" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="Enter your password"
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

                                {/* Remember me + Forgot password */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <Checkbox
                                            checked={remember}
                                            onCheckedChange={val => setRemember(!!val)}
                                            className="border-[#D4D4D4] dark:border-[#B3B3B3]/60"
                                        />
                                        <span className="text-sm text-[#2B2B2B] dark:text-[#D4D4D4]">Remember me</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOpen(false);
                                            setForgotEmail('');
                                            setForgotMessage('');
                                            setForgotError('');
                                            setForgotOpen(true);
                                        }}
                                        className="text-sm font-medium hover:underline text-[#2B2B2B] dark:text-white"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                {error && (
                                    <p className="text-sm rounded-lg px-3 py-2 text-[#2B2B2B] bg-[#D4D4D4] border border-[#B3B3B3] dark:text-white dark:bg-[#1f1f1f] dark:border-[#B3B3B3]/50">
                                        {error}
                                    </p>
                                )}

                                {/* Sign In button */}
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full font-semibold py-5 rounded-lg hover:opacity-90 disabled:opacity-60 bg-[#2B2B2B] text-white dark:bg-white dark:text-[#2B2B2B]"
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </Button>

                                {/* Contact admin */}
                                <p className="text-center text-sm pt-1 text-[#B3B3B3] dark:text-[#B3B3B3]">
                                    Don't have an account?{' '}
                                    <span className="font-medium cursor-pointer hover:underline text-[#2B2B2B] dark:text-white">
                                        Contact Administrator
                                    </span>
                                </p>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
                        <DialogContent className="sm:max-w-md rounded-2xl p-8 border-0 bg-white dark:bg-[#2B2B2B]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-[#2B2B2B] dark:text-white">
                                    Forgot Password
                                </DialogTitle>
                                <DialogDescription className="text-[#B3B3B3] dark:text-[#D4D4D4]">
                                    Enter your email and we'll send you a reset link.
                                </DialogDescription>
                            </DialogHeader>

                            {forgotMessage ? (
                                <div className="mt-2 space-y-4">
                                    <p className="text-sm rounded-lg px-3 py-2 text-[#2B2B2B] bg-[#D4D4D4] border border-[#B3B3B3] dark:text-white dark:bg-[#1f1f1f] dark:border-[#B3B3B3]/50">
                                        {forgotMessage}
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setForgotOpen(false);
                                            setOpen(true);
                                        }}
                                        className="w-full font-semibold py-5 rounded-lg hover:opacity-90 bg-[#2B2B2B] text-white dark:bg-white dark:text-[#2B2B2B]"
                                    >
                                        Back to Sign In
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleForgotSubmit} className="space-y-5 mt-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="forgotEmail" className="text-[#2B2B2B] dark:text-[#D4D4D4]">Email</Label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B3B3B3]" />
                                            <Input
                                                id="forgotEmail"
                                                type="email"
                                                value={forgotEmail}
                                                onChange={e => setForgotEmail(e.target.value)}
                                                placeholder="Enter your email"
                                                required
                                                className="pl-10 border-[#D4D4D4] dark:border-[#B3B3B3]/40 text-[#2B2B2B] dark:text-white dark:bg-[#1f1f1f]"
                                            />
                                        </div>
                                    </div>

                                    {forgotError && (
                                        <p className="text-sm rounded-lg px-3 py-2 text-[#2B2B2B] bg-[#D4D4D4] border border-[#B3B3B3] dark:text-white dark:bg-[#1f1f1f] dark:border-[#B3B3B3]/50">
                                            {forgotError}
                                        </p>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={forgotLoading}
                                        className="w-full font-semibold py-5 rounded-lg hover:opacity-90 disabled:opacity-60 bg-[#2B2B2B] text-white dark:bg-white dark:text-[#2B2B2B]"
                                    >
                                        {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                                    </Button>

                                    <p className="text-center text-sm pt-1 text-[#B3B3B3]">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setForgotOpen(false);
                                                setOpen(true);
                                            }}
                                            className="font-medium hover:underline text-[#2B2B2B] dark:text-white"
                                        >
                                            Back to Sign In
                                        </button>
                                    </p>
                                </form>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Main headline */}
            <div className="relative z-10 space-y-6 max-w-2xl">
                <div>
                    <h1 className="text-5xl font-bold leading-tight text-[#2B2B2B] dark:text-white">
                        Manage People.<br />
                        Streamline Processes.<br />
                        <span className="text-[#2B2B2B]/60 dark:text-[#B3B3B3]">Drive Success.</span>
                    </h1>
                    <p className="mt-4 text-base max-w-sm leading-relaxed text-[#2B2B2B]/80 dark:text-[#D4D4D4]">
                        A complete HR solution to manage employees, attendance, payroll, and performance —
                        all in one place.
                    </p>
                </div>

                {/* Feature icons */}
                <div className="flex items-center gap-10 pt-4">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="rounded-lg p-3 border border-[#2B2B2B]/30 dark:border-[#B3B3B3]">
                            <Users size={24} className="text-[#2B2B2B] dark:text-[#D4D4D4]" />
                        </div>
                        <span className="text-xs text-[#2B2B2B]/80 dark:text-[#D4D4D4]">Employee<br />Management</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="rounded-lg p-3 border border-[#2B2B2B]/30 dark:border-[#B3B3B3]">
                            <CalendarCheck size={24} className="text-[#2B2B2B] dark:text-[#D4D4D4]" />
                        </div>
                        <span className="text-xs text-[#2B2B2B]/80 dark:text-[#D4D4D4]">Attendance<br />Tracking</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="rounded-lg p-3 border border-[#2B2B2B]/30 dark:border-[#B3B3B3]">
                            <Wallet size={24} className="text-[#2B2B2B] dark:text-[#D4D4D4]" />
                        </div>
                        <span className="text-xs text-[#2B2B2B]/80 dark:text-[#D4D4D4]">Payroll<br />Management</span>
                    </div>
                </div>
            </div>

            {/* Bottom spacer */}
            <div className="relative z-10" />
        </div>
    );
}