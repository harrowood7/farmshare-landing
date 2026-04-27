import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  processorSlug: string;
  processorName: string;
}

const SPECIES_OPTIONS = ['Beef', 'Bison', 'Pork', 'Lamb', 'Goat', 'Other'];

// Next 24 calendar months + "Flexible". Computed at module load.
const TIMING_OPTIONS: string[] = (() => {
  const now = new Date();
  const months: string[] = [];
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(d.toLocaleString('en-US', { month: 'short', year: 'numeric' }));
  }
  months.push('Flexible');
  return months;
})();

export default function RequestSchedulingModal({ open, onClose, processorSlug, processorName }: Props) {
  const [species, setSpecies] = useState('');
  const [headCount, setHeadCount] = useState('');
  const [timing, setTiming] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const canSubmit = species && headCount && timing && name && email;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: 'd9ea2243-5be0-499d-915e-be1be2b6fc88',
          subject: `📆 ${processorName}: ${species} × ${headCount}, ${timing}`,
          from_name: 'Farmshare Directory',
          to: 'henry@farmshare.co',
          processor_slug: processorSlug,
          processor_name: processorName,
          species,
          head_count: headCount,
          timing,
          name,
          email,
          phone: phone || 'Not provided',
          notes: notes || 'None',
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Submission failed');
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit scheduling request:', err);
      setError('Something went wrong. Please try again or email henry@farmshare.co.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setSpecies('');
    setHeadCount('');
    setTiming('');
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setSubmitted(false);
    setError(null);
    onClose();
  }

  const pillClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
      active
        ? 'bg-brand-green text-white border-brand-green'
        : 'bg-white text-stone-700 border-stone-300 hover:border-brand-green'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-stone-100">
          <div>
            <h2 className="text-xl font-roca text-brand-green">Request scheduling</h2>
            <p className="text-sm text-stone-500 mt-1">{processorName}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-stone-400 hover:text-stone-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-brand-orange mx-auto mb-4" />
            <h3 className="text-lg font-bold text-brand-green mb-2">Request received</h3>
            <p className="text-stone-600 mb-6">
              Thanks — we'll reach out to {processorName} on your behalf and follow up with you at {email}.
            </p>
            <button
              onClick={handleClose}
              className="bg-brand-orange text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-yellow transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-sm text-stone-600">
              Share what you need and we'll get back to you within 1–2 business days.
            </p>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">
                What species? <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIES_OPTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => setSpecies(s)} className={pillClass(species === s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">
                How many head? <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={headCount}
                onChange={(e) => setHeadCount(e.target.value)}
                placeholder="e.g. 1"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="timing-select" className="block text-sm font-medium text-stone-700">
                When do you need it? <span className="text-red-500">*</span>
              </label>
              <select
                id="timing-select"
                required
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-orange cursor-pointer"
              >
                <option value="" disabled>Select a month…</option>
                {TIMING_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <hr className="border-stone-100" />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">
                Your name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-stone-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-stone-700">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">
                Notes <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Breed, approximate weight, pickup preferences…"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange resize-none"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="w-full bg-brand-orange text-white py-3 rounded-lg font-bold hover:bg-brand-yellow transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Submitting…' : 'Send scheduling request'}
            </button>

            <p className="text-xs text-stone-500 text-center">
              Need to book right now?{' '}
              <a href="/find-a-processor?online=true" className="text-brand-green font-semibold hover:underline">
                See processors with online scheduling →
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
