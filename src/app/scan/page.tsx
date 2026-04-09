"use client";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { api } from "@/lib/api";
import type { FRScanResult, Opportunity } from "@/lib/types";

function ScanContent() {
  const [scanResults, setScanResults] = useState<FRScanResult[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [scanning, setScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const [confirmEntry, setConfirmEntry] = useState<Opportunity | null>(null);
  const [entryLoading, setEntryLoading] = useState(false);

  const loadData = async () => {
    const [scan, opps] = await Promise.all([
      api.get<FRScanResult[]>("/scan/latest").catch(() => []),
      api.get<Opportunity[]>("/scan/opportunities").catch(() => []),
    ]);
    setScanResults(scan);
    setOpportunities(opps);
    if (scan.length > 0) setLastScanTime(scan[0].scan_time);
  };

  useEffect(() => { loadData(); }, []);

  const triggerScan = async () => {
    setScanning(true);
    try {
      await api.post("/scan/trigger");
      await loadData();
    } finally {
      setScanning(false);
    }
  };

  const executeEntry = async (opp: Opportunity) => {
    setEntryLoading(true);
    try {
      const side = opp.direction.includes("LONG") ? "BUY" : "SELL";
      await api.post("/trade/entry", {
        type: opp.type, base: opp.base, side,
        exchange: opp.exchanges[0], amount_usdt: 250, leverage: 20,
      });
      setConfirmEntry(null);
      await loadData();
    } catch (e: unknown) {
      alert(`Entry failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setEntryLoading(false);
    }
  };

  const frColor = (rate: number) =>
    rate > 0 ? "text-green-400" : rate < 0 ? "text-red-400" : "text-gray-400";

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">FR Scan</h1>
          {lastScanTime && (
            <p className="text-xs text-gray-500 mt-1">
              Last scan: {new Date(lastScanTime).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
              {" "}({scanResults.length} results)
            </p>
          )}
        </div>
        <button onClick={triggerScan} disabled={scanning}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg text-sm font-medium transition">
          {scanning ? "Scanning..." : "Scan Now"}
        </button>
      </div>

      {/* Entry Confirm Modal */}
      {confirmEntry && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold">Confirm Entry</h3>
            <div className="space-y-2 text-sm bg-gray-800/50 p-4 rounded-lg">
              <div className="flex justify-between"><span className="text-gray-400">Base</span><span className="font-bold">{confirmEntry.base}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Type</span><span>{confirmEntry.type}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Direction</span><span>{confirmEntry.direction}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">FR Diff</span><span className="text-green-400">{confirmEntry.fr_diff}%</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Est. Income</span><span>${confirmEntry.net_income}</span></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => executeEntry(confirmEntry)} disabled={entryLoading}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg text-sm font-medium">
                {entryLoading ? "Placing..." : "Execute Entry"}
              </button>
              <button onClick={() => setConfirmEntry(null)} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Opportunities */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Opportunities ({opportunities.length})</h2>
        {opportunities.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center text-gray-500">
            No opportunities found. Click Scan Now to check.
          </div>
        ) : (
          <div className="space-y-2">
            {opportunities.map((opp, i) => (
              <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    opp.type.includes("p2") || opp.type.includes("cross") ? "bg-blue-900/50 text-blue-300" :
                    opp.type.includes("p3") || opp.type.includes("single") ? "bg-purple-900/50 text-purple-300" :
                    "bg-cyan-900/50 text-cyan-300"
                  }`}>{opp.type.includes("p2") || opp.type.includes("cross") ? "P2" : opp.type.includes("p3") ? "P3" : "P1"}</span>
                  <span className="font-bold text-lg">{opp.base}</span>
                  <span className="text-gray-400 text-sm">{opp.direction}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-green-400 font-mono text-sm">{opp.fr_diff}%</div>
                    <div className="text-gray-500 text-xs">Est. ${opp.net_income}</div>
                  </div>
                  <button onClick={() => setConfirmEntry(opp)}
                    className="px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-medium transition">
                    Entry
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FR Rates Table */}
      <section>
        <h2 className="text-lg font-semibold mb-3">FR Rates</h2>
        {scanResults.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center text-gray-500">
            No scan data yet. Click Scan Now.
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800 bg-gray-800/30">
                    <th className="text-left py-2.5 px-3 font-medium">Base</th>
                    <th className="text-left py-2.5 px-3 font-medium">Exchange</th>
                    <th className="text-right py-2.5 px-3 font-medium">FR Rate</th>
                    <th className="text-right py-2.5 px-3 font-medium">Volume 24h</th>
                    <th className="text-right py-2.5 px-3 font-medium">Mark Price</th>
                  </tr>
                </thead>
                <tbody>
                  {scanResults.slice(0, 50).map((r, i) => (
                    <tr key={i} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                      <td className="py-2 px-3 font-bold">{r.base}</td>
                      <td className="py-2 px-3 text-gray-300 capitalize">{r.exchange}</td>
                      <td className={`py-2 px-3 text-right font-mono ${frColor(r.fr_rate)}`}>
                        {(r.fr_rate * 100).toFixed(4)}%
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-gray-400">
                        {r.vol_24h >= 1_000_000 ? `$${(r.vol_24h / 1_000_000).toFixed(1)}M` : `$${(r.vol_24h / 1_000).toFixed(0)}K`}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-gray-400">
                        ${r.mark_price < 1 ? r.mark_price.toPrecision(4) : r.mark_price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function ScanPage() {
  return (
    <AuthGuard>
      <ScanContent />
    </AuthGuard>
  );
}
