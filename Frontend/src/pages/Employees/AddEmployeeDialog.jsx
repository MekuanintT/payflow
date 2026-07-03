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
import { Plus, Camera } from 'lucide-react';
import { toast } from 'sonner';
import * as employeeApi from '../../api/employee.api';
import * as departmentApi from '../../api/department.api';
import * as settingsApi from '../../api/settings.api';

function SectionTitle({ title, subtitle }) {
    return (
        <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {title}
            </p>
            {subtitle && (
                <p className="text-xs text-muted-foreground/70">
                    {subtitle}
                </p>
            )}
        </div>
    );
}

export default function AddEmployeeDialog({ onCreated }) {
    const [open, setOpen] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        full_name: '',
        email: '',
        password: '',
        employee_code: '',
        department_id: '',
        position: '',
        phone: '',
        basic_salary: '',
        house_allowance: '',
        transport: '',
        tax_rate: '',
        pension_rate: '',
    });

    useEffect(() => {
        if (!open) return;

        departmentApi.getDepartments().then(res => {
            if (res.success) setDepartments(res.data);
        });

        settingsApi.getSettings().then(res => {
            if (res.success && res.data) {
                setForm(prev => ({
                    ...prev,
                    tax_rate: res.data.default_tax_rate ?? '',
                    pension_rate: res.data.default_pension_rate ?? '',
                }));
            }
        });
    }, [open]);

    useEffect(() => {
        return () => {
            if (avatarPreview.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    function update(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    function handleAvatarSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return;
        if (file.size > 5 * 1024 * 1024) return;

        if (avatarPreview.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreview);
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    }

    function resetForm() {
        setError('');
        setForm({
            full_name: '', email: '', password: '', employee_code: '',
            department_id: '', position: '', phone: '',
            basic_salary: '', house_allowance: '', transport: '',
            tax_rate: '', pension_rate: '',
        });

        if (avatarPreview.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreview);
        }

        setAvatarFile(null);
        setAvatarPreview('');
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            if (avatarFile) formData.append('avatar', avatarFile);

            const res = await employeeApi.createEmployee(formData);

            if (res.success) {
                setOpen(false);
                resetForm();
                toast.success(res.message || 'Employee created');
                onCreated?.();
            } else {
                setError(res.message || 'Failed to create employee');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create employee');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>

            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus size={16} /> Add Employee
                </Button>
            </DialogTrigger>

            <DialogContent className="bg-card border-border text-foreground max-w-2xl">

                <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                    <DialogDescription>
                        Fill in employee details, compensation, and taxes to create a new profile.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* IDENTITY */}
                    <div className="space-y-3">
                        <SectionTitle title="Identity" />

                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="relative group"
                            >
                                <Avatar className="h-16 w-16 ring-2 ring-border">
                                    {avatarPreview ? (
                                        <AvatarImage src={avatarPreview} />
                                    ) : (
                                        <AvatarFallback>+</AvatarFallback>
                                    )}
                                </Avatar>
                                <Camera className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100" />
                            </button>

                            <div className="grid grid-cols-2 gap-3 flex-1">
                                <Input
                                    placeholder="Full Name"
                                    value={form.full_name}
                                    onChange={e => update('full_name', e.target.value)}
                                    required
                                    className="bg-muted border-border"
                                />
                                <Input
                                    placeholder="Employee Code"
                                    value={form.employee_code}
                                    onChange={e => update('employee_code', e.target.value)}
                                    required
                                    className="bg-muted border-border"
                                />
                            </div>
                        </div>

                        <input ref={fileInputRef} type="file" hidden onChange={handleAvatarSelect} />
                    </div>

                    {/* ACCOUNT */}
                    <div className="space-y-3">
                        <SectionTitle title="Account" />

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={e => update('email', e.target.value)}
                                required
                                className="bg-muted border-border"
                            />
                            <Input
                                type="password"
                                placeholder="Password (min 6 characters)"
                                value={form.password}
                                onChange={e => update('password', e.target.value)}
                                required
                                minLength={6}
                                className="bg-muted border-border"
                            />
                        </div>
                    </div>

                    {/* JOB */}
                    <div className="space-y-3">
                        <SectionTitle title="Employment" />

                        <div className="grid grid-cols-2 gap-3">
                            <Select value={form.department_id} onValueChange={v => update('department_id', v)}>
                                <SelectTrigger className="bg-muted border-border">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map(d => (
                                        <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                placeholder="Position"
                                value={form.position}
                                onChange={e => update('position', e.target.value)}
                                className="bg-muted border-border"
                            />
                        </div>

                        <Input
                            type="tel"
                            placeholder="Phone"
                            value={form.phone}
                            onChange={e => update('phone', e.target.value)}
                            className="bg-muted border-border"
                        />
                    </div>

                    {/* PAYROLL */}
                    <div className="space-y-3">
                        <SectionTitle title="Compensation" />

                        <div className="grid grid-cols-3 gap-3">
                            <Input
                                type="number"
                                placeholder="Salary"
                                value={form.basic_salary}
                                onChange={e => update('basic_salary', e.target.value)}
                                className="bg-muted border-border"
                            />
                            <Input
                                type="number"
                                placeholder="House"
                                value={form.house_allowance}
                                onChange={e => update('house_allowance', e.target.value)}
                                className="bg-muted border-border"
                            />
                            <Input
                                type="number"
                                placeholder="Transport"
                                value={form.transport}
                                onChange={e => update('transport', e.target.value)}
                                className="bg-muted border-border"
                            />
                        </div>
                    </div>

                    {/* TAX */}
                    <div className="space-y-3">
                        <SectionTitle title="Taxes" />

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="number"
                                placeholder="Tax %"
                                value={form.tax_rate}
                                onChange={e => update('tax_rate', e.target.value)}
                                className="bg-muted border-border"
                            />
                            <Input
                                type="number"
                                placeholder="Pension %"
                                value={form.pension_rate}
                                onChange={e => update('pension_rate', e.target.value)}
                                className="bg-muted border-border"
                            />
                        </div>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    {/* FOOTER */}
                    <DialogFooter>
                        <Button className="w-full" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Employee'}
                        </Button>
                    </DialogFooter>

                </form>
            </DialogContent>
        </Dialog>
    );
}