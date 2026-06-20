import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    qrCodeUrl: string;
    secret: string;
    enabled: boolean;
}

export default function TwoFactorSetup({ qrCodeUrl, secret, enabled }: Props) {
    const enableForm = useForm({ code: '' });
    const disableForm = useForm({ password: '' });

    function handleEnable(e: React.FormEvent) {
        e.preventDefault();
        enableForm.post('/2fa/enable');
    }

    function handleDisable(e: React.FormEvent) {
        e.preventDefault();
        disableForm.post('/2fa/disable');
    }

    return (
        <AppLayout>
            <Head title="Two-Factor Authentication" />
            <div className="max-w-lg space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Two-Factor Authentication</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Add an extra layer of security to your account using a TOTP authenticator app.
                    </p>
                </div>

                {enabled ? (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-800">
                            Two-factor authentication is currently <strong>enabled</strong>.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm font-medium text-amber-800">
                            Two-factor authentication is currently <strong>disabled</strong>.
                        </p>
                    </div>
                )}

                {!enabled && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-base font-medium text-slate-900">Setup Instructions</h2>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
                            <li>Download an authenticator app (e.g. Google Authenticator, Authy).</li>
                            <li>Scan the QR code below or enter the manual key.</li>
                            <li>Enter the 6-digit code from your app to verify and enable.</li>
                        </ol>

                        <div className="flex flex-col items-center gap-4 py-2">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeUrl)}&size=200x200`}
                                alt="QR Code for 2FA setup"
                                className="h-48 w-48 rounded-lg border border-slate-200 p-1"
                            />
                            <div className="text-center">
                                <p className="text-xs text-slate-500 mb-1">Manual entry key:</p>
                                <code className="rounded bg-slate-100 px-3 py-1.5 text-sm font-mono tracking-wider text-slate-700 select-all">
                                    {secret}
                                </code>
                            </div>
                        </div>

                        <form onSubmit={handleEnable} className="space-y-3">
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-slate-700">
                                    Verification Code
                                </label>
                                <input
                                    id="code"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="000000"
                                    value={enableForm.data.code}
                                    onChange={(e) => enableForm.setData('code', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-center text-lg font-mono tracking-widest focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {enableForm.errors.code && (
                                    <p className="mt-1 text-sm text-red-600">{enableForm.errors.code}</p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={enableForm.processing}
                                loading={enableForm.processing}
                            >
                                Enable Two-Factor Authentication
                            </Button>
                        </form>
                    </div>
                )}

                {enabled && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-base font-medium text-slate-900">Disable Two-Factor Authentication</h2>
                        <p className="text-sm text-slate-500">
                            Confirm your password to disable two-factor authentication.
                        </p>
                        <form onSubmit={handleDisable} className="space-y-3">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                    Current Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={disableForm.data.password}
                                    onChange={(e) => disableForm.setData('password', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                {disableForm.errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{disableForm.errors.password}</p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                variant="danger"
                                disabled={disableForm.processing}
                                loading={disableForm.processing}
                            >
                                Disable Two-Factor Authentication
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
