import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { donationsApi } from '../api/donations';
import { useAuth } from '../context/AuthContext';
import DonationCard from '../components/DonationCard';
import Loader from '../components/Loader';

export default function MyDonations() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await donationsApi.listMine();
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

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this donation?')) return;
    setBusyId(id);
    try {
      await donationsApi.cancel(id);
      setDonations((d) => d.filter((don) => don.donationId !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleComplete = async (id) => {
    setBusyId(id);
    try {
      const res = await donationsApi.complete(id);
      setDonations((d) => d.map((don) => (don.donationId === id ? res.donation : don)));
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">My Donations</h1>
          <p className="mt-1 text-sm text-slate-500">
            {user.role === 'donor' ? 'Donations you have posted' : 'Donations you have accepted'}
          </p>
        </div>
        {user.role === 'donor' && (
          <Link to="/donor/donate" className="btn-primary">+ New Donation</Link>
        )}
      </div>

      {error && <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <Loader />
      ) : donations.length === 0 ? (
        <div className="card mt-8 text-center">
          <p className="text-4xl">📭</p>
          <p className="mt-3 text-slate-500">No donations yet.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {donations.map((donation) => (
            <DonationCard
              key={donation.donationId}
              donation={donation}
              actions={
                user.role === 'donor' && donation.status === 'available' ? (
                  <button
                    onClick={() => handleCancel(donation.donationId)}
                    disabled={busyId === donation.donationId}
                    className="btn-outline w-full"
                  >
                    Cancel
                  </button>
                ) : donation.status === 'accepted' ? (
                  <button
                    onClick={() => handleComplete(donation.donationId)}
                    disabled={busyId === donation.donationId}
                    className="btn-primary w-full"
                  >
                    Mark Completed
                  </button>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
