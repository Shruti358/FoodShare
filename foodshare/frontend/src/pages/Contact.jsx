import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // This is a static contact form; wiring to a backend endpoint (e.g. /api/contact
    // publishing to SNS) can be added the same way donation actions call the API.
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="badge-available">Get in touch</span>
        <h1 className="mt-4 font-display text-4xl font-bold text-slate-900">Contact Us</h1>
        <p className="mt-3 text-slate-500">Questions, partnership ideas, or feedback — we'd love to hear from you.</p>
      </div>

      <div className="card mt-10">
        {submitted ? (
          <div className="py-8 text-center">
            <p className="text-3xl">✅</p>
            <h3 className="mt-3 font-display text-lg font-semibold text-slate-900">Message sent</h3>
            <p className="mt-2 text-sm text-slate-500">Thanks for reaching out — our team will get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
              <input
                name="name" required value={form.name} onChange={handleChange}
                className="input-field" placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
              <input
                type="email" name="email" required value={form.email} onChange={handleChange}
                className="input-field" placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Message</label>
              <textarea
                name="message" required rows={5} value={form.message} onChange={handleChange}
                className="input-field" placeholder="How can we help?"
              />
            </div>
            <button type="submit" className="btn-primary w-full">Send message</button>
          </form>
        )}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3 text-center">
        <div className="card">
          <p className="text-2xl">📧</p>
          <p className="mt-2 text-sm font-medium text-slate-700">support@foodshare.org</p>
        </div>
        <div className="card">
          <p className="text-2xl">📞</p>
          <p className="mt-2 text-sm font-medium text-slate-700">+91 98765 43210</p>
        </div>
        <div className="card">
          <p className="text-2xl">📍</p>
          <p className="mt-2 text-sm font-medium text-slate-700">Lucknow, Uttar Pradesh, India</p>
        </div>
      </div>
    </div>
  );
}
