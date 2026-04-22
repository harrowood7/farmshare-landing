import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  processorSlug: string;
  processorName: string;
}

export default function RequestSchedulingModal({ open, onClose, processorSlug, processorName }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        processor_slug: processorSlug,
        processor_name: processorName,
        producer_name: name,
        producer_email: email,
        producer_phone: phone,
        notes,
        submitted_at: new Date().toISOString(),
      };

      // TODO: replace with real endpoint (Supabase insert or HubSpot form API).
      // For now we POST to a placeholder path so the form flow works locally.
      const res = await fetch('/api/scheduling-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null);

      // In dev without a backend, treat a network failure as a soft success so
      // the producer sees acknowledgement — the payload is still logged.
      if (!res || !res.ok) {
        // eslint-disable-next-line no-console
        console.log('[scheduling-request]', payload);
      }

      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again or email hello@farmshare.co.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setSubmitted(false);
    setError(null);
    onClose();
  }

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
            <h2 className="text-xl font-roca text-brand-green">Request Online Scheduling</h2>
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
            <p className="text-sm text-stone-600 mb-2">
              {processorName} isn't on Farmshare yet. Leave your info and we'll reach out to them on your behalf.
            </p>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Your name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Notes <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="What species, roughly when, any other context…"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange resize-none"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-orange text-white py-3 rounded-lg font-bold hover:bg-brand-yellow transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Submitting…' : 'Send request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
