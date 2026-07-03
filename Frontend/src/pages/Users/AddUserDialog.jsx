import { useState } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import * as userApi from '../../api/user.api';

export default function AddUserDialog({ onCreated }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        full_name: '',
        email: '',
        password: '',
        role: '',
    });

    function update(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    function resetForm() {
        setForm({ full_name: '', email: '', password: '', role: '' });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await userApi.createUser(form);
            if (res.success) {
                setOpen(false);
                resetForm();
                toast.success(res.message || 'Account created');
                onCreated?.();
            } else {
                setError(res.message || 'Failed to create account');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus size={16} /> Add Admin Account
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground max-w-md">
                <DialogHeader>
                    <DialogTitle>Create HR Manager / Super Admin Account</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Input
                        placeholder="Full Name"
                        value={form.full_name}
                        onChange={e => update('full_name', e.target.value)}
                        required
                        className="bg-muted border-border"
                    />
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
                    <Select value={form.role} onValueChange={v => update('role', v)}>
                        <SelectTrigger className="bg-muted border-border">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="HR_MANAGER">HR Manager</SelectItem>
                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                        </SelectContent>
                    </Select>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <DialogFooter>
                        <Button type="submit" disabled={loading || !form.role} className="w-full">
                            {loading ? 'Creating...' : 'Create Account'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}