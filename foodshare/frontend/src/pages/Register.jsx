import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleHome = { donor: '/donor', ngo: '/ngo', admin: '/admin' };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: 'donor',
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    organizationName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      navigate(roleHome[user.role] || '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-2xl text-white mx-auto">🌿</span>
          <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Join FoodShare as a donor or an NGO partner</p>
        </div>

        <form onSubmit={handleSubmit} className="card mt-8 space-y-5">
          {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              {['donor', 'ngo'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setForm({ ...form, role: r })}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${
                    form.role === r
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r === 'ngo' ? 'NGO' : 'Donor'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
            <input name="name" required value={form.name} onChange={handleChange} className="input-field" placeholder="Jane Doe" />
          </div>

          {form.role === 'ngo' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Organization name</label>
              <input
                name="organizationName" value={form.organizationName} onChange={handleChange}
                className="input-field" placeholder="Hope Foundation"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
            <input type="email" name="email" required value={form.email} onChange={handleChange} className="input-field" placeholder="you@example.com" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" name="password" required minLength={6} value={form.password} onChange={handleChange} className="input-field" placeholder="At least 6 characters" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="98765 43210" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Address</label>
              <input name="address" value={form.address} onChange={handleChange} className="input-field" placeholder="City, State" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-700 hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
