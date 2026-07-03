import { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import * as payrollApi from '../../api/payroll.api';
import GeneratePayrollDialog from './GeneratePayrollDialog';
import { useAuth } from '../../context/AuthContext';

const statusColors = {
    DRAFT: 'bg-amber-600/15 text-amber-700 dark:text-amber-400',
    APPROVED: 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-400',
    PAID: 'bg-primary text-primary-foreground',
};

const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PayrollPage() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function loadPayroll() {
        setLoading(true);
        try {
            const res = await payrollApi.getPayroll();
            if (res.success) setRecords(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load payroll');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPayroll();
    }, []);

    async function handleApprove(id) {
        try {
            const res = await payrollApi.approvePayroll(id);
            if (res.success) { toast.success('Payroll approved'); loadPayroll(); }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve');
        }
    }

    async function handleMarkPaid(id) {
        try {
            const res = await payrollApi.markPayrollPaid(id);
            if (res.success) { toast.success('Marked as paid'); loadPayroll(); }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to mark as paid');
        }
    }

    async function handleDownloadPayslip(rec) {
        try {
            await payrollApi.downloadPayslip(rec.id, `payslip-${rec.employee_code}-${rec.month}-${rec.year}.pdf`);
        } catch (err) {
            toast.error('Failed to download payslip');
        }
    }

    return (
        <div
            className="flex flex-col space-y-6 overflow-hidden"
            style={{ height: 'calc(100vh - 3rem)' }}
        >
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-[70ch] space-y-1">
                    <h1 className="text-2xl font-semibold text-foreground">Payroll</h1>
                    <p className="text-sm text-muted-foreground">Generate, review, and process salary payments.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground">
                        {records.length} {records.length === 1 ? 'record' : 'records'}
                    </div>
                    <GeneratePayrollDialog onGenerated={loadPayroll} />
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="relative min-h-0 flex-1 overflow-y-auto">
                    <Table aria-label="Payroll records">
                        <TableCaption className="sr-only">Current payroll records and their status</TableCaption>
                        <TableHeader className="sticky top-0 z-20 bg-card shadow-[0_1px_0_0_theme(colors.border)]">
                            <TableRow className="border-border bg-muted hover:bg-muted">
                                <TableHead className="text-muted-foreground">Employee</TableHead>
                                <TableHead className="text-muted-foreground">Period</TableHead>
                                <TableHead className="text-muted-foreground">Gross</TableHead>
                                <TableHead className="text-muted-foreground">Deductions</TableHead>
                                <TableHead className="text-muted-foreground">Net Salary</TableHead>
                                <TableHead className="text-muted-foreground">Status</TableHead>
                                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
                                        Loading payroll...
                                    </TableCell>
                                </TableRow>
                            ) : records.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
                                        No payroll records yet. Click "Generate Payroll" to create one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                records.map((rec) => (
                                    <TableRow key={rec.id} className="border-border hover:bg-muted/20">
                                        <TableCell>
                                            <p className="text-sm font-medium text-foreground">{rec.full_name}</p>
                                            <p className="text-xs text-muted-foreground">{rec.employee_code}</p>
                                        </TableCell>
                                        <TableCell className="text-foreground">
                                            {monthNames[rec.month]} {rec.year}
                                        </TableCell>
                                        <TableCell className="text-foreground">
                                            ETB {Number(rec.gross_salary).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-foreground">
                                            ETB {Number(rec.total_deductions).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">
                                            ETB {Number(rec.net_salary).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[rec.status] || 'bg-muted text-muted-foreground'}>
                                                {rec.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                {rec.status === 'DRAFT' && isSuperAdmin && (
                                                    <Button size="sm" variant="secondary" onClick={() => handleApprove(rec.id)} className="w-full sm:w-auto">
                                                        Approve
                                                    </Button>
                                                )}
                                                {rec.status === 'APPROVED' && isSuperAdmin && (
                                                    <Button size="sm" onClick={() => handleMarkPaid(rec.id)} className="w-full sm:w-auto">
                                                        Mark Paid
                                                    </Button>
                                                )}
                                                {rec.status === 'PAID' && (
                                                    <Button size="sm" variant="secondary" className="w-full gap-1 sm:w-auto" onClick={() => handleDownloadPayslip(rec)}>
                                                        <Download size={14} /> Payslip
                                                    </Button>
                                                )}
                                            </div>
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
