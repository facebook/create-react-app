import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/Common/Button';
import type { PageProps } from '@/types';

export default function TwoFactorChallenge(_props: PageProps) {
    const { data, setData, post, processing, errors } = useForm({ code: '' });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/2fa/verify');
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <Head title="Two-Factor Authentication" />
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                            <svg className="h-7 w-7 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-semibold text-slate-900">Two-Factor Authentication</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Enter the 6-digit code from your authenticator app, or a recovery code.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-slate-700">
                                Authentication Code
                            </label>
                            <input
                                id="code"
                                type="text"
                                inputMode="numeric"
                                autoFocus
                                autoComplete="one-time-code"
                                placeholder="000000"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-2xl font-mono tracking-widest focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            {errors.code && (
                                <p className="mt-1.5 text-sm text-red-600">{errors.code}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={processing}
                            loading={processing}
                            className="w-full"
                        >
                            Verify Code
                        </Button>
                    </form>

                    <p className="mt-4 text-center text-xs text-slate-400">
                        If you've lost access to your device, enter one of your recovery codes instead.
                    </p>
                </div>
            </div>
        </div>
    );
}
