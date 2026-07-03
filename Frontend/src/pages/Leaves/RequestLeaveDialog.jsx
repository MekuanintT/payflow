import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import * as leaveApi from '../../api/leave.api';
import * as employeeApi from '../../api/employee.api';

export default function RequestLeaveDialog({ onCreated }) {
    const [open, setOpen] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        employee_id: '',
        leave_type: 'ANNUAL',
        start_date: '',
        end_date: '',
        days: '',
        reason: '',
    });

    useEffect(() => {
        if (open) {
            setLoadingEmployees(true);
            employeeApi
                .getEmployees()
                .then(res => {
                    if (res.success) setEmployees(res.data);
                    else setEmployees([]);
                })
                .finally(() => setLoadingEmployees(false));
        }
    }, [open]);

    function handleOpenChange(nextOpen) {
        setOpen(nextOpen);
        if (!nextOpen) {
            setError('');
            setForm({
                employee_id: '',
                leave_type: 'ANNUAL',
                start_date: '',
                end_date: '',
                days: '',
                reason: '',
            });
        }
    }

    function update(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await leaveApi.createLeave(form);
            if (res.success) {
                setOpen(false);
                setForm({ employee_id: '', leave_type: 'ANNUAL', start_date: '', end_date: '', days: '', reason: '' });
                onCreated?.();
            } else {
                setError(res.message || 'Failed to submit leave request');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit leave request');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus size={16} /> Request Leave
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground max-w-md">
                <DialogHeader>
                    <DialogTitle>Request Leave</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to submit a new leave request for review.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-3">
                        <label htmlFor="leave-employee" className="text-sm font-medium text-foreground">
                            Employee
                        </label>
                        <Select
                            value={form.employee_id}
                            onValueChange={v => update('employee_id', v)}
                            disabled={loadingEmployees}
                        >
                            <SelectTrigger className="bg-muted border-border">
                                <SelectValue placeholder={loadingEmployees ? 'Loading employees...' : 'Select employee'} />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map(emp => (
                                    <SelectItem key={emp.id} value={String(emp.id)}>
                                        {emp.full_name} ({emp.employee_code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-3">
                        <label htmlFor="leave-type" className="text-sm font-medium text-foreground">
                            Leave type
                        </label>
                        <Select value={form.leave_type} onValueChange={v => update('leave_type', v)}>
                            <SelectTrigger className="bg-muted border-border">
                                <SelectValue placeholder="Leave type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ANNUAL">Annual</SelectItem>
                                <SelectItem value="SICK">Sick</SelectItem>
                                <SelectItem value="UNPAID">Unpaid</SelectItem>
                                <SelectItem value="MATERNITY">Maternity</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label htmlFor="leave-start" className="text-sm font-medium text-foreground">
                                Start date
                            </label>
                            <Input
                                id="leave-start"
                                type="date"
                                value={form.start_date}
                                onChange={e => update('start_date', e.target.value)}
                                required
                                className="bg-muted border-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="leave-end" className="text-sm font-medium text-foreground">
                                End date
                            </label>
                            <Input
                                id="leave-end"
                                type="date"
                                value={form.end_date}
                                onChange={e => update('end_date', e.target.value)}
                                required
                                className="bg-muted border-border"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="leave-days" className="text-sm font-medium text-foreground">
                            Number of days
                        </label>
                        <Input
                            id="leave-days"
                            type="number"
                            placeholder="Number of days"
                            value={form.days}
                            onChange={e => update('days', e.target.value)}
                            required
                            className="bg-muted border-border"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="leave-reason" className="text-sm font-medium text-foreground">
                            Reason <span className="font-normal text-muted-foreground">(optional)</span>
                        </label>
                        <Input
                            id="leave-reason"
                            placeholder="Reason (optional)"
                            value={form.reason}
                            onChange={e => update('reason', e.target.value)}
                            className="bg-muted border-border"
                        />
                    </div>

                    {error && (
                        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
                            {error}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="submit" disabled={loading || loadingEmployees} className="w-full">
                            {loading ? 'Submitting...' : 'Submit request'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}