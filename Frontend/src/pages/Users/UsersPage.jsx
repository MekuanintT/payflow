import { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import * as userApi from '../../api/user.api';
import AddUserDialog from './AddUserDialog';

const roleColors = {
    SUPER_ADMIN: 'bg-red-700 text-white',
    HR_MANAGER: 'bg-amber-700 text-white',
    EMPLOYEE: 'bg-muted text-muted-foreground',
};

const ADMIN_ROLES = ['SUPER_ADMIN', 'HR_MANAGER'];

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState(null);

    async function loadUsers() {
        setLoading(true);
        try {
            const res = await userApi.getUsers();
            if (res.success) {
                setUsers(res.data);
            } else {
                setError(res.message || 'Failed to load users');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    async function handleToggleActive(u) {
        setActionLoadingId(u.id);
        try {
            const res = await userApi.toggleUserActive(u.id);
            if (res.success) {
                toast.success(res.message);
                loadUsers();
            } else {
                toast.error(res.message || 'Failed to update account');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update account');
        } finally {
            setActionLoadingId(null);
        }
    }

    return (
        <div
            className="flex flex-col space-y-6 overflow-hidden"
            style={{ height: 'calc(100vh - 3rem)' }}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-foreground">User Management</h1>
                    <p className="text-sm text-muted-foreground">Manage Super Admin and HR Manager accounts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground">
                        {users.length} {users.length === 1 ? 'user' : 'users'}
                    </div>
                    <AddUserDialog onCreated={loadUsers} />
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
                                <TableHead className="text-muted-foreground">Email</TableHead>
                                <TableHead className="text-muted-foreground">Role</TableHead>
                                <TableHead className="text-muted-foreground">Status</TableHead>
                                <TableHead className="text-muted-foreground">Last Login</TableHead>
                                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
                                        Loading users...
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((u) => {
                                    const isAdminTier = ADMIN_ROLES.includes(u.role);
                                    const isSelf = u.id === currentUser?.id;
                                    return (
                                        <TableRow key={u.id} className="border-border">
                                            <TableCell className="font-medium text-foreground">
                                                <div className="flex flex-col">
                                                    <span>{u.full_name}</span>
                                                    {isSelf && <span className="text-xs text-muted-foreground">You</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-foreground">{u.email}</TableCell>
                                            <TableCell>
                                                <Badge className={roleColors[u.role] || 'bg-muted text-muted-foreground'}>
                                                    {u.role.replace(/_/g, ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={u.is_active ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}>
                                                    {u.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {isAdminTier && !isSelf && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled={actionLoadingId === u.id}
                                                        onClick={() => handleToggleActive(u)}
                                                        className={u.is_active
                                                            ? 'h-8 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive'
                                                            : 'h-8 gap-1.5 text-emerald-700 hover:bg-emerald-600/10 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-400'}
                                                    >
                                                        {u.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                                                        {u.is_active ? 'Deactivate' : 'Activate'}
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
