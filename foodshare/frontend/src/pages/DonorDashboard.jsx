import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { donationsApi } from '../api/donations';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import DonationCard from '../components/DonationCard';
import Loader from '../components/Loader';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    donationsApi
      .listMine()
      .then((res) => setDonations(res.donations))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: donations.length,
    available: donations.filter((d) => d.status === 'available').length,
    accepted: donations.filter((d) => d.status === 'accepted').length,
    completed: donations.filter((d) => d.status === 'completed').length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Welcome back, {user.name.split(' ')[0]} 👋</h1>
          <p className="mt-1 text-sm text-slate-500">Here's an overview of your donations.</p>
        </div>
        <Link to="/donor/donate" className="btn-primary">+ Donate Food</Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total posted" value={stats.total} icon="📦" accent="brand" />
        <StatCard label="Available" value={stats.available} icon="🟢" accent="brand" />
        <StatCard label="Accepted" value={stats.accepted} icon="🤝" accent="amber" />
        <StatCard label="Completed" value={stats.completed} icon="✅" accent="slate" />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-slate-900">Recent donations</h2>
        <Link to="/donor/my-donations" className="text-sm font-semibold text-brand-700 hover:underline">View all</Link>
      </div>

      {loading ? (
        <Loader />
      ) : donations.length === 0 ? (
        <div className="card mt-6 text-center">
          <p className="text-4xl">🍽️</p>
          <p className="mt-3 text-slate-500">You haven't posted any donations yet.</p>
          <Link to="/donor/donate" className="btn-primary mt-4 inline-flex">Post your first donation</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {donations.slice(0, 3).map((donation) => (
            <DonationCard key={donation.donationId} donation={donation} />
          ))}
        </div>
      )}
    </div>
  );
}
