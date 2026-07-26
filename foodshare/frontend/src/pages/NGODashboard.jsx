import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { donationsApi } from '../api/donations';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import DonationCard from '../components/DonationCard';
import Loader from '../components/Loader';

export default function NGODashboard() {
  const { user } = useAuth();
  const [available, setAvailable] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([donationsApi.listAvailable(), donationsApi.listMine()])
      .then(([availRes, mineRes]) => {
        setAvailable(availRes.donations);
        setMine(mineRes.donations);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    availableNow: available.length,
    accepted: mine.filter((d) => d.status === 'accepted').length,
    completed: mine.filter((d) => d.status === 'completed').length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Welcome, {user.organizationName || user.name} 👋</h1>
          <p className="mt-1 text-sm text-slate-500">Here's what's happening on FoodShare right now.</p>
        </div>
        <Link to="/ngo/available" className="btn-primary">Browse Donations</Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Available near you" value={stats.availableNow} icon="🟢" accent="brand" />
        <StatCard label="Currently accepted" value={stats.accepted} icon="🤝" accent="amber" />
        <StatCard label="Completed pickups" value={stats.completed} icon="✅" accent="slate" />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-slate-900">Newly available</h2>
        <Link to="/ngo/available" className="text-sm font-semibold text-brand-700 hover:underline">View all</Link>
      </div>

      {loading ? (
        <Loader />
      ) : available.length === 0 ? (
        <div className="card mt-6 text-center">
          <p className="text-4xl">📭</p>
          <p className="mt-3 text-slate-500">No donations available right now. Check back soon!</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {available.slice(0, 3).map((donation) => (
            <DonationCard key={donation.donationId} donation={donation} />
          ))}
        </div>
      )}
    </div>
  );
}
