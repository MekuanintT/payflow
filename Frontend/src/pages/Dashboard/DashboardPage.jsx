import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Wallet, CalendarOff, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import * as reportApi from '../../api/report.api';

function StatCard({ title, value, icon: Icon }) {
    return (
        <Card className="border-border bg-card shadow-sm transition-colors hover:bg-muted/20">
            <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-2xl font-semibold text-foreground">{value}</p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted/70">
                    <Icon size={18} className="text-foreground" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const [summary, setSummary] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const now = new Date();
    const monthLabel = now.toLocaleString('default', { month: 'long' });
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError('');
            try {
                const summaryRes = await reportApi.getDashboardSummary();
                if (summaryRes.success) {
                    setSummary(summaryRes.data);
                } else {
                    setError(summaryRes.message || 'Unable to load dashboard summary.');
                }

                if (isSuperAdmin) {
                    const deptRes = await reportApi.getPayrollByDepartment(currentMonth, currentYear);
                    if (deptRes.success) {
                        setChartData(
                            deptRes.data.map(d => ({
                                name: d.department,
                                total: Number(d.total)
                            }))
                        );
                    } else {
                        setError(deptRes.message || 'Unable to load payroll chart data.');
                    }
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load dashboard data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [isSuperAdmin, currentMonth, currentYear]);

    if (loading) {
        return (
            <div className="space-y-6 p-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Overview of employees, payroll, and leave activity.</p>
                </div>
                <div className="rounded-xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                    Loading dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div className="max-w-[70ch] space-y-1">
                    <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Overview of employees, payroll, and leave activity.
                    </p>
                </div>
                <div className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground">
                    {monthLabel} {currentYear}
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Active Employees"
                    value={summary?.active_employees ?? '—'}
                    icon={Users}
                />
                <StatCard
                    title="Payroll This Month"
                    value={summary?.total_payroll_this_month != null ? `ETB ${Number(summary.total_payroll_this_month).toLocaleString()}` : '—'}
                    icon={Wallet}
                />
                <StatCard
                    title="Pending Leaves"
                    value={summary?.pending_leaves ?? '—'}
                    icon={CalendarOff}
                />
                <StatCard
                    title="Departments"
                    value={summary?.total_departments ?? '—'}
                    icon={Building2}
                />
            </div>

            {isSuperAdmin && (
                <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-foreground">
                            Payroll by Department
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {monthLabel} {currentYear} distribution across departments.
                        </p>
                    </CardHeader>

                    <CardContent className="h-[320px]">
                        {chartData.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                No payroll summary available for this period.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 16, right: 8, left: -8, bottom: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--card)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 10
                                        }}
                                        formatter={(value) => [`ETB ${Number(value).toLocaleString()}`, 'Payroll']}
                                    />
                                    <Bar dataKey="total" fill="var(--accent)" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}