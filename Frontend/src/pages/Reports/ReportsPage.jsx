import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import * as reportApi from '../../api/report.api';

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

function ChartCard({ title, children }) {
    return (
        <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

const tooltipStyle = {
    contentStyle: {
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        color: 'var(--foreground)'
    },
    labelStyle: { color: 'var(--foreground)' },
};

export default function ReportsPage() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const [headcountData, setHeadcountData] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [payrollTrendData, setPayrollTrendData] = useState([]);
    const [leaveStatusData, setLeaveStatusData] = useState([]);
    const [leaveTypeData, setLeaveTypeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError('');
            try {
                const now = new Date();
                const month = now.getMonth() + 1;
                const year = now.getFullYear();

                const calls = [
                    reportApi.getHeadcountByDepartment(),
                    reportApi.getAttendanceTrend(month, year),
                ];
                if (isSuperAdmin) {
                    calls.push(reportApi.getPayrollTrend(6));
                    calls.push(reportApi.getLeaveStats());
                }

                const results = await Promise.all(calls);
                const [headcountRes, attendanceRes, payrollTrendRes, leaveStatsRes] = results;

                if (headcountRes.success) {
                    setHeadcountData(headcountRes.data.map(d => ({
                        name: d.department,
                        headcount: parseInt(d.headcount),
                    })));
                }
                if (attendanceRes.success) {
                    setAttendanceData(attendanceRes.data.map(d => ({
                        date: new Date(d.date).getDate(),
                        present: parseInt(d.present),
                        absent: parseInt(d.absent),
                    })));
                }
                if (isSuperAdmin && payrollTrendRes?.success) {
                    setPayrollTrendData(payrollTrendRes.data.map(d => ({
                        name: d.label,
                        total: d.total_payroll,
                    })));
                }
                if (isSuperAdmin && leaveStatsRes?.success) {
                    setLeaveStatusData(leaveStatsRes.data.by_status.map(d => ({
                        name: d.status,
                        value: d.count,
                    })));
                    setLeaveTypeData(leaveStatsRes.data.by_type.map(d => ({
                        name: d.leave_type,
                        count: d.count,
                    })));
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load reports');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [isSuperAdmin]);

    if (loading) {
        return (
            <div className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground shadow-sm">
                Loading reports...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="max-w-[70ch] space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
                <p className="text-sm text-muted-foreground">
                    {isSuperAdmin
                        ? 'Company-wide analytics across headcount, payroll, and leave.'
                        : 'Headcount and attendance analytics.'}
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ChartCard title="Headcount by Department">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={headcountData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                            <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                            <Tooltip {...tooltipStyle} />
                            <Bar dataKey="headcount" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Attendance Trend (This Month)">
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={attendanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                            <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                            <Tooltip {...tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: 12, color: 'var(--muted-foreground)' }} />
                            <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {isSuperAdmin && (
                    <ChartCard title="Payroll Cost Trend (Last 6 Months)">
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={payrollTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                                <Tooltip
                                    {...tooltipStyle}
                                    formatter={(value) => [`ETB ${Number(value).toLocaleString()}`, 'Total Payroll']}
                                />
                                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}

                {isSuperAdmin && (
                    <ChartCard title="Leave Requests by Status">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={leaveStatusData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {leaveStatusData.map((entry, index) => (
                                        <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip {...tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}
            </div>

            {isSuperAdmin && (
                <ChartCard title="Leave Requests by Type">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={leaveTypeData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                            <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={12} width={100} />
                            <Tooltip {...tooltipStyle} />
                            <Bar dataKey="count" fill="var(--accent)" radius={[0, 6, 6, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}
        </div>
    );
}