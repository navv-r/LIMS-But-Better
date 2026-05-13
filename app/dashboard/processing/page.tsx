"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Species { id: number; name: string; }
interface Matrix { id: number; name: string; }
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
  species_id: number;
  matrix_id: number;
  storage_temp_id: number;
  collection_site_id: number;
  created_at: string;
}

type Mode = "none" | "aliquot" | "lot";

function VolumeGauge({ used, total, label }: { used: number; total: number; label: string }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const over = used > total;
  return (
    <div className="p-3 rounded-xl" style={{ background: "rgba(5,12,26,0.8)", border: `1px solid ${over ? "rgba(239,68,68,0.35)" : "rgba(74,124,247,0.13)"}` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#3d5270" }}>{label}</span>
        <span className="text-xs font-bold font-mono" style={{ color: over ? "#f87171" : "#34d399" }}>
          {used} mL <span style={{ color: "#3d5270" }}>/ {total} mL</span>
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(74,124,247,0.1)" }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            background: over ? "linear-gradient(90deg,#ef4444,#f87171)" : "linear-gradient(90deg,#059669,#34d399)",
          }}
        />
      </div>
      {over && (
        <p className="text-xs font-semibold mt-1.5 flex items-center gap-1" style={{ color: "#f87171" }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          Exceeds available volume
        </p>
      )}
    </div>
  );
}

export default function ProcessingPage() {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [temps, setTemps] = useState<StorageTemp[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpecies, setFilterSpecies] = useState("");
  const [filterMatrix, setFilterMatrix] = useState("");
  const [results, setResults] = useState<Sample[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Up to 2 selections; index 0 = "1st", index 1 = "2nd"
  const [selections, setSelections] = useState<Sample[]>([]);

  // Aliquot state (mode === "aliquot")
  const [numAliquots, setNumAliquots] = useState("");
  const [aliquotVol, setAliquotVol] = useState("");
  const [aliquotError, setAliquotError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newAliquotIds, setNewAliquotIds] = useState<string[] | null>(null);

  // Lot state (mode === "lot")
  const [lotVol1, setLotVol1] = useState("");
  const [lotVol2, setLotVol2] = useState("");
  const [lotStorageTemp, setLotStorageTemp] = useState("");
  const [lotError, setLotError] = useState<string | null>(null);
  const [lotCreating, setLotCreating] = useState(false);
  const [newLotAlias, setNewLotAlias] = useState<string | null>(null);
  const [newLotParents, setNewLotParents] = useState<[string, string] | null>(null);

  const mode: Mode = selections.length === 2 ? "lot" : selections.length === 1 ? "aliquot" : "none";
  const selected = mode === "aliquot" ? selections[0] : null;
  const lotSample1 = mode === "lot" ? selections[0] : null;
  const lotSample2 = mode === "lot" ? selections[1] : null;

  useEffect(() => {
    (async () => {
      const [s, m, t] = await Promise.all([
        supabase.from("species").select("*").order("name"),
        supabase.from("matrices").select("*").order("name"),
        supabase.from("storage_temps").select("*").order("id"),
      ]);
      if (s.data) setSpeciesList(s.data);
      if (m.data) setMatrices(m.data);
      if (t.data) setTemps(t.data);
    })();
  }, []);

  const isSearchMode = searchQuery.trim().length > 0;
  const isFilterMode = filterSpecies !== "" || filterMatrix !== "";

  function handleSearchInput(val: string) {
    setSearchQuery(val);
    if (val.trim()) { setFilterSpecies(""); setFilterMatrix(""); }
  }

  function handleFilterInput(field: "species" | "matrix", val: string) {
    if (field === "species") setFilterSpecies(val);
    else setFilterMatrix(val);
    if (val) setSearchQuery("");
  }

  function resetActionState() {
    setNumAliquots(""); setAliquotVol(""); setAliquotError(null); setNewAliquotIds(null);
    setLotVol1(""); setLotVol2(""); setLotStorageTemp(""); setLotError(null);
    setNewLotAlias(null); setNewLotParents(null);
  }

  function handleClear() {
    setSearchQuery(""); setFilterSpecies(""); setFilterMatrix("");
    setResults([]); setHasSearched(false); setSelections([]);
    resetActionState();
  }

  function toggleSelection(s: Sample) {
    resetActionState();
    setSelections(prev => {
      const idx = prev.findIndex(p => p.id === s.id);
      if (idx >= 0) return prev.filter(p => p.id !== s.id);
      if (prev.length < 2) return [...prev, s];
      return [prev[1], s]; // replace the oldest selection
    });
  }

  async function doSearch(opts?: { overrideQuery?: string }) {
    const q = opts?.overrideQuery !== undefined ? opts.overrideQuery : searchQuery.trim();
    if (opts?.overrideQuery !== undefined) {
      setSearchQuery(opts.overrideQuery);
      setFilterSpecies(""); setFilterMatrix("");
    }

    setLoading(true);
    setHasSearched(true);
    setSelections([]);
    resetActionState();

    let query = supabase
      .from("samples")
      .select(`
        id, alias_id, vendor_sample_id, gender, race, ethnicity, age,
        consumed_at, quantity_ml, collection_date, created_at,
        species_id, matrix_id, storage_temp_id, collection_site_id,
        parent_sample_id, parent_sample_id_2,
        parent:samples!parent_sample_id(alias_id),
        parent2:samples!parent_sample_id_2(alias_id),
        species:species_id(name),
        matrix:matrix_id(name),
        storage_temp:storage_temp_id(label, description),
        collection_site:collection_site_id(name, abbreviation)
      `)
      .is("consumed_at", null);

    const searching = opts?.overrideQuery !== undefined ? q.length > 0 : isSearchMode;
    if (searching && q.length > 0) {
      query = query.or(`alias_id.ilike.%${q}%,vendor_sample_id.ilike.%${q}%`);
    } else if (opts?.overrideQuery === undefined) {
      if (filterSpecies) query = query.eq("species_id", Number(filterSpecies));
      if (filterMatrix) query = query.eq("matrix_id", Number(filterMatrix));
    }

    const { data } = await query.order("created_at", { ascending: false });
    setLoading(false);

    if (data) {
      const mapped = data.map((s: any) => ({
        ...s,
        parent_alias: (s.parent as { alias_id: string } | null)?.alias_id ?? null,
        parent_alias_2: (s.parent2 as { alias_id: string } | null)?.alias_id ?? null,
      }));
      setResults(mapped as Sample[]);
    }
  }

  // ── Aliquot logic ──────────────────────────────────────────────────────────
  const n = parseInt(numAliquots) || 0;
  const vol = parseFloat(aliquotVol) || 0;
  const totalAliqVol = n > 0 && vol > 0 ? +(n * vol).toFixed(4) : 0;
  const aliqExceeds = selected ? totalAliqVol > selected.quantity_ml : false;
  const aliquotReady = !!(selected && n >= 1 && vol > 0 && !aliqExceeds);

  async function createAliquots() {
    if (!selected || !aliquotReady) return;
    setCreating(true); setAliquotError(null);

    const inserts = Array.from({ length: n }, () => ({
      species_id: selected.species_id,
      matrix_id: selected.matrix_id,
      quantity_ml: vol,
      collection_date: selected.collection_date,
      storage_temp_id: selected.storage_temp_id,
      collection_site_id: selected.collection_site_id,
      vendor_sample_id: selected.vendor_sample_id,
      gender: selected.gender,
      race: selected.race,
      ethnicity: selected.ethnicity,
      age: selected.age,
      parent_sample_id: selected.id,
    }));

    const { data, error } = await supabase.from("samples").insert(inserts).select("alias_id");
    setCreating(false);

    if (error) {
      setAliquotError(error.message);
    } else {
      const ids = (data ?? []).map((d: any) => d.alias_id as string);
      setNewAliquotIds(ids);
      await supabase.from("history_log").insert({
        event_type: "aliquoted",
        sample_id: selected.id,
        alias_id: selected.alias_id,
        notes: `Created ${n} aliquot${n !== 1 ? "s" : ""} (${vol} mL each) from ${selected.alias_id}. Child IDs: ${ids.join(", ")}.`,
      });
    }
  }

  // ── Lot logic ──────────────────────────────────────────────────────────────
  const lv1 = parseFloat(lotVol1) || 0;
  const lv2 = parseFloat(lotVol2) || 0;
  const lotTotalVol = lv1 > 0 && lv2 > 0 ? +(lv1 + lv2).toFixed(4) : 0;
  const lot1Exceeds = lotSample1 ? lv1 > lotSample1.quantity_ml : false;
  const lot2Exceeds = lotSample2 ? lv2 > lotSample2.quantity_ml : false;
  const speciesMismatch = !!(lotSample1 && lotSample2 && lotSample1.species?.name !== lotSample2.species?.name);
  const matrixMismatch = !!(lotSample1 && lotSample2 && lotSample1.matrix?.name !== lotSample2.matrix?.name);
  const lotReady = !!(lotSample1 && lotSample2 && lv1 > 0 && lv2 > 0 && !lot1Exceeds && !lot2Exceeds && lotStorageTemp);

  async function createLot() {
    if (!lotSample1 || !lotSample2 || !lotReady) return;
    setLotCreating(true); setLotError(null);

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("samples")
      .insert({
        species_id: lotSample1.species_id,
        matrix_id: lotSample1.matrix_id,
        quantity_ml: lotTotalVol,
        collection_date: today,
        storage_temp_id: Number(lotStorageTemp),
        collection_site_id: lotSample1.collection_site_id,
        gender: lotSample1.gender === lotSample2.gender ? lotSample1.gender : null,
        race: lotSample1.race === lotSample2.race ? lotSample1.race : null,
        ethnicity: lotSample1.ethnicity === lotSample2.ethnicity ? lotSample1.ethnicity : null,
        age: lotSample1.age === lotSample2.age ? lotSample1.age : null,
        parent_sample_id: lotSample1.id,
        parent_sample_id_2: lotSample2.id,
      })
      .select("id, alias_id")
      .single();

    setLotCreating(false);

    if (error) {
      setLotError(error.message);
    } else {
      setNewLotAlias(data.alias_id);
      setNewLotParents([lotSample1.alias_id, lotSample2.alias_id]);
      await supabase.from("history_log").insert({
        event_type: "lot_created",
        sample_id: data.id,
        alias_id: data.alias_id,
        notes: `Created lot ${data.alias_id} from ${lotSample1.alias_id} (${lv1} mL) + ${lotSample2.alias_id} (${lv2} mL). Total: ${lotTotalVol} mL.`,
      });
    }
  }

  // ── Shared UI helpers ──────────────────────────────────────────────────────
  const ghostBtn = "text-xs font-medium px-3 py-1.5 rounded-lg transition-colors";
  const ghostStyle = { color: "#4a617f", background: "rgba(74,124,247,0.07)", border: "1px solid rgba(74,124,247,0.13)" };

  return (
    <div className="flex flex-col flex-1 font-sans">

      <main className="flex flex-col items-center px-4 py-10 gap-8">

        {/* ── Find Samples ── */}
        <section className="w-full max-w-3xl card px-8 py-8">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#3d5270" }}>Lookup</p>
              <h2 className="text-lg font-bold tracking-tight" style={{ color: "#d8e8f7" }}>Find Samples</h2>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Search by ID</label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearchInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && doSearch()}
                placeholder="Enter alias ID or vendor ID…"
                className="input-field"
                style={isFilterMode ? { opacity: 0.4, pointerEvents: "none" } : {}}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px" style={{ background: "rgba(74,124,247,0.1)" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#3d5270" }}>or filter by</span>
              <div className="flex-1 h-px" style={{ background: "rgba(74,124,247,0.1)" }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Species</label>
                <select
                  value={filterSpecies}
                  onChange={e => handleFilterInput("species", e.target.value)}
                  className="select-field"
                  style={isSearchMode ? { opacity: 0.4, pointerEvents: "none" } : {}}
                >
                  <option value="">All species</option>
                  {speciesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Matrix</label>
                <select
                  value={filterMatrix}
                  onChange={e => handleFilterInput("matrix", e.target.value)}
                  className="select-field"
                  style={isSearchMode ? { opacity: 0.4, pointerEvents: "none" } : {}}
                >
                  <option value="">All matrices</option>
                  {matrices.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: "rgba(74,124,247,0.1)" }}>
              <button
                onClick={() => doSearch()}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)" }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Searching…
                  </>
                ) : "Search"}
              </button>
              {(isSearchMode || isFilterMode || hasSearched) && (
                <button
                  onClick={handleClear}
                  className={ghostBtn}
                  style={ghostStyle}
                  onMouseEnter={e => (e.currentTarget.style.color = "#7d9abd")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#4a617f")}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Results ── */}
        {hasSearched && (
          <section className="w-full max-w-7xl card px-8 py-8">
            <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h7" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#3d5270" }}>Results</p>
                  <h2 className="text-lg font-bold tracking-tight" style={{ color: "#d8e8f7" }}>
                    {results.length} Active Sample{results.length !== 1 ? "s" : ""}
                  </h2>
                </div>
              </div>
              {results.length > 0 && selections.length === 0 && (
                <p className="text-xs px-3 py-1.5 rounded-lg" style={{ color: "#4a617f", background: "rgba(74,124,247,0.06)", border: "1px solid rgba(74,124,247,0.1)" }}>
                  Select 1 sample to aliquot · Select 2 to create a lot
                </p>
              )}
              {selections.length === 1 && (
                <p className="text-xs px-3 py-1.5 rounded-lg" style={{ color: "#a78bfa", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(167,139,250,0.2)" }}>
                  1 selected — scroll down to aliquot, or select a 2nd to create a lot
                </p>
              )}
              {selections.length === 2 && (
                <p className="text-xs px-3 py-1.5 rounded-lg" style={{ color: "#f59e0b", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  2 selected — scroll down to create a lot
                </p>
              )}
            </div>

            {results.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-14" style={{ color: "#3d5270" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">No matching active samples found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(74,124,247,0.1)" }}>
                      {["Alias ID", "Vendor ID", "Species", "Matrix", "Qty (mL)", "Coll. Date", "Lineage", ""].map(h => (
                        <th key={h} className="table-header-cell">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(s => {
                      const selPos = selections.findIndex(sel => sel.id === s.id);
                      const isFirst = selPos === 0;
                      const isSecond = selPos === 1;
                      const isAnySelected = selPos >= 0;

                      const rowStyle = isFirst
                        ? { background: "rgba(124,58,237,0.10)", borderLeft: "2px solid #a78bfa" }
                        : isSecond
                        ? { background: "rgba(245,158,11,0.08)", borderLeft: "2px solid #f59e0b" }
                        : {};

                      return (
                        <tr
                          key={s.id}
                          className="table-row cursor-pointer"
                          onClick={() => toggleSelection(s)}
                          style={rowStyle}
                        >
                          <td className="table-cell">
                            <span className="font-mono text-xs font-semibold" style={{ color: "#4a7cf7" }}>{s.alias_id}</span>
                          </td>
                          <td className="table-cell font-mono text-xs">
                            {s.vendor_sample_id ?? <span style={{ color: "#3d5270" }}>—</span>}
                          </td>
                          <td className="table-cell">{s.species?.name}</td>
                          <td className="table-cell">{s.matrix?.name}</td>
                          <td className="table-cell font-mono text-xs">{s.quantity_ml}</td>
                          <td className="table-cell">{s.collection_date}</td>
                          <td className="table-cell">
                            {s.parent_alias && s.parent_alias_2 ? (
                              <span className="font-mono text-xs font-semibold" style={{ color: "#f59e0b" }}>
                                ↑ {s.parent_alias} + {s.parent_alias_2}
                              </span>
                            ) : s.parent_alias ? (
                              <span className="font-mono text-xs font-semibold" style={{ color: "#a78bfa" }}>
                                ↑ {s.parent_alias}
                              </span>
                            ) : (
                              <span style={{ color: "#3d5270" }}>—</span>
                            )}
                          </td>
                          <td className="table-cell">
                            {isFirst ? (
                              <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: "rgba(167,139,250,0.2)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)" }}>
                                1st ✓
                              </span>
                            ) : isSecond ? (
                              <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
                                2nd ✓
                              </span>
                            ) : (
                              <span
                                className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                                style={{ background: isAnySelected ? "rgba(74,124,247,0.06)" : "rgba(124,58,237,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}
                              >
                                Select
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ── Aliquot Panel (1 sample selected) ── */}
        {mode === "aliquot" && selected && !newAliquotIds && (
          <section className="w-full max-w-3xl card px-8 py-8" style={{ borderColor: "rgba(167,139,250,0.35)" }}>
            <div className="flex items-center gap-3 mb-7">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#3d5270" }}>Aliquoting</p>
                <h2 className="text-lg font-bold tracking-tight" style={{ color: "#d8e8f7" }}>Create Aliquots</h2>
              </div>
            </div>

            {/* Parent summary */}
            <div className="rounded-xl p-4 mb-6 flex flex-wrap gap-x-8 gap-y-3" style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(167,139,250,0.15)" }}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#3d5270" }}>Parent Sample</p>
                <p className="font-mono text-sm font-bold" style={{ color: "#a78bfa" }}>{selected.alias_id}</p>
              </div>
              {selected.vendor_sample_id && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#3d5270" }}>Vendor ID</p>
                  <p className="font-mono text-sm" style={{ color: "#7d9abd" }}>{selected.vendor_sample_id}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#3d5270" }}>Species</p>
                <p className="text-sm" style={{ color: "#d8e8f7" }}>{selected.species?.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#3d5270" }}>Matrix</p>
                <p className="text-sm" style={{ color: "#d8e8f7" }}>{selected.matrix?.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#3d5270" }}>Available</p>
                <p className="text-sm font-bold font-mono" style={{ color: "#34d399" }}>{selected.quantity_ml} mL</p>
              </div>
              {/* Show lot parents if this sample is a lot */}
              {selected.parent_alias && selected.parent_alias_2 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#3d5270" }}>Lot formed from</p>
                  <p className="font-mono text-xs font-semibold" style={{ color: "#f59e0b" }}>
                    {selected.parent_alias} + {selected.parent_alias_2}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Number of Aliquots</label>
                <input type="number" value={numAliquots} onChange={e => { setNumAliquots(e.target.value); setAliquotError(null); }} placeholder="e.g. 4" min="1" step="1" className="input-field" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Volume per Aliquot (mL)</label>
                <input type="number" value={aliquotVol} onChange={e => { setAliquotVol(e.target.value); setAliquotError(null); }} placeholder="e.g. 0.5" min="0.001" step="0.001" className="input-field" />
              </div>
            </div>

            {n > 0 && vol > 0 && (
              <div className="mb-5">
                <VolumeGauge used={totalAliqVol} total={selected.quantity_ml} label="Total volume used" />
              </div>
            )}

            {aliquotError && (
              <p className="text-xs font-semibold mb-4 flex items-center gap-1.5" style={{ color: "#f87171" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                {aliquotError}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: "rgba(74,124,247,0.1)" }}>
              <button
                onClick={createAliquots}
                disabled={!aliquotReady || creating}
                className="btn-primary flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)" }}
              >
                {creating ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating…
                  </>
                ) : n > 0 ? `Create ${n} Aliquot${n !== 1 ? "s" : ""}` : "Create Aliquots"}
              </button>
              <button onClick={() => setSelections([])} className={ghostBtn} style={ghostStyle}
                onMouseEnter={e => (e.currentTarget.style.color = "#7d9abd")} onMouseLeave={e => (e.currentTarget.style.color = "#4a617f")}>
                Cancel
              </button>
            </div>
          </section>
        )}

        {/* ── Aliquot Success ── */}
        {mode === "aliquot" && newAliquotIds && selected && (
          <section className="w-full max-w-3xl card px-8 py-8" style={{ borderColor: "rgba(52,211,153,0.35)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(5,150,105,0.15)", color: "#34d399" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#3d5270" }}>Success</p>
                <h2 className="text-lg font-bold tracking-tight" style={{ color: "#d8e8f7" }}>Aliquots Created</h2>
              </div>
            </div>

            <div className="mb-4 text-sm" style={{ color: "#7d9abd" }}>
              <span>{newAliquotIds.length} aliquot{newAliquotIds.length !== 1 ? "s" : ""} ({vol} mL each) created from </span>
              <span className="font-mono font-bold" style={{ color: "#a78bfa" }}>{selected.alias_id}</span>
              {selected.parent_alias && selected.parent_alias_2 && (
                <span>
                  <span> — lot formed from </span>
                  <span className="font-mono font-semibold" style={{ color: "#f59e0b" }}>{selected.parent_alias}</span>
                  <span> + </span>
                  <span className="font-mono font-semibold" style={{ color: "#f59e0b" }}>{selected.parent_alias_2}</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {newAliquotIds.map(id => (
                <span key={id} className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
                  {id}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setNewAliquotIds(null)} className="btn-primary" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)" }}>
                Aliquot Another Sample
              </button>
              <button onClick={handleClear} className={ghostBtn} style={ghostStyle}
                onMouseEnter={e => (e.currentTarget.style.color = "#7d9abd")} onMouseLeave={e => (e.currentTarget.style.color = "#4a617f")}>
                New Search
              </button>
            </div>
          </section>
        )}

        {/* ── Lot Creation Panel (2 samples selected) ── */}
        {mode === "lot" && lotSample1 && lotSample2 && !newLotAlias && (
          <section className="w-full max-w-4xl card px-8 py-8" style={{ borderColor: "rgba(245,158,11,0.3)" }}>
            <div className="flex items-center gap-3 mb-7">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#3d5270" }}>Combining</p>
                <h2 className="text-lg font-bold tracking-tight" style={{ color: "#d8e8f7" }}>Create Lot</h2>
              </div>
            </div>

            {/* Mismatch warnings */}
            {(speciesMismatch || matrixMismatch) && (
              <div className="mb-5 px-4 py-3 rounded-xl flex items-start gap-2.5" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-xs font-medium" style={{ color: "#f59e0b" }}>
                  {speciesMismatch && <span>Species mismatch ({lotSample1.species?.name} vs {lotSample2.species?.name}). </span>}
                  {matrixMismatch && <span>Matrix mismatch ({lotSample1.matrix?.name} vs {lotSample2.matrix?.name}). </span>}
                  Lot will inherit metadata from the 1st sample.
                </p>
              </div>
            )}

            {/* Two sample cards + volume inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              {/* Sample 1 */}
              <div className="flex flex-col gap-3">
                <div className="rounded-xl p-4" style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(167,139,250,0.2)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)" }}>1st</span>
                    <span className="font-mono text-sm font-bold" style={{ color: "#a78bfa" }}>{lotSample1.alias_id}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs" style={{ color: "#7d9abd" }}>
                    <span style={{ color: "#3d5270" }}>Species</span><span>{lotSample1.species?.name}</span>
                    <span style={{ color: "#3d5270" }}>Matrix</span><span>{lotSample1.matrix?.name}</span>
                    <span style={{ color: "#3d5270" }}>Available</span>
                    <span className="font-mono font-semibold" style={{ color: "#34d399" }}>{lotSample1.quantity_ml} mL</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Volume to use (mL)</label>
                  <input type="number" value={lotVol1} onChange={e => { setLotVol1(e.target.value); setLotError(null); }}
                    placeholder={`max ${lotSample1.quantity_ml}`} min="0.001" step="0.001" className="input-field" />
                </div>
                {lv1 > 0 && <VolumeGauge used={lv1} total={lotSample1.quantity_ml} label="From 1st sample" />}
              </div>

              {/* Sample 2 */}
              <div className="flex flex-col gap-3">
                <div className="rounded-xl p-4" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}>2nd</span>
                    <span className="font-mono text-sm font-bold" style={{ color: "#f59e0b" }}>{lotSample2.alias_id}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs" style={{ color: "#7d9abd" }}>
                    <span style={{ color: "#3d5270" }}>Species</span><span>{lotSample2.species?.name}</span>
                    <span style={{ color: "#3d5270" }}>Matrix</span><span>{lotSample2.matrix?.name}</span>
                    <span style={{ color: "#3d5270" }}>Available</span>
                    <span className="font-mono font-semibold" style={{ color: "#34d399" }}>{lotSample2.quantity_ml} mL</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Volume to use (mL)</label>
                  <input type="number" value={lotVol2} onChange={e => { setLotVol2(e.target.value); setLotError(null); }}
                    placeholder={`max ${lotSample2.quantity_ml}`} min="0.001" step="0.001" className="input-field" />
                </div>
                {lv2 > 0 && <VolumeGauge used={lv2} total={lotSample2.quantity_ml} label="From 2nd sample" />}
              </div>
            </div>

            {/* Total + storage temp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Storage Temperature for Lot</label>
                <select value={lotStorageTemp} onChange={e => { setLotStorageTemp(e.target.value); setLotError(null); }} className="select-field">
                  <option value="">Select temp</option>
                  {temps.map(t => <option key={t.id} value={t.id}>{t.label} ({t.description})</option>)}
                </select>
              </div>
              {lotTotalVol > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Total Lot Volume</p>
                  <div className="flex items-center h-[42px]">
                    <span className="font-mono text-2xl font-bold" style={{ color: "#d8e8f7" }}>{lotTotalVol}</span>
                    <span className="ml-1.5 text-sm" style={{ color: "#3d5270" }}>mL</span>
                  </div>
                </div>
              )}
            </div>

            {lotError && (
              <p className="text-xs font-semibold mb-4 flex items-center gap-1.5" style={{ color: "#f87171" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                {lotError}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: "rgba(74,124,247,0.1)" }}>
              <button
                onClick={createLot}
                disabled={!lotReady || lotCreating}
                className="btn-primary flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)" }}
              >
                {lotCreating ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating…
                  </>
                ) : "Create Lot"}
              </button>
              <button onClick={() => setSelections([])} className={ghostBtn} style={ghostStyle}
                onMouseEnter={e => (e.currentTarget.style.color = "#7d9abd")} onMouseLeave={e => (e.currentTarget.style.color = "#4a617f")}>
                Cancel
              </button>
            </div>
          </section>
        )}

        {/* ── Lot Success ── */}
        {newLotAlias && newLotParents && (
          <section className="w-full max-w-3xl card px-8 py-8" style={{ borderColor: "rgba(245,158,11,0.35)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#3d5270" }}>Success</p>
                <h2 className="text-lg font-bold tracking-tight" style={{ color: "#d8e8f7" }}>Lot Created</h2>
              </div>
            </div>

            <div className="rounded-xl p-5 mb-6 flex flex-wrap gap-x-8 gap-y-3" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#3d5270" }}>New Lot ID</p>
                <p className="font-mono text-lg font-bold" style={{ color: "#f59e0b" }}>{newLotAlias}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#3d5270" }}>Formed from</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold" style={{ color: "#a78bfa" }}>{newLotParents[0]}</span>
                  <span style={{ color: "#3d5270" }}>+</span>
                  <span className="font-mono text-sm font-bold" style={{ color: "#a78bfa" }}>{newLotParents[1]}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#3d5270" }}>Total Volume</p>
                <p className="font-mono text-sm font-bold" style={{ color: "#34d399" }}>{lotTotalVol} mL</p>
              </div>
            </div>

            <p className="text-xs mb-5" style={{ color: "#4a617f" }}>
              You can now aliquot this lot — its child aliquots will display full traceability back to both parent samples.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => doSearch({ overrideQuery: newLotAlias })}
                className="btn-primary flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Aliquot This Lot
              </button>
              <button onClick={handleClear} className={ghostBtn} style={ghostStyle}
                onMouseEnter={e => (e.currentTarget.style.color = "#7d9abd")} onMouseLeave={e => (e.currentTarget.style.color = "#4a617f")}>
                New Search
              </button>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
