import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-brand-50/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">🌿</span>
              <span className="font-display text-lg font-bold text-slate-900">FoodShare</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Rescuing surplus food, one donation at a time. Connecting generous donors with NGOs across the community.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-slate-900">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link to="/" className="hover:text-brand-700">Home</Link></li>
              <li><Link to="/about" className="hover:text-brand-700">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-brand-700">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-slate-900">Get Involved</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link to="/register" className="hover:text-brand-700">Become a Donor</Link></li>
              <li><Link to="/register" className="hover:text-brand-700">Register your NGO</Link></li>
              <li><Link to="/login" className="hover:text-brand-700">Log in</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-slate-900">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li>support@foodshare.org</li>
              <li>+91 98765 43210</li>
              <li>Lucknow, Uttar Pradesh, India</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} FoodShare. Built to reduce food waste, together.
        </div>
      </div>
    </footer>
  );
}
