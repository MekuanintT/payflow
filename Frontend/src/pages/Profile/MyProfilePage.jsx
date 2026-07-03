import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';
import * as employeeApi from '../../api/employee.api';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

function initials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function MyProfilePage() {
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [error, setError] = useState('');
    const [phone, setPhone] = useState('');
    const fileInputRef = useRef(null);
    const phoneInputId = 'profile-phone';
    const errorId = 'profile-error';

    async function loadProfile() {
        setLoading(true);
        setError('');
        try {
            const res = await employeeApi.getEmployees();
            if (res.success && res.data.length > 0) {
                const self = res.data[0];
                setEmployee(self);
                setPhone(self.phone || '');
            } else {
                setError('Could not find your employee profile');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProfile();
    }, []);

    async function handleAvatarSelect(e) {
        const file = e.target.files?.[0];
        if (!file || !employee) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('Only JPG, PNG, and WEBP images are allowed');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB');
            return;
        }

        setUploadingAvatar(true);
        try {
            const res = await employeeApi.uploadAvatar(employee.id, file);
            if (res.success) {
                setEmployee(prev => ({ ...prev, avatar_url: res.data.avatar_url }));
                toast.success('Profile picture updated');
            } else {
                toast.error(res.message || 'Failed to upload picture');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload picture');
        } finally {
            setUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    async function handleSave(e) {
        e.preventDefault();
        if (!employee) return;
        setSaving(true);
        setError('');
        try {
            const res = await employeeApi.updateEmployee(employee.id, {
                full_name: employee.full_name,
                phone,
                position: employee.position,
                department_id: employee.department_id,
            });
            if (res.success) {
                toast.success('Profile updated');
            } else {
                setError(res.message || 'Failed to update profile');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="max-w-lg">
                <Card className="bg-card border-border">
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Loading your profile…</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="max-w-lg">
                <Card className="bg-card border-border">
                    <CardContent>
                        <p className="text-sm font-medium text-destructive">{error || 'Profile not found'}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <main className="space-y-6 max-w-lg">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-foreground">My Profile</h1>
                <p className="text-sm text-muted-foreground">
                    View and update the personal details we use for payroll and communication.
                </p>
            </div>

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base text-foreground">Profile picture</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Upload a clear headshot so your profile is easy to identify.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-3">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingAvatar}
                            aria-label="Upload profile photo"
                            className="relative group rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <Avatar className="h-20 w-20 ring-2 ring-border">
                                {employee.avatar_url && (
                                    <AvatarImage src={`${API_BASE}${employee.avatar_url}`} alt={employee.full_name} />
                                )}
                                <AvatarFallback className="bg-accent text-accent-foreground text-lg">
                                    {initials(employee.full_name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/50 transition-colors">
                                <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </button>
                        <p className="text-sm text-muted-foreground">
                            {uploadingAvatar ? 'Uploading…' : 'Click the photo to update it'}
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleAvatarSelect}
                            className="hidden"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base text-foreground">Personal information</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Name, position, and department are managed by HR. Update your phone number if it changes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="profile-full-name" className="text-sm font-medium text-muted-foreground">
                                    Full name
                                </label>
                                <Input
                                    id="profile-full-name"
                                    value={employee.full_name || ''}
                                    disabled
                                    className="bg-muted/50 border-border text-muted-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="profile-code" className="text-sm font-medium text-muted-foreground">
                                    Employee code
                                </label>
                                <Input
                                    id="profile-code"
                                    value={employee.employee_code || ''}
                                    disabled
                                    className="bg-muted/50 border-border text-muted-foreground"
                                />
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="profile-department" className="text-sm font-medium text-muted-foreground">
                                    Department
                                </label>
                                <Input
                                    id="profile-department"
                                    value={employee.department_name || '—'}
                                    disabled
                                    className="bg-muted/50 border-border text-muted-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="profile-position" className="text-sm font-medium text-muted-foreground">
                                    Position
                                </label>
                                <Input
                                    id="profile-position"
                                    value={employee.position || '—'}
                                    disabled
                                    className="bg-muted/50 border-border text-muted-foreground"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="profile-email" className="text-sm font-medium text-muted-foreground">
                                Email
                            </label>
                            <Input
                                id="profile-email"
                                value={employee.email || ''}
                                disabled
                                className="bg-muted/50 border-border text-muted-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor={phoneInputId} className="text-sm font-medium text-foreground">
                                Phone
                            </label>
                            <Input
                                id={phoneInputId}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Phone number"
                                className="bg-muted border-border text-foreground"
                                aria-describedby={error ? errorId : undefined}
                            />
                        </div>

                        {error && (
                            <div
                                id={errorId}
                                role="alert"
                                className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
                            >
                                {error}
                            </div>
                        )}

                        <Button type="submit" disabled={saving} className="w-full">
                            {saving ? 'Saving…' : 'Save changes'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
