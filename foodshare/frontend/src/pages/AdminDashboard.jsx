import { useEffect, useState } from 'react';
import { adminApi } from '../api/users';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('users'); // 'users' | 'donations'
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, donationsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.listUsers(),
        adminApi.listAllDonations(),
      ]);
      setStats(statsRes.stats);
      setUsers(usersRes.users);
      setDonations(donationsRes.donations);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const toggleStatus = async (u) => {
    setBusyId(u.userId);
    try {
      const newStatus = u.status === 'active' ? 'blocked' : 'active';
      const res = await adminApi.updateUserStatus(u.userId, newStatus);
      setUsers((list) => list.map((x) => (x.userId === u.userId ? res.user : x)));
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const removeUser = async (u) => {
    if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    setBusyId(u.userId);
    try {
      await adminApi.deleteUser(u.userId);
      setUsers((list) => list.filter((x) => x.userId !== u.userId));
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const filteredUsers = roleFilter ? users.filter((u) => u.role === roleFilter) : users;

  if (loading) return <Loader fullScreen />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-slate-900">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Manage users and monitor donation activity across FoodShare.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total users" value={stats.totalUsers} icon="👥" accent="brand" />
        <StatCard label="Donors / NGOs" value={`${stats.totalDonors} / ${stats.totalNgos}`} icon="🔀" accent="brand" />
        <StatCard label="Total donations" value={stats.totalDonations} icon="📦" accent="amber" />
        <StatCard label="Completed" value={stats.completedDonations} icon="✅" accent="slate" />
      </div>

      <div className="mt-10 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 text-sm font-semibold ${tab === 'users' ? 'border-b-2 border-brand-600 text-brand-700' : 'text-slate-500'}`}
        >
          User Management
        </button>
        <button
          onClick={() => setTab('donations')}
          className={`px-4 py-2 text-sm font-semibold ${tab === 'donations' ? 'border-b-2 border-brand-600 text-brand-700' : 'text-slate-500'}`}
        >
          All Donations
        </button>
      </div>

      {tab === 'users' && (
        <div className="mt-6">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field mb-4 max-w-[200px]">
            <option value="">All roles</option>
            <option value="donor">Donor</option>
            <option value="ngo">NGO</option>
            <option value="admin">Admin</option>
          </select>

          <div className="card overflow-x-auto !p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.userId} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3 capitalize text-slate-500">{u.role}</td>
                    <td className="px-4 py-3">
                      <span className={u.status === 'active' ? 'badge-available' : 'badge-rejected'}>{u.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(u)}
                          disabled={busyId === u.userId || u.role === 'admin'}
                          className="btn-outline !px-3 !py-1.5 text-xs"
                        >
                          {u.status === 'active' ? 'Block' : 'Unblock'}
                        </button>
                        <button
                          onClick={() => removeUser(u)}
                          disabled={busyId === u.userId || u.role === 'admin'}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'donations' && (
        <div className="mt-6 card overflow-x-auto !p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Food</th>
                <th className="px-4 py-3">Donor</th>
                <th className="px-4 py-3">NGO</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Posted</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.donationId} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800">{d.foodName}</td>
                  <td className="px-4 py-3 text-slate-500">{d.donorName}</td>
                  <td className="px-4 py-3 text-slate-500">{d.ngoName || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge-${d.status === 'available' ? 'available' : d.status === 'accepted' ? 'accepted' : d.status === 'completed' ? 'completed' : 'rejected'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
