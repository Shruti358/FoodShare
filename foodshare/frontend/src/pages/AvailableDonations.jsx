import { useEffect, useState } from 'react';
import { donationsApi } from '../api/donations';
import DonationCard from '../components/DonationCard';
import Loader from '../components/Loader';

const categories = ['All', 'Cooked Meals', 'Bakery', 'Fruits & Vegetables', 'Packaged Food', 'Dairy', 'General'];

export default function AvailableDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await donationsApi.listAvailable();
      setDonations(res.donations);
    } catch (err) {
      setError(err.message || 'Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAccept = async (id) => {
    setBusyId(id);
    try {
      await donationsApi.accept(id);
      setDonations((d) => d.filter((don) => don.donationId !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const filtered = donations.filter((d) => {
    const matchesCategory = category === 'All' || d.category === category;
    const matchesSearch = d.foodName.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Available Donations</h1>
        <p className="mt-1 text-sm text-slate-500">Browse and accept donations posted by donors near you.</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search food name…"
          className="input-field max-w-xs"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field max-w-[200px]">
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {error && <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <div className="card mt-8 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-3 text-slate-500">No matching donations right now. Check back soon!</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((donation) => (
            <DonationCard
              key={donation.donationId}
              donation={donation}
              actions={
                <button
                  onClick={() => handleAccept(donation.donationId)}
                  disabled={busyId === donation.donationId}
                  className="btn-primary w-full"
                >
                  {busyId === donation.donationId ? 'Accepting…' : 'Accept Donation'}
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
