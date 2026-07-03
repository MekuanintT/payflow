import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Building2, CalendarCheck, CalendarOff, Wallet,
    ShieldUser, UserCircle, FileText, KeyRound, BarChart3, Settings, LogOut,
    Sun, Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '../ui/dropdown-menu';
import * as settingsApi from '../../api/settings.api';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

const reportsItem = { to: '/reports', label: 'Reports', icon: BarChart3 };

const superAdminOnlyItems = [
    { to: '/users', label: 'User Management', icon: ShieldUser },
];

/* -----------------------------
   NAV LINK STYLE
------------------------------*/
function linkClass({ isActive }) {
    return `
        group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
        ${
            isActive
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent/20 hover:text-foreground'
        }
    `;
}

/* -----------------------------
   NAV GROUP
------------------------------*/
function NavGroup({ items }) {
    return (
        <div className="space-y-1">
            {items.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={linkClass}>
                    <Icon size={18} className="transition-transform group-hover:scale-105" />
                    <span className="truncate">{label}</span>
                </NavLink>
            ))}
        </div>
    );
}

/* -----------------------------
   SECTION WRAPPER
------------------------------*/
function NavSection({ title, children }) {
    return (
        <div className="space-y-1">
            {title && (
                <p className="px-3 pt-3 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {title}
                </p>
            )}
            {children}
        </div>
    );
}

/* -----------------------------
   SETTINGS FLYOUT
------------------------------*/
function SettingsFlyout({ showCompanySettings, theme, toggleTheme }) {
    const navigate = useNavigate();

    function go(path) {
        navigate(path);
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="default"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                    <Settings size={18} />
                    Settings
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" sideOffset={8} className="space-y-1 min-w-[220px]">
                {showCompanySettings && (
                    <DropdownMenuItem asChild>
                        <button
                            type="button"
                            onClick={() => go('/settings')}
                            className="flex items-center gap-3 px-3 py-2 w-full text-sm text-muted-foreground hover:bg-accent/20 hover:text-foreground"
                        >
                            <Building2 size={16} />
                            Company Settings
                        </button>
                    </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                    <button
                        type="button"
                        onClick={() => go('/change-password')}
                        className="flex items-center gap-3 px-3 py-2 w-full text-sm text-muted-foreground hover:bg-accent/20 hover:text-foreground"
                    >
                        <KeyRound size={16} />
                        Change Password
                    </button>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex items-center gap-3 px-3 py-2 w-full text-sm text-muted-foreground hover:bg-accent/20 hover:text-foreground"
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    </button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/* -----------------------------
   MAIN SIDEBAR
------------------------------*/
export default function Sidebar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [companyName, setCompanyName] = useState('PayFlow');
    const [logoUrl, setLogoUrl] = useState('');

    useEffect(() => {
        settingsApi.getSettings()
            .then(res => {
                if (res.success && res.data) {
                    setCompanyName(res.data.company_name || 'PayFlow');
                    setLogoUrl(res.data.logo_url || '');
                }
            })
            .catch(() => {});
    }, []);

    const isEmployee = user?.role === 'EMPLOYEE';
    const isHrManager = user?.role === 'HR_MANAGER';
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const canSeeReports = isSuperAdmin || isHrManager;

    /* -----------------------------
       ROLE-BASED NAV ITEMS
    ------------------------------*/
    let navItems;

    if (isEmployee) {
        navItems = [
            { to: '/my-profile', label: 'My Profile', icon: UserCircle },
            { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
            { to: '/leaves', label: 'Leaves', icon: CalendarOff },
            { to: '/my-payslips', label: 'My Payslips', icon: FileText },
        ];
    } else if (isHrManager) {
        navItems = [
            { to: '/employees', label: 'Employees', icon: Users },
            { to: '/departments', label: 'Departments', icon: Building2 },
            { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
            { to: '/leaves', label: 'Leaves', icon: CalendarOff },
            { to: '/payroll', label: 'Payroll', icon: Wallet },
        ];
    } else {
        navItems = [
            { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/employees', label: 'Employees', icon: Users },
            { to: '/departments', label: 'Departments', icon: Building2 },
            { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
            { to: '/leaves', label: 'Leaves', icon: CalendarOff },
            { to: '/payroll', label: 'Payroll', icon: Wallet },
        ];
    }

    return (
        <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col overflow-visible">

            {/* HEADER */}
            <div className="p-6 border-b border-sidebar-border">
                <div className="flex items-center gap-2">
                    {logoUrl && (
                        <img
                            src={`${API_BASE}${logoUrl}`}
                            alt={companyName}
                            className="h-7 w-7 rounded object-cover"
                        />
                    )}
                    <h1 className="text-xl font-bold text-sidebar-foreground truncate">
                        {companyName}
                    </h1>
                </div>

                <p className="text-xs text-muted-foreground mt-1">
                    {user?.full_name}
                </p>

                <span className="inline-block mt-1 text-[10px] uppercase tracking-wide text-accent-foreground bg-accent px-2 py-0.5 rounded">
                    {user?.role}
                </span>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-4">

                <NavSection title="Main">
                    <NavGroup items={navItems} />
                </NavSection>

                {canSeeReports && (
                    <NavSection title="Insights">
                        <NavGroup items={[reportsItem]} />
                    </NavSection>
                )}

                {isSuperAdmin && (
                    <NavSection title="Admin">
                        <NavGroup items={superAdminOnlyItems} />
                    </NavSection>
                )}

            </nav>

            {/* FOOTER */}
            <div className="p-4 border-t border-sidebar-border space-y-1">

                <SettingsFlyout
                    showCompanySettings={isSuperAdmin}
                    theme={theme}
                    toggleTheme={toggleTheme}
                />

                <Button
                    variant="ghost"
                    size="default"
                    onClick={logout}
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                    <LogOut size={18} />
                    Logout
                </Button>
            </div>
        </aside>
    );
}