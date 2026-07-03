import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Camera, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import * as settingsApi from '../../api/settings.api';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export default function SettingsPage() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const companyNameId = 'company-name';
    const companyAddressId = 'company-address';
    const taxRateId = 'default-tax-rate';
    const pensionRateId = 'default-pension-rate';
    const errorId = 'settings-error';

    const [form, setForm] = useState({
        company_name: '',
        company_address: '',
        default_tax_rate: '',
        default_pension_rate: '',
    });

    async function loadSettings() {
        setLoading(true);
        try {
            const res = await settingsApi.getSettings();
            if (res.success) {
                setSettings(res.data);
                setForm({
                    company_name: res.data.company_name || '',
                    company_address: res.data.company_address || '',
                    default_tax_rate: res.data.default_tax_rate ?? '',
                    default_pension_rate: res.data.default_pension_rate ?? '',
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSettings();
    }, []);

    function update(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    async function handleLogoSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('Only JPG, PNG, and WEBP images are allowed');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB');
            return;
        }

        setUploadingLogo(true);
        try {
            const res = await settingsApi.uploadLogo(file);
            if (res.success) {
                setSettings(prev => ({ ...prev, logo_url: res.data.logo_url }));
                toast.success('Logo updated');
            } else {
                toast.error(res.message || 'Failed to upload logo');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload logo');
        } finally {
            setUploadingLogo(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const res = await settingsApi.updateSettings(form);
            if (res.success) {
                setSettings(res.data);
                toast.success('Settings updated');
            } else {
                setError(res.message || 'Failed to update settings');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <main className="max-w-2xl space-y-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-foreground">Company settings</h1>
                    <p className="text-sm text-muted-foreground">
                        Keep the company details and default payroll rates aligned with your organization.
                    </p>
                </div>
                <div className="rounded-xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                    Loading company settings…
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-2xl space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">Company settings</h1>
                <p className="text-sm text-muted-foreground">
                    Keep the company details and default payroll rates aligned with your organization.
                </p>
            </div>

            <Card className="border-border bg-card shadow-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-base text-foreground">Company logo</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        This appears across the app and on payslips.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-background/60 px-4 py-5">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingLogo}
                            aria-label="Upload company logo"
                            className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted"
                        >
                            {settings?.logo_url ? (
                                <img
                                    src={`${API_BASE}${settings.logo_url}`}
                                    alt="Company logo"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Building2 size={28} className="text-muted-foreground" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/50">
                                <Camera size={20} className="text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                            </div>
                        </button>
                        <p className="text-sm text-muted-foreground">
                            {uploadingLogo ? 'Uploading…' : 'Click to upload a logo'}
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleLogoSelect}
                            className="hidden"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-base text-foreground">Company information</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        Update the company details used throughout payroll and reporting.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor={companyNameId} className="text-sm font-medium text-foreground">
                                Company name
                            </label>
                            <Input
                                id={companyNameId}
                                value={form.company_name}
                                onChange={(e) => update('company_name', e.target.value)}
                                required
                                className="bg-muted border-border text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor={companyAddressId} className="text-sm font-medium text-foreground">
                                Company address
                            </label>
                            <Input
                                id={companyAddressId}
                                value={form.company_address}
                                onChange={(e) => update('company_address', e.target.value)}
                                placeholder="Optional"
                                className="bg-muted border-border text-foreground"
                            />
                        </div>

                        <div className="rounded-lg border border-border bg-background/70 p-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">Default payroll rates</p>
                                <p className="text-sm text-muted-foreground">
                                    These are used to pre-fill tax and pension rates when adding new employees.
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor={taxRateId} className="text-sm font-medium text-foreground">
                                    Default tax rate (%)
                                </label>
                                <Input
                                    id={taxRateId}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={form.default_tax_rate}
                                    onChange={(e) => update('default_tax_rate', e.target.value)}
                                    className="bg-muted border-border text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor={pensionRateId} className="text-sm font-medium text-foreground">
                                    Default pension rate (%)
                                </label>
                                <Input
                                    id={pensionRateId}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={form.default_pension_rate}
                                    onChange={(e) => update('default_pension_rate', e.target.value)}
                                    className="bg-muted border-border text-foreground"
                                />
                            </div>
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

                        <Button type="submit" disabled={saving} className="w-full md:w-auto">
                            {saving ? 'Saving…' : 'Save changes'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}