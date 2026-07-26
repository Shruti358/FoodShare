import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../api/users';

export default function Profile() {
  const { user, updateLocalUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    organizationName: user?.organizationName || '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      const res = await usersApi.updateProfile(payload);
      updateLocalUser(res.user);
      setMessage('Profile updated successfully');
      setForm((f) => ({ ...f, password: '' }));
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm capitalize text-slate-500">{user?.role} account · {user?.email}</p>
      </div>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-5">
        {message && <div className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">{message}</div>}
        {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
          <input name="name" value={form.name} onChange={handleChange} className="input-field" />
        </div>

        {user?.role === 'ngo' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Organization name</label>
            <input name="organizationName" value={form.organizationName} onChange={handleChange} className="input-field" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Address</label>
            <input name="address" value={form.address} onChange={handleChange} className="input-field" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">New password (optional)</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} className="input-field" placeholder="Leave blank to keep current password" />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
