import { useNavigate } from 'react-router-dom';
import {
    Users, CalendarCheck, Wallet, CalendarOff,
    BarChart3, ShieldCheck, ArrowRight, CheckCircle2
} from 'lucide-react';
import { useState, useEffect } from 'react';

const features = [
    {
        icon: Users,
        title: 'Employee Management',
        description: 'Full workforce records — departments, positions, salaries, and avatars in one place.',
    },
    {
        icon: CalendarCheck,
        title: 'Attendance Tracking',
        description: 'Daily present, absent, late, and half-day records with monthly summaries per employee.',
    },
    {
        icon: CalendarOff,
        title: 'Leave Management',
        description: 'Approval workflows that automatically feed into payroll — no manual reconciliation.',
    },
    {
        icon: Wallet,
        title: 'Payroll Processing',
        description: 'Tax, pension, and absence deductions calculated automatically. PDF payslips on demand.',
    },
    {
        icon: BarChart3,
        title: 'Reports & Analytics',
        description: 'Headcount by department, payroll cost trends, leave statistics — all in visual charts.',
    },
    {
        icon: ShieldCheck,
        title: 'Role-Based Access',
        description: 'Super Admin, HR Manager, and Employee — each sees only what they need.',
    },
];

const stats = [
    { value: 'ETB', label: 'Native currency support' },
    { value: '3', label: 'Access levels' },
    { value: 'PDF', label: 'Instant payslips' },
    { value: '∞', label: 'Employees supported' },
];

const checks = [
    'Automated salary calculations',
    'Leave-aware payroll deductions',
    'PDF payslip generation',
    'Email notifications',
    'Company branding on payslips',
    'Attendance summary by month',
];

function BlinkingCursor() {
    const [visible, setVisible] = useState(true);
    useEffect(() => {
        const interval = setInterval(() => setVisible(v => !v), 530);
        return () => clearInterval(interval);
    }, []);
    return (
        <span style={{
            display: 'inline-block',
            width: '3px',
            height: '0.85em',
            background: '#D4D4D4',
            marginLeft: '6px',
            verticalAlign: 'middle',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.1s',
            borderRadius: '1px',
        }} />
    );
}

export default function LandingPage() {
    const navigate = useNavigate();

    const BG = '#2B2B2B';
    const SURFACE = '#333333';
    const BORDER = '#3D3D3D';
    const WHITE = '#FFFFFF';
    const SILVER = '#D4D4D4';
    const MUTED = '#B3B3B3';
    const DIM = '#6B6B6B';

    return (
        <div style={{ background: BG, minHeight: '100vh', color: WHITE, fontFamily: 'Inter, sans-serif' }}>

            {/* Nav */}
            <nav style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 48px',
                borderBottom: `1px solid ${BORDER}`,
                position: 'sticky',
                top: 0,
                background: 'rgba(43,43,43,0.92)',
                backdropFilter: 'blur(12px)',
                zIndex: 50,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        height: 32, width: 32, borderRadius: 8,
                        background: SILVER,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Wallet size={15} color={BG} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px', color: WHITE }}>PayFlow</span>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    style={{
                        background: 'transparent',
                        border: `1px solid ${BORDER}`,
                        color: MUTED,
                        padding: '8px 20px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 500,
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = SILVER;
                        e.currentTarget.style.color = WHITE;
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = BORDER;
                        e.currentTarget.style.color = MUTED;
                    }}
                >
                    Sign In <ArrowRight size={14} />
                </button>
            </nav>

            {/* Hero */}
            <section style={{ padding: '100px 48px 80px', maxWidth: 900, margin: '0 auto' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(212,212,212,0.06)',
                    border: `1px solid ${BORDER}`,
                    borderRadius: 100,
                    padding: '5px 14px',
                    marginBottom: 36,
                }}>
                    <span style={{
                        height: 6, width: 6, borderRadius: '50%',
                        background: SILVER,
                        display: 'inline-block',
                    }} />
                    <span style={{ fontSize: 12, color: MUTED, fontWeight: 500, letterSpacing: '0.06em' }}>
                        HR & PAYROLL PLATFORM
                    </span>
                </div>

                <h1 style={{
                    fontSize: 'clamp(40px, 6vw, 72px)',
                    fontWeight: 900,
                    lineHeight: 1.05,
                    letterSpacing: '-2px',
                    margin: '0 0 8px',
                    color: WHITE,
                }}>
                    Payroll, done
                </h1>
                <h1 style={{
                    fontSize: 'clamp(40px, 6vw, 72px)',
                    fontWeight: 900,
                    lineHeight: 1.05,
                    letterSpacing: '-2px',
                    margin: '0 0 32px',
                    color: SILVER,
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    right.
                    <BlinkingCursor />
                </h1>

                <p style={{
                    fontSize: 18,
                    color: MUTED,
                    fontWeight: 300,
                    maxWidth: 520,
                    lineHeight: 1.7,
                    marginBottom: 44,
                }}>
                    PayFlow automates salary calculations, attendance tracking, leave approvals, and PDF payslips — built for Ethiopian businesses.
                </p>

                <button
                    onClick={() => navigate('/login')}
                    style={{
                        background: WHITE,
                        color: BG,
                        border: 'none',
                        padding: '14px 28px',
                        borderRadius: 10,
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = SILVER}
                    onMouseLeave={e => e.currentTarget.style.background = WHITE}
                >
                    Sign in to PayFlow <ArrowRight size={16} />
                </button>
            </section>

            {/* Stats strip */}
            <section style={{
                borderTop: `1px solid ${BORDER}`,
                borderBottom: `1px solid ${BORDER}`,
                padding: '32px 48px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                maxWidth: 900,
                margin: '0 auto',
            }}>
                {stats.map((stat, i) => (
                    <div key={stat.label} style={{
                        textAlign: 'center',
                        padding: '0 24px',
                        borderRight: i < stats.length - 1 ? `1px solid ${BORDER}` : 'none',
                    }}>
                        <p style={{
                            fontSize: 28,
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            color: WHITE,
                            margin: '0 0 4px',
                            letterSpacing: '-1px',
                        }}>{stat.value}</p>
                        <p style={{ fontSize: 12, color: DIM, margin: 0, fontWeight: 400 }}>{stat.label}</p>
                    </div>
                ))}
            </section>

            {/* Features */}
            <section style={{ padding: '96px 48px', maxWidth: 1100, margin: '0 auto' }}>
                <p style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
                    color: DIM, marginBottom: 16, textTransform: 'uppercase',
                }}>
                    Platform
                </p>
                <h2 style={{
                    fontSize: 'clamp(24px, 3vw, 36px)',
                    fontWeight: 800,
                    letterSpacing: '-0.8px',
                    marginBottom: 56,
                    color: WHITE,
                }}>
                    One system for your entire HR operation
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 1,
                    background: BORDER,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 16,
                    overflow: 'hidden',
                }}>
                    {features.map(({ icon: Icon, title, description }) => (
                        <div
                            key={title}
                            style={{
                                background: BG,
                                padding: '32px',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = SURFACE}
                            onMouseLeave={e => e.currentTarget.style.background = BG}
                        >
                            <div style={{
                                height: 40, width: 40,
                                borderRadius: 10,
                                background: 'rgba(212,212,212,0.08)',
                                border: `1px solid ${BORDER}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 20,
                            }}>
                                <Icon size={18} color={SILVER} />
                            </div>
                            <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, color: WHITE }}>{title}</h3>
                            <p style={{ fontSize: 13, color: DIM, lineHeight: 1.65, margin: 0 }}>{description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Checklist section */}
            <section style={{
                padding: '0 48px 96px',
                maxWidth: 1100,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 80,
                alignItems: 'center',
            }}>
                <div>
                    <p style={{
                        fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
                        color: DIM, marginBottom: 16, textTransform: 'uppercase',
                    }}>
                        What's included
                    </p>
                    <h2 style={{
                        fontSize: 'clamp(22px, 2.5vw, 32px)',
                        fontWeight: 800,
                        letterSpacing: '-0.6px',
                        marginBottom: 16,
                        color: WHITE,
                        lineHeight: 1.2,
                    }}>
                        Built to cover every step of the payroll cycle
                    </h2>
                    <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, marginBottom: 32, fontWeight: 300 }}>
                        From marking attendance to signing off payroll, PayFlow handles the full cycle so nothing falls through the cracks.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'transparent',
                            border: `1px solid ${BORDER}`,
                            color: SILVER,
                            padding: '12px 24px',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            transition: 'border-color 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = SILVER}
                        onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
                    >
                        Open PayFlow <ArrowRight size={14} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {checks.map((item) => (
                        <div key={item} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '14px 18px',
                            background: SURFACE,
                            borderRadius: 10,
                            border: `1px solid ${BORDER}`,
                        }}>
                            <CheckCircle2 size={15} color={SILVER} style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: 14, color: MUTED, fontWeight: 400 }}>{item}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={{
                margin: '0 auto 96px',
                maxWidth: 1004,
                padding: '0 48px',
            }}>
                <div style={{
                    borderRadius: 20,
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                    padding: '72px 64px',
                    textAlign: 'center',
                }}>
                    <h2 style={{
                        fontSize: 'clamp(24px, 3vw, 40px)',
                        fontWeight: 800,
                        letterSpacing: '-0.8px',
                        marginBottom: 16,
                        color: WHITE,
                    }}>
                        Your HR team is waiting.
                    </h2>
                    <p style={{ fontSize: 16, color: MUTED, marginBottom: 36, fontWeight: 300 }}>
                        Sign in and start running payroll the right way.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: WHITE,
                            color: BG,
                            border: 'none',
                            padding: '16px 36px',
                            borderRadius: 12,
                            fontSize: 15,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = SILVER}
                        onMouseLeave={e => e.currentTarget.style.background = WHITE}
                    >
                        Sign in to PayFlow <ArrowRight size={16} />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                borderTop: `1px solid ${BORDER}`,
                padding: '24px 48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        height: 24, width: 24, borderRadius: 6,
                        background: SILVER,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Wallet size={11} color={BG} />
                    </div>
                    <span style={{ fontSize: 13, color: MUTED, fontWeight: 600 }}>PayFlow</span>
                </div>
                <p style={{ fontSize: 12, color: DIM, margin: 0 }}>
                    © {new Date().getFullYear()} PayFlow. Built for Ethiopian HR teams.
                </p>
            </footer>
        </div>
    );
}