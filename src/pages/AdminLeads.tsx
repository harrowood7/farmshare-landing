import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  rankProcessors,
  buildRoutingDraft,
  inferLeadType,
  haversineMiles,
  normSpecies,
  DEFAULT_WEIGHTS,
  FLAG_TEXT,
  type Lead,
  type RankResult,
  type RankedProcessor,
} from '../lib/leadRouter';
import { geocodeZip, type GeoResult } from '../lib/geocode';
import {
  MapPin, AlertTriangle, Building2, Phone, Mail, ExternalLink, RefreshCw,
} from 'lucide-react';

interface BuyerLeadRow {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  zip?: string | null;
  species: string;
  cut_type: string;
  timing?: string | null;
  notes?: string | null;
  processor_slug?: string | null;
  status: string;
  created_at: string;
  lat?: number | null;
  lng?: number | null;
  assignee?: string | null;
  lead_type?: string | null;
  matched_slug?: string | null;
  routed_at?: string | null;
}

const EMPTY: RankResult = { top: [], flags: [] };

export default function AdminLeads() {
  const [authed, setAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [authErr, setAuthErr] = useState('');

  const [leads, setLeads] = useState<BuyerLeadRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [geo, setGeo] = useState<GeoResult | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [procIdx, setProcIdx] = useState(0);
  const [procEmail, setProcEmail] = useState<string | null>(null);
  const [procEmailLoading, setProcEmailLoading] = useState(false);
  const [tab, setTab] = useState<'all' | 'Henry' | 'Wyatt'>('all');

  // Booth mode: type a processor's zip -> nearest buyer leads (the reverse of the
  // normal lead -> processors flow). Built for AAMP: show a plant the live demand near them.
  const [mode, setMode] = useState<'lead' | 'booth'>('lead');
  const [boothZip, setBoothZip] = useState('');
  const [boothOrigin, setBoothOrigin] = useState<GeoResult | null>(null);
  const [boothGeoLoading, setBoothGeoLoading] = useState(false);
  const [boothErr, setBoothErr] = useState('');
  const [boothSpecies, setBoothSpecies] = useState('all');
  const [boothRadius, setBoothRadius] = useState(150);
  const [boothEmailTo, setBoothEmailTo] = useState('');
  const [prepping, setPrepping] = useState(false);
  const [prepDone, setPrepDone] = useState(0);
  const [prepTotal, setPrepTotal] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setAuthed(!!data.user);
      setAuthLoading(false);
      if (data.user) loadLeads();
    })();
  }, []);

  async function loadLeads() {
    const { data, error } = await supabase
      .from('buyer_leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('load buyer_leads failed:', error);
      return;
    }
    setLeads((data || []) as BuyerLeadRow[]);
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) {
      setAuthErr(error.message);
      return;
    }
    setAuthErr('');
    setAuthed(true);
    loadLeads();
  }

  const selected = leads.find((l) => l.id === selectedId) || null;

  // Ensure the selected lead has coordinates: use stored lat/lng, else geocode + persist.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selected) {
        setGeo(null);
        return;
      }
      if (selected.lat != null && selected.lng != null) {
        setGeo({ lat: selected.lat, lng: selected.lng, country: 'US' });
        return;
      }
      setGeoLoading(true);
      const g = await geocodeZip(selected.zip);
      if (cancelled) return;
      setGeo(g);
      setGeoLoading(false);
      if (g) {
        await supabase.from('buyer_leads').update({ lat: g.lat, lng: g.lng }).eq('id', selected.id);
        setLeads((ls) => ls.map((l) => (l.id === selected.id ? { ...l, lat: g.lat, lng: g.lng } : l)));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const leadObj: Lead | null = selected
    ? {
        name: selected.name,
        email: selected.email,
        phone: selected.phone || undefined,
        zip: selected.zip || undefined,
        species: selected.species,
        cut_type: selected.cut_type,
        timing: selected.timing || undefined,
        notes: selected.notes || undefined,
        processor_slug: selected.processor_slug || undefined,
        lat: geo?.lat ?? null,
        lng: geo?.lng ?? null,
        country: geo?.country ?? null,
      }
    : null;

  const type = leadObj ? inferLeadType(leadObj) : 'buyer';
  const { top, flags } = useMemo<RankResult>(
    () => (leadObj && geo ? rankProcessors(leadObj, DEFAULT_WEIGHTS) : EMPTY),
    [selectedId, geo], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const chosen = top[procIdx] || top[0];

  // Booth results: every lead with coords, ranked by distance from the typed zip.
  const boothResults = useMemo(() => {
    if (!boothOrigin) return [];
    return leads
      .filter((l) => l.lat != null && l.lng != null)
      .filter((l) => boothSpecies === 'all' || normSpecies(l.species) === boothSpecies)
      .map((l) => ({ ...l, distanceMi: haversineMiles(boothOrigin.lat, boothOrigin.lng, l.lat!, l.lng!) }))
      .filter((l) => l.distanceMi <= boothRadius)
      .sort((a, b) => a.distanceMi - b.distanceMi);
  }, [boothOrigin, leads, boothSpecies, boothRadius]);

  useEffect(() => {
    setDraft(leadObj && chosen ? buildRoutingDraft(leadObj, chosen, type) : '');
  }, [selectedId, procIdx, chosen, type]); // eslint-disable-line react-hooks/exhaustive-deps

  // Look up the chosen processor's email in HubSpot — grays out the email button when absent.
  useEffect(() => {
    let cancelled = false;
    setProcEmail(null);
    if (!chosen) return;
    setProcEmailLoading(true);
    const params = new URLSearchParams({ name: chosen.name, website: chosen.website || '', phone: chosen.phone || '' });
    fetch(`/api/leads/processor-email?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : { email: null }))
      .then((d) => { if (!cancelled) setProcEmail(d.email || null); })
      .catch(() => { if (!cancelled) setProcEmail(null); })
      .finally(() => { if (!cancelled) setProcEmailLoading(false); });
    return () => { cancelled = true; };
  }, [selectedId, procIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleLeads = tab === 'all' ? leads : leads.filter((l) => (l.assignee || '') === tab);

  // Open a processor's record in HubSpot (find-or-creates the company there so cold
  // directory processors become tracked prospects) and mark the lead as Working.
  async function openInHubSpot(p: RankedProcessor, i: number) {
    if (!p || !selected) return;
    setProcIdx(i);
    if (selected.status === 'new') setLeadStatus(selected.id, 'working');
    try {
      const params = new URLSearchParams({ name: p.name, website: p.website || '', phone: p.phone || '', slug: p.slug });
      const r = await fetch(`/api/leads/open-processor?${params.toString()}`);
      const d = (await r.json()) as { url?: string };
      if (d.url) window.open(d.url, '_blank', 'noopener');
      else window.alert('Could not open this processor in HubSpot.');
    } catch (e) {
      window.alert(`HubSpot open failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  function emailProcessor() {
    if (!procEmail || !selected) return;
    let su = 'We have a buyer near you';
    let body = draft;
    const m = draft.match(/^Subject:\s*(.*)\n+([\s\S]*)$/);
    if (m) { su = m[1].trim(); body = m[2]; }
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(procEmail)}&su=${encodeURIComponent(su)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank', 'noopener');
    if (selected.status === 'new') setLeadStatus(selected.id, 'working');
  }

  // Connected = win (records which processor took it). Closed = couldn't place it.
  async function markConnected() {
    if (!selected || !chosen) return;
    await supabase
      .from('buyer_leads')
      .update({ status: 'connected', matched_slug: chosen.slug, routed_at: new Date().toISOString() })
      .eq('id', selected.id);
    setLeads((ls) => ls.map((l) => (l.id === selected.id ? { ...l, status: 'connected', matched_slug: chosen.slug } : l)));
  }

  async function setLeadStatus(id: string, status: string) {
    await supabase.from('buyer_leads').update({ status }).eq('id', id);
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  async function deleteLead(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This permanently removes the lead and can't be undone.`)) return;
    const { error } = await supabase.from('buyer_leads').delete().eq('id', id);
    if (error) {
      window.alert(`Could not delete: ${error.message}`);
      return;
    }
    setLeads((ls) => ls.filter((l) => l.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  // Geocode + persist coords for any lead missing them, so booth searches are instant.
  async function ensureAllCoords() {
    const missing = leads.filter((l) => (l.lat == null || l.lng == null) && l.zip);
    if (missing.length === 0) return;
    setPrepping(true);
    setPrepTotal(missing.length);
    setPrepDone(0);
    for (const l of missing) {
      const g = await geocodeZip(l.zip);
      if (g) {
        await supabase.from('buyer_leads').update({ lat: g.lat, lng: g.lng }).eq('id', l.id);
        setLeads((ls) => ls.map((x) => (x.id === l.id ? { ...x, lat: g.lat, lng: g.lng } : x)));
      }
      setPrepDone((d) => d + 1);
    }
    setPrepping(false);
  }

  function enterBooth() {
    setMode('booth');
    ensureAllCoords();
  }

  async function boothSearch(e: React.FormEvent) {
    e.preventDefault();
    setBoothErr('');
    const z = boothZip.trim();
    if (!z) return;
    setBoothGeoLoading(true);
    const g = await geocodeZip(z);
    setBoothGeoLoading(false);
    if (!g) {
      setBoothErr('Could not find that zip.');
      setBoothOrigin(null);
      return;
    }
    setBoothOrigin(g);
  }

  // Email the visible booth list to a processor — names + what/when/where + distance,
  // NO buyer contact info. They reply to Farmshare to get connected (we stay in the middle).
  function emailBoothList() {
    if (!boothResults.length) return;
    const lines = boothResults
      .map((l, i) => {
        const bits = [`${l.species} ${l.cut_type}`.trim()];
        if (l.timing) bits.push(l.timing);
        if (l.zip) bits.push(l.zip);
        bits.push(`~${Math.round(l.distanceMi)} mi away`);
        return `${i + 1}. ${l.name} — ${bits.join(' · ')}`;
      })
      .join('\n');
    const su = 'Farmshare — buyers looking for beef near you';
    const body = `Hi,\n\nHere are the buyers we're currently seeing near you (within ${boothRadius} miles of ${boothZip}). We haven't shared their contact details — but if you'd like us to connect you with any of them, just reply and we'll make the introduction.\n\n${lines}\n\nBest,\nHenry\nFarmshare`;
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(boothEmailTo)}&su=${encodeURIComponent(su)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank', 'noopener');
  }

  if (authLoading) return <div className="min-h-screen grid place-items-center text-stone-500">Loading…</div>;

  if (!authed) {
    return (
      <div className="min-h-screen grid place-items-center bg-stone-50 p-6">
        <form onSubmit={signIn} className="bg-white border border-stone-200 rounded-xl p-6 w-full max-w-sm space-y-3">
          <h1 className="text-lg font-semibold">Lead Router — sign in</h1>
          <input className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm" type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
          {authErr && <p className="text-xs text-red-600">{authErr}</p>}
          <button className="w-full bg-emerald-700 text-white rounded-md py-2 text-sm">Sign in</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 p-5">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-emerald-700" />
          <h1 className="text-xl font-semibold tracking-tight">Farmshare Lead Router</h1>
          <div className="ml-4 flex items-center gap-1 bg-white rounded-lg border border-stone-200 p-1">
            {([['lead', 'Lead router'], ['booth', 'Booth mode']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => (key === 'booth' ? enterBooth() : setMode('lead'))}
                className={`text-xs px-2.5 py-1.5 rounded-md ${mode === key ? 'bg-emerald-700 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button onClick={loadLeads} className="ml-auto flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-stone-300 bg-white hover:bg-stone-100">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {mode === 'booth' && (
          <div className="max-w-3xl">
            <form onSubmit={boothSearch} className="bg-white rounded-lg border border-stone-200 p-4 flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Processor zip</label>
                <input
                  value={boothZip}
                  onChange={(e) => setBoothZip(e.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 68701"
                  className="border border-stone-300 rounded-md px-3 py-2 text-lg w-36"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Species</label>
                <select value={boothSpecies} onChange={(e) => setBoothSpecies(e.target.value)} className="border border-stone-300 rounded-md px-3 py-2 text-sm">
                  <option value="all">All</option>
                  <option value="beef">Beef</option>
                  <option value="pork">Pork</option>
                  <option value="lamb">Lamb</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Within {boothRadius} mi</label>
                <input type="range" min={25} max={500} step={25} value={boothRadius} onChange={(e) => setBoothRadius(Number(e.target.value))} className="w-40 align-middle" />
              </div>
              <button className="bg-emerald-700 text-white rounded-md px-4 py-2 text-sm font-medium">{boothGeoLoading ? 'Searching…' : 'Find buyers'}</button>
            </form>

            {prepping && <p className="text-xs text-stone-500 mt-2">Prepping lead locations… {prepDone}/{prepTotal}</p>}
            {boothErr && <p className="text-xs text-red-600 mt-2">{boothErr}</p>}

            {boothOrigin && (
              <div className="mt-4">
                <p className="text-sm text-stone-600 mb-2">
                  <strong className="text-emerald-700 text-base">{boothResults.length}</strong> buyer{boothResults.length === 1 ? '' : 's'} within {boothRadius} mi of {boothZip}
                </p>
                {boothResults.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      value={boothEmailTo}
                      onChange={(e) => setBoothEmailTo(e.target.value)}
                      type="email"
                      placeholder="processor@email.com"
                      className="border border-stone-300 rounded-md px-2.5 py-1.5 text-sm w-56"
                    />
                    <button
                      onClick={emailBoothList}
                      title="Opens a Gmail draft with this list (names + what they want, no contact info)"
                      className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-50"
                    >
                      <Mail className="w-4 h-4" /> Email these leads
                    </button>
                  </div>
                )}
                <div className="bg-white rounded-lg border border-stone-200 divide-y divide-stone-100 max-h-[68vh] overflow-y-auto">
                  {boothResults.map((l, i) => (
                    <div key={l.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-stone-400 w-6 text-right">#{i + 1}</span>
                        <div>
                          <div className="font-medium text-sm">{l.name}</div>
                          <div className="text-xs text-stone-500">
                            {l.species} {l.cut_type}
                            {l.timing ? ` · ${l.timing}` : ''} · {l.zip}
                          </div>
                        </div>
                      </div>
                      <span className="text-base font-semibold text-emerald-700">{Math.round(l.distanceMi)} mi</span>
                    </div>
                  ))}
                  {boothResults.length === 0 && <p className="text-xs text-stone-400 p-4">No buyers in range — widen the radius.</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'lead' && (
        <div className="grid md:grid-cols-[340px_1fr] gap-4">
          {/* LEFT: queue */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1 bg-white rounded-lg border border-stone-200 p-1">
              {([['all', 'All'], ['Henry', 'Henry'], ['Wyatt', 'Wyatt']] as const).map(([key, label]) => {
                const count = key === 'all' ? leads.length : leads.filter((l) => (l.assignee || '') === key).length;
                return (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex-1 text-xs px-2 py-1.5 rounded-md ${tab === key ? 'bg-emerald-700 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    {label} <span className={tab === key ? 'text-emerald-100' : 'text-stone-400'}>({count})</span>
                  </button>
                );
              })}
            </div>
            <div className="bg-white rounded-lg border border-stone-200 p-2 max-h-[74vh] overflow-y-auto">
              {visibleLeads.length === 0 && <p className="text-xs text-stone-400 p-3">No leads in this view.</p>}
              {visibleLeads.map((l) => (
                <button
                  key={l.id}
                  onClick={() => { setSelectedId(l.id); setProcIdx(0); }}
                  className={`w-full text-left rounded-md p-2.5 mb-1 border ${l.id === selectedId ? 'border-emerald-400 bg-emerald-50/60' : 'border-transparent hover:bg-stone-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{l.name}</span>
                    <StatusBadge status={l.status} />
                  </div>
                  <div className="text-xs text-stone-500 flex flex-wrap gap-x-2">
                    <span>{l.species} {l.cut_type}</span>
                    <span>· {l.zip || '—'}</span>
                    {l.assignee && <span>· {l.assignee}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: detail */}
          <div className="space-y-4">
            {!selected ? (
              <div className="bg-white rounded-lg border border-stone-200 p-8 text-center text-sm text-stone-400">
                Select a lead to see matches.
              </div>
            ) : (
              <>
                <Card title="Lead">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {[
                      ['Name', selected.name],
                      ['Type', type],
                      ['Species', selected.species],
                      [type === 'producer' ? 'Head count' : 'Cut', type === 'producer' ? '' : selected.cut_type],
                      ['Zip', selected.zip],
                      ['Timing', selected.timing],
                      ['Email', selected.email],
                      ['Phone', selected.phone],
                    ].map(([k, v]) => (
                      <div key={k as string} className="flex justify-between border-b border-stone-100 py-0.5">
                        <span className="text-stone-400">{k}</span>
                        <span className="font-medium text-right">{(v as string) || '—'}</span>
                      </div>
                    ))}
                  </div>
                  {selected.notes && <p className="text-xs text-stone-500 mt-2">Notes: {selected.notes}</p>}
                </Card>

                {flags.length > 0 && (
                  <div className="space-y-1.5">
                    {flags.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-md px-2.5 py-2">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        {FLAG_TEXT[f] || f}
                      </div>
                    ))}
                  </div>
                )}

                <Card title={geoLoading ? 'Ranking (geocoding…)' : `Ranked shortlist (${top.length})`}>
                  <div className="space-y-2">
                    {top.map((p, i) => (
                      <div key={p.slug} onClick={() => setProcIdx(i)} className={`rounded-md border p-2.5 cursor-pointer ${i === procIdx ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-400' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-stone-400">#{i + 1}</span>
                            <Building2 className="w-3.5 h-3.5 text-stone-400" />
                            <span className="font-medium text-sm">{p.name}</span>
                            {p.status === 'customer' ? <Pill tone="emerald">Customer</Pill> : <Pill tone="stone">Prospect</Pill>}
                            {p.boosted && <Pill tone="amber">boosted</Pill>}
                            {p.intended && <Pill tone="sky">named</Pill>}
                          </div>
                          <span className="text-sm font-semibold">{Math.round(p.distanceMi)} mi</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-500 mt-1 pl-7">
                          <span>{p.location}</span>
                          {p.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.phone}</span>}
                          {p.website && <a href={p.website} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="underline text-stone-500 hover:text-stone-700">site</a>}
                          <span>{p.species.join(', ')}</span>
                          <button onClick={(e) => { e.stopPropagation(); openInHubSpot(p, i); }} className="flex items-center gap-1 font-medium text-emerald-700 underline hover:text-emerald-800">
                            <ExternalLink className="w-3 h-3" />Open in HubSpot
                          </button>
                        </div>
                      </div>
                    ))}
                    {top.length === 0 && !geoLoading && <p className="text-xs text-stone-400">No matches.</p>}
                  </div>
                </Card>

                <Card title={`Drafted message to ${chosen ? chosen.name : 'processor'}`}>
                  <textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="w-full h-52 text-xs font-mono border border-stone-300 rounded-md p-2 bg-white" />
                  <div className="flex items-center flex-wrap gap-2 mt-2">
                    <button
                      onClick={emailProcessor}
                      disabled={!procEmail || procEmailLoading}
                      title={procEmail ? `Email ${procEmail}` : 'No email on file for this processor'}
                      className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border ${procEmail ? 'border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-50' : 'border-stone-200 text-stone-400 bg-stone-50 cursor-not-allowed'}`}
                    >
                      <Mail className="w-4 h-4" />
                      {procEmailLoading ? 'Checking…' : procEmail ? 'Email processor' : 'No email on file'}
                    </button>
                    <button onClick={() => navigator.clipboard?.writeText(draft)} className="text-xs px-2.5 py-1.5 rounded-md border border-stone-300 bg-white hover:bg-stone-100">Copy</button>
                    <span className="mx-1 text-stone-300">|</span>
                    <button onClick={() => setLeadStatus(selected.id, 'working')} className="text-xs px-2.5 py-1.5 rounded-md border border-stone-300 bg-white hover:bg-stone-100">Working</button>
                    <button onClick={markConnected} className="text-xs px-2.5 py-1.5 rounded-md border border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-50">Connected</button>
                    <button onClick={() => setLeadStatus(selected.id, 'closed')} className="text-xs px-2.5 py-1.5 rounded-md border border-stone-300 bg-white hover:bg-stone-100">Closed</button>
                    <button onClick={() => deleteLead(selected.id, selected.name)} className="text-xs px-2.5 py-1.5 rounded-md border border-red-200 text-red-700 bg-white hover:bg-red-50">Delete</button>
                    <span className="text-xs text-stone-400">Assigned to: <strong>{selected.assignee || 'unassigned'}</strong>. Open the processor in HubSpot to call; email opens in Gmail. Mark <strong>Connected</strong> when placed, <strong>Closed</strong> if it falls through.</span>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-stone-200 p-3.5 shadow-sm">
      <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2.5">{title}</div>
      {children}
    </div>
  );
}
function Pill({ children, tone }: { children: React.ReactNode; tone: 'emerald' | 'stone' | 'amber' | 'sky' }) {
  const tones = {
    emerald: 'bg-emerald-100 text-emerald-800',
    stone: 'bg-stone-100 text-stone-600',
    amber: 'bg-amber-100 text-amber-800',
    sky: 'bg-sky-100 text-sky-800',
  };
  return <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tones[tone]}`}>{children}</span>;
}
function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'closed' ? 'bg-stone-200 text-stone-600'
    : status === 'connected' ? 'bg-emerald-100 text-emerald-800'
    : status === 'working' || status === 'contacted' || status === 'matched' ? 'bg-sky-100 text-sky-800'
    : 'bg-amber-100 text-amber-800';
  return <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tone}`}>{status}</span>;
}
