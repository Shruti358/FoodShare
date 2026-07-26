import { Link } from 'react-router-dom';

const steps = [
  { title: 'Donors post surplus food', desc: 'Restaurants, events, and households list extra food with photos, quantity, and pickup details.', icon: '🍱' },
  { title: 'NGOs discover & accept', desc: 'Verified NGOs browse nearby available donations and accept the ones they can collect.', icon: '🤝' },
  { title: 'Food reaches people in need', desc: 'NGOs pick up the donation and distribute it, and everyone gets notified in real time.', icon: '❤️' },
];

const stats = [
  { label: 'Meals rescued', value: '12,400+' },
  { label: 'Partner NGOs', value: '85+' },
  { label: 'Active donors', value: '640+' },
  { label: 'Cities covered', value: '14' },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <span className="badge-available">Reducing food waste, together</span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
              Turn extra food into someone's next meal.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              FoodShare connects donors with surplus food to verified NGOs who deliver it to communities in need —
              fast, transparent, and tracked end-to-end.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary px-6 py-3 text-base">Start Donating</Link>
              <Link to="/about" className="btn-secondary px-6 py-3 text-base">Learn More</Link>
            </div>
          </div>

          <div className="relative">
            <div className="card !p-8">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-xl bg-brand-50 p-4 text-center">
                    <p className="font-display text-2xl font-bold text-brand-700">{s.value}</p>
                    <p className="mt-1 text-xs text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-slate-900">How FoodShare works</h2>
          <p className="mt-3 text-slate-500">Three simple steps from surplus to someone's plate.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="card text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-3xl">
                {step.icon}
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="bg-brand-50/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900">Built for every role</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="card">
              <h3 className="font-display text-lg font-semibold text-brand-700">Donors</h3>
              <p className="mt-2 text-sm text-slate-500">List surplus food in minutes with photos and pickup info, and track it through to completion.</p>
            </div>
            <div className="card">
              <h3 className="font-display text-lg font-semibold text-brand-700">NGOs</h3>
              <p className="mt-2 text-sm text-slate-500">Browse available donations nearby, accept what you can collect, and coordinate pickup directly.</p>
            </div>
            <div className="card">
              <h3 className="font-display text-lg font-semibold text-brand-700">Admins</h3>
              <p className="mt-2 text-sm text-slate-500">Oversee the platform, manage users, and monitor donation activity from one dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold text-slate-900">Ready to make an impact?</h2>
        <p className="mt-3 text-slate-500">Join FoodShare today as a donor or NGO partner — it takes less than two minutes.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/register" className="btn-primary px-6 py-3 text-base">Create your account</Link>
        </div>
      </section>
    </div>
  );
}
