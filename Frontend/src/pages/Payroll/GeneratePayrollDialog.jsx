import { useState } from 'react';
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
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
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import * as payrollApi from '../../api/payroll.api';

const now = new Date();
const monthOptions = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
];

function getMonthLabel(monthValue) {
    return monthOptions.find((option) => option.value === monthValue)?.label || 'Month';
}

export default function GeneratePayrollDialog({ onGenerated }) {
    const [open, setOpen] = useState(false);
    const [month, setMonth] = useState(String(now.getMonth() + 1));
    const [year, setYear] = useState(String(now.getFullYear()));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState('');
    const [validationError, setValidationError] = useState('');

    function handleOpenChange(nextOpen) {
        setOpen(nextOpen);
        if (!nextOpen) {
            setError('');
            setResult('');
            setValidationError('');
            setLoading(false);
        }
    }

    function validateForm() {
        const monthNumber = Number(month);
        const yearNumber = Number(year);

        if (!month || Number.isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
            setValidationError('Please choose a valid month from January to December.');
            return false;
        }

        if (!year || Number.isNaN(yearNumber) || yearNumber < 2000 || yearNumber > 2100) {
            setValidationError('Please enter a valid year between 2000 and 2100.');
            return false;
        }

        setValidationError('');
        return true;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        setError('');
        setResult('');
        setLoading(true);
        try {
            const res = await payrollApi.generatePayrollForAll(month, year);
            if (res.success) {
                setResult(res.message || `Payroll generated for ${getMonthLabel(month)} ${year}.`);
                onGenerated?.();
            } else {
                setError(res.message || 'Failed to generate payroll');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate payroll');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Sparkles size={16} /> Generate Payroll
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground max-w-md">
                <DialogHeader className="space-y-1">
                    <DialogTitle>Generate payroll</DialogTitle>
                    <DialogDescription>
                        This creates payroll for all active employees for the selected period.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-sm font-medium text-foreground">Payroll period</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Choose the month and year to generate payroll for.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Month</label>
                            <Select value={month} onValueChange={setMonth}>
                                <SelectTrigger className="w-full bg-muted border-border">
                                    <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {monthOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Year</label>
                            <Input
                                type="number"
                                placeholder="Year"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                min="2000"
                                max="2100"
                                required
                                className="bg-muted border-border"
                            />
                        </div>
                    </div>

                    {validationError && (
                        <div className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{validationError}</span>
                        </div>
                    )}
                    {error && (
                        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}
                    {result && (
                        <div className="flex items-start gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700">
                            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                            <span>{result}</span>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                            This action can be repeated for a different period.
                        </p>
                        <div className="flex gap-2">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={loading} className="min-w-32">
                                {loading ? 'Generating...' : 'Generate payroll'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}