import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, CalendarClock } from 'lucide-react';
import * as attendanceApi from '../api/attendance.api';

const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function StatBlock({ label, value, icon: Icon }) {
    return (
        <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
            <div className="p-2 rounded-md bg-muted">
                <Icon size={16} className="text-foreground" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold text-foreground">{value}</p>
            </div>
        </div>
    );
}

/**
 * Reusable attendance summary card.
 *
 * Two usage modes:
 * - requiresSelection=true: caller must pass employeeId (e.g. HR/Super Admin picking
 *   from a dropdown on the Attendance page). Shows a "select an employee" placeholder
 *   until employeeId is provided.
 * - requiresSelection=false (default): always fetches the logged-in user's own summary;
 *   employeeId is ignored and the backend defaults to req.user.employee_id. Used on
 *   My Profile for EMPLOYEE role.
 */
export default function AttendanceSummaryCard({ employeeId, title = 'Attendance Summary', requiresSelection = false }) {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const needsEmployeeSelection = requiresSelection && !employeeId;

    useEffect(() => {
        if (needsEmployeeSelection) {
            setLoading(false);
            return;
        }
        async function load() {
            setLoading(true);
            setError('');
            try {
                const res = await attendanceApi.getAttendanceSummary(employeeId, month, year);
                if (res.success) {
                    setSummary(res.data);
                } else {
                    setError(res.message || 'Failed to load summary');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load summary');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [employeeId, month, year, needsEmployeeSelection]);

    const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

    return (
        <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-foreground text-base">{title}</CardTitle>
                <div className="flex gap-2">
                    <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                        <SelectTrigger className="bg-muted border-border h-8 w-32 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {monthNames.slice(1).map((name, idx) => (
                                <SelectItem key={idx + 1} value={String(idx + 1)}>{name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                        <SelectTrigger className="bg-muted border-border h-8 w-20 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((y) => (
                                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {needsEmployeeSelection ? (
                    <p className="text-muted-foreground text-sm">Select an employee above to see their summary.</p>
                ) : loading ? (
                    <p className="text-muted-foreground text-sm">Loading...</p>
                ) : error ? (
                    <p className="text-destructive text-sm">{error}</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <StatBlock
                            label="Present"
                            value={summary?.present_days ?? 0}
                            icon={CheckCircle2}
                        />
                        <StatBlock
                            label="Absent"
                            value={summary?.absent_days ?? 0}
                            icon={XCircle}
                        />
                        <StatBlock
                            label="Late"
                            value={summary?.late_days ?? 0}
                            icon={Clock}
                        />
                        <StatBlock
                            label="Half Day"
                            value={summary?.half_days ?? 0}
                            icon={CalendarClock}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}