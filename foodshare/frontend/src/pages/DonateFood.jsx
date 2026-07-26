import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { donationsApi } from '../api/donations';

const categories = ['Cooked Meals', 'Bakery', 'Fruits & Vegetables', 'Packaged Food', 'Dairy', 'General'];

export default function DonateFood() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    foodName: '',
    category: 'Cooked Meals',
    quantity: '',
    description: '',
    pickupLocation: '',
    expiryTime: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (imageFile) formData.append('image', imageFile);

      await donationsApi.create(formData);
      navigate('/donor/my-donations');
    } catch (err) {
      setError(err.message || 'Failed to post donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="badge-available">Post a donation</span>
        <h1 className="mt-4 font-display text-3xl font-bold text-slate-900">Donate Food</h1>
        <p className="mt-2 text-sm text-slate-500">Tell us what you have — NGOs nearby will be notified instantly.</p>
      </div>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-5">
        {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Food photo</label>
          <div className="flex items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
              {preview ? <img src={preview} alt="preview" className="h-full w-full object-cover" /> : <span className="text-3xl">🍽️</span>}
            </div>
            <label className="btn-outline cursor-pointer">
              Choose image
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Food name</label>
          <input name="foodName" required value={form.foodName} onChange={handleChange} className="input-field" placeholder="e.g. Vegetable Biryani" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="input-field">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Quantity</label>
            <input name="quantity" required value={form.quantity} onChange={handleChange} className="input-field" placeholder="e.g. Serves 20" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
          <textarea name="description" rows={3} value={form.description} onChange={handleChange} className="input-field" placeholder="Any details NGOs should know (allergens, packaging, etc.)" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Pickup location</label>
          <input name="pickupLocation" required value={form.pickupLocation} onChange={handleChange} className="input-field" placeholder="Full address for pickup" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Best before (optional)</label>
          <input type="datetime-local" name="expiryTime" value={form.expiryTime} onChange={handleChange} className="input-field" />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Posting…' : 'Post Donation'}
        </button>
      </form>
    </div>
  );
}
