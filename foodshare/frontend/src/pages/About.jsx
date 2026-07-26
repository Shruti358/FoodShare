export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="badge-available">About FoodShare</span>
        <h1 className="mt-4 font-display text-4xl font-bold text-slate-900">
          Every year, tons of good food goes to waste. We're changing that.
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          FoodShare is a smart food donation and distribution platform that bridges the gap between people who
          have surplus food and NGOs who can get it to those who need it most.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="card">
          <h2 className="font-display text-xl font-semibold text-slate-900">Our Mission</h2>
          <p className="mt-3 text-sm text-slate-500">
            To eliminate avoidable food waste by making it effortless for donors — restaurants, event organizers,
            grocers, and households — to connect surplus food with verified NGOs in real time, tracked from
            donation to delivery.
          </p>
        </div>
        <div className="card">
          <h2 className="font-display text-xl font-semibold text-slate-900">How We Help</h2>
          <p className="mt-3 text-sm text-slate-500">
            Our platform gives donors a simple way to list food with photos and pickup details, gives NGOs a live
            feed of nearby donations they can accept, and gives admins the tools to keep the community safe and
            accountable.
          </p>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-center font-display text-2xl font-bold text-slate-900">Why it matters</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="card text-center">
            <p className="font-display text-3xl font-bold text-brand-700">1/3</p>
            <p className="mt-2 text-sm text-slate-500">of all food produced globally is wasted every year</p>
          </div>
          <div className="card text-center">
            <p className="font-display text-3xl font-bold text-brand-700">828M</p>
            <p className="mt-2 text-sm text-slate-500">people face hunger worldwide despite this surplus</p>
          </div>
          <div className="card text-center">
            <p className="font-display text-3xl font-bold text-brand-700">100%</p>
            <p className="mt-2 text-sm text-slate-500">of donations on FoodShare are tracked end-to-end</p>
          </div>
        </div>
      </div>
    </div>
  );
}
