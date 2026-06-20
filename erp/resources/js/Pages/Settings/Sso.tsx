import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';

interface SsoProvider {
  id: number; name: string; provider_type: 'saml' | 'oauth2' | 'oidc'; is_active: boolean;
  entity_id: string | null; sso_url: string | null; email_attribute: string | null; name_attribute: string | null;
}

export default function SsoSettings({ providers }: { providers: SsoProvider[] }) {
  const [showForm, setShowForm] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '', provider_type: 'saml' as const, is_active: true,
    entity_id: '', sso_url: '', slo_url: '', idp_certificate: '',
    email_attribute: 'email', name_attribute: 'displayName',
    client_id: '', client_secret: '', authorization_url: '', token_url: '', userinfo_url: '',
    metadata_url: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/settings/sso', { onSuccess: () => { reset(); setShowForm(false); } });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Single Sign-On (SSO)</h1>
        <button onClick={() => setShowForm(v => !v)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          {showForm ? 'Cancel' : '+ Add Provider'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl shadow p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-700">New SSO Provider</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Provider Name</label>
              <input value={data.name} onChange={e => setData('name', e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Provider Type</label>
              <select value={data.provider_type} onChange={e => setData('provider_type', e.target.value as any)}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="saml">SAML 2.0</option>
                <option value="oauth2">OAuth 2.0</option>
                <option value="oidc">OpenID Connect</option>
              </select>
            </div>
          </div>

          {data.provider_type === 'saml' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">IdP Entity ID</label>
                  <input value={data.entity_id} onChange={e => setData('entity_id', e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">SSO URL (IdP Login)</label>
                  <input type="url" value={data.sso_url} onChange={e => setData('sso_url', e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">IdP X.509 Certificate</label>
                <textarea value={data.idp_certificate} onChange={e => setData('idp_certificate', e.target.value)}
                  rows={4} placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                  className="w-full border rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email Attribute</label>
                  <input value={data.email_attribute} onChange={e => setData('email_attribute', e.target.value)}
                    placeholder="email" className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name Attribute</label>
                  <input value={data.name_attribute} onChange={e => setData('name_attribute', e.target.value)}
                    placeholder="displayName" className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>
            </>
          )}

          {(data.provider_type === 'oauth2' || data.provider_type === 'oidc') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Client ID</label>
                <input value={data.client_id} onChange={e => setData('client_id', e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Client Secret</label>
                <input type="password" value={data.client_secret} onChange={e => setData('client_secret', e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Authorization URL</label>
                <input type="url" value={data.authorization_url} onChange={e => setData('authorization_url', e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Token URL</label>
                <input type="url" value={data.token_url} onChange={e => setData('token_url', e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)}
                className="rounded" />
              Active
            </label>
          </div>

          <button type="submit" disabled={processing}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50">
            {processing ? 'Saving...' : 'Save Provider'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-5 py-3 border-b">
          <span className="font-semibold text-gray-700">SSO Providers ({providers.length})</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Name</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Type</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">Status</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">SSO URL</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium">SP Metadata</th>
            </tr>
          </thead>
          <tbody>
            {providers.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                <td className="px-4 py-3 text-gray-600 uppercase text-xs">{p.provider_type}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-xs">{p.sso_url ?? '—'}</td>
                <td className="px-4 py-3">
                  {p.provider_type === 'saml' && (
                    <a href={`/sso/saml/${p.id}/metadata`} target="_blank" rel="noreferrer"
                      className="text-blue-600 hover:underline text-xs">SP Metadata XML</a>
                  )}
                </td>
              </tr>
            ))}
            {providers.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No SSO providers configured.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
