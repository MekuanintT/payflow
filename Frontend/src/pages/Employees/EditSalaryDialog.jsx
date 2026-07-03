import { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import * as employeeApi from '../../api/employee.api';

export default function EditSalaryDialog({ employee, onUpdated }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        basic_salary: employee.basic_salary || '',
        house_allowance: employee.house_allowance || '',
        transport: employee.transport || '',
        tax_rate: employee.tax_rate || '',
        pension_rate: employee.pension_rate || '',
        other_deductions: employee.other_deductions || '',
    });

    function update(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    function resetState() {
        setError('');
        setForm({
            basic_salary: employee.basic_salary || '',
            house_allowance: employee.house_allowance || '',
            transport: employee.transport || '',
            tax_rate: employee.tax_rate || '',
            pension_rate: employee.pension_rate || '',
            other_deductions: employee.other_deductions || '',
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await employeeApi.updateSalary(employee.id, form);

            if (res.success) {
                setOpen(false);
                toast.success('Salary updated');
                onUpdated?.();
            } else {
                setError(res.message || 'Failed to update salary');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update salary');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                setOpen(v);
                if (v) resetState();
            }}
        >

            {/* TRIGGER */}
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                    <Pencil size={16} />
                </Button>
            </DialogTrigger>

            {/* MODAL */}
            <DialogContent className="
                bg-card border border-border text-foreground
                max-w-lg rounded-xl shadow-xl
            ">

                {/* HEADER */}
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-lg font-semibold">
                        Edit Salary
                    </DialogTitle>

                    <p className="text-sm text-muted-foreground">
                        {employee.full_name} • Update compensation structure
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-2">

                    {/* BASE PAY */}
                    <div className="space-y-3">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            Base Pay
                        </p>

                        <Input
                            type="number"
                            placeholder="Basic Salary"
                            value={form.basic_salary}
                            onChange={e => update('basic_salary', e.target.value)}
                            className="bg-muted border-border"
                        />
                    </div>

                    {/* ALLOWANCES */}
                    <div className="space-y-3">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            Allowances
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="number"
                                placeholder="House Allowance"
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

                    {/* DEDUCTIONS */}
                    <div className="space-y-3">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            Deductions
                        </p>

                        <div className="grid grid-cols-3 gap-3">
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

                            <Input
                                type="number"
                                placeholder="Other"
                                value={form.other_deductions}
                                onChange={e => update('other_deductions', e.target.value)}
                                className="bg-muted border-border"
                            />
                        </div>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2">
                            {error}
                        </div>
                    )}

                    {/* FOOTER */}
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'Saving...' : 'Save Salary'}
                        </Button>
                    </DialogFooter>

                </form>
            </DialogContent>
        </Dialog>
    );
}