import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../../context/AuthContext';
import * as attendanceApi from '../../api/attendance.api';
import * as employeeApi from '../../api/employee.api';
import AttendanceSummaryCard from '../../components/AttendanceSummaryCard';

const statusColors = {
    PRESENT: 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-400',
    ABSENT: 'bg-destructive/10 text-destructive',
    LATE: 'bg-amber-600/15 text-amber-700 dark:text-amber-400',
    HALF_DAY: 'bg-sky-600/15 text-sky-700 dark:text-sky-400',
};

export default function AttendancePage() {
    const { user } = useAuth();
    const canMarkAttendance = user?.role === 'SUPER_ADMIN' || user?.role === 'HR_MANAGER';

    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [employeePickerOpen, setEmployeePickerOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    const selectedEmployeeLabel = (() => {
        const emp = employees.find((e) => String(e.id) === selectedEmployee);
        return emp ? `${emp.full_name} (${emp.employee_code})` : '';
    })();

    async function loadRecords() {
        setLoading(true);
        try {
            const res = await attendanceApi.getAttendance();
            if (res.success) setRecords(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load attendance');
        } finally {
            setLoading(false);
        }
    }

    async function loadEmployees() {
        if (!canMarkAttendance) return;
        setError('');

        try {
            const res = await employeeApi.getEmployees();
            if (res.success) {
                setEmployees(res.data);
            } else {
                setError(res.message || 'Failed to load employees');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load employees');
        }
    }

    useEffect(() => {
        loadRecords();
        loadEmployees();
    }, [canMarkAttendance]);

    async function handleCheckIn() {
        if (!selectedEmployee) return;
        setActionLoading(true);
        setError('');
        try {
            const res = await attendanceApi.checkIn(selectedEmployee);
            if (res.success) {
                toast.success('Check in recorded successfully.');
                await loadRecords();
            } else {
                setError(res.message || 'Check-in failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Check-in failed');
        } finally {
            setActionLoading(false);
        }
    }

    async function handleCheckOut() {
        if (!selectedEmployee) return;
        setActionLoading(true);
        setError('');
        try {
            const res = await attendanceApi.checkOut(selectedEmployee);
            if (res.success) {
                toast.success('Check out recorded successfully.');
                await loadRecords();
            } else {
                setError(res.message || 'Check-out failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Check-out failed');
        } finally {
            setActionLoading(false);
        }
    }

    return (
        <div
            className="flex flex-col space-y-6 overflow-hidden"
            style={{ height: 'calc(100vh - 3rem)' }}
        >
            <div className="max-w-[70ch] space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">
                    {canMarkAttendance ? 'Attendance' : 'My Attendance'}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {canMarkAttendance
                        ? 'Track daily check-ins and check-outs.'
                        : 'View your attendance history.'}
                </p>
            </div>

            {!canMarkAttendance && (
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <AttendanceSummaryCard title="My Attendance Summary" />
                </div>
            )}

            {canMarkAttendance && (
                <div className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-[minmax(20rem,1fr)_auto]">
                    <AttendanceSummaryCard
                        employeeId={selectedEmployee}
                        title="Attendance Summary"
                        requiresSelection={canMarkAttendance}
                    />
                    <div className="grid gap-3">
                        <div className="grid gap-2 text-sm text-foreground/80">
                            Select employee
                            <Popover open={employeePickerOpen} onOpenChange={setEmployeePickerOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={employeePickerOpen}
                                        className="w-full justify-between border-border bg-background font-normal"
                                    >
                                        <span className={cn(!selectedEmployeeLabel && 'text-muted-foreground')}>
                                            {selectedEmployeeLabel || 'Choose employee'}
                                        </span>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search employee..." />
                                        <CommandList>
                                            <CommandEmpty>No employee found.</CommandEmpty>
                                            <CommandGroup>
                                                {employees.map((emp) => (
                                                    <CommandItem
                                                        key={emp.id}
                                                        value={`${emp.full_name} ${emp.employee_code}`}
                                                        onSelect={() => {
                                                            setSelectedEmployee(String(emp.id));
                                                            setEmployeePickerOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                'mr-2 h-4 w-4',
                                                                selectedEmployee === String(emp.id) ? 'opacity-100' : 'opacity-0'
                                                            )}
                                                        />
                                                        {emp.full_name} ({emp.employee_code})
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={handleCheckIn} disabled={!selectedEmployee || actionLoading} className="min-w-[8rem]">
                                Check In
                            </Button>
                            <Button onClick={handleCheckOut} disabled={!selectedEmployee || actionLoading} variant="secondary" className="min-w-[8rem]">
                                Check Out
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="relative min-h-0 flex-1 overflow-y-auto">
                <Table>
                    <TableHeader className="sticky top-0 z-20 bg-card shadow-[0_1px_0_0_theme(colors.border)]">
                        <TableRow className="border-border bg-muted hover:bg-muted">
                            {canMarkAttendance && <TableHead className="text-muted-foreground">Employee</TableHead>}
                            <TableHead className="text-muted-foreground">Date</TableHead>
                            <TableHead className="text-muted-foreground">Check In</TableHead>
                            <TableHead className="text-muted-foreground">Check Out</TableHead>
                            <TableHead className="text-muted-foreground">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={canMarkAttendance ? 5 : 4} className="py-10 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
                                    Loading attendance...
                                </TableCell>
                            </TableRow>
                        ) : records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={canMarkAttendance ? 5 : 4} className="py-10 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
                                    No attendance records yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            records.map((rec) => (
                                <TableRow key={rec.id} className="border-border hover:bg-muted/20">
                                    {canMarkAttendance && <TableCell className="text-foreground">{rec.full_name}</TableCell>}
                                    <TableCell className="text-foreground">
                                        {new Date(rec.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-foreground">{rec.check_in || '—'}</TableCell>
                                    <TableCell className="text-foreground">{rec.check_out || '—'}</TableCell>
                                    <TableCell>
                                        <Badge className={statusColors[rec.status] || 'bg-muted text-muted-foreground'}>
                                            {rec.status}
                                        </Badge>
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
