import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, ChevronDown, ChevronRight, Lock, MapPin, Plus, Search, Star, Trash2, Upload } from 'lucide-react';
import { processors, stateNames, type Processor, type PartnerFacility } from '../data/processors';

const PASSWORD_KEY = 'farmshare_admin_password';
const ALL_SPECIES = ['Beef', 'Bison', 'Goat', 'Hog', 'Lamb', 'Veal'] as const;
type SpeciesT = (typeof ALL_SPECIES)[number];

type LogoState =
  | { kind: 'unchanged' }
  | { kind: 'uploaded'; dataUrl: string; filename: string; previewUrl: string }
  | { kind: 'cleared' };

interface Result {
  commitUrl: string;
  commitSha: string;
  slug?: string;
  geocodeWarning?: string;
}

export default function AdminPromote() {
  const [password, setPassword] = useState<string>(() => localStorage.getItem(PASSWORD_KEY) || '');
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [mode, setMode] = useState<'promote' | 'create' | 'add-prospect'>('promote');

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const passwordSaved = !!localStorage.getItem(PASSWORD_KEY);
  if (!authChecked && !passwordSaved) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center px-4">
        <form onSubmit={handleAuthSubmit} className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="h-6 w-6 text-brand-green" />
            <h1 className="text-2xl font-roca text-brand-green">Admin</h1>
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

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-roca text-brand-green">Directory admin</h1>
            <p className="text-stone-600 mt-1">Promote a prospect, add a new customer, or add a new prospect from Google.</p>
          </div>
          <button onClick={handleSignOut} className="text-sm text-stone-500 hover:text-stone-700 underline">Sign out</button>
        </div>

        {/* Mode tabs */}
        <div className="inline-flex bg-white rounded-lg p-1 mb-6 shadow-sm">
          <button
            onClick={() => { setMode('promote'); setResult(null); setError(null); }}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${mode === 'promote' ? 'bg-brand-green text-white' : 'text-stone-600 hover:text-brand-green'}`}
          >
            Promote existing prospect
          </button>
          <button
            onClick={() => { setMode('create'); setResult(null); setError(null); }}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${mode === 'create' ? 'bg-brand-green text-white' : 'text-stone-600 hover:text-brand-green'}`}
          >
            Add new customer
          </button>
          <button
            onClick={() => { setMode('add-prospect'); setResult(null); setError(null); }}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${mode === 'add-prospect' ? 'bg-brand-green text-white' : 'text-stone-600 hover:text-brand-green'}`}
          >
            Add new prospect
          </button>
        </div>

        {mode === 'promote' && (
          <PromoteForm
            password={password}
            submitting={submitting}
            setSubmitting={setSubmitting}
            setResult={setResult}
            setError={setError}
            onWrongPassword={() => { setAuthChecked(false); localStorage.removeItem(PASSWORD_KEY); }}
          />
        )}
        {mode === 'create' && (
          <CreateForm
            password={password}
            submitting={submitting}
            setSubmitting={setSubmitting}
            setResult={setResult}
            setError={setError}
            onWrongPassword={() => { setAuthChecked(false); localStorage.removeItem(PASSWORD_KEY); }}
          />
        )}
        {mode === 'add-prospect' && (
          <AddProspectForm
            password={password}
            submitting={submitting}
            setSubmitting={setSubmitting}
            setResult={setResult}
            setError={setError}
            onWrongPassword={() => { setAuthChecked(false); localStorage.removeItem(PASSWORD_KEY); }}
          />
        )}

        {error && (
          <p className="mt-6 text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3 whitespace-pre-wrap">{error}</p>
        )}
        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
            <p className="font-bold text-green-800 mb-1">Saved ✓</p>
            <p className="text-green-700">
              Vercel will rebuild in 1–2 minutes.{' '}
              <a href={result.commitUrl} target="_blank" rel="noopener noreferrer" className="underline font-medium">View commit</a>
            </p>
            {result.slug && (
              <p className="text-green-700 mt-2">
                <Link to={`/find-a-processor/${result.slug}`} className="underline">
                  Open public listing →
                </Link>
              </p>
            )}
            {result.geocodeWarning && (
              <p className="text-amber-700 mt-2 text-xs">⚠ {result.geocodeWarning}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------- PROMOTE EXISTING --------------------
function PromoteForm({
  password,
  submitting,
  setSubmitting,
  setResult,
  setError,
  onWrongPassword,
}: {
  password: string;
  submitting: boolean;
  setSubmitting: (b: boolean) => void;
  setResult: (r: Result | null) => void;
  setError: (s: string | null) => void;
  onWrongPassword: () => void;
}) {
  const [search, setSearch] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [partnerSlug, setPartnerSlug] = useState('');
  const [multi, setMulti] = useState(false);
  const [facilities, setFacilities] = useState<PartnerFacility[]>([{ slug: '', label: '' }]);
  const [species, setSpecies] = useState<SpeciesT[]>([]);
  const [website, setWebsite] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [logoState, setLogoState] = useState<LogoState>({ kind: 'unchanged' });
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  useEffect(() => {
    if (!selected) return;
    setPartnerSlug(selected.partnerSlug ?? selected.slug);
    setMulti(Boolean(selected.partnerFacilities && selected.partnerFacilities.length > 0));
    setFacilities(selected.partnerFacilities && selected.partnerFacilities.length > 0
      ? selected.partnerFacilities
      : [{ slug: '', label: '' }]);
    setSpecies(selected.species as SpeciesT[]);
    setWebsite(selected.website ?? '');
    setName(selected.name);
    setPhone(selected.phone ?? '');
    setAddress(selected.address ?? '');
    setDescription(selected.description ?? '');
    setLogoState({ kind: 'unchanged' });
    setShowAdvanced(false);
    setResult(null);
    setError(null);
  }, [selected, setError, setResult]);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const payload: Record<string, unknown> = {
        mode: 'promote',
        password,
        slug: selected.slug,
        species,
        website: website.trim() || null,
        name: name.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        description: description.trim() || null,
      };
      if (multi) {
        payload.partnerFacilities = facilities.filter((f) => f.slug.trim());
      } else {
        payload.partnerSlug = partnerSlug.trim() || selected.slug;
      }
      if (logoState.kind === 'uploaded') {
        payload.logo = { dataUrl: logoState.dataUrl, filename: logoState.filename };
      } else if (logoState.kind === 'cleared') {
        payload.logo = null;
      }
      // 'unchanged' → omit, so server keeps existing logo

      const res = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as Result & { error?: string };
      if (!res.ok) {
        if (res.status === 401) {
          setError('Wrong password.');
          onWrongPassword();
        } else {
          setError(data.error || `Server error (${res.status})`);
        }
        return;
      }
      setResult({ ...data, slug: data.slug ?? selected.slug });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
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
              className={`w-full text-left px-3 py-2 text-sm hover:bg-brand-cream transition-colors ${p.slug === selectedSlug ? 'bg-brand-cream font-bold' : ''}`}
            >
              <div className="text-brand-green">{p.name}</div>
              <div className="text-stone-500 text-xs">{p.location} · {p.slug}</div>
            </button>
          ))}
          {filteredProspects.length > 100 && (
            <p className="text-xs text-stone-400 px-3 py-2">Showing first 100. Refine search to narrow.</p>
          )}
          {filteredProspects.length === 0 && <p className="text-stone-500 text-sm px-3 py-4">No prospects match.</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        {!selected && <p className="text-stone-500">Select a prospect on the left to begin.</p>}
        {selected && (
          <>
            <h2 className="text-lg font-bold text-brand-green mb-4">2. Confirm details for {selected.name}</h2>

            <label className="inline-flex items-center gap-2 mb-4 cursor-pointer">
              <input type="checkbox" checked={multi} onChange={(e) => setMulti(e.target.checked)} className="h-4 w-4 accent-brand-orange" />
              <span className="text-sm font-medium text-stone-700">Multi-facility (e.g. separate USDA + Custom plants)</span>
            </label>

            {multi ? (
              <FacilitiesEditor facilities={facilities} setFacilities={setFacilities} />
            ) : (
              <Field label="Partner scheduling slug" required hint={<>What goes after <code>partners.farmshare.co/scheduling/</code>. Defaults to the landing slug.</>}>
                <input type="text" value={partnerSlug} onChange={(e) => setPartnerSlug(e.target.value)} className="w-full px-3 py-2 rounded border border-stone-300" />
              </Field>
            )}

            <Field label="Species" hint="Toggle the species this plant processes.">
              <SpeciesPicker value={species} onChange={setSpecies} />
            </Field>

            <Field label="Logo" hint="Upload their actual brand mark — not a Facebook icon or favicon. Leave blank to fall back to initials.">
              <LogoUploader processor={selected} state={logoState} setState={setLogoState} />
            </Field>

            <Field label="Website">
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" className="w-full px-3 py-2 rounded border border-stone-300" />
            </Field>

            <Field label="About / description" hint='Watch for nav-junk like "Toggle Menu Search Search". Rewrite if it doesn&rsquo;t read like a description.'>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 rounded border border-stone-300 text-sm" />
            </Field>

            {/* Advanced */}
            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm text-stone-500 hover:text-stone-700 inline-flex items-center gap-1 mb-2">
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? '' : '-rotate-90'}`} />
              {showAdvanced ? 'Hide' : 'Show'} advanced fields
            </button>
            {showAdvanced && (
              <div className="border-t border-stone-100 pt-4">
                <Field label="Display name"><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded border border-stone-300" /></Field>
                <Field label="Phone"><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 rounded border border-stone-300" /></Field>
                <Field label="Address"><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 rounded border border-stone-300" /></Field>
              </div>
            )}

            {/* Preview */}
            <div className="mt-6 mb-4">
              <h3 className="text-sm font-bold text-stone-700 mb-2">Preview</h3>
              <CardPreview
                name={name || selected.name}
                location={selected.location}
                species={species}
                logoUrl={logoState.kind === 'uploaded' ? logoState.previewUrl : logoState.kind === 'cleared' ? null : selected.logo}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || (!multi && !partnerSlug.trim()) || (multi && !facilities.some((f) => f.slug.trim())) || species.length === 0}
              className="w-full bg-brand-orange text-white py-3 rounded-lg font-bold hover:bg-brand-yellow transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
            >
              {submitting ? 'Committing…' : 'Promote to customer'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// -------------------- ADD NEW CUSTOMER --------------------
function CreateForm({
  password,
  submitting,
  setSubmitting,
  setResult,
  setError,
  onWrongPassword,
}: {
  password: string;
  submitting: boolean;
  setSubmitting: (b: boolean) => void;
  setResult: (r: Result | null) => void;
  setError: (s: string | null) => void;
  onWrongPassword: () => void;
}) {
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [species, setSpecies] = useState<SpeciesT[]>([]);
  const [partnerSlug, setPartnerSlug] = useState('');
  const [multi, setMulti] = useState(false);
  const [facilities, setFacilities] = useState<PartnerFacility[]>([{ slug: '', label: '' }]);
  const [description, setDescription] = useState('');
  const [logoState, setLogoState] = useState<LogoState>({ kind: 'unchanged' });

  const stateAbbrs = Object.keys(stateNames).sort();

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const payload: Record<string, unknown> = {
        mode: 'create',
        password,
        name: name.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase(),
        zip: zip.trim(),
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        species,
        partnerSlug: partnerSlug.trim(),
        description: description.trim() || undefined,
      };
      if (multi) {
        payload.partnerFacilities = facilities.filter((f) => f.slug.trim());
      }
      if (logoState.kind === 'uploaded') {
        payload.logo = { dataUrl: logoState.dataUrl, filename: logoState.filename };
      }

      const res = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as Result & { error?: string };
      if (!res.ok) {
        if (res.status === 401) {
          setError('Wrong password.');
          onWrongPassword();
        } else {
          setError(data.error || `Server error (${res.status})`);
        }
        return;
      }
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = name.trim() && street.trim() && city.trim() && state.trim() && zip.trim() && species.length > 0 && (multi ? facilities.some(f => f.slug.trim()) : partnerSlug.trim());

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-bold text-brand-green mb-4">New customer details</h2>

        <Field label="Business name" required>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded border border-stone-300" />
        </Field>

        <Field label="Street address" required>
          <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="123 Main St" className="w-full px-3 py-2 rounded border border-stone-300" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="City" required>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2 rounded border border-stone-300" />
          </Field>
          <Field label="State" required>
            <select value={state} onChange={(e) => setState(e.target.value)} className="w-full px-3 py-2 rounded border border-stone-300 bg-white">
              <option value="">—</option>
              {stateAbbrs.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <Field label="ZIP" required>
          <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} className="w-full px-3 py-2 rounded border border-stone-300" />
        </Field>

        <Field label="Phone">
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 rounded border border-stone-300" />
        </Field>

        <Field label="Website">
          <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" className="w-full px-3 py-2 rounded border border-stone-300" />
        </Field>

        <Field label="Species" required>
          <SpeciesPicker value={species} onChange={setSpecies} />
        </Field>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-bold text-brand-green mb-4">Scheduling & branding</h2>

        <label className="inline-flex items-center gap-2 mb-4 cursor-pointer">
          <input type="checkbox" checked={multi} onChange={(e) => setMulti(e.target.checked)} className="h-4 w-4 accent-brand-orange" />
          <span className="text-sm font-medium text-stone-700">Multi-facility</span>
        </label>

        {multi ? (
          <FacilitiesEditor facilities={facilities} setFacilities={setFacilities} />
        ) : (
          <Field label="Partner scheduling slug" required hint={<>What goes after <code>partners.farmshare.co/scheduling/</code>.</>}>
            <input type="text" value={partnerSlug} onChange={(e) => setPartnerSlug(e.target.value)} className="w-full px-3 py-2 rounded border border-stone-300" />
          </Field>
        )}

        <Field label="Logo">
          <LogoUploader state={logoState} setState={setLogoState} />
        </Field>

        <Field label="About / description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 rounded border border-stone-300 text-sm" />
        </Field>

        <div className="mt-4 mb-4">
          <h3 className="text-sm font-bold text-stone-700 mb-2">Preview</h3>
          <CardPreview
            name={name || 'New Customer'}
            location={`${city || 'City'}, ${state || 'ST'}`}
            species={species}
            logoUrl={logoState.kind === 'uploaded' ? logoState.previewUrl : null}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !canSubmit}
          className="w-full bg-brand-orange text-white py-3 rounded-lg font-bold hover:bg-brand-yellow transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving…' : 'Add customer'}
        </button>

        <p className="text-xs text-stone-500 mt-2">Address is geocoded server-side. If geocoding fails, the record saves without lat/lng (won&rsquo;t appear on the map until added).</p>
      </div>
    </div>
  );
}

// -------------------- ADD NEW PROSPECT (Google Places search) --------------------
interface PlacesCandidate {
  placeId: string;
  name: string;
  formattedAddress: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  website?: string;
  lat?: number;
  lng?: number;
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
  hours?: string[];
  editorialSummary?: string;
  businessStatus?: string;
  placeTypes?: string[];
}

function AddProspectForm({
  password,
  submitting,
  setSubmitting,
  setResult,
  setError,
  onWrongPassword,
}: {
  password: string;
  submitting: boolean;
  setSubmitting: (b: boolean) => void;
  setResult: (r: Result | null) => void;
  setError: (s: string | null) => void;
  onWrongPassword: () => void;
}) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [candidates, setCandidates] = useState<PlacesCandidate[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [species, setSpecies] = useState<SpeciesT[]>([]);
  const [description, setDescription] = useState('');
  const [logoState, setLogoState] = useState<LogoState>({ kind: 'unchanged' });

  const selected = selectedIdx != null ? candidates[selectedIdx] : null;

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    setResult(null);
    setCandidates([]);
    setSelectedIdx(null);
    try {
      const res = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'search', password, query: query.trim() }),
      });
      const data = (await res.json()) as { candidates?: PlacesCandidate[]; error?: string };
      if (!res.ok) {
        if (res.status === 401) {
          setError('Wrong password.');
          onWrongPassword();
        } else {
          setError(data.error || `Server error (${res.status})`);
        }
        return;
      }
      const list = data.candidates ?? [];
      setCandidates(list);
      if (list.length === 0) setError('No matches from Google. Try a different query.');
      if (list.length === 1) setSelectedIdx(0);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const payload: Record<string, unknown> = {
        mode: 'add-prospect',
        password,
        candidate: selected,
        species,
        description: description.trim() || undefined,
      };
      if (logoState.kind === 'uploaded') {
        payload.logo = { dataUrl: logoState.dataUrl, filename: logoState.filename };
      }

      const res = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as Result & { error?: string };
      if (!res.ok) {
        if (res.status === 401) {
          setError('Wrong password.');
          onWrongPassword();
        } else {
          setError(data.error || `Server error (${res.status})`);
        }
        return;
      }
      setResult(data);
      // Reset for next add
      setQuery('');
      setCandidates([]);
      setSelectedIdx(null);
      setSpecies([]);
      setDescription('');
      setLogoState({ kind: 'unchanged' });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !!selected && species.length > 0;

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-bold text-brand-green mb-4">1. Find them on Google</h2>
        <p className="text-sm text-stone-600 mb-3">
          Paste a Google Maps URL, or type the business name + city + state. We'll fetch their address, phone, website, hours, rating, and Google Maps link.
        </p>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
            placeholder='e.g. "Bichelmeyer Meats Kansas City KS"'
            className="flex-1 px-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-orange"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="bg-brand-orange text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-yellow transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            {searching ? 'Searching…' : 'Search'}
          </button>
        </div>

        {candidates.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-stone-700 mb-2">
              {candidates.length === 1 ? 'Match' : `${candidates.length} matches — pick the right one`}
            </h3>
            {candidates.map((c, i) => (
              <button
                key={c.placeId}
                type="button"
                onClick={() => setSelectedIdx(i)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  i === selectedIdx
                    ? 'bg-brand-cream border-brand-orange'
                    : 'bg-white border-stone-200 hover:border-brand-orange'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-brand-green">{c.name}</div>
                    <div className="text-xs text-stone-500 mt-0.5">{c.formattedAddress}</div>
                    {c.businessStatus && c.businessStatus !== 'OPERATIONAL' && (
                      <div className="text-xs text-red-600 mt-1 font-medium">⚠ {c.businessStatus.replace(/_/g, ' ').toLowerCase()}</div>
                    )}
                  </div>
                  {c.rating != null && (
                    <div className="flex items-center gap-1 text-xs text-stone-600 flex-shrink-0">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{c.rating.toFixed(1)}</span>
                      {c.userRatingCount != null && <span className="text-stone-400">({c.userRatingCount})</span>}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        {!selected && <p className="text-stone-500">Search and pick a match on the left to begin.</p>}
        {selected && (
          <>
            <h2 className="text-lg font-bold text-brand-green mb-1">2. Confirm details</h2>
            <p className="text-sm text-stone-600 mb-4">Everything below comes from Google. You only need to set species (Google doesn't know that).</p>

            <div className="bg-brand-cream/40 rounded-lg p-3 mb-4 text-sm space-y-1">
              <div className="font-bold text-brand-green">{selected.name}</div>
              <div className="text-stone-700">{selected.formattedAddress}</div>
              {selected.phone && <div className="text-stone-600">📞 {selected.phone}</div>}
              {selected.website && (
                <div className="text-stone-600 truncate">🌐 <a href={selected.website} target="_blank" rel="noopener noreferrer" className="underline">{selected.website}</a></div>
              )}
              {selected.googleMapsUri && (
                <div className="text-stone-600 truncate">📍 <a href={selected.googleMapsUri} target="_blank" rel="noopener noreferrer" className="underline">View on Google Maps</a></div>
              )}
              {selected.placeTypes && selected.placeTypes.length > 0 && (
                <div className="text-xs text-stone-500 pt-1">Place types: {selected.placeTypes.slice(0, 4).join(', ')}</div>
              )}
            </div>

            <Field label="Species" required hint="Google doesn't tell us what species they process. Toggle the ones this plant does.">
              <SpeciesPicker value={species} onChange={setSpecies} />
            </Field>

            <Field label="Description" hint="Optional one-liner. Leave blank if you'd rather use Google's editorial summary or website later.">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={selected.editorialSummary ?? ''}
                className="w-full px-3 py-2 rounded border border-stone-300 text-sm"
              />
            </Field>

            <Field label="Logo" hint="Optional. Skip and add later if you don't have one handy.">
              <LogoUploader state={logoState} setState={setLogoState} />
            </Field>

            <div className="mt-4 mb-4">
              <h3 className="text-sm font-bold text-stone-700 mb-2">Preview</h3>
              <CardPreview
                name={selected.name}
                location={`${selected.city ?? ''}${selected.city && selected.state ? ', ' : ''}${selected.state ?? ''}`}
                species={species}
                logoUrl={logoState.kind === 'uploaded' ? logoState.previewUrl : null}
                isProspect
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !canSubmit}
              className="w-full bg-brand-orange text-white py-3 rounded-lg font-bold hover:bg-brand-yellow transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving…' : 'Add prospect to directory'}
            </button>

            <p className="text-xs text-stone-500 mt-2">
              Saves with <code>status: prospect</code>. Listing shows "Send a Scheduling Request" instead of "Book now."
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// -------------------- SHARED SUBCOMPONENTS --------------------
function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-bold text-stone-700 mb-1">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-stone-500 mt-1">{hint}</p>}
    </div>
  );
}

function SpeciesPicker({ value, onChange }: { value: SpeciesT[]; onChange: (next: SpeciesT[]) => void }) {
  const toggle = (s: SpeciesT) => {
    if (value.includes(s)) onChange(value.filter((x) => x !== s));
    else onChange([...value, s]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_SPECIES.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => toggle(s)}
          className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-colors ${
            value.includes(s)
              ? 'bg-brand-orange text-white border-brand-orange'
              : 'bg-white text-stone-600 border-stone-300 hover:border-brand-orange'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function FacilitiesEditor({ facilities, setFacilities }: { facilities: PartnerFacility[]; setFacilities: (f: PartnerFacility[]) => void }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-bold text-stone-700 mb-2">Facilities</label>
      {facilities.map((f, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input type="text" placeholder="partner-slug" value={f.slug}
            onChange={(e) => { const n = [...facilities]; n[i] = { ...n[i], slug: e.target.value }; setFacilities(n); }}
            className="flex-1 px-3 py-2 rounded border border-stone-300 text-sm" />
          <input type="text" placeholder='Label (e.g. "USDA Plant")' value={f.label}
            onChange={(e) => { const n = [...facilities]; n[i] = { ...n[i], label: e.target.value }; setFacilities(n); }}
            className="flex-1 px-3 py-2 rounded border border-stone-300 text-sm" />
          <button type="button" onClick={() => setFacilities(facilities.filter((_, j) => j !== i))} className="text-stone-400 hover:text-red-600 px-2" aria-label="Remove">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setFacilities([...facilities, { slug: '', label: '' }])} className="inline-flex items-center gap-1 text-sm text-brand-orange font-medium hover:underline">
        <Plus className="h-4 w-4" /> Add facility
      </button>
      <p className="text-xs text-stone-500 mt-2">First facility is the default for "Book now" CTAs.</p>
    </div>
  );
}

function LogoUploader({ processor, state, setState }: { processor?: Processor; state: LogoState; setState: (s: LogoState) => void }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const acceptFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File is over 2MB. Please use a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setState({ kind: 'uploaded', dataUrl, filename: file.name, previewUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) acceptFile(file);
  };

  const currentLogo =
    state.kind === 'uploaded' ? state.previewUrl :
    state.kind === 'cleared' ? null :
    processor?.logo ?? null;

  return (
    <div>
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${dragOver ? 'border-brand-orange bg-brand-orange/5' : 'border-stone-300 hover:border-brand-orange'}`}
      >
        <div className="flex items-center gap-4">
          {currentLogo ? (
            <div className="w-16 h-16 rounded bg-brand-cream flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
              <img src={currentLogo} alt="Logo preview" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded bg-stone-100 flex items-center justify-center flex-shrink-0">
              <Upload className="h-6 w-6 text-stone-400" />
            </div>
          )}
          <div className="text-sm text-stone-600">
            {state.kind === 'uploaded' ? (
              <>
                <p className="font-medium text-brand-green">{state.filename}</p>
                <p className="text-xs">Click or drop to replace.</p>
              </>
            ) : currentLogo ? (
              <>
                <p>{processor && state.kind === 'unchanged' ? 'Current logo' : 'Logo set'}</p>
                <p className="text-xs">Click or drop to replace.</p>
              </>
            ) : (
              <>
                <p className="font-medium">Click or drop to upload a logo</p>
                <p className="text-xs">PNG, JPG, SVG, WebP — under 2MB</p>
              </>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) acceptFile(f); }}
        />
      </div>
      {currentLogo && (
        <button
          type="button"
          onClick={() => setState({ kind: 'cleared' })}
          className="text-xs text-stone-500 hover:text-red-600 mt-2 underline"
        >
          Remove logo
        </button>
      )}
    </div>
  );
}

function CardPreview({ name, location, species, logoUrl, isProspect }: { name: string; location: string; species: string[]; logoUrl: string | null | undefined; isProspect?: boolean }) {
  const initials = name.split(' ').map((w) => w[0]).filter((c) => c && c.match(/[A-Z0-9]/i)).slice(0, 2).join('').toUpperCase();
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full max-w-sm border border-stone-200">
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start gap-4 mb-4">
          {logoUrl ? (
            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-brand-cream flex items-center justify-center overflow-hidden p-1">
              <img src={logoUrl} alt={name} className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-brand-green flex items-center justify-center">
              <span className="text-white font-bold text-xl">{initials || '?'}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-brand-green leading-tight">{name}</h3>
            <div className="flex items-center text-stone-500 mt-1">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="text-sm">{location}</span>
            </div>
            {!isProspect && (
              <div className="flex items-center gap-1 text-xs font-semibold text-brand-green mt-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Online scheduling</span>
              </div>
            )}
          </div>
        </div>
        {species.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {species.map((s) => (
              <span key={s} className="bg-brand-orange/10 text-brand-orange text-xs font-bold px-2 py-1 rounded-full">{s}</span>
            ))}
          </div>
        )}
        <div className={`mt-auto flex items-center justify-between text-sm rounded-lg px-3 py-2 ${isProspect ? 'bg-stone-200 text-stone-700' : 'bg-brand-green text-white'}`}>
          <div className="flex items-center font-semibold">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{isProspect ? 'Send a scheduling request' : 'Book now — real-time availability'}</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
