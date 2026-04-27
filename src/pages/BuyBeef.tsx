import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Send, CheckCircle } from 'lucide-react';

const SPECIES_OPTIONS = ['Beef', 'Pork', 'Lamb', 'Goat', 'Other'];
const CUT_OPTIONS = ['Whole', 'Half', 'Quarter', 'Not sure'];
const TIMING_OPTIONS = ['Within 1 month', '1–3 months', '3–6 months', 'Just exploring'];

export default function BuyBeef() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    zip: '',
    species: '',
    cutType: '',
    timing: '',
    notes: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    document.title = 'Buy Local Beef, Pork & Lamb | Farmshare';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Find a local meat processor near you and buy a quarter, half, or whole animal direct from the farm. Farmshare connects you with independent processors across the country.');
    }
  }, []);

  const update = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.species || !form.cutType) return;

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: 'd9ea2243-5be0-499d-915e-be1be2b6fc88',
          subject: `🥩 New buyer lead: ${form.name} — ${form.species} ${form.cutType}`,
          from_name: 'Farmshare Buy Beef',
          to: 'henry@farmshare.co',
          name: form.name,
          email: form.email,
          phone: form.phone || 'Not provided',
          zip: form.zip || 'Not provided',
          species: form.species,
          cut_type: form.cutType,
          timing: form.timing || 'Not specified',
          notes: form.notes || 'None',
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Submission failed');

      setStatus('success');
    } catch (err) {
      console.error('Failed to submit:', err);
      setErrorMsg('Something went wrong. Please try again or call us at (301) 448-0543.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <main className="min-h-screen bg-brand-cream">
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="text-center mb-10">
            <CheckCircle className="w-16 h-16 text-brand-green mx-auto mb-4" />
            <h1 className="text-3xl font-roca text-brand-green mb-3">We've got your request!</h1>
            <p className="text-lg text-stone-600">
              We'll connect you with a processor in your area. Expect to hear from us within 1–2 business days.
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link to="/find-a-processor" className="text-brand-green font-medium hover:underline">
              Browse all processors →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <section className="bg-brand-green text-white py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight text-white font-roca tracking-tight">
            Buy Local Beef, Pork & Lamb
          </h1>
          <p className="text-xl text-brand-cream/80 max-w-xl mx-auto font-medium">
            Tell us what you're looking for and we'll connect you with an independent processor in your area.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-lg">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-5">

            {/* Species */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-stone-700">
                What are you looking for? <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIES_OPTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update('species', s)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      form.species === s
                        ? 'bg-brand-green text-white border-brand-green'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-brand-green'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Cut type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-stone-700">
                How much? <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CUT_OPTIONS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => update('cutType', c)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      form.cutType === c
                        ? 'bg-brand-green text-white border-brand-green'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-brand-green'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Timing */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-stone-700">
                When do you need it?
              </label>
              <div className="flex flex-wrap gap-2">
                {TIMING_OPTIONS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => update('timing', t)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      form.timing === t
                        ? 'bg-brand-green text-white border-brand-green'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-brand-green'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label htmlFor="zip" className="block text-sm font-medium text-stone-700">
                <MapPin className="w-4 h-4 inline mr-1" />
                Your zip code
              </label>
              <input
                id="zip"
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="e.g. 80216"
                value={form.zip}
                onChange={e => update('zip', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none"
              />
            </div>

            <hr className="border-stone-200" />

            {/* Contact info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-stone-700">
                  Your name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-stone-700">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium text-stone-700">
                Anything else we should know?
              </label>
              <textarea
                id="notes"
                rows={2}
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                placeholder="e.g. grass-fed only, specific breeds, delivery needs..."
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none resize-none"
              />
            </div>

            {errorMsg && (
              <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting' || !form.name || !form.email || !form.species || !form.cutType}
              className="w-full bg-brand-green text-white py-3 rounded-lg font-bold text-lg hover:bg-brand-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'submitting' ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Find me a processor
                </>
              )}
            </button>

            <p className="text-xs text-stone-400 text-center">
              We'll reach out within 1–2 business days to connect you with a processor.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
