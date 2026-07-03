import { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import * as leaveApi from '../../api/leave.api';
import RequestLeaveDialog from './RequestLeaveDialog';
import { useAuth } from '../../context/AuthContext';

const statusColors = {
    PENDING: 'bg-amber-600/15 text-amber-700 dark:text-amber-400',
    APPROVED: 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-400',
    REJECTED: 'bg-destructive/10 text-destructive',
};

export default function LeavesPage() {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function loadLeaves() {
        setLoading(true);
        try {
            const res = await leaveApi.getLeaves();
            if (res.success) setLeaves(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load leaves');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadLeaves();
    }, []);

    async function handleApprove(id) {
        try {
            const res = await leaveApi.approveLeave(id);
            if (res.success) {
                toast.success('Leave approved');
                loadLeaves();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve');
        }
    }

    async function handleReject(id) {
        try {
            const res = await leaveApi.rejectLeave(id);
            if (res.success) {
                toast.success('Leave rejected');
                loadLeaves();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject');
        }
    }

    const pendingCount = leaves.filter((leave) => leave.status === 'PENDING').length;

    return (
        <div
            className="flex flex-col space-y-6 overflow-hidden"
            style={{ height: 'calc(100vh - 3rem)' }}
        >
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-[70ch] space-y-1">
                    <h1 className="text-2xl font-semibold text-foreground">
                        {user?.role === 'EMPLOYEE' ? 'My Leave Requests' : 'Leaves'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {user?.role === 'EMPLOYEE'
                            ? 'View and submit your leave requests.'
                            : 'Manage leave requests and approvals.'}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {!user?.role || user.role !== 'EMPLOYEE' ? (
                        <div className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground">
                            {pendingCount} pending
                        </div>
                    ) : null}
                    <RequestLeaveDialog onCreated={loadLeaves} />
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="relative min-h-0 flex-1 overflow-y-auto">
                    <Table aria-label="Leave requests table">
                        <TableCaption className="sr-only">
                            Leave requests and approval actions for employees.
                        </TableCaption>
                        <TableHeader className="sticky top-0 z-20 bg-card shadow-[0_1px_0_0_theme(colors.border)]">
                            <TableRow className="border-border bg-muted hover:bg-muted">
                                <TableHead className="text-muted-foreground">Employee</TableHead>
                                <TableHead className="text-muted-foreground">Type</TableHead>
                                <TableHead className="text-muted-foreground">Start</TableHead>
                                <TableHead className="text-muted-foreground">End</TableHead>
                                <TableHead className="text-muted-foreground">Days</TableHead>
                                <TableHead className="text-muted-foreground">Status</TableHead>
                                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
                                        Loading leave requests...
                                    </TableCell>
                                </TableRow>
                            ) : leaves.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
                                        No leave requests yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                leaves.map((leave) => (
                                    <TableRow key={leave.id} className="border-border hover:bg-muted/20">
                                        <TableCell className="font-medium text-foreground">{leave.full_name}</TableCell>
                                        <TableCell className="text-foreground">
                                            <span className="capitalize">{leave.leave_type?.replace(/_/g, ' ')}</span>
                                        </TableCell>
                                        <TableCell className="text-foreground">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays size={14} className="text-muted-foreground" />
                                                <span>{new Date(leave.start_date).toLocaleDateString()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-foreground">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays size={14} className="text-muted-foreground" />
                                                <span>{new Date(leave.end_date).toLocaleDateString()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-foreground">{leave.days}</TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[leave.status] || 'bg-muted text-muted-foreground'}>
                                                {leave.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {leave.status === 'PENDING' && user?.role !== 'EMPLOYEE' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleApprove(leave.id)}
                                                        aria-label="Approve leave"
                                                        className="h-8 w-8 text-emerald-700 hover:bg-emerald-600/10 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-400"
                                                    >
                                                        <Check size={16} />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleReject(leave.id)}
                                                        aria-label="Reject leave"
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <X size={16} />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
