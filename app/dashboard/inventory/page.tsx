"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface Species { id: number; name: string; }
interface Matrix { id: number; name: string; }
interface CollectionSite { id: number; name: string; abbreviation: string; }
interface StorageTemp { id: number; label: string; description: string; }
interface Sample {
  id: string;
  alias_id: string;
  vendor_sample_id: string | null;
  gender: string | null;
  race: string | null;
  ethnicity: string | null;
  age: string | null;
  consumed_at: string | null;
  parent_sample_id: string | null;
  parent_sample_id_2: string | null;
  parent_alias: string | null;
  parent_alias_2: string | null;
  species: { name: string };
  matrix: { name: string };
  quantity_ml: number;
  collection_date: string;
  storage_temp: { label: string; description: string };
  collection_site: { name: string; abbreviation: string };
  created_at: string;
}
interface HistoryEntry {
  id: string;
  created_at: string;
  event_type: string;
  sample_id: string;
  alias_id: string;
  notes: string | null;
}

const RACE_OPTIONS = [
  "American Indian or Alaska Native","Asian","Black or African American",
  "Native Hawaiian or Other Pacific Islander","White","Multiracial","Other","Unknown / Not Reported",
];
const ETHNICITY_OPTIONS = ["Hispanic or Latino","Not Hispanic or Latino","Unknown / Not Reported"];

const empty = {
  species_id: "", matrix_id: "", quantity_ml: "", collection_date: "",
  storage_temp_id: "", collection_site_id: "", vendor_sample_id: "",
  gender: "", race: "", ethnicity: "", age: "",
};

/* ── History Modal ─────────────────────────────────────────── */
function HistoryModal({
  sample, onClose, allSamples, historyLog, loading,
}: {
  sample: Sample;
  onClose: () => void;
  allSamples: Sample[];
  historyLog: HistoryEntry[];
  loading: boolean;
}) {
  const parent1 = sample.parent_sample_id
    ? allSamples.find(s => s.id === sample.parent_sample_id) ?? null : null;
  const parent2 = sample.parent_sample_id_2
    ? allSamples.find(s => s.id === sample.parent_sample_id_2) ?? null : null;
  const children = allSamples.filter(s =>
    s.parent_sample_id === sample.id || s.parent_sample_id_2 === sample.id
  );
  const siblings = allSamples.filter(s => {
    if (s.id === sample.id) return false;
    return (
      (sample.parent_sample_id && (s.parent_sample_id === sample.parent_sample_id || s.parent_sample_id_2 === sample.parent_sample_id)) ||
      (sample.parent_sample_id_2 && (s.parent_sample_id === sample.parent_sample_id_2 || s.parent_sample_id_2 === sample.parent_sample_id_2))
    );
  });

  const eventColor: Record<string, string> = {
    consumed: "#f87171",
    aliquoted: "#a78bfa",
    lot_created: "#f59e0b",
  };

  function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>{label}</span>
        <span className="text-sm" style={{ color: "var(--fg-primary)" }}>{value ?? <span style={{ color: "var(--fg-muted)" }}>—</span>}</span>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="px-7 py-6">

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(74,124,247,0.12)", color: "var(--cobalt-light)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--fg-muted)" }}>Sample History</p>
                <h2 className="text-xl font-bold font-mono" style={{ color: "var(--cobalt-light)" }}>{sample.alias_id}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0"
              style={{ color: "var(--fg-muted)", background: "rgba(74,124,247,0.05)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(74,124,247,0.12)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(74,124,247,0.05)")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sample Details */}
          <div className="rounded-xl p-5 mb-5 grid grid-cols-2 sm:grid-cols-3 gap-4"
            style={{ background: "rgba(74,124,247,0.04)", border: "1px solid var(--border)" }}>
            <DetailRow label="Alias ID" value={<span className="font-mono font-semibold" style={{ color: "var(--cobalt-light)" }}>{sample.alias_id}</span>} />
            <DetailRow label="Vendor ID" value={sample.vendor_sample_id} />
            <DetailRow label="Species" value={sample.species?.name} />
            <DetailRow label="Matrix" value={sample.matrix?.name} />
            <DetailRow label="Quantity" value={`${sample.quantity_ml} mL`} />
            <DetailRow label="Collection Date" value={sample.collection_date} />
            <DetailRow label="Storage" value={sample.storage_temp ? `${sample.storage_temp.label} (${sample.storage_temp.description})` : null} />
            <DetailRow label="Site" value={sample.collection_site?.name} />
            <DetailRow label="Gender" value={sample.gender} />
            {sample.race && <DetailRow label="Race" value={sample.race} />}
            {sample.ethnicity && <DetailRow label="Ethnicity" value={sample.ethnicity} />}
            {sample.age && <DetailRow label="Age" value={sample.age} />}
            <DetailRow label="Status" value={
              sample.consumed_at
                ? <span style={{ color: "#6b7280" }}>Consumed {new Date(sample.consumed_at).toLocaleDateString()}</span>
                : <span style={{ color: "#34d399" }}>Active</span>
            } />
            <DetailRow label="Logged" value={new Date(sample.created_at).toLocaleDateString()} />
          </div>

          {/* Lineage: Parents */}
          {(parent1 || parent2) && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7 7 7M5 19l7-7 7 7" />
                </svg>
                <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color: "#a78bfa" }}>
                  Parent Sample{parent2 ? "s" : ""}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[parent1, parent2].filter(Boolean).map((p, i) => p && (
                  <div key={p.id} className="rounded-xl p-4"
                    style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.18)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(167,139,250,0.14)", color: "#a78bfa" }}>
                        {i === 0 ? "Parent 1" : "Parent 2"}
                      </span>
                      <span className="font-mono text-sm font-bold" style={{ color: "#a78bfa" }}>{p.alias_id}</span>
                    </div>
                    <div className="text-xs" style={{ color: "var(--fg-secondary)" }}>
                      {p.species?.name} · {p.matrix?.name} · {p.quantity_ml} mL
                    </div>
                    {p.consumed_at && (
                      <div className="text-xs mt-1" style={{ color: "#6b7280" }}>Consumed</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Siblings */}
          {siblings.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="var(--fg-muted)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" />
                </svg>
                <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--fg-muted)" }}>
                  Sibling Samples ({siblings.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {siblings.map(s => (
                  <span key={s.id} className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(74,124,247,0.07)", color: "var(--cobalt-light)", border: "1px solid var(--border)" }}>
                    {s.alias_id}
                    {s.consumed_at && <span className="ml-1" style={{ color: "#6b7280" }}>·consumed</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Children */}
          {children.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#34d399" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7-7-7M19 5l-7 7-7-7" />
                </svg>
                <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color: "#34d399" }}>
                  Derived Samples ({children.length})
                </h3>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(52,211,153,0.15)" }}>
                {children.map((c, i) => (
                  <div key={c.id}
                    className="flex items-center gap-4 px-4 py-2.5"
                    style={{
                      background: i % 2 === 0 ? "rgba(52,211,153,0.03)" : "transparent",
                      borderBottom: i < children.length - 1 ? "1px solid rgba(52,211,153,0.08)" : "none",
                    }}>
                    <span className="font-mono text-xs font-bold" style={{ color: "#34d399" }}>{c.alias_id}</span>
                    <span className="text-xs" style={{ color: "var(--fg-muted)" }}>{c.species?.name} · {c.matrix?.name}</span>
                    <span className="text-xs font-mono" style={{ color: "var(--fg-secondary)" }}>{c.quantity_ml} mL</span>
                    {c.consumed_at && <span className="badge-consumed text-xs ml-auto">Consumed</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History Log */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="var(--cobalt-light)" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--cobalt-light)" }}>Activity Log</h3>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 py-4" style={{ color: "var(--fg-muted)" }}>
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-xs">Loading…</span>
              </div>
            ) : historyLog.length === 0 ? (
              <p className="text-xs py-4" style={{ color: "var(--fg-muted)" }}>No activity recorded yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {historyLog.map(entry => (
                  <div key={entry.id} className="flex gap-3 px-4 py-3 rounded-xl"
                    style={{ background: "rgba(74,124,247,0.04)", border: "1px solid var(--border)" }}>
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md"
                        style={{
                          background: `${eventColor[entry.event_type] ?? "var(--cobalt-light)"}18`,
                          color: eventColor[entry.event_type] ?? "var(--cobalt-light)",
                          border: `1px solid ${eventColor[entry.event_type] ?? "var(--cobalt-light)"}38`,
                        }}>
                        {entry.event_type.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      {entry.notes && (
                        <p className="text-xs leading-relaxed" style={{ color: "var(--fg-secondary)" }}>{entry.notes}</p>
                      )}
                      <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function InventoryPage() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [sites, setSites] = useState<CollectionSite[]>([]);
  const [temps, setTemps] = useState<StorageTemp[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [showConsumed, setShowConsumed] = useState(false);
  const [confirmConsume, setConfirmConsume] = useState<string | null>(null);
  const [consuming, setConsuming] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkConsume, setConfirmBulkConsume] = useState(false);
  const [bulkConsuming, setBulkConsuming] = useState(false);

  // History modal state
  const [historyModal, setHistoryModal] = useState<Sample | null>(null);
  const [historyLog, setHistoryLog] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => { loadLookups(); loadSamples(); }, []);

  async function loadLookups() {
    const [s, m, si, t] = await Promise.all([
      supabase.from("species").select("*").order("name"),
      supabase.from("matrices").select("*").order("name"),
      supabase.from("collection_sites").select("*").order("name"),
      supabase.from("storage_temps").select("*").order("id"),
    ]);
    if (s.data) setSpecies(s.data);
    if (m.data) setMatrices(m.data);
    if (si.data) setSites(si.data);
    if (t.data) setTemps(t.data);
  }

  async function loadSamples() {
    const { data } = await supabase
      .from("samples")
      .select(`
        id, alias_id, vendor_sample_id, gender, race, ethnicity, age, consumed_at, quantity_ml, collection_date, created_at,
        parent_sample_id, parent_sample_id_2,
        parent:samples!parent_sample_id(alias_id),
        parent2:samples!parent_sample_id_2(alias_id),
        species:species_id(name),
        matrix:matrix_id(name),
        storage_temp:storage_temp_id(label, description),
        collection_site:collection_site_id(name, abbreviation)
      `)
      .order("created_at", { ascending: false });
    if (data) {
      const mapped = data.map((s: any) => ({
        ...s,
        parent_alias: (s.parent as { alias_id: string } | null)?.alias_id ?? null,
        parent_alias_2: (s.parent2 as { alias_id: string } | null)?.alias_id ?? null,
      }));
      setSamples(mapped as unknown as Sample[]);
    }
  }

  const openHistoryModal = useCallback(async (sample: Sample) => {
    setHistoryModal(sample);
    setHistoryLoading(true);
    const { data } = await supabase
      .from("history_log")
      .select("*")
      .eq("sample_id", sample.id)
      .order("created_at", { ascending: false });
    setHistoryLog(data ?? []);
    setHistoryLoading(false);
  }, []);

  const selectedSpeciesName = species.find(s => String(s.id) === form.species_id)?.name ?? "";
  const isHuman = selectedSpeciesName.toLowerCase() === "human";

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => {
      const next = { ...f, [name]: value };
      if (name === "species_id") {
        const newName = species.find(s => String(s.id) === value)?.name ?? "";
        if (newName.toLowerCase() !== "human") { next.race = ""; next.ethnicity = ""; next.age = ""; }
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true); setError(null); setSuccess(false);
    const { error } = await supabase.from("samples").insert({
      species_id: Number(form.species_id), matrix_id: Number(form.matrix_id),
      quantity_ml: Number(form.quantity_ml), collection_date: form.collection_date,
      storage_temp_id: Number(form.storage_temp_id), collection_site_id: Number(form.collection_site_id),
      vendor_sample_id: form.vendor_sample_id || null, gender: form.gender,
      race: isHuman ? form.race || null : null,
      ethnicity: isHuman ? form.ethnicity || null : null,
      age: isHuman ? form.age || null : null,
    });
    setSubmitting(false);
    if (error) { setError(error.message); }
    else { setForm(empty); setSuccess(true); loadSamples(); setTimeout(() => setSuccess(false), 3000); }
  }

  async function handleConsume(sample: Sample) {
    if (confirmConsume !== sample.id) { setConfirmConsume(sample.id); return; }
    setConsuming(sample.id); setConfirmConsume(null);
    const now = new Date().toISOString();
    const [u, l] = await Promise.all([
      supabase.from("samples").update({ consumed_at: now }).eq("id", sample.id),
      supabase.from("history_log").insert({ event_type: "consumed", sample_id: sample.id, alias_id: sample.alias_id, notes: `Sample ${sample.alias_id} consumed from inventory.` }),
    ]);
    setConsuming(null);
    if (u.error || l.error) setError(u.error?.message ?? l.error?.message ?? "Failed.");
    else loadSamples();
  }

  async function handleBulkConsume() {
    if (!confirmBulkConsume) { setConfirmBulkConsume(true); return; }
    setBulkConsuming(true);
    const now = new Date().toISOString();
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map(id => {
      const s = samples.find(s => s.id === id);
      return Promise.all([
        supabase.from("samples").update({ consumed_at: now }).eq("id", id),
        s ? supabase.from("history_log").insert({ event_type: "consumed", sample_id: id, alias_id: s.alias_id, notes: `Sample ${s.alias_id} consumed from inventory (bulk action).` }) : Promise.resolve(),
      ]);
    }));
    setBulkConsuming(false); setConfirmBulkConsume(false);
    setSelectedIds(new Set()); loadSamples();
  }

  const { vendor_sample_id: _v, race: _r, ethnicity: _e, age: _a, ...coreRequired } = form;
  const humanFieldsFilled = !isHuman || (form.race !== "" && form.ethnicity !== "" && form.age !== "");
  const allFilled = Object.values(coreRequired).every(v => v !== "") && humanFieldsFilled;

  const displayed = samples.filter(s => showConsumed ? true : !s.consumed_at);
  const activeDisplayed = displayed.filter(s => !s.consumed_at);
  const allSelected = activeDisplayed.length > 0 && activeDisplayed.every(s => selectedIds.has(s.id));
  const someSelected = selectedIds.size > 0;

  function toggleSelectSample(id: string) {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function selectAll() { setSelectedIds(new Set(activeDisplayed.map(s => s.id))); }
  function unselectAll() { setSelectedIds(new Set()); setConfirmBulkConsume(false); }

  const ghostBtn = "text-xs font-medium px-3 py-1 rounded-lg transition-all";

  return (
    <div className="flex flex-col flex-1 font-sans">

      {/* History Modal */}
      {historyModal && (
        <HistoryModal
          sample={historyModal}
          onClose={() => { setHistoryModal(null); setHistoryLog([]); }}
          allSamples={samples}
          historyLog={historyLog}
          loading={historyLoading}
        />
      )}

      <main className="flex flex-col items-center px-4 py-10 gap-8">

        {/* ── Log New Sample ── */}
        <section className="w-full max-w-3xl card px-8 py-8">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(36,86,224,0.13)", color: "var(--cobalt-light)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--fg-muted)" }}>Intake</p>
              <h2 className="text-lg font-bold tracking-tight" style={{ color: "var(--fg-primary)" }}>Log New Sample</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--fg-secondary)" }}>Species</label>
              <select name="species_id" value={form.species_id} onChange={handleChange} className="select-field">
                <option value="">Select species</option>
                {species.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--fg-secondary)" }}>Matrix</label>
              <select name="matrix_id" value={form.matrix_id} onChange={handleChange} className="select-field">
                <option value="">Select matrix</option>
                {matrices.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--fg-secondary)" }}>Quantity (mL)</label>
              <input type="number" name="quantity_ml" value={form.quantity_ml} onChange={handleChange} placeholder="e.g. 2.5" min="0" step="0.01" className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--fg-secondary)" }}>Collection Date</label>
              <input type="date" name="collection_date" value={form.collection_date} onChange={handleChange} className="input-field" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--fg-secondary)" }}>Storage Temperature</label>
              <select name="storage_temp_id" value={form.storage_temp_id} onChange={handleChange} className="select-field">
                <option value="">Select temp</option>
                {temps.map(t => <option key={t.id} value={t.id}>{t.label} ({t.description})</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--fg-secondary)" }}>Collection Site</label>
              <select name="collection_site_id" value={form.collection_site_id} onChange={handleChange} className="select-field">
                <option value="">Select site</option>
                {sites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.abbreviation})</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--fg-secondary)" }}>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="select-field">
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Male/Female">Male/Female</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
            {isHuman && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--fg-secondary)" }}>Race</label>
                  <select name="race" value={form.race} onChange={handleChange} className="select-field">
                    <option value="">Select race</option>
                    {RACE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--fg-secondary)" }}>Ethnicity</label>
                  <select name="ethnicity" value={form.ethnicity} onChange={handleChange} className="select-field">
                    <option value="">Select ethnicity</option>
                    {ETHNICITY_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--fg-secondary)" }}>Age</label>
                  <input type="number" name="age" value={form.age} onChange={handleChange} placeholder="e.g. 34" min="0" max="130" step="1" className="input-field" />
                </div>
              </>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--fg-secondary)" }}>
                Vendor / Site ID <span style={{ color: "var(--fg-muted)", textTransform: "none", fontSize: "0.7rem", letterSpacing: 0 }}>(optional)</span>
              </label>
              <input type="text" name="vendor_sample_id" value={form.vendor_sample_id} onChange={handleChange} placeholder="e.g. 003, AB-00192" className="input-field" />
            </div>
            <div className="sm:col-span-2 flex items-center gap-4 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <button type="submit" disabled={!allFilled || submitting} className="btn-primary flex items-center gap-2">
                {submitting ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Saving…
                  </>
                ) : "Log Sample"}
              </button>
              {success && (
                <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#34d399" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Sample logged successfully
                </span>
              )}
              {error && <span className="text-xs font-medium" style={{ color: "#f87171" }}>{error}</span>}
            </div>
          </form>
        </section>

        {/* ── Sample Inventory Table ── */}
        <section className="w-full max-w-7xl card px-8 py-8">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(36,86,224,0.13)", color: "var(--cobalt-light)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h7" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--fg-muted)" }}>Records</p>
                <h2 className="text-lg font-bold tracking-tight" style={{ color: "var(--fg-primary)" }}>Sample Inventory</h2>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Select All / Deselect All */}
              {activeDisplayed.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={selectAll}
                    className={ghostBtn}
                    style={{ color: "var(--cobalt-light)", background: "rgba(74,124,247,0.07)", border: "1px solid var(--border)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(74,124,247,0.13)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(74,124,247,0.07)")}
                  >
                    Select All
                  </button>
                  {someSelected && (
                    <button
                      onClick={unselectAll}
                      className={ghostBtn}
                      style={{ color: "var(--fg-tertiary)", background: "rgba(74,124,247,0.04)", border: "1px solid var(--border)" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--fg-secondary)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--fg-tertiary)")}
                    >
                      Deselect All
                    </button>
                  )}
                </div>
              )}

              {/* Show consumed toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div className="relative">
                  <input type="checkbox" checked={showConsumed} onChange={e => setShowConsumed(e.target.checked)} className="sr-only peer" />
                  <div className="w-9 h-5 rounded-full peer-checked:bg-cobalt transition-colors"
                    style={{ background: showConsumed ? "var(--cobalt)" : "rgba(74,124,247,0.12)", border: "1px solid rgba(74,124,247,0.25)" }} />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-4" />
                </div>
                <span className="text-xs font-medium" style={{ color: "var(--fg-tertiary)" }}>Show consumed</span>
              </label>
            </div>
          </div>

          {/* Bulk action bar */}
          {someSelected && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl mb-4 flex-wrap"
              style={{ background: "rgba(74,124,247,0.06)", border: "1px solid var(--border)" }}>
              <span className="text-xs font-semibold" style={{ color: "var(--cobalt-light)" }}>
                {selectedIds.size} sample{selectedIds.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex-1" />
              {confirmBulkConsume ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs" style={{ color: "var(--fg-secondary)" }}>
                    Confirm consuming {selectedIds.size} sample{selectedIds.size !== 1 ? "s" : ""}?
                  </span>
                  <button
                    onClick={handleBulkConsume}
                    disabled={bulkConsuming}
                    className="text-xs font-semibold px-3 py-1 rounded-lg transition-all"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
                  >
                    {bulkConsuming ? "Consuming…" : "Yes, Consume All"}
                  </button>
                  <button onClick={() => setConfirmBulkConsume(false)} className="text-xs" style={{ color: "var(--fg-muted)" }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleBulkConsume}
                  className="text-xs font-semibold px-3 py-1 rounded-lg transition-all"
                  style={{ background: "rgba(239,68,68,0.10)", color: "#f87171", border: "1px solid rgba(239,68,68,0.22)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.20)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.10)")}
                >
                  Consume Selected
                </button>
              )}
            </div>
          )}

          {displayed.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14" style={{ color: "var(--fg-muted)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-sm">No samples to display.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th className="table-header-cell pr-3">
                      <input
                        type="checkbox"
                        className="sample-checkbox"
                        checked={allSelected}
                        ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                        onChange={e => e.target.checked ? selectAll() : unselectAll()}
                      />
                    </th>
                    {["Alias ID","Parent","Vendor ID","Species","Gender","Race","Ethnicity","Age","Matrix","Qty (mL)","Coll. Date","Storage","Site","Status","History"].map(h => (
                      <th key={h} className="table-header-cell">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(s => (
                    <tr key={s.id} className={`table-row ${s.consumed_at ? "consumed" : ""}`}>
                      <td className="table-cell pr-3">
                        {!s.consumed_at ? (
                          <input
                            type="checkbox"
                            className="sample-checkbox"
                            checked={selectedIds.has(s.id)}
                            onChange={() => toggleSelectSample(s.id)}
                            onClick={e => e.stopPropagation()}
                          />
                        ) : (
                          <span className="inline-block w-[15px]" />
                        )}
                      </td>
                      <td className="table-cell">
                        <span className="font-mono text-xs font-semibold" style={{ color: "var(--cobalt-light)" }}>{s.alias_id}</span>
                      </td>
                      <td className="table-cell">
                        {s.parent_alias ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-xs font-semibold" style={{ color: "#a78bfa" }}>{s.parent_alias}</span>
                            {s.parent_alias_2 && (
                              <span className="font-mono text-xs font-semibold" style={{ color: "#a78bfa" }}>{s.parent_alias_2}</span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "var(--fg-muted)" }}>—</span>
                        )}
                      </td>
                      <td className="table-cell font-mono text-xs">
                        {s.vendor_sample_id ?? <span style={{ color: "var(--fg-muted)" }}>—</span>}
                      </td>
                      <td className="table-cell">{s.species?.name}</td>
                      <td className="table-cell">{s.gender ?? <span style={{ color: "var(--fg-muted)" }}>—</span>}</td>
                      <td className="table-cell">{s.race ?? <span style={{ color: "var(--fg-muted)" }}>—</span>}</td>
                      <td className="table-cell">{s.ethnicity ?? <span style={{ color: "var(--fg-muted)" }}>—</span>}</td>
                      <td className="table-cell">{s.age ?? <span style={{ color: "var(--fg-muted)" }}>—</span>}</td>
                      <td className="table-cell">{s.matrix?.name}</td>
                      <td className="table-cell">{s.quantity_ml}</td>
                      <td className="table-cell">{s.collection_date}</td>
                      <td className="table-cell">
                        {s.storage_temp?.label}
                        <span className="ml-1 text-xs" style={{ color: "var(--fg-muted)" }}>({s.storage_temp?.description})</span>
                      </td>
                      <td className="table-cell">
                        <span className="font-mono text-xs font-semibold" style={{ color: "var(--fg-secondary)" }}>{s.collection_site?.abbreviation}</span>
                      </td>
                      <td className="table-cell">
                        {s.consumed_at ? (
                          <span className="badge-consumed">Consumed</span>
                        ) : confirmConsume === s.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleConsume(s)}
                              disabled={consuming === s.id}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
                              style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.25)")}
                              onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
                            >
                              Confirm
                            </button>
                            <button onClick={() => setConfirmConsume(null)} className="text-xs transition-colors" style={{ color: "var(--fg-muted)" }}
                              onMouseEnter={e => (e.currentTarget.style.color = "var(--fg-secondary)")}
                              onMouseLeave={e => (e.currentTarget.style.color = "var(--fg-muted)")}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleConsume(s)}
                            className="badge-active cursor-pointer transition-all"
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.2)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.12)"; }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                            Active
                          </button>
                        )}
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => openHistoryModal(s)}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg transition-all"
                          style={{ background: "rgba(74,124,247,0.07)", color: "var(--cobalt-light)", border: "1px solid var(--border)" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(74,124,247,0.16)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "rgba(74,124,247,0.07)")}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
