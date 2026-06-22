import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  rankProcessors,
  buildRoutingDraft,
  inferLeadType,
  nextAssignee,
  DEFAULT_WEIGHTS,
  FLAG_TEXT,
  type Lead,
  type RankResult,
} from '../lib/leadRouter';
import { geocodeZip, type GeoResult } from '../lib/geocode';
import {
  MapPin, AlertTriangle, Building2, Phone, Mail, ArrowRight, RefreshCw,
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
  const [routeMsg, setRouteMsg] = useState('');
  const [routing, setRouting] = useState(false);
  const [procIdx, setProcIdx] = useState(0);
  const [procEmail, setProcEmail] = useState<string | null>(null);
  const [procEmailLoading, setProcEmailLoading] = useState(false);
  const [tab, setTab] = useState<'all' | 'Henry' | 'Wyatt'>('all');

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

  const routedCount = leads.filter((l) => l.assignee).length;
  const visibleLeads = tab === 'all' ? leads : leads.filter((l) => (l.assignee || '') === tab);

  async function routeLead() {
    if (!selected || !chosen || !leadObj) return;
    setRouting(true);
    setRouteMsg('');
    const assignee = selected.assignee || nextAssignee(routedCount);
    const routed_at = new Date().toISOString();

    // Phase 2: find/create the processor (company) + buyer (contact) in HubSpot
    // and drop a round-robin follow-up task. Runtime needs HUBSPOT_PRIVATE_APP_TOKEN
    // in the Vercel env; sending any outreach still stays a human click.
    try {
      const r = await fetch('/api/leads/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: { ...leadObj, lead_type: type },
          processor: {
            slug: chosen.slug,
            name: chosen.name,
            location: chosen.location,
            phone: chosen.phone,
            website: chosen.website,
            status: chosen.status,
          },
          assignee,
        }),
      });
      if (r.ok) {
        const d = (await r.json()) as { taskId?: string };
        setRouteMsg(`HubSpot task created for ${assignee}${d.taskId ? ` (#${d.taskId})` : ''}.`);
      } else {
        const e = (await r.json().catch(() => ({}))) as { error?: string };
        setRouteMsg(`Routed locally — HubSpot task failed: ${e.error || r.status}`);
      }
    } catch (err) {
      setRouteMsg(`Routed locally — HubSpot call errored: ${err instanceof Error ? err.message : String(err)}`);
    }

    await supabase
      .from('buyer_leads')
      .update({ assignee, matched_slug: chosen.slug, status: 'matched', routed_at })
      .eq('id', selected.id);
    setLeads((ls) =>
      ls.map((l) =>
        l.id === selected.id ? { ...l, assignee, matched_slug: chosen.slug, status: 'matched', routed_at } : l,
      ),
    );
    setRouting(false);
  }

  function emailProcessor() {
    if (!procEmail || !selected) return;
    let su = 'We have a buyer near you';
    let body = draft;
    const m = draft.match(/^Subject:\s*(.*)\n+([\s\S]*)$/);
    if (m) { su = m[1].trim(); body = m[2]; }
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(procEmail)}&su=${encodeURIComponent(su)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank', 'noopener');
    if (selected.status === 'new') setLeadStatus(selected.id, 'contacted');
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
          <button onClick={loadLeads} className="ml-auto flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-stone-300 bg-white hover:bg-stone-100">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

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
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-stone-500 mt-1 pl-7">
                          <span>{p.location}</span>
                          {p.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.phone}</span>}
                          {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-emerald-700 underline"><Mail className="w-3 h-3" />site</a>}
                          <span>{p.species.join(', ')}</span>
                        </div>
                      </div>
                    ))}
                    {top.length === 0 && !geoLoading && <p className="text-xs text-stone-400">No matches.</p>}
                  </div>
                </Card>

                <Card title={`Drafted message to ${chosen ? chosen.name : 'processor'}`}>
                  <textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="w-full h-52 text-xs font-mono border border-stone-300 rounded-md p-2 bg-white" />
                  <div className="flex items-center flex-wrap gap-2 mt-2">
                    <button onClick={routeLead} disabled={!chosen || routing} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-emerald-700 text-white disabled:opacity-40">
                      {routing ? 'Routing…' : `Route to #${procIdx + 1} & assign`} <ArrowRight className="w-4 h-4" />
                    </button>
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
                    {['contacted', 'closed'].map((s) => (
                      <button key={s} onClick={() => setLeadStatus(selected.id, s)} className="text-xs px-2.5 py-1.5 rounded-md border border-stone-300 bg-white hover:bg-stone-100 capitalize">{s}</button>
                    ))}
                    <button onClick={() => deleteLead(selected.id, selected.name)} className="text-xs px-2.5 py-1.5 rounded-md border border-red-200 text-red-700 bg-white hover:bg-red-50">Delete</button>
                    <span className="text-xs text-stone-400">Assigned to: <strong>{selected.assignee || 'unassigned'}</strong>. Email opens in Gmail; sending stays your click.</span>
                  </div>
                  {routeMsg && <p className="text-xs text-stone-600 mt-2">{routeMsg}</p>}
                </Card>
              </>
            )}
          </div>
        </div>
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
    : status === 'matched' ? 'bg-emerald-100 text-emerald-800'
    : status === 'contacted' ? 'bg-sky-100 text-sky-800'
    : 'bg-amber-100 text-amber-800';
  return <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tone}`}>{status}</span>;
}
