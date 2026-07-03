import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import * as authApi from '../../api/auth.api';

export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const currentPasswordId = 'current-password';
    const newPasswordId = 'new-password';
    const confirmPasswordId = 'confirm-password';
    const errorId = 'change-password-error';

    function handleInputChange(setValue) {
        return (e) => {
            setError('');
            setValue(e.target.value);
        };
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('New password and confirmation do not match');
            return;
        }

        setLoading(true);
        try {
            const res = await authApi.changePassword(currentPassword, newPassword);
            if (res.success) {
                toast.success('Password updated successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setError(res.message || 'Failed to update password');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6 max-w-md">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">Change password</h1>
                <p className="text-sm text-muted-foreground">Update your account password for a more secure login.</p>
            </div>

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-foreground text-base">Update password</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Choose a strong password and confirm it below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor={currentPasswordId} className="text-sm font-medium text-foreground">
                                Current password
                            </label>
                            <Input
                                id={currentPasswordId}
                                type="password"
                                value={currentPassword}
                                onChange={handleInputChange(setCurrentPassword)}
                                required
                                autoComplete="current-password"
                                className="bg-muted border-border text-foreground"
                                aria-describedby={error ? errorId : undefined}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor={newPasswordId} className="text-sm font-medium text-foreground">
                                New password
                            </label>
                            <Input
                                id={newPasswordId}
                                type="password"
                                value={newPassword}
                                onChange={handleInputChange(setNewPassword)}
                                required
                                minLength={6}
                                autoComplete="new-password"
                                className="bg-muted border-border text-foreground"
                                aria-describedby={error ? errorId : undefined}
                            />
                            <p className="text-xs text-muted-foreground">Minimum 6 characters.</p>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor={confirmPasswordId} className="text-sm font-medium text-foreground">
                                Confirm new password
                            </label>
                            <Input
                                id={confirmPasswordId}
                                type="password"
                                value={confirmPassword}
                                onChange={handleInputChange(setConfirmPassword)}
                                required
                                minLength={6}
                                autoComplete="new-password"
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

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? 'Updating…' : 'Update password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}