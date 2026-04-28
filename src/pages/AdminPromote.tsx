import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, ChevronRight, Lock, MapPin, Plus, Trash2 } from 'lucide-react';
import { processors, type Processor, type PartnerFacility } from '../data/processors';

const PASSWORD_KEY = 'farmshare_admin_password';

export default function AdminPromote() {
  const [password, setPassword] = useState<string>(() => localStorage.getItem(PASSWORD_KEY) || '');
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Page state once unlocked
  const [search, setSearch] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [partnerSlug, setPartnerSlug] = useState('');
  const [multi, setMulti] = useState(false);
  const [facilities, setFacilities] = useState<PartnerFacility[]>([{ slug: '', label: '' }]);
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ commitUrl: string; commitSha: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prospects = useMemo(
    () => processors.filter((p) => p.status === 'prospect').sort((a, b) => a.name.localeCompare(b.name)),
    []
  );
  const filteredProspects = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return prospects;
    return prospects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [search, prospects]);

  const selected: Processor | undefined = useMemo(
    () => processors.find((p) => p.slug === selectedSlug),
    [selectedSlug]
  );

  // Prefill form when a prospect is selected
  useEffect(() => {
    if (!selected) return;
    setPartnerSlug(selected.partnerSlug ?? selected.slug);
    setMulti(Boolean(selected.partnerFacilities && selected.partnerFacilities.length > 0));
    setFacilities(selected.partnerFacilities && selected.partnerFacilities.length > 0
      ? selected.partnerFacilities
      : [{ slug: '', label: '' }]);
    setLogo(selected.logo ?? '');
    setDescription(selected.description ?? '');
    setResult(null);
    setError(null);
  }, [selected]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setAuthError('Enter the admin password.');
      return;
    }
    localStorage.setItem(PASSWORD_KEY, password);
    setAuthChecked(true);
    setAuthError(null);
  };

  const handleSignOut = () => {
    localStorage.removeItem(PASSWORD_KEY);
    setPassword('');
    setAuthChecked(false);
  };

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const payload: Record<string, unknown> = {
        password,
        slug: selected.slug,
      };
      if (multi) {
        payload.partnerFacilities = facilities.filter((f) => f.slug.trim());
      } else {
        payload.partnerSlug = partnerSlug.trim() || selected.slug;
      }
      if (logo.trim()) payload.logo = logo.trim();
      else payload.logo = null;
      if (description.trim()) payload.description = description.trim();
      else payload.description = null;

      const res = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string; commitUrl?: string; commitSha?: string };
      if (!res.ok) {
        if (res.status === 401) {
          setError('Wrong password. Re-enter and try again.');
          setAuthChecked(false);
          localStorage.removeItem(PASSWORD_KEY);
        } else {
          setError(data.error || `Server error (${res.status})`);
        }
        return;
      }
      setResult({ commitUrl: data.commitUrl!, commitSha: data.commitSha! });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- AUTH GATE ----------
  const passwordSaved = !!localStorage.getItem(PASSWORD_KEY);
  if (!authChecked && !passwordSaved) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center px-4">
        <form onSubmit={handleAuthSubmit} className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="h-6 w-6 text-brand-green" />
            <h1 className="text-2xl font-roca text-brand-green">Promote a processor</h1>
          </div>
          <p className="text-stone-600 text-sm mb-6">Ask Henry for the admin password.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-orange mb-4"
          />
          {authError && <p className="text-red-600 text-sm mb-3">{authError}</p>}
          <button
            type="submit"
            className="w-full bg-brand-orange text-white py-3 rounded-lg font-bold hover:bg-brand-yellow transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  // ---------- MAIN UI ----------
  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-roca text-brand-green">Promote a processor</h1>
            <p className="text-stone-600 mt-1">Flip a prospect → customer once their scheduling is live.</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-stone-500 hover:text-stone-700 underline"
          >
            Sign out
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: pick a prospect */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-bold text-brand-green mb-4">1. Pick a prospect</h2>
            <input
              type="text"
              placeholder="Search by name, city, or slug…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-orange mb-4"
            />
            <div className="max-h-96 overflow-y-auto divide-y divide-stone-100">
              {filteredProspects.slice(0, 100).map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => setSelectedSlug(p.slug)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-brand-cream transition-colors ${
                    p.slug === selectedSlug ? 'bg-brand-cream font-bold' : ''
                  }`}
                >
                  <div className="text-brand-green">{p.name}</div>
                  <div className="text-stone-500 text-xs">{p.location} · {p.slug}</div>
                </button>
              ))}
              {filteredProspects.length > 100 && (
                <p className="text-xs text-stone-400 px-3 py-2">Showing first 100. Refine search to narrow.</p>
              )}
              {filteredProspects.length === 0 && (
                <p className="text-stone-500 text-sm px-3 py-4">No prospects match.</p>
              )}
            </div>
          </div>

          {/* Right: form + preview */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            {!selected && <p className="text-stone-500">Select a prospect on the left to begin.</p>}
            {selected && (
              <>
                <h2 className="text-lg font-bold text-brand-green mb-4">2. Confirm details for {selected.name}</h2>

                {/* Multi-facility toggle */}
                <label className="inline-flex items-center gap-2 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={multi}
                    onChange={(e) => setMulti(e.target.checked)}
                    className="h-4 w-4 accent-brand-orange"
                  />
                  <span className="text-sm font-medium text-stone-700">Multi-facility (e.g. separate USDA + Custom plants)</span>
                </label>

                {multi ? (
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-stone-700 mb-2">Facilities</label>
                    {facilities.map((f, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="partner-slug"
                          value={f.slug}
                          onChange={(e) => {
                            const next = [...facilities];
                            next[i] = { ...next[i], slug: e.target.value };
                            setFacilities(next);
                          }}
                          className="flex-1 px-3 py-2 rounded border border-stone-300 text-sm"
                        />
                        <input
                          type="text"
                          placeholder='Label (e.g. "USDA Plant")'
                          value={f.label}
                          onChange={(e) => {
                            const next = [...facilities];
                            next[i] = { ...next[i], label: e.target.value };
                            setFacilities(next);
                          }}
                          className="flex-1 px-3 py-2 rounded border border-stone-300 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setFacilities(facilities.filter((_, j) => j !== i))}
                          className="text-stone-400 hover:text-red-600 px-2"
                          aria-label="Remove facility"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFacilities([...facilities, { slug: '', label: '' }])}
                      className="inline-flex items-center gap-1 text-sm text-brand-orange font-medium hover:underline"
                    >
                      <Plus className="h-4 w-4" /> Add facility
                    </button>
                    <p className="text-xs text-stone-500 mt-2">First facility is the default for "Book now" CTAs.</p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-stone-700 mb-1">
                      Partner scheduling slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={partnerSlug}
                      onChange={(e) => setPartnerSlug(e.target.value)}
                      placeholder="hunter-cattle"
                      className="w-full px-3 py-2 rounded border border-stone-300"
                    />
                    <p className="text-xs text-stone-500 mt-1">
                      What goes after <code>partners.farmshare.co/scheduling/</code>. Defaults to the landing slug.
                    </p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-bold text-stone-700 mb-1">Logo URL</label>
                  <input
                    type="url"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="https://…"
                    className="w-full px-3 py-2 rounded border border-stone-300"
                  />
                  <p className="text-xs text-stone-500 mt-1">Their actual brand mark — not a Facebook icon or favicon. Leave blank to fall back to initials.</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-stone-700 mb-1">About / description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="1–3 sentences about the processor."
                    className="w-full px-3 py-2 rounded border border-stone-300 text-sm"
                  />
                  <p className="text-xs text-stone-500 mt-1">
                    Watch for nav-junk like "Toggle Menu Search Search". Rewrite if it doesn't read like a description.
                  </p>
                </div>

                {/* Live preview of customer card */}
                <div className="mt-6 mb-4">
                  <h3 className="text-sm font-bold text-stone-700 mb-2">Preview</h3>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full max-w-sm border border-stone-200">
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        {logo ? (
                          <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-brand-cream flex items-center justify-center overflow-hidden p-1">
                            <img src={logo} alt={selected.name} className="max-w-full max-h-full object-contain" />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-brand-green flex items-center justify-center">
                            <span className="text-white font-bold text-xl">
                              {selected.name.split(' ').map((w) => w[0]).filter((c) => c && c.match(/[A-Z0-9]/i)).slice(0, 2).join('').toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-brand-green leading-tight">{selected.name}</h3>
                          <div className="flex items-center text-stone-500 mt-1">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="text-sm">{selected.location}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-semibold text-brand-green mt-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Online scheduling</span>
                          </div>
                        </div>
                      </div>
                      {selected.species.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {selected.species.map((s) => (
                            <span key={s} className="bg-brand-orange/10 text-brand-orange text-xs font-bold px-2 py-1 rounded-full">{s}</span>
                          ))}
                        </div>
                      )}
                      <div className="mt-auto flex items-center justify-between text-sm bg-brand-green rounded-lg px-3 py-2">
                        <div className="flex items-center font-semibold text-white">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Book now — real-time availability</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || (!multi && !partnerSlug.trim()) || (multi && !facilities.some((f) => f.slug.trim()))}
                  className="w-full bg-brand-orange text-white py-3 rounded-lg font-bold hover:bg-brand-yellow transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Committing…' : 'Promote to customer'}
                </button>

                {error && (
                  <p className="mt-4 text-red-600 text-sm whitespace-pre-wrap">{error}</p>
                )}
                {result && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
                    <p className="font-bold text-green-800 mb-1">Promoted ✓</p>
                    <p className="text-green-700">
                      Vercel will rebuild in 1–2 minutes.{' '}
                      <a
                        href={result.commitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium"
                      >
                        View commit
                      </a>
                    </p>
                    <p className="text-green-700 mt-2">
                      <Link to={`/find-a-processor/${selected.slug}`} className="underline">
                        Open public listing →
                      </Link>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
