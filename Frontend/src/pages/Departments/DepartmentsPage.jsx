import { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import * as departmentApi from '../../api/department.api';
import AddDepartmentDialog from './AddDepartmentDialog';

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function loadDepartments() {
        setLoading(true);
        try {
            const res = await departmentApi.getDepartments();
            if (res.success) {
                setDepartments(res.data);
            } else {
                setError(res.message || 'Failed to load departments');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load departments');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDepartments();
    }, []);

    async function handleDelete(id, name) {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

        try {
            const res = await departmentApi.deleteDepartment(id);
            if (res.success) {
                toast.success('Department deleted');
                loadDepartments();
            } else {
                toast.error(res.message || 'Failed to delete department');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete department');
        }
    }

    return (
        <div
            className="flex flex-col space-y-6 overflow-hidden"
            style={{ height: 'calc(100vh - 3rem)' }}
        >
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-[70ch] space-y-1">
                    <h1 className="text-2xl font-semibold text-foreground">Departments</h1>
                    <p className="text-sm text-muted-foreground">
                        Organize your company structure and teams.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground">
                        {departments.length} {departments.length === 1 ? 'department' : 'departments'}
                    </div>
                    <AddDepartmentDialog onCreated={loadDepartments} />
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
                                <TableHead className="text-muted-foreground">Name</TableHead>
                                <TableHead className="text-muted-foreground">Description</TableHead>
                                <TableHead className="text-muted-foreground">Created</TableHead>
                                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
                                        Loading departments...
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading && departments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-10 text-center" role="status" aria-live="polite">
                                        <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                                            <p className="text-sm font-medium text-foreground">No departments yet</p>
                                            <p className="text-sm text-muted-foreground">
                                                Create your first department to organize your company structure.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading && departments.map((dept) => (
                                <TableRow key={dept.id} className="border-border hover:bg-muted/20">
                                    <TableCell className="font-medium text-foreground">{dept.name}</TableCell>

                                    <TableCell className="max-w-[28rem] text-sm text-muted-foreground">
                                        <span className="line-clamp-2">{dept.description || '—'}</span>
                                    </TableCell>

                                    <TableCell className="text-sm text-muted-foreground">
                                        {dept.created_at ? new Date(dept.created_at).toLocaleDateString() : '—'}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(dept.id, dept.name)}
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
