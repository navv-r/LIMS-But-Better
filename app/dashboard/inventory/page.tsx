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
  consumed_at: string | null;
  species: { name: string };
  matrix: { name: string };
  quantity_ml: number;
  collection_date: string;
  storage_temp: { label: string; description: string };
  collection_site: { name: string; abbreviation: string };
  created_at: string;
}

const empty = { species_id: "", matrix_id: "", quantity_ml: "", collection_date: "", storage_temp_id: "", collection_site_id: "", vendor_sample_id: "", gender: "" };

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
        id, alias_id, vendor_sample_id, gender, consumed_at, quantity_ml, collection_date, created_at,
        species:species_id(name),
        matrix:matrix_id(name),
        storage_temp:storage_temp_id(label, description),
        collection_site:collection_site_id(name, abbreviation)
      `)
      .order("created_at", { ascending: false });
    if (data) setSamples(data as unknown as Sample[]);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
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

  const { vendor_sample_id: _v, ...requiredFields } = form;  // vendor_sample_id is optional
  const allFilled = Object.values(requiredFields).every(v => v !== "");

  const displayed = samples.filter(s => showConsumed ? true : !s.consumed_at);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <nav className="w-full bg-cobalt px-8 py-4 flex items-center justify-between shadow-md">
        <span className="text-white text-xl font-semibold tracking-tight">LIMS But Better</span>
        <Link href="/dashboard" className="text-blue-200 hover:text-white text-sm transition-colors">
          ← Departments
        </Link>
      </nav>

      <main className="flex flex-col items-center px-4 py-10 gap-10">

        {/* Log new sample */}
        <section className="w-full max-w-3xl card px-8 py-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Log New Sample</h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Species</label>
              <select name="species_id" value={form.species_id} onChange={handleChange} className="select-field">
                <option value="">Select species</option>
                {species.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Matrix</label>
              <select name="matrix_id" value={form.matrix_id} onChange={handleChange} className="select-field">
                <option value="">Select matrix</option>
                {matrices.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Quantity (mL)</label>
              <input
                type="number" name="quantity_ml" value={form.quantity_ml} onChange={handleChange}
                placeholder="e.g. 2.5" min="0" step="0.01"
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Collection Date</label>
              <input
                type="date" name="collection_date" value={form.collection_date} onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Storage Temperature</label>
              <select name="storage_temp_id" value={form.storage_temp_id} onChange={handleChange} className="select-field">
                <option value="">Select temp</option>
                {temps.map(t => <option key={t.id} value={t.id}>{t.label} ({t.description})</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Collection Site</label>
              <select name="collection_site_id" value={form.collection_site_id} onChange={handleChange} className="select-field">
                <option value="">Select site</option>
                {sites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.abbreviation})</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="select-field">
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Male/Female">Male/Female</option>
                <option value="N/A">N/A</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Vendor / Collection Site ID <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="text" name="vendor_sample_id" value={form.vendor_sample_id} onChange={handleChange}
                placeholder="e.g. 003, AB-00192, XZ7"
                className="input-field"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={!allFilled || submitting}
                className="rounded-lg bg-cobalt px-6 py-2 text-sm font-semibold text-white hover:bg-cobalt-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Saving…" : "Log Sample"}
              </button>
              {success && <span className="text-sm text-emerald-600 font-medium">Sample logged successfully.</span>}
              {error && <span className="text-sm text-red-500">{error}</span>}
            </div>

          </form>
        </section>

        {/* Samples table */}
        <section className="w-full max-w-7xl card px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Sample Inventory</h2>
            <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showConsumed}
                onChange={e => setShowConsumed(e.target.checked)}
                className="rounded"
              />
              Show consumed
            </label>
          </div>

          {displayed.length === 0 ? (
            <p className="text-sm text-gray-400">No samples to display.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-slate-50 text-gray-500 text-xs tracking-wider uppercase font-semibold">
                    <th className="pb-3 pr-4">Alias ID</th>
                    <th className="pb-3 pr-4">Vendor ID</th>
                    <th className="pb-3 pr-4">Species</th>
                    <th className="pb-3 pr-4">Gender</th>
                    <th className="pb-3 pr-4">Matrix</th>
                    <th className="pb-3 pr-4">Qty (mL)</th>
                    <th className="pb-3 pr-4">Collection Date</th>
                    <th className="pb-3 pr-4">Storage Temp</th>
                    <th className="pb-3 pr-4">Collection Site</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(s => (
                    <tr key={s.id} className={`border-b border-gray-50 transition-colors ${s.consumed_at ? "opacity-50" : "hover:bg-gray-50"}`}>
                      <td className="py-3 pr-4 font-mono text-blue-700">{s.alias_id}</td>
                      <td className="py-3 pr-4 font-mono text-gray-700">{s.vendor_sample_id ?? <span className="text-gray-300">—</span>}</td>
                      <td className="py-3 pr-4 text-gray-700">{s.species?.name}</td>
                      <td className="py-3 pr-4 text-gray-700">{s.gender ?? <span className="text-gray-300">—</span>}</td>
                      <td className="py-3 pr-4 text-gray-700">{s.matrix?.name}</td>
                      <td className="py-3 pr-4 text-gray-700">{s.quantity_ml}</td>
                      <td className="py-3 pr-4 text-gray-700">{s.collection_date}</td>
                      <td className="py-3 pr-4 text-gray-700">{s.storage_temp?.label} <span className="text-gray-400 text-xs">({s.storage_temp?.description})</span></td>
                      <td className="py-3 pr-4 text-gray-700">{s.collection_site?.name} <span className="text-gray-400 text-xs">({s.collection_site?.abbreviation})</span></td>
                      <td className="py-3">
                        {s.consumed_at ? (
                          <span className="text-xs text-gray-400 italic">Consumed</span>
                        ) : confirmConsume === s.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleConsume(s)}
                              disabled={consuming === s.id}
                              className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmConsume(null)}
                              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleConsume(s)}
                            className="text-xs font-medium text-amber-600 hover:text-amber-700 border border-amber-200 hover:border-amber-300 px-3 py-1 rounded-lg transition-colors"
                          >
                            Consume
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
