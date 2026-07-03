import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2 } from 'lucide-react';
import * as employeeApi from '../../api/employee.api';
import AddEmployeeDialog from './AddEmployeeDialog';
import EditSalaryDialog from './EditSalaryDialog';
import EditEmployeeDialog from './EditEmployeeDialog';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function loadEmployees() {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id, fullName) {
        if (!confirm(`Delete ${fullName}? This cannot be undone.`)) return;

        try {
            const res = await employeeApi.deleteEmployee(id);
            if (res.success) {
                toast.success('Employee deleted');
                loadEmployees();
            } else {
                toast.error(res.message || 'Failed to delete employee');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete employee');
        }
    }

    useEffect(() => {
        loadEmployees();
    }, []);

    function initials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }

    return (
        <div
            className="flex flex-col space-y-6 overflow-hidden"
            style={{ height: 'calc(100vh - 3rem)' }}
        >
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-[70ch] space-y-1">
                    <h1 className="text-2xl font-semibold text-foreground">Employees</h1>
                    <p className="text-sm text-muted-foreground">Manage your workforce and salary records.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground">
                        {employees.length} {employees.length === 1 ? 'employee' : 'employees'}
                    </div>
                    <AddEmployeeDialog onCreated={loadEmployees} />
                </div>
            </div>

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
                                <TableHead className="text-muted-foreground">Employee</TableHead>
                                <TableHead className="text-muted-foreground">Code</TableHead>
                                <TableHead className="text-muted-foreground">Department</TableHead>
                                <TableHead className="text-muted-foreground">Position</TableHead>
                                <TableHead className="text-muted-foreground">Basic Salary</TableHead>
                                <TableHead className="text-muted-foreground">Status</TableHead>
                                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
                                        Loading employees...
                                    </TableCell>
                                </TableRow>
                            ) : employees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
                                        No employees yet. Click "Add Employee" to create one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                employees.map((emp) => (
                                    <TableRow key={emp.id} className="border-border hover:bg-muted/20">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    {emp.avatar_url && (
                                                        <AvatarImage
                                                            src={`${API_BASE}${emp.avatar_url}`}
                                                            alt={emp.full_name}
                                                        />
                                                    )}
                                                    <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                                                        {initials(emp.full_name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-foreground">{emp.full_name}</p>
                                                    <p className="truncate text-xs text-muted-foreground">{emp.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-foreground">{emp.employee_code}</TableCell>
                                        <TableCell className="text-foreground">{emp.department_name || '—'}</TableCell>
                                        <TableCell className="text-foreground">{emp.position || '—'}</TableCell>
                                        <TableCell className="text-foreground">
                                            {emp.basic_salary ? `ETB ${Number(emp.basic_salary).toLocaleString()}` : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={emp.status === 'ACTIVE' ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}>
                                                {emp.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <EditEmployeeDialog employee={emp} onUpdated={loadEmployees} />
                                                <EditSalaryDialog employee={emp} onUpdated={loadEmployees} />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(emp.id, emp.full_name)}
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
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
