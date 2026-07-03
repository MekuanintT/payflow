import { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPen, Camera } from 'lucide-react';
import { toast } from 'sonner';
import * as employeeApi from '../../api/employee.api';
import * as departmentApi from '../../api/department.api';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

function initials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function EditEmployeeDialog({ employee, onUpdated }) {
    const [open, setOpen] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(employee.avatar_url || '');
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        full_name: employee.full_name || '',
        phone: employee.phone || '',
        position: employee.position || '',
        department_id: employee.department_id ? String(employee.department_id) : '',
    });

    useEffect(() => {
        if (open) {
            departmentApi.getDepartments().then(res => {
                if (res.success) setDepartments(res.data);
            });

            setForm({
                full_name: employee.full_name || '',
                phone: employee.phone || '',
                position: employee.position || '',
                department_id: employee.department_id ? String(employee.department_id) : '',
            });

            setAvatarUrl(employee.avatar_url || '');
            setError('');
        }
    }, [open, employee]);

    function update(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    async function handleAvatarSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('Only JPG, PNG, and WEBP images are allowed.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB.');
            return;
        }

        setUploadingAvatar(true);

        try {
            const res = await employeeApi.uploadAvatar(employee.id, file);

            if (res.success) {
                setAvatarUrl(res.data.avatar_url);
                toast.success('Profile photo updated');
                onUpdated?.();
            } else {
                toast.error(res.message || 'Upload failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await employeeApi.updateEmployee(employee.id, form);

            if (res.success) {
                setOpen(false);
                toast.success('Employee updated');
                onUpdated?.();
            } else {
                setError(res.message || 'Failed to update employee');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update employee');
        } finally {
            setLoading(false);
        }
    }

    function handleOpenChange(value) {
        if (!value) {
            setError('');
        }
        setOpen(value);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>

            {/* TRIGGER */}
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                    <UserPen size={16} />
                </Button>
            </DialogTrigger>

            {/* MODAL */}
            <DialogContent className="max-w-lg rounded-xl border border-border bg-card text-foreground shadow-lg">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-lg font-semibold">Edit Employee</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Update the employee’s personal details, department, and position.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-2 py-2">

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        aria-label="Upload profile photo"
                        className="group relative rounded-full"
                    >
                        <Avatar className="h-20 w-20 ring-2 ring-border">
                            {avatarUrl && (
                                <AvatarImage
                                    src={`${API_BASE}${avatarUrl}`}
                                    alt={employee.full_name}
                                />
                            )}
                            <AvatarFallback className="bg-accent text-accent-foreground text-lg">
                                {initials(employee.full_name)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/55 group-disabled:bg-black/35">
                            <Camera size={18} className="text-white opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                    </button>

                    <p className="text-xs text-muted-foreground">
                        {uploadingAvatar ? 'Uploading...' : 'Click to update photo'}
                    </p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleAvatarSelect}
                        className="hidden"
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4 rounded-lg border border-border bg-background/70 p-4">
                        <div className="space-y-1">
                            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Personal Info</p>
                            <p className="text-sm text-muted-foreground">Keep the employee profile current for payroll and contact records.</p>
                        </div>

                        <div className="space-y-3">
                            <Input
                                placeholder="Full Name"
                                value={form.full_name}
                                onChange={e => update('full_name', e.target.value)}
                                required
                            />

                            <Input
                                placeholder="Phone"
                                value={form.phone}
                                onChange={e => update('phone', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 rounded-lg border border-border bg-background/70 p-4">
                        <div className="space-y-1">
                            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Job Details</p>
                            <p className="text-sm text-muted-foreground">Adjust departmental placement and role information.</p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <Select value={form.department_id} onValueChange={v => update('department_id', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map(d => (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                placeholder="Position"
                                value={form.position}
                                onChange={e => update('position', e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <DialogFooter showCloseButton>
                        <Button type="submit" disabled={loading} className="w-full md:w-auto">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}