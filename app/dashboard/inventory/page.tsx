"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

const RACE_OPTIONS = [
  "American Indian or Alaska Native",
  "Asian",
  "Black or African American",
  "Native Hawaiian or Other Pacific Islander",
  "White",
  "Multiracial",
  "Other",
  "Unknown / Not Reported",
];

const ETHNICITY_OPTIONS = [
  "Hispanic or Latino",
  "Not Hispanic or Latino",
  "Unknown / Not Reported",
];

const empty = { species_id: "", matrix_id: "", quantity_ml: "", collection_date: "", storage_temp_id: "", collection_site_id: "", vendor_sample_id: "", gender: "", race: "", ethnicity: "", age: "" };

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

  useEffect(() => {
    loadLookups();
    loadSamples();
  }, []);

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

  const selectedSpeciesName = species.find(s => String(s.id) === form.species_id)?.name ?? "";
  const isHuman = selectedSpeciesName.toLowerCase() === "human";

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => {
      const next = { ...f, [name]: value };
      if (name === "species_id") {
        const newSpeciesName = species.find(s => String(s.id) === value)?.name ?? "";
        if (newSpeciesName.toLowerCase() !== "human") {
          next.race = "";
          next.ethnicity = "";
          next.age = "";
        }
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const { error } = await supabase.from("samples").insert({
      species_id: Number(form.species_id),
      matrix_id: Number(form.matrix_id),
      quantity_ml: Number(form.quantity_ml),
      collection_date: form.collection_date,
      storage_temp_id: Number(form.storage_temp_id),
      collection_site_id: Number(form.collection_site_id),
      vendor_sample_id: form.vendor_sample_id || null,
      gender: form.gender,
      race: isHuman ? form.race || null : null,
      ethnicity: isHuman ? form.ethnicity || null : null,
      age: isHuman ? form.age || null : null,
    });

    setSubmitting(false);
    if (error) {
      setError(error.message);
    } else {
      setForm(empty);
      setSuccess(true);
      loadSamples();
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  async function handleConsume(sample: Sample) {
    if (confirmConsume !== sample.id) {
      setConfirmConsume(sample.id);
      return;
    }

    setConsuming(sample.id);
    setConfirmConsume(null);

    const now = new Date().toISOString();

    const [updateRes, logRes] = await Promise.all([
      supabase.from("samples").update({ consumed_at: now }).eq("id", sample.id),
      supabase.from("history_log").insert({
        event_type: "consumed",
        sample_id: sample.id,
        alias_id: sample.alias_id,
        notes: `Sample ${sample.alias_id} consumed from inventory.`,
      }),
    ]);

    setConsuming(null);

    if (updateRes.error || logRes.error) {
      setError(updateRes.error?.message ?? logRes.error?.message ?? "Failed to consume sample.");
    } else {
      loadSamples();
    }
  }

  const { vendor_sample_id: _v, race: _r, ethnicity: _e, age: _a, ...coreRequired } = form;
  const humanFieldsFilled = !isHuman || (form.race !== "" && form.ethnicity !== "" && form.age !== "");
  const allFilled = Object.values(coreRequired).every(v => v !== "") && humanFieldsFilled;

  const displayed = samples.filter(s => showConsumed ? true : !s.consumed_at);

  const sampleMap = new Map<string, Sample>(samples.map(s => [s.id, s]));

  const childCounts: Record<string, number> = {};
  samples.forEach(s => {
    if (s.parent_sample_id) childCounts[s.parent_sample_id] = (childCounts[s.parent_sample_id] ?? 0) + 1;
    if (s.parent_sample_id_2) childCounts[s.parent_sample_id_2] = (childCounts[s.parent_sample_id_2] ?? 0) + 1;
  });

  return (
    <div className="flex flex-col min-h-screen font-sans">

      {/* Nav */}
      <nav className="nav-glass w-full px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2456e0, #4a7cf7)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <span className="text-white text-lg font-semibold tracking-tight">LIMS But Better</span>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs font-medium tracking-wide transition-colors"
          style={{ color: "#4a617f" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#7d9abd")}
          onMouseLeave={e => (e.currentTarget.style.color = "#4a617f")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Departments
        </Link>
      </nav>

      <main className="flex flex-col items-center px-4 py-10 gap-8">

        {/* ── Log New Sample ── */}
        <section className="w-full max-w-3xl card px-8 py-8">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(36,86,224,0.15)", color: "#4a7cf7" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#3d5270" }}>Intake</p>
              <h2 className="text-lg font-bold tracking-tight" style={{ color: "#d8e8f7" }}>Log New Sample</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Species</label>
              <select name="species_id" value={form.species_id} onChange={handleChange} className="select-field">
                <option value="">Select species</option>
                {species.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Matrix</label>
              <select name="matrix_id" value={form.matrix_id} onChange={handleChange} className="select-field">
                <option value="">Select matrix</option>
                {matrices.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Quantity (mL)</label>
              <input
                type="number" name="quantity_ml" value={form.quantity_ml} onChange={handleChange}
                placeholder="e.g. 2.5" min="0" step="0.01"
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Collection Date</label>
              <input
                type="date" name="collection_date" value={form.collection_date} onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Storage Temperature</label>
              <select name="storage_temp_id" value={form.storage_temp_id} onChange={handleChange} className="select-field">
                <option value="">Select temp</option>
                {temps.map(t => <option key={t.id} value={t.id}>{t.label} ({t.description})</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Collection Site</label>
              <select name="collection_site_id" value={form.collection_site_id} onChange={handleChange} className="select-field">
                <option value="">Select site</option>
                {sites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.abbreviation})</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Gender</label>
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
                  <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Race</label>
                  <select name="race" value={form.race} onChange={handleChange} className="select-field">
                    <option value="">Select race</option>
                    {RACE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Ethnicity</label>
                  <select name="ethnicity" value={form.ethnicity} onChange={handleChange} className="select-field">
                    <option value="">Select ethnicity</option>
                    {ETHNICITY_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Age</label>
                  <input
                    type="number" name="age" value={form.age} onChange={handleChange}
                    placeholder="e.g. 34" min="0" max="130" step="1"
                    className="input-field"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>
                Vendor / Site ID <span style={{ color: "#3d5270", textTransform: "none", fontSize: "0.7rem", letterSpacing: "0" }}>(optional)</span>
              </label>
              <input
                type="text" name="vendor_sample_id" value={form.vendor_sample_id} onChange={handleChange}
                placeholder="e.g. 003, AB-00192"
                className="input-field"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-4 pt-2 border-t" style={{ borderColor: "rgba(74,124,247,0.1)" }}>
              <button
                type="submit"
                disabled={!allFilled || submitting}
                className="btn-primary flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>Log Sample</>
                )}
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
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(36,86,224,0.15)", color: "#4a7cf7" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h7" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#3d5270" }}>Records</p>
                <h2 className="text-lg font-bold tracking-tight" style={{ color: "#d8e8f7" }}>Sample Inventory</h2>
              </div>
            </div>

            {/* Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showConsumed}
                  onChange={e => setShowConsumed(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 rounded-full peer-checked:bg-cobalt transition-colors" style={{ background: showConsumed ? "#2456e0" : "rgba(74,124,247,0.12)", border: "1px solid rgba(74,124,247,0.25)" }} />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-4" />
              </div>
              <span className="text-xs font-medium" style={{ color: "#4a617f" }}>Show consumed</span>
            </label>
          </div>

          {displayed.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14" style={{ color: "#3d5270" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-sm">No samples to display.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(74,124,247,0.1)" }}>
                    {["Alias ID","Vendor ID","Lineage","Species","Gender","Race","Ethnicity","Age","Matrix","Qty (mL)","Coll. Date","Storage","Site","Status"].map(h => (
                      <th key={h} className="table-header-cell">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(s => (
                    <tr key={s.id} className={`table-row ${s.consumed_at ? "consumed" : ""}`}>
                      <td className="table-cell">
                        <span className="font-mono text-xs font-semibold" style={{ color: "#4a7cf7" }}>{s.alias_id}</span>
                      </td>
                      <td className="table-cell font-mono text-xs">
                        {s.vendor_sample_id ?? <span style={{ color: "#3d5270" }}>—</span>}
                      </td>
                      <td className="table-cell">
                        {(() => {
                          // Lot: has two parents
                          if (s.parent_alias && s.parent_alias_2) {
                            return (
                              <span className="font-mono text-xs font-semibold" style={{ color: "#f59e0b" }}>
                                ↑ {s.parent_alias} + {s.parent_alias_2}
                              </span>
                            );
                          }
                          // Aliquot: has one direct parent
                          if (s.parent_alias && s.parent_sample_id) {
                            const parent = sampleMap.get(s.parent_sample_id);
                            if (parent?.parent_alias && parent?.parent_alias_2) {
                              // Parent is a lot — show: ↑ lot_alias (from p1 + p2)
                              return (
                                <span className="flex flex-col gap-0.5">
                                  <span className="font-mono text-xs font-semibold" style={{ color: "#a78bfa" }}>↑ {s.parent_alias}</span>
                                  <span className="text-xs" style={{ color: "#3d5270" }}>
                                    lot: {parent.parent_alias} + {parent.parent_alias_2}
                                  </span>
                                </span>
                              );
                            }
                            return (
                              <span className="font-mono text-xs font-semibold" style={{ color: "#a78bfa" }}>
                                ↑ {s.parent_alias}
                              </span>
                            );
                          }
                          // Parent sample
                          if (childCounts[s.id]) {
                            return (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "#7d9abd" }}>
                                ↓ {childCounts[s.id]} child{childCounts[s.id] !== 1 ? "ren" : ""}
                              </span>
                            );
                          }
                          return <span style={{ color: "#3d5270" }}>—</span>;
                        })()}
                      </td>
                      <td className="table-cell">{s.species?.name}</td>
                      <td className="table-cell">{s.gender ?? <span style={{ color: "#3d5270" }}>—</span>}</td>
                      <td className="table-cell">{s.race ?? <span style={{ color: "#3d5270" }}>—</span>}</td>
                      <td className="table-cell">{s.ethnicity ?? <span style={{ color: "#3d5270" }}>—</span>}</td>
                      <td className="table-cell">{s.age ?? <span style={{ color: "#3d5270" }}>—</span>}</td>
                      <td className="table-cell">{s.matrix?.name}</td>
                      <td className="table-cell">{s.quantity_ml}</td>
                      <td className="table-cell">{s.collection_date}</td>
                      <td className="table-cell">
                        {s.storage_temp?.label}
                        <span className="ml-1 text-xs" style={{ color: "#3d5270" }}>({s.storage_temp?.description})</span>
                      </td>
                      <td className="table-cell">
                        <span className="font-mono text-xs font-semibold" style={{ color: "#7d9abd" }}>{s.collection_site?.abbreviation}</span>
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
                            <button
                              onClick={() => setConfirmConsume(null)}
                              className="text-xs transition-colors"
                              style={{ color: "#3d5270" }}
                              onMouseEnter={e => (e.currentTarget.style.color = "#7d9abd")}
                              onMouseLeave={e => (e.currentTarget.style.color = "#3d5270")}
                            >
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
