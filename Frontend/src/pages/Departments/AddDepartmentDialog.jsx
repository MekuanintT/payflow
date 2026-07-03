import { useState } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import * as departmentApi from '../../api/department.api';

export default function AddDepartmentDialog({ onCreated }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await departmentApi.createDepartment({ name, description });

            if (res.success) {
                setOpen(false);
                setName('');
                setDescription('');
                toast.success('Department created');
                onCreated?.();
            } else {
                setError(res.message || 'Failed to create department');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create department');
        } finally {
            setLoading(false);
        }
    }

    function handleOpenChange(value) {
        setOpen(value);

        // reset form when closing
        if (!value) {
            setName('');
            setDescription('');
            setError('');
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>

            {/* TRIGGER */}
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-sm">
                    <Plus size={16} />
                    Add Department
                </Button>
            </DialogTrigger>

            {/* MODAL */}
            <DialogContent className="
                bg-card border border-border text-foreground
                max-w-md rounded-xl shadow-xl
            ">

                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-lg font-semibold">
                        Create Department
                    </DialogTitle>

                    <p className="text-sm text-muted-foreground">
                        Add a new department to organize your teams and structure.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">

                    {/* NAME */}
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">
                            Department Name
                        </label>
                        <Input
                            placeholder="e.g. Engineering, HR, Finance"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="bg-muted border-border focus-visible:ring-1"
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">
                            Description (optional)
                        </label>
                        <Input
                            placeholder="Brief description of this department"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-muted border-border focus-visible:ring-1"
                        />
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2">
                            {error}
                        </div>
                    )}

                    {/* ACTIONS */}
                    <DialogFooter className="pt-2">
                        <Button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="w-full transition-all"
                        >
                            {loading ? 'Creating...' : 'Create Department'}
                        </Button>
                    </DialogFooter>

                </form>
            </DialogContent>
        </Dialog>
    );
}